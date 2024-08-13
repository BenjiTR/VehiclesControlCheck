import { Component, OnInit, DoCheck, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonTextarea, IonAccordion, IonAccordionGroup, IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonMenu, IonMenuButton, IonRouterOutlet, IonRow, IonSelect, IonSelectOption, IonTitle, IonToolbar, MenuController, ModalController, NavController, IonDatetime, IonFab, IonFabList, IonFabButton, IonBadge } from '@ionic/angular/standalone';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
import { GrowShrinkAnimation, MainAnimation, RoadAnimation, SecondaryAnimation } from 'src/app/services/animation.service';
import { Event } from '../../models/event.model'
import { EventTypes } from 'src/app/const/eventTypes';
import { ImgmodalPage } from '../imgmodal/imgmodal.page';
import { AdmobService } from 'src/app/services/admob.service';
import { LocalNotificationSchema } from '@capacitor/local-notifications';
import { NotificationsService } from 'src/app/services/notifications.service';
import { DateService } from 'src/app/services/date.service';
import { DatePipe } from '@angular/common';
import { LoaderService } from 'src/app/services/loader.service';
import { DriveService } from 'src/app/services/drive.service';
import { Subscription } from 'rxjs';
import { Network } from '@capacitor/network';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
  standalone: true,
  imports: [IonBadge, IonFabButton, IonFabList, IonFab, IonTextarea, IonDatetime, IonSelect, IonSelectOption, IonRouterOutlet, IonAccordionGroup, IonAccordion, UserdataviewPage, IonInput, IonItem, IonLabel, TranslateModule, RouterModule, IonMenu, IonIcon, IonButtons, IonMenuButton, IonButton, IonImg, IonGrid, IonCol ,IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonRow, IonGrid],
  animations: [ MainAnimation, RoadAnimation, SecondaryAnimation, GrowShrinkAnimation ],
  providers:[EventTypes, DatePipe]
})
export class MainPage implements OnInit, OnDestroy {

  public creatingElement:Boolean=false;
  public vehiclesArray:Vehicle[]=[];
  public eventsArray:Event[]=[];
  public user:User = new User;
  public editingVehicle:Boolean = false;
  public currentVehicle:string = "";
  public eventTypes:any;
  public remindersArray:LocalNotificationSchema[] = [];
  public filter:string = "";
  public filteredEventsArray:Event[]=[];
  public filtering:boolean=false;
  public reload:boolean=false;
  public token:string = "";

  private downloadingSubscription: Subscription;

  constructor(
    private translate:TranslateService,
    private _translation:TranslationConfigService,
    private _paddingService:PaddingService,
    private _session:SessionService,
    private _alert:AlertService,
    private _storage:StorageService,
    private etypes:EventTypes,
    private modalController: ModalController,
    private _admob:AdmobService,
    private router:Router,
    private _notification:NotificationsService,
    private _date:DateService,
    private datePipe: DatePipe,
    private _loader:LoaderService,
    private activatedroute:ActivatedRoute,
    private _drive:DriveService,
    private navCtr:NavController,
    private _data:DataService
  ) {
    this.eventTypes = etypes.getEventTypes();
    this.downloadingSubscription = this._drive.downloading$.subscribe(data=>{
      if(!data){
        this.loadAllData();
      }
    });
  }

  async ngOnInit() {
    console.log("Inicio")

    await this.loadAllData();
    await this._loader.presentLoader();
    this.user = this._session.currentUser;
    this.translate.setDefaultLang(this._translation.getLanguage());
    await this._admob.resumeBanner();
    if(this._session.currentUser.token){
      await this._drive.init();
    }

    this.token = await this._session.getToken();
    console.log("Fin")
    //console.log(this._loader.isLoading)
    if(this._loader.isLoading){
      await this._loader.dismissLoader();
    }
  }


