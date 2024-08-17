import { NotificationsPage } from './../notifications/notifications.page';
import { Backup } from './../../models/backup.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCol, IonButton, IonRow, IonIcon, IonLabel, IonItem, IonCardContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, NavController, Platform, IonItemDivider, IonPopover, IonProgressBar } from '@ionic/angular/standalone';
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
import { Router, RouterModule } from '@angular/router';
import { Network } from '@capacitor/network';
import { AlertService } from 'src/app/services/alert.service';
import { LoaderService } from 'src/app/services/loader.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { PaddingService } from 'src/app/services/padding.service';
import { DataService } from 'src/app/services/data.service';
import { CryptoService } from 'src/app/services/crypto.services';

@Component({
  selector: 'app-backup',
  templateUrl: './backup.page.html',
  styleUrls: ['./backup.page.scss'],
  standalone: true,
  imports: [IonProgressBar, IonPopover, IonItemDivider, RouterModule, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard, IonCardContent, IonItem, IonLabel, IonIcon, TranslateModule, IonRow, IonButton, IonCol, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class BackupPage implements OnInit {

  public token:string = "";
  public connected:boolean = false;
  public haveFiles:boolean = true;
  public creatingFile:boolean = false;
  public progress:any = [0,0];
  public uploading:boolean = false;
  public downloading:string = "false";
  public cleaning:boolean = false;

  private progressSubscription: Subscription;
  private uploadingSubscription: Subscription;
  private downloadingSubscription: Subscription;
  private cleaningSubscription: Subscription;


  constructor(
    private _file:FileSystemService,
    private _storage:StorageService,
    private _session:SessionService,
    private _notifications:NotificationsService,
    private _auth:AuthService,
    private _drive:DriveService,
    private translate:TranslateService,
    private _translation:TranslationConfigService,
    private _platform:Platform,
    private navCtr:NavController,
    private _alert:AlertService,
    private _loader:LoaderService,
    private _paddingService:PaddingService,
    private _data:DataService,
    private notifications:NotificationsPage,
    private _crypto:CryptoService
  ) {
    this.progressSubscription = this._drive.progress$.subscribe(data=>{
      this.progress = data;
    });
    this.uploadingSubscription = this._drive.uploading$.subscribe(data=>{
      this.uploading = data;
    });
    this.downloadingSubscription = this._drive.downloading$.subscribe(data=>{
      this.downloading = data;
    });
    this.cleaningSubscription = this._drive.cleaning$.subscribe(data=>{
      this.cleaning = data;
    });
  }

  async ngOnInit() {
    this.translate.setDefaultLang(this._translation.getLanguage());
    this.getData();
  }

  ionViewWillLeave() {
    this.progressSubscription.unsubscribe();
    this.uploadingSubscription.unsubscribe();
    this.downloadingSubscription.unsubscribe();
    this.cleaningSubscription.unsubscribe();

  }

  OnDestroy(){
    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
    }
    if (this.uploadingSubscription) {
      this.uploadingSubscription.unsubscribe();
    }
  }

  async getData(){
    this.connected = await firstValueFrom(this._drive.conected$);
    this.haveFiles = await firstValueFrom(this._drive.haveFiles$);
  }


  async connectAccount(){
    await this._loader.presentLoader();
    await this._drive.connectAccount();
    this.getData();
    this.notifications.getData();
    await this._loader.dismissLoader();


  }


  //DISPOSITIVO
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
    const sure = await this._alert.twoOptionsAlert(this.translate.instant('alert.are_you_sure?'),this.translate.instant('alert.actual_data_will_be_rewrite'),this.translate.instant('alert.accept'),this.translate.instant('alert.cancel'))
    if(sure){
      this.creatingFile = true;
      await this._file.restoreBackup()
      .then(()=>{
        this.creatingFile = false;
        this._alert.createAlert(this.translate.instant('alert.file_restored'),this.translate.instant('alert.file_restored_text'));
        this.navCtr.navigateRoot(['/dashboard'], { queryParams: { reload: true } });
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

//DRIVE
  async updateData(){
    if(this.token && (await Network.getStatus()).connected === false){
      this._alert.createAlert(this.translate.instant("error.no_network"),"");
    }else{

      const sure = await this._alert.twoOptionsAlert(this.translate.instant('alert.are_you_sure?'),this.translate.instant('alert.update_files_text'),this.translate.instant('alert.accept'),this.translate.instant('alert.cancel'));
      if(sure){
        this._storage.setStorageItem(storageConstants.USER_OPS+this._session.currentUser.id,true)
        await this.removeAllElements()
        .then(async()=>{
          await this.uploadFiles();
          this._storage.setStorageItem(storageConstants.USER_OPS+this._session.currentUser.id,false)
        })
        .catch((e)=>{
          console.log(e);
          this._alert.createAlert(this.translate.instant('error.error_cleaning'), this.translate.instant('error.error_cleaning_text'))
        })
      }
    }
  }

  async uploadFiles():Promise<void> {
    if(this.token && (await Network.getStatus()).connected === false){
      this._alert.createAlert(this.translate.instant("error.no_network"),"");
    }else{
      this._storage.setStorageItem(storageConstants.USER_OPS+this._session.currentUser.id,true)
      if(!this._drive.folderId){
        await this.createFolder();
      }
      const data = await this._data.buildDriveData();
      this._drive.changeProgress(0,0)
      this._drive.changeUploading(true);
      const total = data.length;
      const unit = 1/total;
      let value = 0;
      let buffer = 0;

      for(const element of data){
        try {
          buffer += unit;
          this._drive.changeProgress(value, buffer);
          const exist = await this._drive.findFileByName(element.fileName)
          if(exist){
            await this._drive.updateFile(exist, element.content, element.fileName);
          }else{
            await this._drive.uploadFile(element.content, element.fileName);
          }
          value += unit;
          this._drive.changeProgress(value, buffer);
        } catch (err) {
          console.log("Ocurrió un error: ", err);
          break;
        }
      }
      this._storage.setStorageItem(storageConstants.USER_OPS+this._session.currentUser.id,false)
      this._drive.changeHaveFiles(true);
      this._drive.changeUploading(false);
      this.getData();
    }
  }

  async restoreBackup(){
    this._drive.changeProgress(0,0)
    this._drive.changeDownloading("true");
    const backupList = await this.readAll();
    const backupData = await this.setData(backupList);
    await this._data.restoreDeviceData(backupData);
    this._drive.changeDownloading("refresh");
    this._drive.changeDownloading("false");
    this.navCtr.navigateRoot(['/dashboard'], { queryParams: { reload: true } });
  }

  async setData(backup:any):Promise<Backup>{
    let temporalBackup:Backup = {
      vehicles: [],
      events: [],
      reminders: [],
      remindersOptions: false,
      autoBackup: true,
      photo: ""
    };

      const total = backup.length;
      const unit = 1/total;
      let value = 0;
      let buffer = 0;

    for (const element of backup) {
      value += unit;
      this._drive.changeProgress(value, value);
      const content = await this.readFileFromDrive(element.name);
      if (content) {
        if (element.name === "photo") {
          temporalBackup.photo = content;
        } else if (element.name === "remindersOptions") {
          temporalBackup.remindersOptions = JSON.parse(content) ;
        } else if (element.name.startsWith("V")) {
          //console.log("Vehiculos: ",content)
          temporalBackup.vehicles.push(JSON.parse(this._crypto.decryptMessage(content)));
        } else if (element.name.startsWith("E")) {
          //console.log("Eventos: ",content)
          temporalBackup.events.push(JSON.parse(this._crypto.decryptMessage(content)));
        } else if (element.name.startsWith("R")) {
          temporalBackup.reminders.push(JSON.parse(content));
        }
      }
    }
    return temporalBackup;
  }

  async unconnectAccount(){
    await this._session.setGoogleToken("");
    await this._drive.changeConnected(false);
    await this._drive.changeHaveFiles(false);
    await this.getData();
    await this._auth.signOutGoogle();
  }

  async readFileFromDrive(fileName:string):Promise<any> {
    try {
      // Primero, encuentra el archivo por su nombre
      const file = await this._drive.findFileByName(fileName);

      if (!file) {
        //console.log('El archivo no fue encontrado.');
        return;
      }
      // Luego, descarga el contenido del archivo usando su fileId
      const content = await this._drive.downloadFile(file);
      return content;

    } catch (error) {
      console.error('Error al leer el archivo desde Drive:', error);
      return;
    }
  }


   //ELIMINAR TODOS LOS ELEMENTOS DE DRIVE
   async removeAllElements():Promise<void>{
    this._drive.changecleaning(true);
    const oldFiles = await this._drive.listFilesInFolder();
    const total = oldFiles.length;
    const unit = 1/total;
    let value = 0;
    let buffer = 0;

    for(const element of oldFiles){

      buffer += unit;
      this._drive.changeProgress(value, buffer);
      try{
        await this.deleteFile(element.id);
        value += unit;
        this._drive.changeProgress(value, buffer);
      }catch (err){
        console.log(err);
        throw new Error('Error al eliminar de Drive');
      }
    }
    this._drive.changecleaning(false);
    return;
  }

  async createFolder(){
    const resp = await this._drive.createFolder();
  }

  async readAll(){
    const resp = await this._drive.listFilesInFolder();
    return resp;
  }

  async deleteFile(id:string){
    await this._drive.deleteFile(id);
  }

  async setDates(reminders:LocalNotificationSchema[]):Promise<LocalNotificationSchema[]>{
    reminders.forEach(element => {
      element.schedule!.at! = new Date(element.schedule!.at!)
    });
    return reminders;
  }

  calculatePadding(){
    return this._paddingService.calculatePadding();
  }


}


