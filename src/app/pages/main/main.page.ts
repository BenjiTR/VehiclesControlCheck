import { Component, OnInit, DoCheck } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonAccordion, IonAccordionGroup, IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonMenu, IonMenuButton, IonRouterOutlet, IonRow, IonSelect, IonSelectOption, IonTitle, IonToolbar, MenuController, ModalController, NavController, IonDatetime } from '@ionic/angular/standalone';
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

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
  standalone: true,
  imports: [IonDatetime, IonSelect, IonSelectOption, IonRouterOutlet, IonAccordionGroup, IonAccordion, UserdataviewPage, IonInput, IonItem, IonLabel, TranslateModule, RouterModule, IonMenu, IonIcon, IonButtons, IonMenuButton, IonButton, IonImg, IonGrid, IonCol ,IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonRow, IonGrid],
  animations: [ MainAnimation, RoadAnimation, SecondaryAnimation ],
  providers:[EventTypes]
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
    private menuCtrl: MenuController,
    private _authService: AuthService,
    private router:Router,
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
    private _notification:NotificationsService
  ) {
    this.eventTypes = etypes.getEventTypes();
  }

  async ngOnInit() {
    this.dashboard.isLoading=true;
    this.user = this._session.currentUser;
    this.translate.setDefaultLang(this._translation.getLanguage());
    this.vehiclesArray = await this._session.loadVehicles();
    this.eventsArray = await this._session.loadEvents();
    this.remindersArray = await this._session.loadReminders();
    this._session.getReminderNotifications();
    this._admob.resumeBanner();
    this.dashboard.isLoading=false;
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
      this._storage.setStorageItem(storageConstants.USER_VEHICLES+this.user.id,this.vehiclesArray);
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
      this._storage.setStorageItem(storageConstants.USER_EVENTS+this.user.id,this.eventsArray);
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
    const date = new Date(string)
    return date.toISOString().slice(0, -1);
  }

  //RECORDATORIOS
  deleteReminder(reminder:LocalNotificationSchema){

  }

  editReminder(id:number){

  }

}
