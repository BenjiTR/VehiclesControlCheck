import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCol, IonButton, IonRow, IonIcon, IonLabel, IonItem, IonCardContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, NavController, Platform, IonItemDivider, IonPopover } from '@ionic/angular/standalone';
import { FileSystemService } from 'src/app/services/filesystem.service';
import { StorageService } from 'src/app/services/storage.service';
import { storageConstants } from 'src/app/const/storage';
import { SessionService } from 'src/app/services/session.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { LocalNotificationSchema } from '@capacitor/local-notifications';
import { AuthService } from 'src/app/services/auth.service';
import { DriveService } from 'src/app/services/drive.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationConfigService } from '../../services/translation.service';
import { DashboardPage } from '../dashboard/dashboard.page';
import { Router, RouterModule } from '@angular/router';
import { Network } from '@capacitor/network';
import { AlertService } from 'src/app/services/alert.service';


@Component({
  selector: 'app-backup',
  templateUrl: './backup.page.html',
  styleUrls: ['./backup.page.scss'],
  standalone: true,
  providers:[DashboardPage],
  imports: [IonPopover, IonItemDivider, RouterModule, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard, IonCardContent, IonItem, IonLabel, IonIcon, TranslateModule, IonRow, IonButton, IonCol, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class BackupPage implements OnInit {

  public token:string = "";
  public connected:boolean = false;
  public haveFile:boolean = true;
  public creatingFile:boolean = false;

  constructor(
    private _file:FileSystemService,
    private _storage:StorageService,
    private _session:SessionService,
    private _notifications:NotificationsService,
    private _auth:AuthService,
    private _drive:DriveService,
    private translate:TranslateService,
    private _translation:TranslationConfigService,
    private dashboard:DashboardPage,
    private _platform:Platform,
    private navCtr:NavController,
    private _alert:AlertService
  ) { }

  async ngOnInit() {
    this.translate.setDefaultLang(this._translation.getLanguage());
  }

  async ionViewWillEnter(){
    this.token = this._drive.token;
    this.connected = this._drive.connected;
    this.haveFile = this._drive.haveFile;
  }

  async connectAccount(){
    this.dashboard.isLoading = true;
    await this._drive.connectAccount();
    this.dashboard.isLoading = false;
  }

  async updateData(){
    this.dashboard.isLoading = true;
    await this._drive.updateData();
    this.dashboard.isLoading = false;
  }

  async uploadFile():Promise<void> {
    if(this.token && (await Network.getStatus()).connected === false){
      this._alert.createAlert(this.translate.instant("error.no_network"),"");
    }else{
      this.dashboard.isLoading = true;
      const data = await this._file.buildData();
      console.log(data, this._session.currentUser.id)
      // Subir el contenido del archivo a Google Drive
      await this._drive.uploadFile(data, `${this._session.currentUser.id}.vcc`,this.token)
      .then((msg)=>{
        console.log(msg);
        this.haveFile = true;

      })
      .catch((err)=>{
        console.log(err)
        if(err.error){
          alert(err.error);
        }
      })
      this.dashboard.isLoading = false;
    }
  }

  unconnectAccount(){
    this._session.setGoogleToken("");
    this.connected = false;
    this.haveFile = false;
    this._auth.signOutGoogle();
  }

  async readFileFromDrive() {
    this.dashboard.isLoading = true;
    const fileId = await this._drive.findFileByName(`${this._session.currentUser.id}.vcc`, this.token)
    if (fileId) {
      const result = await this._drive.downloadFile(fileId, this.token);
      console.log(result)
      if(result){
        const resp = JSON.parse(result)
        await this._storage.setStorageItem(storageConstants.USER_VEHICLES+this._session.currentUser.id,resp.vehicles)
        console.log(resp.vehicles)
        await this._storage.setStorageItem(storageConstants.USER_EVENTS+this._session.currentUser.id,resp.events);
        await this._storage.setStorageItem(storageConstants.USER_REMINDER+this._session.currentUser.id,resp.remindersOptions);
        const preparedReminders = await this.setDates(resp.reminders);
        console.log(preparedReminders)
        if(this._platform.is("android")){
          await this._notifications.createNotification(preparedReminders);
        }
        this.navCtr.navigateRoot('/dashboard');
      }
    } else {
      console.log(`File with name '${`${this._session.currentUser.id}.vcc`}' not found.`);
      this.dashboard.isLoading = false;
    }
  }

  async setDates(reminders:LocalNotificationSchema[]):Promise<LocalNotificationSchema[]>{
    reminders.forEach(element => {
      element.schedule!.at! = new Date(element.schedule!.at!)
    });
    return reminders;
  }

  async saveDataOnDevice(){
    this.creatingFile = true;
    await this._file.createBackupFile()
    .then(async()=>{
      this.creatingFile = false;
      await this._alert.createAlert(this.translate.instant('alert.file_created'),this.translate.instant('alert.file_created_text'));
    })
    .catch((err)=>{
      console.log(err);
      this.creatingFile = false;
      if(err.message && err.message === "FILE_NOTCREATED"){
        this._alert.createAlert(this.translate.instant("error.file_notcreated"), this.translate.instant("error.file_notcreated_text"))
      }else{
        alert(err.message);
      }
    })
  }

  async restoreByDevice(){
    this.creatingFile = true;
    await this._file.restoreBackup()
    .then(()=>{
      this.creatingFile = false;
      this._alert.createAlert(this.translate.instant('alert.file_restored'),this.translate.instant('alert.file_restored_text'));
      this.navCtr.navigateRoot('/dashboard');
    })
    .catch((err)=>{
      this.creatingFile = false;
      console.log(err)
      if(err.message &&err.message === "Archivo no válido"){
        this._alert.createAlert(this.translate.instant('error.invalid_file'),this.translate.instant('error.invalid_file_text'));
      }else if(err.message &&err.message === "Usuario incorrecto"){
        this._alert.createAlert(this.translate.instant('error.incorrect_user'),this.translate.instant('error.incorrect_user_text'));
      }else if(err.message !== "pickFiles canceled."){
        alert(err.message);
      }
    })
  }

}


