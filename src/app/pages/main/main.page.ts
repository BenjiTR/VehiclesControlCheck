import { Component, OnInit, DoCheck } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonTextarea, IonAccordion, IonAccordionGroup, IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonMenu, IonMenuButton, IonRouterOutlet, IonRow, IonSelect, IonSelectOption, IonTitle, IonToolbar, MenuController, ModalController, NavController, IonDatetime } from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserdataviewPage } from '../userdataview/userdataview.page';
import { User } from 'src/app/models/user.model';
import { Vehicle } from 'src/app/models/vehicles.model';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { PaddingService } from 'src/app/services/padding.service';
import { SessionService } from 'src/app/services/session.service';
import { StorageService } from 'src/app/services/storage.service';
import { TranslationConfigService } from 'src/app/services/translation.service';
import { storageConstants } from 'src/app/const/storage';
import { MainAnimation, RoadAnimation, SecondaryAnimation } from 'src/app/services/animation.service';
import { DashboardPage } from '../dashboard/dashboard.page';
import { Event } from '../../models/event.model'
import { EventTypes } from 'src/app/const/eventTypes';
import { ImgmodalPage } from '../imgmodal/imgmodal.page';
import { AdmobService } from 'src/app/services/admob.service';
import { LocalNotificationSchema } from '@capacitor/local-notifications';
import { NotificationsService } from 'src/app/services/notifications.service';
import { DateService } from 'src/app/services/date.service';
import { BackupPage } from '../backup/backup.page';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
  standalone: true,
  imports: [IonTextarea, IonDatetime, IonSelect, IonSelectOption, IonRouterOutlet, IonAccordionGroup, IonAccordion, UserdataviewPage, IonInput, IonItem, IonLabel, TranslateModule, RouterModule, IonMenu, IonIcon, IonButtons, IonMenuButton, IonButton, IonImg, IonGrid, IonCol ,IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonRow, IonGrid],
  animations: [ MainAnimation, RoadAnimation, SecondaryAnimation ],
  providers:[EventTypes, BackupPage]
})
export class MainPage implements OnInit {

  public creatingElement:Boolean=false;
  public vehiclesArray:Vehicle[]=[];
  public eventsArray:Event[]=[];
  public user:User = new User;
  public editingVehicle:Boolean = false;
  public currentVehicle:string = "";
  public eventTypes:any;
  public remindersArray:LocalNotificationSchema[] = [];

  constructor(
    private translate:TranslateService,
    private _translation:TranslationConfigService,
    private _paddingService:PaddingService,
    private _session:SessionService,
    private _alert:AlertService,
    private _storage:StorageService,
    private dashboard:DashboardPage,
    private etypes:EventTypes,
    private modalController: ModalController,
    private _admob:AdmobService,
    private navCtr:NavController,
    private _notification:NotificationsService,
    private _date:DateService,
    private backup:BackupPage
  ) {
    this.eventTypes = etypes.getEventTypes();
  }

  async ngOnInit() {
    this.dashboard.isLoading=true;
    this.user = this._session.currentUser;
    this.translate.setDefaultLang(this._translation.getLanguage());
    await this._admob.resumeBanner();
    if(!this._session.currentUser.token){
      await this.backup.ionViewWillEnter();
    }
    this.dashboard.isLoading=false;
  }

  async ionViewWillEnter() {
    this.dashboard.isLoading=true;
    await this.loadAllData();
    this.dashboard.isLoading=false;
  }

  async loadAllData():Promise<void>{
    this.vehiclesArray = await this._session.loadVehicles();
    this.eventsArray = await this._session.loadEvents();
    this.remindersArray = await this._session.loadReminders();
    await this._session.getReminderNotifications();
    await this._session.getAutoBackup();
    return
  }



  ionViewWillLeave() {
    this._admob.hideBanner();
  }

  calculatePadding(){
    return this._paddingService.calculatePadding();
  }



  createElement(){
    this.creatingElement = !this.creatingElement;
  }

