import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Platform, IonToggle, IonContent, IonHeader, IonTitle, IonToolbar, IonCol, IonRow, IonLabel, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonSegment, IonSegmentButton, IonRadio, IonProgressBar, IonPopover, IonItemDivider, IonButton } from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationConfigService } from 'src/app/services/translation.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { SessionService } from 'src/app/services/session.service';
import { RouterModule } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { DriveService } from 'src/app/services/drive.service';
import { AlertService } from 'src/app/services/alert.service';
import { PaddingService } from 'src/app/services/padding.service';
import { BackupPage } from "../backup/backup.page";
import { StorageService } from 'src/app/services/storage.service';
import { storageConstants } from 'src/app/const/storage';
import { LoaderService } from 'src/app/services/loader.service';
import { AuthService } from 'src/app/services/auth.service';
import { CalendarService } from 'src/app/services/calendar.service';
import { SyncService } from 'src/app/services/sync.service';
import { HashService } from 'src/app/services/hash.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: true,
  imports: [IonButton, IonLabel, IonItemDivider, IonProgressBar, IonPopover, IonRadio, IonSegmentButton, IonSegment, IonCardContent, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard, RouterModule, IonIcon, FormsModule, IonLabel, IonCol, IonRow, IonToggle, TranslateModule, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, BackupPage]
})
export class NotificationsPage{

  public isAllowed:boolean = false;
  public errorText:string = "prueba";
  public autoBk:boolean = true;
  public connected:boolean = false;
  public hasFile:boolean = false;
  public currency:string = "";
  public platform:string = "";
  public creatingFile:boolean = false;
  public downloading:string = "false";
  public backupAccount:string="";
  public calendar:boolean|undefined = undefined;

  private calendarSubscription:Subscription;
  private connectedSubscription: Subscription;
  private creatingFileSubscription: Subscription;
  private hasFileSubscription:Subscription;
  private downloadingSubscription: Subscription;

  constructor(
    private translate:TranslateService,
    private _translation:TranslationConfigService,
    private _notifications:NotificationsService,
    private _session:SessionService,
    private _drive:DriveService,
    private _alert:AlertService,
    private _paddingService:PaddingService,
    private _storage:StorageService,
    private _platform:Platform,
    private _loader:LoaderService,
    private _auth:AuthService,
    private _calendar:CalendarService,
    private _sync:SyncService,
    private _hash:HashService
  ) {
    this.hasFileSubscription = this._drive.haveFiles$.subscribe((data)=>{
      this.hasFile = data;
    });
    this.creatingFileSubscription = this._drive.creatingFile$.subscribe(data=>{
      this.creatingFile=data;
    });
    this.downloadingSubscription = this._drive.downloading$.subscribe(data=>{
      this.downloading = data;
    });
    this.calendarSubscription = this._calendar.calendar$.subscribe(value=>{
      this.calendar = value;
    })
    this.connectedSubscription = this._drive.conected$.subscribe(async data=>{
      this.connected = data;
    })

    if(this._platform.is('android')){
      this.platform = 'android'
    }else if(this._platform.is('desktop')){
      this.platform = 'desktop'
    }else if(this._platform.is('ios')){
      this.platform = 'ios'
    }
  }

  async ionViewWillEnter() {
    this.getData();
    //console.log("estado: ",this.connected, this.hasFile)
    this.autoBk = await this._session.getAutoBackup();
    if(this.autoBk === null){
      this._session.setAutoBackup(true);
      this.autoBk = true;
    }else{
      this._drive.changeautoBk(this.autoBk);
    }
    //console.log(this.autoBk);
    this.errorText = "";
    this.translate.setDefaultLang(this._translation.getLanguage());
    this.currency = this._session.currency;
    await this.checkPermissions();
  }


  async getData(){
    this.backupAccount = this._session.backupMail;
    if(this.connected){
      const id = await this._calendar.findVehicleControlCalendar();
      if(id){
        this.calendar = true;
        this._storage.setStorageItem(storageConstants.USER_CALENDAR_ID+this._session.currentUser.id,id);
      }else{
        this.calendar = false;
      }
    }
  }


  async checkPermissions():Promise<void>{
    const resp = await this._notifications.checkPermissions();
    //console.log("Check: ",resp)
    this.isAllowedAndActivated(resp.display);
  }

  async requestPermissions():Promise<void>{
    const resp = await this._notifications.requestPermissions();
      this.isAllowedAndActivated(resp.display);
  }

  async isAllowedAndActivated(resp:string){
    const remindNotifications = await this._session.getReminderNotifications();
    //console.log(resp, remindNotifications)
    if (resp === "granted" && remindNotifications){
      this.isAllowed = true;
      this._notifications.createChannel();
    }else{
      this.isAllowed = false;
      this._notifications.deleteChannel();
    }
  }

