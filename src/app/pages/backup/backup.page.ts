import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCol, IonButton, IonRow, IonIcon, IonLabel, IonItem, IonCardContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, NavController, Platform } from '@ionic/angular/standalone';
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
  imports: [RouterModule, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard, IonCardContent, IonItem, IonLabel, IonIcon, TranslateModule, IonRow, IonButton, IonCol, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class BackupPage implements OnInit {

  public token:string = "";
  public connected:boolean = false;
  public haveFile:boolean = false;

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
  ) {
  }

  async ngOnInit() {
    this.dashboard.isLoading = true;
    this.translate.setDefaultLang(this._translation.getLanguage());
  }

  async ionViewWillEnter(){
    this.dashboard.isLoading = true;
    await this.haveToken()
    this.dashboard.isLoading = false;
  }

  async haveToken(){
    this.token = await this._session.getToken();
    if(this.token && (await Network.getStatus()).connected === true){
      await this.connectAccount();
    }else if(this.token && (await Network.getStatus()).connected === false){
      this._alert.createAlert(this.translate.instant("error.no_network"), this.translate.instant("error.no_network_to_backup"));
    }else{
      this.dashboard.isLoading = false;
    }
  }

  async connectAccount():Promise<void>{
    if(this.token && (await Network.getStatus()).connected === false){
      this._alert.createAlert(this.translate.instant("error.no_network"),"");
    }else{
      this.dashboard.isLoading = true;
      await this._auth.refreshGoogle()
      .then(async(msg)=>{
        this.token = msg.accessToken;
        this._session.setGoogleToken(this.token);
        this.connected = true;
        await this.existsFile();
      })
      .catch(async (err)=>{
        console.log("error",err);
        await this._auth.loginWithGoogle()
        .then(async(user)=>{
          this.token = user.authentication.accessToken;
          this._session.setGoogleToken(this.token);
          this.connected = true;
          await this.existsFile();
        })
        .catch(async (err)=>{
          console.log("error",err);
          if(err.error){
          alert(err.error);
        }
        })
      })
      this.dashboard.isLoading = false;
    }
  }

  async existsFile():Promise<void>{
    const fileId = await this._drive.findFileByName(`${this._session.currentUser.id}.vcc`, this.token)
    console.log(fileId);
    if(fileId){
      this.haveFile = true;
      this._session.currentUser.backupId = fileId;
    }
    return;
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

  async updateData(){
    if((await Network.getStatus()).connected === false){
      this._alert.createAlert(this.translate.instant("error.no_network"), this.translate.instant("error.no_network_to_backup"));
      this._session.currentUser.backupId = "";
      return
    }else{
      this.dashboard.isLoading = true;
      this.token = await this._session.getToken();
      const data = await this._file.buildData();
      const fileId = await this._drive.findFileByName(`${this._session.currentUser.id}.vcc`, this.token)
      console.log(fileId,this.token)
      if(fileId){
        await this._drive.updateFile(fileId,data,this._session.currentUser.id+".vcc",this.token)
        .then((msg)=>{
          console.log(msg)
          return
        })
        .catch((err)=>{
          console.log(err);
          if(err.error){
            alert(err.error);
          }
          return
        })
        this.dashboard.isLoading = false;
      }else{
        this.dashboard.isLoading = false;
      }
    }
  }



}


