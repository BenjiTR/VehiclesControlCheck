import { AdmobService } from 'src/app/services/admob.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonSelectOption, IonContent, IonHeader, IonTitle, IonToolbar, IonRow, IonCol, IonIcon, IonButton, IonImg, IonItem, IonLabel, IonDatetime, IonInput, IonTextarea, NavController, IonSelect } from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationConfigService } from 'src/app/services/translation.service';
import { LocalNotificationSchema } from '@capacitor/local-notifications';
import { DashboardPage } from '../dashboard/dashboard.page';
import { SessionService } from 'src/app/services/session.service';
import { AlertService } from 'src/app/services/alert.service';
import { Vehicle } from 'src/app/models/vehicles.model';
import { NotificationsService } from 'src/app/services/notifications.service';
import { User } from 'src/app/models/user.model';
import { DateService } from 'src/app/services/date.service';
import { BackupPage } from '../backup/backup.page';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-reminder',
  templateUrl: './reminder.page.html',
  styleUrls: ['./reminder.page.scss'],
  standalone: true,
  providers: [DashboardPage, BackupPage],
  imports: [IonSelect, IonSelectOption, IonInput, IonTextarea, TranslateModule, IonDatetime, IonLabel, IonItem, IonImg, IonButton, IonIcon, IonCol, IonRow, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ReminderPage{

  public remindersArray:LocalNotificationSchema[] = [];
  public reminderToEditId:number;
  public reminderToEdit:LocalNotificationSchema = {
    id: 0,
    title:"",
    body: ""
  };
  public dateOfEvent:Date = new Date;
  public title:string = "";
  public body:string = "";
  public vehiclesArray:Vehicle[] = [];
  public vehicleId:string="";
  public user:User = new User;

  constructor(
    private translate:TranslateService,
    private _translation:TranslationConfigService,
    private activatedroute:ActivatedRoute,
    private dashboard:DashboardPage,
    private _session:SessionService,
    private _alert:AlertService,
    private navCtr:NavController,
    private _admobService:AdmobService,
    private _notifications:NotificationsService,
    private _date:DateService,
    private _loader:LoaderService,
    private backup:BackupPage
  ) {
    this.reminderToEditId = this.activatedroute.snapshot.queryParams['reminderToEditId'];
    if(this.reminderToEditId){
      this.getReminder();
    }
  }

  async ionViewWillEnter() {
    await this._loader.presentLoader();
    this.translate.setDefaultLang(this._translation.getLanguage());
    this.remindersArray = await this._session.remindersArray;
    this.reminderToEditId = this.activatedroute.snapshot.queryParams['reminderToEditId'];
    if(this.reminderToEditId){
      this.getReminder();
    }
    this.vehiclesArray = this._session.vehiclesArray;
    this.user = this._session.currentUser;
    await this._loader.dismissLoader();
;
  }

  getReminder(){
    const current = this.remindersArray.find(reminder => reminder.id === this.reminderToEditId)
    if (current){
      this.reminderToEdit = JSON.parse(JSON.stringify(current));
      this.asignPropertis();
    }
  }

  getDate(): string {
    return this._date.getIsoDate(this.dateOfEvent);
  }

  updateDate(event:any){
    this.dateOfEvent = event.detail.value;
  }

  asignPropertis(){
    this.vehicleId = this.reminderToEdit.extra.vehicleId;
    this.dateOfEvent = this.reminderToEdit.schedule!.at!;
    this.title = this.reminderToEdit.extra.titleWithoutCar;
    this.body = this.reminderToEdit.body;
  }

  async cancelCreateEvent(){
    const sure = await this._alert.twoOptionsAlert(this.translate.instant('alert.are_you_sure?'),this.translate.instant('alert.changes_will_not_be_saved'),this.translate.instant('alert.accept'),this.translate.instant('alert.cancel'))
    if(sure){
    await this._loader.presentLoader();
      this.navCtr.navigateRoot('/dashboard')
    }
  }

  async createEvent(){
    if(this.reminderToEditId){
      this.editReminder();
    }else{
      this.createNew();
    }
  }

  async editReminder(){
    if(!this.vehicleId){
      this._alert.createAlert(this.translate.instant("alert.enter_name_or_model"),this.translate.instant("alert.enter_name_or_model_text"));
    }else if(!this.title){
      this._alert.createAlert(this.translate.instant("alert.enter_title"),this.translate.instant("alert.enter_title_text"));
    }else if(!this.dateOfEvent){
      this._alert.createAlert(this.translate.instant("alert.enter_date"),this.translate.instant("alert.enter_date_text"));
    }else{
    await this._loader.presentLoader();
      const index = this.remindersArray.findIndex(reminder => reminder.id === this.reminderToEditId);
      if(index !== -1){
         const newReminder = await this.generateReminder();
         console.log(newReminder);
         this._session.remindersArray[index] = newReminder;
         await this._notifications.createNotification([newReminder]);
         console.log(this.remindersArray[index]);
      }
      this.saveAndExit();
    }
  }

  async generateReminder(){
    let id;
    if(this.reminderToEditId){
      id = this.reminderToEditId;
    }else{
      id = this.remindersArray.length+1;
    }
    const newReminder:LocalNotificationSchema = {
      channelId:"VCC",
      title:this.currentVehicle()+" - "+this.title,
      body:this.body,
      largeBody:this.body,
      summaryText:this.body,
      id:id,
      schedule: {at: new Date(this.dateOfEvent)},
      extra:{
        vehicleId:this.vehicleId,
        userId:this.user.id,
        titleWithoutCar:this.title
      }
    }
    return newReminder;
  }

  currentVehicle(){
    const current = this.vehiclesArray.find(vehicle=>vehicle.id === this.vehicleId);
    return current!.brandOrModel;
  }

  async saveAndExit(){
    this._session.remindersArray = this.remindersArray
    await this._admobService.showinterstitial();
    if(this._session.currentUser.backupId && this._session.autoBackup){
      await this.backup.updateData();
    }
    this.navCtr.navigateRoot('/dashboard');
  }

  async createNew(){
    if(!this.vehicleId){
      this._alert.createAlert(this.translate.instant("alert.enter_name_or_model"),this.translate.instant("alert.enter_name_or_model_text"));
    }else if(!this.title){
      this._alert.createAlert(this.translate.instant("alert.enter_title"),this.translate.instant("alert.enter_title_text"));
    }else if(!this.dateOfEvent){
      this._alert.createAlert(this.translate.instant("alert.enter_date"),this.translate.instant("alert.enter_date_text"));
    }else{
      await this._loader.presentLoader();
      const newReminder = await this.generateReminder();
      this.remindersArray.push(newReminder)
      await this._notifications.createNotification([newReminder]);
      this.saveAndExit();
    }
  }


}
