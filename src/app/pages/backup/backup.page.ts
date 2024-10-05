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
import { RouterModule } from '@angular/router';
import { Network } from '@capacitor/network';
import { AlertService } from 'src/app/services/alert.service';
import { LoaderService } from 'src/app/services/loader.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { PaddingService } from 'src/app/services/padding.service';
import { DataService } from 'src/app/services/data.service';
import { CryptoService } from 'src/app/services/crypto.services';
import { DateService } from 'src/app/services/date.service';
import { Event } from 'src/app/models/event.model';
import { Vehicle } from 'src/app/models/vehicles.model';
import { CalendarService } from 'src/app/services/calendar.service';

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
  public haveFiles:boolean = false;
  public creatingFile:boolean = false;
  public progress:any = [0,0];
  public uploading:boolean = false;
  public downloading:string = "false";
  public cleaning:boolean = false;
  public vehiclesArray:Vehicle[]=[];

  private progressSubscription: Subscription;
  private uploadingSubscription: Subscription;
  private downloadingSubscription: Subscription;
  private cleaningSubscription: Subscription;
  private haveFileSubscription:Subscription;
  private creatingFileSubscription: Subscription;
  private connectedSubscription: Subscription;

  constructor(
    private _file:FileSystemService,
    private _storage:StorageService,
    private _session:SessionService,
    private _notifications:NotificationsService,
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
    private _crypto:CryptoService,
    private _date:DateService,
    private _calendar:CalendarService
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
    this.haveFileSubscription = this._drive.haveFiles$.subscribe(data=>{
      this.haveFiles=data;
    });
    this.creatingFileSubscription = this._drive.creatingFile$.subscribe(data=>{
      this.creatingFile=data;
    });
    this.connectedSubscription = this._drive.conected$.subscribe(async data=>{
      console.log(data)
      this.connected = data;
      const id = await this._calendar.findVehicleControlCalendar();
      if(this.connected && !id){
        const sure = await this._alert.twoOptionsAlert(this.translate.instant('alert.do_you_want_connect_calendar'),this.translate.instant('alert.do_you_want_connect_calendar_text'),this.translate.instant('alert.accept'),this.translate.instant('alert.cancel'))
        if(sure){
          await this._loader.presentLoader();
          try{
            await this._calendar.connectCalendar();
          }catch(err:any){
            throw err;
          }
          await this._loader.dismissLoader();
        }
      }
      if(this.connected && !this.haveFiles){
        const sure = await this._alert.twoOptionsAlert(this.translate.instant('alert.files_not_found'),this.translate.instant('alert.files_not_found_text'),this.translate.instant('alert.accept'),this.translate.instant('alert.cancel'))
        if(sure){
          this.uploadFiles();
        }
      }
    })
    this.vehiclesArray = this._session.vehiclesArray;
  }

  async ngOnInit() {
    this.translate.setDefaultLang(this._translation.getLanguage());
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

  //DISPOSITIVO
  async saveDataOnDevice(){
    this._drive.changeCreatingFile(true);

    await this._file.createBackupFile()
    .then(async()=>{
      this._drive.changeCreatingFile(false);
      await this._alert.createAlert(this.translate.instant('alert.file_created'),this.translate.instant('alert.file_created_text'));
    })
    .catch((err)=>{
      console.log(err);
      this._drive.changeCreatingFile(false);
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
      this._drive.changeCreatingFile(true);
      const data = await this._file.restoreBackup()
      .then(async ()=>{
        this._drive.changeCreatingFile(false);
        await this._alert.createAlert(this.translate.instant('alert.file_restored'),this.translate.instant('alert.file_restored_text'))
        .then(async ()=>{
          if(this._drive.folderId && this._session.autoBackup){
            this.updateData(true);
          }
          const events = await this._session.loadEvents();
          this.setNotifications(events)
          this._drive.changeDownloading("refresh");
          this._drive.changeDownloading("false");
          this.navCtr.navigateRoot(['/dashboard'], { queryParams: { reload: true } });
        })
      })
      .catch((err)=>{
        this._drive.changeCreatingFile(false);
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
  async updateData(alternativeAks?:boolean){
    if(this.token && (await Network.getStatus()).connected === false){
      this._alert.createAlert(this.translate.instant("error.no_network"),"");
    }else{
      let title;
      let text;
      if(alternativeAks){
        title = this.translate.instant('alert.do_you_want?');
        text = this.translate.instant('alert.update_files_text');
      }else{
        title = this.translate.instant('alert.are_you_sure?');
        text = this.translate.instant('alert.update_files_text');
      }
      const sure = await this._alert.twoOptionsAlert(title,text,this.translate.instant('alert.accept'),this.translate.instant('alert.cancel'));
      if(sure){
        this.updateProcess();
      }
    }
  }

  async updateProcess(){
    this._drive.changeCreatingFile(true);
    this._storage.setStorageItem(storageConstants.USER_OPS+this._session.currentUser.id,true);
        await this.removeAllElements()
        .then(async()=>{
          await this.uploadFiles();
          this._drive.changeCreatingFile(false);
          this._storage.setStorageItem(storageConstants.USER_OPS+this._session.currentUser.id,false);
        })
        .catch((e)=>{
          console.log(e);
          this._drive.changeCreatingFile(false);
          this._alert.createAlert(this.translate.instant('error.error_cleaning'), this.translate.instant('error.error_cleaning_text'));
        })
  }

  async uploadFiles():Promise<void> {
    if(this.token && (await Network.getStatus()).connected === false){
      this._alert.createAlert(this.translate.instant("error.no_network"),"");
    }else{
      this._drive.changeCreatingFile(true);
      this._storage.setStorageItem(storageConstants.USER_OPS+this._session.currentUser.id,true);

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
      this._drive.changeCreatingFile(false);
      this._storage.setStorageItem(storageConstants.USER_OPS+this._session.currentUser.id,false)
      this._drive.changeHaveFiles(true);
      this._drive.changeUploading(false);
    }
  }

  async restoreBackup(){
    const sure = await this._alert.twoOptionsAlert(this.translate.instant('alert.are_you_sure?'),this.translate.instant('alert.actual_data_will_be_rewrite'),this.translate.instant('alert.accept'),this.translate.instant('alert.cancel'))
    if(sure){
      this._drive.changeProgress(0,0)
      this._drive.changeDownloading("true");
      const backupList = await this.readAll();
      const backupData = await this.setData(backupList);
      await this._data.restoreDeviceData(backupData);
      this.setNotifications(backupData.events)
      this._drive.changeDownloading("refresh");
      this._drive.changeDownloading("false");
      this.navCtr.navigateRoot(['/dashboard'], { queryParams: { reload: true } });
    }
  }

  async setNotifications(events:Event[]){
    let remindersArray:LocalNotificationSchema[]= await this._session.loadReminders();
    events.forEach(async event => {
      if(event.reminderDate && event.reminder && this._date.isFutureEvent(event.reminderDate)){
        const index = remindersArray.findIndex(reminder=>reminder.extra.eventId === event.id);
        const reminder = await this.constructReminder(event);
        console.log("¿Indice? ", index);
        if (index !=-1){
          console.log("¿Indice si? ", index);
          remindersArray[index] = reminder;
        }else{
          console.log("¿Indice no? ", index);
          remindersArray.push(reminder);
        }
        console.log("se crea la notificación: ");
        this._notifications.createNotification(remindersArray);
      }
    });
  }

  async setData(backup:any):Promise<Backup>{
    let temporalBackup:Backup = {
      vehicles: [],
      events: [],
      remindersOptions: false,
      autoBackup: true,
      photo: "",
      tags: []
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
        console.log(content)
        if (element.name === "photo") {
          temporalBackup.photo = content;
        } else if (element.name === "remindersOptions") {
          temporalBackup.remindersOptions = JSON.parse(content) ;
        } else if (element.name.startsWith("V")) {
          //console.log("Vehiculos: ",content)
          temporalBackup.vehicles.push(JSON.parse(this._crypto.decryptMessage(content)));
        } else if (element.name.startsWith("E")) {
          //console.log("Eventos: ",content)
          const event:Event = JSON.parse(this._crypto.decryptMessage(content))
          temporalBackup.events.push(event);
        }else if (element.name === "tags"){
          temporalBackup.tags = JSON.parse(this._crypto.decryptMessage(content));
        }
      }
    }
    return temporalBackup;
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

  async constructReminder(event:Event){

    const newReminder:LocalNotificationSchema = {
      channelId:"VCC",
      title:this.currentVehicle(event.vehicleId)+" - "+event.reminderTittle,
      body:event.info,
      largeBody:event.info,
      summaryText:event.info,
      id: event.reminderId!,
      schedule: {at: new Date(event.reminderDate!)},
      sound:'clockalarm.wav',
      extra:{
        eventId:event.id,
        titleWithoutCar:event.reminderTittle,
      }
    }
    return newReminder;
  }

  async currentVehicle(vehicleId:string){
    this.vehiclesArray = await this._session.loadVehicles();
    console.log("Array:", this.vehiclesArray)
    const current = this.vehiclesArray.find(vehicle=>vehicle.id === vehicleId);
    return current!.brandOrModel;
  }



}