  async ionViewWillEnter() {
    console.log("InicioView")
    this.reload = this.activatedroute.snapshot.queryParams['reload'] || false;
    if(this.reload){
      await this._loader.presentLoader();
      await this.loadAllData();
      await this._loader.dismissLoader();
    }
  }

  ngOnDestroy(){
    //console.log("main destruido")
    this.downloadingSubscription.unsubscribe();
  }


  async loadAllData():Promise<void>{
    this.vehiclesArray = await this._session.loadVehicles();
    this.eventsArray = await this._session.loadEvents();
    this.remindersArray = await this._session.loadReminders();
    await this._session.getReminderNotifications();
    await this._session.getAutoBackup();
    this.filteredEventsArray = this.eventsArray;
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

  async deleteVehicle(vehicle: Vehicle) {
    const sure = await this._alert.twoOptionsAlert(
      this.translate.instant('alert.are_you_sure?'),
      this.translate.instant('alert.vehicle_permanently_erased'),
      this.translate.instant('alert.erase'),
      this.translate.instant('alert.cancel')
    );

    if (sure) {
      const index = this.vehiclesArray.indexOf(vehicle);
      if (index > -1) {
        this.vehiclesArray.splice(index, 1);
        this._session.vehiclesArray = this.vehiclesArray;
        await this._storage.setStorageItem(
          storageConstants.USER_VEHICLES + this.user.id,
          this.vehiclesArray
        );

        const elements = await this.GetElementsToClean(vehicle);
        await this.deleteLocalElements(vehicle);

        if (this._drive.folderId && this._session.autoBackup) {
          this._storage.setStorageItem(storageConstants.USER_OPS+this._session.currentUser.id,true)
          const id = await this._drive.findFileByName(vehicle.id);
          if (id) {
            await this._drive.deleteFile(id, true);
          }
          this.deleteList(elements);
        }
      }
    }
  }

  async deleteList(elements: any[]) {
    this._drive.changecleaning(true);

    for (const element of elements) {
      const id = await this._drive.findFileByName(element);
      if (id) {
        await this._drive.deleteFile(id);
      }
    }
    this._storage.setStorageItem(storageConstants.USER_OPS+this._session.currentUser.id,false)
    this._drive.changecleaning(false);
  }

  async GetElementsToClean(vehicle: Vehicle): Promise<any[]> {
    let array: any[] = [];

    for (const element of this.eventsArray) {
      if (element.vehicleId === vehicle.id) {
        array.push(element.id);
      }
    }

    for (const element of this.remindersArray) {
      if (element.extra.vehicleId === vehicle.id) {
        array.push('R' + element.id);
      }
    }
    return array;
  }

  async deleteLocalElements(vehicle: Vehicle): Promise<void> {

    const temporalEventArray = this.eventsArray.map(event => ({ ...event }));

    for (const element of temporalEventArray) {
      if (element.vehicleId === vehicle.id) {
        await this.deleteEvent(element, true);
      }
    }

    const temporalRemindersArray = this.remindersArray.map(reminder => ({ ...reminder }));

    for (const element of temporalRemindersArray) {
      if (element.extra.vehicleId === vehicle.id) {
        await this.deleteReminder(element, true);
      }
    }

    return;
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
      if(this.filteredEventsArray.some((element:any)=>element.vehicleId === id)){
        return true;
      }else{
        return false;
      }
    }
  }

  //MODAL IMÁGENES
  async openModal(img:string){
    const modal = await this.modalController.create({
      component: ImgmodalPage,
      componentProps: {
        img: img
      }
    });

    await modal.present();
  }

  //ELIMINAR UN EVENTO
  async deleteEvent(event:Event, autoClean?:boolean){
    if(autoClean){
      await this.deleteEventProcess(event);
    }else{
      const sure = await this._alert.twoOptionsAlert(this.translate.instant('alert.are_you_sure?'),this.translate.instant('alert.event_permanently_erased'),this.translate.instant('alert.erase'),this.translate.instant('alert.cancel'))
      if(sure){
        await this.deleteEventProcess(event);
        if(this._drive.folderId && this._session.autoBackup){
          const id = await this._drive.findFileByName(event.id)
          await this._drive.deleteFile(id, true);
        }
      }
    }
  }

