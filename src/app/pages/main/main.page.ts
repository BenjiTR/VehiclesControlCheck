import { Component, OnInit, DoCheck, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Platform, IonTextarea, IonAccordion, IonAccordionGroup, IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonMenu, IonMenuButton, IonRouterOutlet, IonRow, IonSelect, IonSelectOption, IonTitle, IonToolbar, MenuController, ModalController, NavController, IonDatetime, IonFab, IonFabList, IonFabButton, IonBadge, IonText, IonDatetimeButton, IonModal, IonPopover, IonList, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
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
import { GrowShrinkAnimation, MainAnimation, RoadAnimation, SecondaryAnimation, SlideUpDownAnimation  } from 'src/app/services/animation.service';
import { Event } from '../../models/event.model'
import { EventTypes } from 'src/app/const/eventTypes';
import { ImgmodalPage } from '../imgmodal/imgmodal.page';
import { AdmobService } from 'src/app/services/admob.service';
import { LocalNotificationSchema, PendingResult } from '@capacitor/local-notifications';
import { NotificationsService } from 'src/app/services/notifications.service';
import { DateService } from 'src/app/services/date.service';
import { DatePipe } from '@angular/common';
import { LoaderService } from 'src/app/services/loader.service';
import { DriveService } from 'src/app/services/drive.service';
import { Subscription } from 'rxjs';
import { Network } from '@capacitor/network';
import { DataService } from 'src/app/services/data.service';
import { CryptoService } from 'src/app/services/crypto.services';
import { FilterService } from 'src/app/services/filter.service';
import { CalendarService } from 'src/app/services/calendar.service';
import { EspecialiOS } from 'src/app/services/especialiOS.service';
import { environment } from 'src/environments/environment.prod';
import { NewsPage } from '../newsmodal/newsmodal.page';
import { close } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import {NgxIonicImageViewerModule} from '@herdwatch-apps/ngx-ionic-image-viewer';
import { FileSystemService } from 'src/app/services/filesystem.service';
import { SyncService } from 'src/app/services/sync.service';


@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
  standalone: true,
  imports: [IonRefresherContent, IonRefresher, NgxIonicImageViewerModule, IonIcon, IonList, IonPopover, IonModal, IonDatetimeButton, IonText, IonBadge, IonFabButton, IonFabList, IonFab, IonTextarea, IonDatetime, IonSelect, IonSelectOption, IonRouterOutlet, IonAccordionGroup, IonAccordion, UserdataviewPage, IonInput, IonItem, IonLabel, TranslateModule, RouterModule, IonMenu, IonIcon, IonButtons, IonMenuButton, IonButton, IonImg, IonGrid, IonCol ,IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonRow, IonGrid],
  animations: [ MainAnimation, RoadAnimation, SecondaryAnimation, GrowShrinkAnimation, SlideUpDownAnimation,  ],
  providers:[EventTypes, DatePipe, FilterService],
})
export class MainPage implements OnInit, OnDestroy {

  @ViewChild('accordionGroup', { static: false }) accordionGroup: IonAccordionGroup | undefined;
  @ViewChild('filterInput', { static: false }) filterInput!: IonInput;

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
  public currency:string = "";
  public platform:string="";
  private downloadingSubscription: Subscription;
  public startDate:Date = new Date;
  public endDate:Date = new Date;
  public types:string[] = [];
  //TAGS
  public showSuggestions: boolean = false;
  public tags: string[] = [];
  public filteredTags: string[] = [];
  public currentTag: string = '';
  //NEWS
  public newsReaded:string|null;

  public connected:boolean = false;
  public hasFiles:boolean = false;
  private connectedSubscription:Subscription;
  private haveFilesSubscription:Subscription;