  async togglePermissions(event?:CustomEvent){
    if(event && !event.detail.checked){
      //console.log(event.detail.checked);
      this.isAllowed = false;
      this._notifications.deleteChannel();
      this._session.setReminderNotifications(false)
    }else{
      const resp = await this._notifications.requestPermissions();
      //console.log("Req: ",resp)
      if(resp.display==="granted"){
        this.isAllowed = true;
        this._notifications.createChannel();
        this._session.setReminderNotifications(true)
      }else{
        this.isAllowed = false;
        this._notifications.deleteChannel();
        this._session.setReminderNotifications(false);
        this.errorText = await this.translate.instant("notifications.not_allowed_text");
      }
    }
    this.hasFile = await firstValueFrom(this._drive.haveFiles$);
    this.saveInCloud(this.isAllowed)
  }

  async toggleCalendar(event:CustomEvent){
    if(event.detail.checked){

      await this._loader.presentLoader();
        await this.connectCalendar()
        .then(()=>{
          this.calendar = event.detail.checked;
        })
        .catch(async (err)=>{
          this._alert.createAlert(this.translate.instant("error.an_error_ocurred"),err);
          this._calendar.calendarId = "";
          this._storage.setStorageItem(storageConstants.USER_CALENDAR_ID+this._session.currentUser.id,"");
          this.calendar = false;
          if(this._calendar.calendarId){
            await this.unconnectCalendar();
          }
        })
      await this._loader.dismissLoader();

    }else{

      await this._loader.presentLoader();
        await this.unconnectCalendar()
        .then(()=>{
          this.calendar = event.detail.checked;
          this._storage.setStorageItem(storageConstants.USER_CALENDAR_ID+this._session.currentUser.id,"");
          this._calendar.calendarId = "";
        })
        .catch((err)=>{
          this._alert.createAlert(this.translate.instant("error.an_error_ocurred"),err);
          this.calendar = true;
        })
      await this._loader.dismissLoader();
    }
  }


  async onAutoBkChange(value: any) {
    //console.log(value.detail.value)
    if(value.detail.value === "true"){
      this.autoBk = true;
    }else{
      this.autoBk = false;
    }

    const fileName = "autoBackup";
    const newSyncHash = await this._hash.generateSyncPhrase();
    const DriveFileName = fileName+"-"+newSyncHash;
    const exist = await this._drive.findFileByName(fileName)
    let optionString:string;
      if(this.autoBk){
        optionString = "true";
      }else{
        optionString = "false";
      }
    if(exist){
      this._drive.updateFile(exist, optionString, DriveFileName, true);
    }else{
      this._drive.uploadFile(optionString, DriveFileName);
    }
    this._sync.updateSyncList(DriveFileName);
    this._drive.changeautoBk(this.autoBk)
    this._session.setAutoBackup(this.autoBk);
  }

  async currencyChange(value: any) {
    //console.log(value.detail.value)
    await this._storage.setStorageItem(storageConstants.USER_CURRENCY+this._session.currentUser.id, value.detail.value);
    this._session.currency = value.detail.value;
  }


  segmentAlerts(){
    if(this.connected && !this.hasFile){
      this._alert.createAlert(this.translate.instant("alert.no_backup_file"), this.translate.instant("alert.no_backup_files_text"))
    }else if(!this.connected && !this.hasFile){
      this._alert.createAlert(this.translate.instant("alert.no_connected_to_backup_account"), this.translate.instant("alert.no_connected_to_backup_account_text"))
    }
  }

  calculatePadding(){
    return this._paddingService.calculatePadding();
  }

  async saveInCloud(option:boolean){
    if(this._drive.folderId && this._session.autoBackup){
      const newSyncHash = await this._hash.generateSyncPhrase();
      const fileName = "remindersOptions";
      const DriveFileName = fileName+"-"+newSyncHash;

      let optionString:string;
      if(option){
        optionString = "true";
      }else{
        optionString = "false";
      }
      const exist = await this._drive.findFileByName(fileName)
          if(exist){
            this._drive.updateFile(exist, optionString, fileName, true);
          }else{
            this._drive.uploadFile(optionString, fileName);
          }
      this._sync.updateSyncList(DriveFileName);
    }
  }

  //CONECTAR CUENTA ASOCIADA
  async connectAccount(){
    await this._loader.presentLoader();
    await this._drive.connectAccount();
    this.getData();
    await this._loader.dismissLoader();
  }

  async unconnectAccount(){
    await this._session.setGoogleToken("");
    await this._drive.changeConnected(false);
    await this._drive.changeHaveFiles(false);
    await this.getData();
    await this._auth.signOutGoogle();
    localStorage.setItem(storageConstants.SUGGESTIONS+this._session.currentUser.id,"");
    this._storage.setStorageItem(storageConstants.USER_CALENDAR_ID+this._session.currentUser.id, "");
  }


  //GOOGLE CALENDAR
  async connectCalendar():Promise<any>{
      try{
        await this._calendar.connectCalendar();
      }catch(err:any){
        throw err;
      }
  }

  async unconnectCalendar(){
      try{
        await this._calendar.deleteCalendar();
      }catch(err:any){
        throw err;
      }
  }

}