  async deleteEventProcess(event:Event):Promise<void>{
    const index = this.eventsArray.indexOf(event);
    this.eventsArray.splice(index,1)
    this._session.eventsArray = this.eventsArray;
    await this._storage.setStorageItem(storageConstants.USER_EVENTS+this.user.id,this.eventsArray);
    return;
  }

  //TRADUCCIÓN DE TIPOS
  getTranslatedType(type: string): string {
    const eventType = this.eventTypes.find((eventType: { name: string; }) => eventType.name === type);
    return eventType ? eventType.string : type;
  }

  //CREAR EVENTO, VEHÍCULO Y RECORDATORIO
  async createEvent(){
    await this.router.navigate(['/dashboard/newevent']);
    this.creatingElement=false;
  }
  async createVehicle(){
    await this.router.navigate(['/dashboard/vehicle']);
    this.creatingElement=false;
  }
  async createReminder(){
    await this.router.navigate(['/dashboard/reminder']);
    this.creatingElement=false;
  }

  //EDITAR EVENTOS Y VEHÍCULOS
  async editEvent(eventId:string){
    await this.router.navigate(['/dashboard/newevent'],{queryParams: { eventToEditId: eventId }});
    this.creatingElement=false;
  }
  async editVehicle(vehicleId:string){
    await this.router.navigate(['/dashboard/vehicle'],{queryParams: { vehicleToEditId: vehicleId}});
    this.creatingElement=false;
  }
  async editReminder(id:number){
    await this.router.navigate(['/dashboard/reminder'],{queryParams: { reminderToEditId: id}});
    this.creatingElement=false;
  }

  //FECHA
  getDate(string: Date):string{
    return this._date.getIsoDate(string);
  }

  async deleteReminder(reminder:LocalNotificationSchema, autoClean?:boolean){
    if(autoClean){
      await this.deleteReminderProcess(reminder);
    }else{
      const sure = await this._alert.twoOptionsAlert(this.translate.instant('alert.are_you_sure?'),this.translate.instant('alert.event_permanently_erased'),this.translate.instant('alert.erase'),this.translate.instant('alert.cancel'))
      if(sure){
        await this.deleteReminderProcess(reminder);
        if(this._drive.folderId && this._session.autoBackup){
          const id = await this._drive.findFileByName("R"+reminder.id)
          await this._drive.deleteFile(id, true);
        }
      }
    }
  }

  async deleteReminderProcess(reminder:LocalNotificationSchema):Promise<void>{
    await this._notification.deleteNotification(reminder);
    const array = await this._notification.getPending();
    this.remindersArray = await array.notifications;
    return;
  }

  changefilter(event:any){
    this.filter = event.detail.value;
    this.filteredEventsArray = this.eventsArray.filter(event => this.matchesFilter(event, this.filter));
  }

  matchesFilter(event: any, filter: string): boolean {
    for (const key in event) {
      if (event.hasOwnProperty(key) && key !== 'images') {
        let value;
        if (key === 'date') {
          value = this.datePipe.transform(event[key], 'dd/MM/yyyy');
        } else if (key === 'type') {
          value = this.getTranslatedType(event[key]);
        } else {
          value = event[key].toString();
        }
        if (value && value.includes(filter)) {
          return true;
        }
      }
    }
    return false;
  }

  toogleFiltering(){
    this.filtering = !this.filtering;
  }

  eraseFilter(){
    this.filter = "";
    const fakeEvent = { detail: { value: '' } };
    this.changefilter(fakeEvent);
    this.filtering = false;
  }

  getMatchesNumber(vehicleId:string){
    return this.filteredEventsArray.filter(event=>event.vehicleId===vehicleId).length;
  }

}