  constructor(
    private translate:TranslateService,
    private _translation:TranslationConfigService,
    private _paddingService:PaddingService,
    private _session:SessionService,
    private _alert:AlertService,
    private _storage:StorageService,
    private etypes:EventTypes,
    private mController: ModalController,
    private _admob:AdmobService,
    private router:Router,
    private _notification:NotificationsService,
    private _date:DateService,
    private _loader:LoaderService,
    private activatedroute:ActivatedRoute,
    private _drive:DriveService,
    private _crypto:CryptoService,
    private _platform:Platform,
    private _filter:FilterService,
    private _calendar:CalendarService,
    private _specialiOS:EspecialiOS,
    private _file:FileSystemService,
    private _sync:SyncService
  ) {
    addIcons({
      'close': close,
    });
    this.eventTypes = etypes.getEventTypes();
    this.downloadingSubscription = this._drive.downloading$.subscribe(data=>{
      //console.log(data)
      if(data==="refresh"){
        this.loadAllData();
      }
    });
    if(this._platform.is('android')){
      this.platform = 'android'
    }else{
      this.platform = 'ios'
    }
    this.newsReaded = localStorage.getItem(storageConstants.NEWS_READED+this._session.currentUser.id);
    //console.log(this.newsReaded)
    this.connectedSubscription = this._drive.conected$.subscribe(async value=>{
      this.token = await this._session.getToken();
      //console.log(this.token)
      this.connected = value;
    })
    this.haveFilesSubscription = this._drive.haveFiles$.subscribe(value=>{
      this.hasFiles = value;
    })
  }

  async ngOnInit() {
    await this._loader.presentLoader();
    this.types = this.etypes.getTypes();
    this.user = this._session.currentUser;
    this._crypto.init(this.user);
    await this.loadAllData();
    this.translate.setDefaultLang(this._translation.getLanguage());
    if(this._loader.isLoading){
      await this._loader.dismissLoader();
    }
    this.checkNews();
    await this._admob.resumeBanner();
    if(this._session.currentUser.token){
      await this._drive.init();
    }
    this.token = await this._session.getToken();
    const currency = await this._storage.getStorageItem(storageConstants.USER_CURRENCY+this.user.id);
    if(currency){
      this._session.currency = currency;
      this.currency = currency;
    }else{
      this._session.currency = "€";
      this.currency = "€";
    }
    this.calculateDates();
    this._calendar.init();
  }

  async ionViewWillEnter() {
    this.reload = this.activatedroute.snapshot.queryParams['reload'] || false;
    if(this.reload){
      await this._loader.presentLoader();
      await this.loadAllData();
      await this._loader.dismissLoader();
    }
    this.currency = this._session.currency;
    this.getTags();
  }

  ngOnDestroy(){
    this.vehiclesArray=[]
    //console.log("main destruido")
    this.downloadingSubscription.unsubscribe();
  }

