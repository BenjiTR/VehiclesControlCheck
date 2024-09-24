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

  private hasFileSubscription:Subscription;

  constructor(
    private translate:TranslateService,
    private _translation:TranslationConfigService,
    private _notifications:NotificationsService,
    private _session:SessionService,
    private _drive:DriveService,
    private _alert:AlertService,
    private _paddingService:PaddingService,
    private _storage:StorageService,
    private _platform:Platform
  ) {
    this.hasFileSubscription = this._drive.haveFiles$.subscribe((data)=>{
      this.hasFile = data;
    });
    if(this._platform.is('android')){
      this.platform = 'android'
    }else{
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
    this.connected = await firstValueFrom(this._drive.conected$);
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
    console.log(resp, remindNotifications)
    if (resp === "granted" && remindNotifications){
      this.isAllowed = true;
      this._notifications.createChannel();
    }else{
      this.isAllowed = false;
      this._notifications.deleteChannel();
    }
  }

  async togglePermissions(){
    console.log(this.isAllowed)
    if(this.isAllowed){
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

  onAutoBkChange(value: any) {
    //console.log(value.detail.value)
    if(value.detail.value === "true"){
      this.autoBk = true;
    }else{
      this.autoBk = false;
    }
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
      const fileName = "remindersOptions";
      let optionString:string;
      if(option){
        optionString = "true";
      }else{
        optionString = "false";
      }
      const exist = await this._drive.findFileByName(fileName)
          if(exist){
            this._drive.updateFile(exist, optionString, fileName);
          }else{
            this._drive.uploadFile(optionString, fileName);
          }
    }
  }


}