  async deleteVehicle(vehicle:Vehicle){
    const sure = await this._alert.twoOptionsAlert(this.translate.instant('alert.are_you_sure?'),this.translate.instant('alert.vehicle_permanently_erased'),this.translate.instant('alert.erase'),this.translate.instant('alert.cancel'))
    if(sure){
      const index = this.vehiclesArray.indexOf(vehicle);
      this.vehiclesArray.splice(index,1)
      this._session.vehiclesArray = this.vehiclesArray;
      await this._storage.setStorageItem(storageConstants.USER_VEHICLES+this.user.id,this.vehiclesArray);
      if(this._session.currentUser.backupId && this._session.autoBackup){
        await this.backup.updateData();
      }
    }
  }

  //SABER SI EL EVENTO CORRESPONDE A ESE VEHÍCULO
  someForThatVehicle(id:string, isReminder?:boolean){

    if(isReminder){
      if(this.remindersArray.some((element:any)=>element.extra.vehicleId === id)){
        return true;
      }else{
        return false;
      }
    }else{
      if(this.eventsArray.some((element:any)=>element.vehicleId === id)){
        return true;
      }else{
        return false;
      }
    }
  }

  //MODAL IMÁGENES
  async openModal(img:string){
    console.log("modal")
    const modal = await this.modalController.create({
      component: ImgmodalPage,
      componentProps: {
        img: img
      }
    });

    await modal.present();
  }

  //ELIMINAR UN EVENTO
  async deleteEvent(event:Event){
    const sure = await this._alert.twoOptionsAlert(this.translate.instant('alert.are_you_sure?'),this.translate.instant('alert.event_permanently_erased'),this.translate.instant('alert.erase'),this.translate.instant('alert.cancel'))
    if(sure){
      const index = this.eventsArray.indexOf(event);
      this.eventsArray.splice(index,1)
      this._session.eventsArray = this.eventsArray;
      await this._storage.setStorageItem(storageConstants.USER_EVENTS+this.user.id,this.eventsArray);
      if(this._session.currentUser.backupId && this._session.autoBackup){
        await this.backup.updateData();
      }
    }
  }

  //TRADUCCIÓN DE TIPOS
  getTranslatedType(type: string): string {
    const eventType = this.eventTypes.find((eventType: { name: string; }) => eventType.name === type);
    return eventType ? eventType.string : type;
  }

  //CREAR EVENTO Y VEHÍCUO
  createEvent(){
    this.navCtr.navigateRoot('/dashboard/newevent');
  }
  createVehicle(){
    this.navCtr.navigateRoot('/dashboard/vehicle');
  }



  //EDITAR EVENTOS Y VEHÍCULOS
  editEvent(eventId:string){
    this.navCtr.navigateRoot('/dashboard/newevent',{queryParams: { eventToEditId: eventId }});
  }
  editVehicle(vehicleId:string){
    this.navCtr.navigateRoot('/dashboard/vehicle',{queryParams: { vehicleToEditId: vehicleId}});
  }

  //FECHA
  getDate(string: Date):string{
    return this._date.getIsoDate(string);
  }

  //RECORDATORIOS

  createReminder(){
    this.navCtr.navigateRoot('/dashboard/reminder');
  }

  async deleteReminder(reminder:LocalNotificationSchema){
    const sure = await this._alert.twoOptionsAlert(this.translate.instant('alert.are_you_sure?'),this.translate.instant('alert.event_permanently_erased'),this.translate.instant('alert.erase'),this.translate.instant('alert.cancel'))
    if(sure){
      await this._notification.deleteNotification(reminder);
      const array = await this._notification.getPending();
      this.remindersArray = await array.notifications;
      if(this._session.currentUser.backupId && this._session.autoBackup){
        await this.backup.updateData();
      }
    }
  }

  editReminder(id:number){
    this.navCtr.navigateRoot('/dashboard/reminder',{queryParams: { reminderToEditId: id}});
  }

}