  async loadAllData():Promise<void>{
    if(this.user.method === 'email'){
      this._session.currentUser.photo = await this._session.searchphoto( this._session.currentUser.method, this._session.currentUser.id);
      this.user.photo = await this._session.searchphoto( this._session.currentUser.method, this._session.currentUser.id);
    }
    this.vehiclesArray = await this._session.loadVehicles();
    this.vehiclesArray.sort((a, b) => {
      if (a.brandOrModel < b.brandOrModel) return -1;
      if (a.brandOrModel > b.brandOrModel) return 1;
      return 0;
    });
    this.eventsArray = await this._session.loadEvents();
    this.remindersArray = await this._session.loadReminders();
    if(this.filtering){
      this.generateData();
    }else{
      this.filteredEventsArray = this.eventsArray;
    }
    this.filteredEventsArray = this.filteredEventsArray.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime(); // Ordena por fecha, más recientes primero
    });
    await this._session.getReminderNotifications();
    const autobk = await this._session.getAutoBackup();
    if(autobk !== null && autobk !== undefined){
      this._drive.changeautoBk(autobk);
    }
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


  async deleteList(elements: any[]) {
    this._drive.changecleaning(true);

    for (const element of elements) {
      const id = await this._drive.findFileByName(element);
      if (id) {
        await this._drive.deleteFile(id);
        this._sync.deleteFileInList(element);
      }
    }
    this._storage.setStorageItem(storageConstants.USER_OPS+this._session.currentUser.id,false)
    this._drive.changecleaning(false);
  }

  async GetElementsToClean(vehicle: Vehicle): Promise<any[]> {
    let array: any[] = [];
    const pending:PendingResult = await this._notification.getPending();

    for (const element of this.eventsArray) {
      if (element.vehicleId === vehicle.id) {
        array.push(element.id);
      }
      if(element.reminder){
        const found = pending.notifications.find(pending => pending.id === element.reminderId);
        if(found){
          this._notification.deleteNotification(found);
          console.log("Pendiente",await this._notification.getPending())
        }
        const id = await this._storage.getStorageItem(storageConstants.USER_CALENDAR_ID+this._session.currentUser.id);
        if(id && element.reminder && element.calendarEventId){
          this._calendar.deleteCalendarEvent(element.calendarEventId);
        }
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
    const modal = await this.mController.create({
      component: ImgmodalPage,
      componentProps: {
        img: img
      }
    });

    await modal.present();
  }

  //TRADUCCIÓN DE TIPOS
  getTranslatedType(type: string): string {
    return this._filter.getTranslatedType(type)
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
    this.closeAccordion();
  }
  async editVehicle(vehicleId:string){
    await this.router.navigate(['/dashboard/vehicle'],{queryParams: { vehicleToEditId: vehicleId}});
    this.creatingElement=false;
  }
  async editReminder(id:number){
    await this.router.navigate(['/dashboard/reminder'],{queryParams: { reminderToEditId: id}});
    this.creatingElement=false;
  }

  //ELIMINAR UN VEHÍCULO
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
        await this._storage.setStorageItem(storageConstants.USER_VEHICLES + this.user.id, this._crypto.encryptMessage(JSON.stringify(this.vehiclesArray)));

        const elements = await this.GetElementsToClean(vehicle);
        console.log("elementos: ",elements)
        await this.deleteLocalElements(vehicle);

        if (this._drive.folderId && this._session.autoBackup) {
          this._storage.setStorageItem(storageConstants.USER_OPS+this._session.currentUser.id,true)
          const id = await this._drive.findFileByName(vehicle.id);
          if (id) {
            await this._drive.deleteFile(id, true);
            await this._sync.deleteFileInList(vehicle.id);
          }
          //Borra todos los eventos y recordatorios asociados
          this.deleteList(elements);
        }
      }
    }
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
          this._storage.setStorageItem(storageConstants.USER_OPS+this._session.currentUser.id,true)
          if((await Network.getStatus()).connected === true){
            const id = await this._drive.findFileByName(event.id)
            if(id){
              await this._drive.deleteFile(id, true);
              await this._sync.deleteFileInList(event.id);
            }
            this._storage.setStorageItem(storageConstants.USER_OPS+this._session.currentUser.id,false)
          }else{
            this._alert.createAlert(this.translate.instant("error.no_network"), this.translate.instant("error.no_network_to_backup"));
            this._drive.folderId = "";
          }
        }
        if(event.reminder){
          const reminder = this.remindersArray.find(reminder=>reminder.extra.eventId === event.id);
          if(reminder){
            this._notification.deleteNotification(reminder)
          }
        }
        const id = await this._storage.getStorageItem(storageConstants.USER_CALENDAR_ID+this._session.currentUser.id);
        if(id && event.calendarEventId){
          this._calendar.deleteCalendarEvent(event.calendarEventId);
        }
      }
    }
  }

  async deleteReminder(event:Event){
    const sure = await this._alert.twoOptionsAlert(this.translate.instant('alert.are_you_sure?'),this.translate.instant('alert.reminder_permanently_erased'),this.translate.instant('alert.erase'),this.translate.instant('alert.cancel'));
    if(sure){
      const reminder = this.remindersArray.find(reminder=>reminder.extra.eventId === event.id);
          if(reminder){
            await this._notification.deleteNotification(reminder)
            const index = this.eventsArray.findIndex(e => e.id === event.id);
            this.eventsArray[index].reminder = false;
            if (this._drive.folderId && this._session.autoBackup) {
              await this.uploadFile('event',this.eventsArray[index]);
            }
            const id = await this._storage.getStorageItem(storageConstants.USER_CALENDAR_ID+this._session.currentUser.id);
            //console.log("Preparar para eliminar ",id, event.calendarEventId)
            if(id && event.calendarEventId){
              this._calendar.deleteCalendarEvent(event.calendarEventId)
              .catch((err:any)=>{
                this._alert.createAlert(this.translate.instant("error.an_error_ocurred"),err);
              })
            }
            this._storage.setStorageItem(storageConstants.USER_EVENTS + this.user.id, this._crypto.encryptMessage(JSON.stringify(this.eventsArray)));
          }
    }
  }

  async uploadFile(fileType:string, file:any):Promise<void>{
    //console.log(fileType, file);
    let fileName;
    let encripted;

    if(fileType === "event"){
      fileName = file.id;
      encripted = this._crypto.encryptMessage(JSON.stringify(file))
    }else{
      fileName = 'tags';
      encripted = this._crypto.encryptMessage(JSON.stringify(file))
    }
    //console.log(fileName, encripted);
    this._storage.setStorageItem(storageConstants.USER_OPS + this._session.currentUser.id, true)
    if ((await Network.getStatus()).connected === true) {
      const exist = await this._drive.findFileByName(fileName)
      if (exist) {
        //console.log(exist);
        this._drive.updateFile(exist, encripted, fileName, true);
      } else {
        this._drive.uploadFile(encripted, fileName, true);
      }
      this._storage.setStorageItem(storageConstants.USER_OPS + this._session.currentUser.id, false)
    } else {
      this._alert.createAlert(this.translate.instant("error.no_network"), this.translate.instant("error.no_network_to_backup"));
      this._drive.folderId = "";
    }
    return;
  }


  async deleteEventProcess(event:Event):Promise<void>{
    const index = this.eventsArray.findIndex(e => e.id === event.id);
    this.eventsArray.splice(index,1)
    this._session.eventsArray = this.eventsArray;
    this.filteredEventsArray = this.eventsArray;
    await this._storage.setStorageItem(storageConstants.USER_EVENTS+this.user.id,this._crypto.encryptMessage(JSON.stringify(this.eventsArray)));
    return;
  }

  async deleteReminderProcess(reminder:LocalNotificationSchema):Promise<void>{
    await this._notification.deleteNotification(reminder);
    const array = await this._notification.getPending();
    this.remindersArray = await array.notifications;
    return;
  }

  //FECHA
  getDate(string: Date):string{
    return this._date.getIsoDate(string);
  }

  async getTags(){
    this.tags = await this._session.getTags()
}

  //FILTROS
  //FILTRO PALABRA
  changefilter(event:any){
    this.filter = event.detail.value;

     // Buscar la última palabra que empieza con '#'
  const tagMatch = this.filter.match(/#\w*$/);

  if (tagMatch) {
    this.currentTag = tagMatch[0];

    // Filtrar las etiquetas existentes
    this.filteredTags = this.tags.filter(tag => tag.toLowerCase().startsWith(this.currentTag.toLowerCase()));
    this.showSuggestions = true;
  } else {
    this.showSuggestions = false;
  }
}


selectTagForFilter(tag: string) {
  // Reemplazar la búsqueda con la etiqueta seleccionada
  this.filter = this.filter.replace(/#\w*$/, tag);
  this.showSuggestions = false;

}

addHashtag() {
  if (!this.filter.endsWith(' ')) {
    this.filter += ' ';
  }

  this.filter += '#';
  this.filteredTags = this.tags;
  this.showSuggestions = true;

  setTimeout(() => {
    this.filterInput.setFocus();
    this.setCursorAtEnd();
  }, 0);
}

// Función para posicionar el cursor al final del textarea
setCursorAtEnd() {
  this.filterInput.getInputElement().then(input => {
    const length = input.value.length;
    input.setSelectionRange(length, length);
  });
}


  //FILTRO POR PALABRAS O FECHA ESCRITA
  matchesFilter(event: any, filter: string): boolean {
    return this._filter.matchesFilter(event, filter)
  }


  toogleFiltering(){
    this.filtering = !this.filtering;
  }

  async eraseFilter(){
    this.filtering = false;
    await this._loader.presentLoader();
    this.filter = "";
    this.calculateDates();
    this.types = this.etypes.getTypes();
    this.filteredEventsArray = this.eventsArray;
    this.filteredEventsArray = this.filteredEventsArray.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    await this._loader.dismissLoader();
  }

  getMatchesNumber(vehicleId:string){
    return this.filteredEventsArray.filter(event=>event.vehicleId===vehicleId).length;
  }



  correctDates(): boolean {
    return this._filter.correctDates(this.startDate,this.endDate)
  }

  changeDate(property:String, event:CustomEvent){
    const newValue = new Date(event.detail.value);
    if (property === 'startDate') {
      this.startDate = newValue;
    } else if (property === 'endDate') {
      this.endDate = newValue;
    }
  }

  async calculateDates():Promise<void>{
  this.startDate = await this._filter.getFirstDate(this.eventsArray);
  this.endDate = await this._filter.getLastDate(this.eventsArray);
  return;
  }

  //DEVUELVE EL ARRAY FILTRADO
  async generateData(): Promise<void> {
    await this._loader.presentLoader();
    this.filteredEventsArray = await this._filter.generateData(this.startDate, this.endDate, this.eventsArray, this.filter, this.types);
    this.filteredEventsArray = this.filteredEventsArray.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime(); // Ordena por fecha, más recientes primero
    });
    await this._loader.dismissLoader();
  }

  changeTypesFilter(types:any){
    this.types=types;

  }

  //REALIZAR LLAMADA
  makeCall(numberString:string){
    const cleanedNumber = numberString.replace(/\s+/g, '');

    if(cleanedNumber){
      window.location.href=`tel:${cleanedNumber}`
    }else{
      this._alert.createAlert(this.translate.instant('error.number_its_not_correct'),this.translate.instant('error.number_its_not_correct_text'));
    }
  }


  closeAccordion() {
    const nativeEl = this.accordionGroup;
      nativeEl!.value = undefined;
  };

  getLabelOfDate(dateInput: any): string {
    const date = new Date(dateInput);  // Asegura que sea un objeto Date

    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateInput);
      return ''; // Retorna una cadena vacía si la fecha es inválida
    }

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    const preposition = this.translate.instant('mainpage.on');
    const at = this.translate.instant('mainpage.at');

    return `${preposition} ${day}/${month}/${year} ${at} ${hours}:${minutes}`;
  }


  thereIsReminder(event:Event){
    const thereisReminder = event.reminder;
    return thereisReminder && this.isFutureEvent(event);
  }

  isFutureEvent(event:Event){
    if(event.reminder){
      return this._date.isFutureEvent(event.reminderDate!);
    }else{
      return false;
    }
  }

  checkReminder(event:Event){
    const isInNotifications = this.remindersArray.some(e => e.extra.eventId === event.id);
    return !isInNotifications && this.isFutureEvent(event);
    }

    preventFocus(event: MouseEvent) {
      this._specialiOS.preventFocus(event);
    }


    async checkNews():Promise<void>{
      if(this.newsReaded !== environment.versioncode){
        await this.openNewsPage();
        this.newsReaded = environment.versioncode;
        return;
      }else{
        return;
      }
    }

    async openNewsPage():Promise<void> {
      const page = await this.mController.create({
        component: NewsPage,
        cssClass: 'news'
      });
      await page.present();
      await page.onDidDismiss();
    }

    //IMAGENES
    async shareImg(image:string, imgNumber:number, event:Event){
      const text = "Img " + imgNumber + " - "+ this.getTranslatedType(event.type) + " - " + event.date;
      await this._file.shareImg(image, text)
      .catch((err:any)=>{
        this._alert.createAlert(this.translate.instant('error.error_sharing_img'),err)
      })
    }

    async downloadImg(image:string, imgNumber:number, event:Event){
      const text = "Img " + imgNumber + " - "+ this.getTranslatedType(event.type) + " - " + event.date;
      await this._file.downloadImg(image, text)
      .then(()=>{
        this._alert.createAlert(this.translate.instant('alert.downloading_img_sucess'),this.translate.instant('alert.downloading_img_sucess_text'))
      })
      .catch((err:any)=>{
        this._alert.createAlert(this.translate.instant('error.error_downloading_img'),err)
      })
    }

    async handleRefresh(event:any){
      if(this.connected && this.hasFiles){
        await this._drive.existsFolder();
      }
      if(event.target){
        event.target.complete();
      }
  }

}
