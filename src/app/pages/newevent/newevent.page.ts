import { imageConstants } from './../../const/img';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonRow, IonCol, IonLabel, IonAvatar, IonItem, IonIcon, IonButton, IonSelectOption, ModalController, IonSelect, IonInput, IonImg, NavController } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { EventTypes } from 'src/app/const/eventTypes';
import { AlertService } from 'src/app/services/alert.service';
import { TranslationConfigService } from 'src/app/services/translation.service';
import { DashboardPage } from '../dashboard/dashboard.page';
import { Event } from '../../models/event.model'
import { AdmobService } from 'src/app/services/admob.service';
import { SessionService } from 'src/app/services/session.service';
import { HashService } from 'src/app/services/hash.service';
import { StorageService } from 'src/app/services/storage.service';
import { storageConstants } from 'src/app/const/storage';
import { User } from 'src/app/models/user.model';
import { Vehicle } from 'src/app/models/vehicles.model';
import { ImgmodalPage } from '../imgmodal/imgmodal.page';
import { CameraServices } from 'src/app/services/camera.service';
import { BackupPage } from '../backup/backup.page';

@Component({
  selector: 'app-newevent',
  templateUrl: './newevent.page.html',
  styleUrls: ['./newevent.page.scss'],
  standalone: true,
  providers:[BackupPage],
  imports: [IonImg, IonInput, TranslateModule, IonSelect, IonSelectOption, IonButton, IonIcon, IonItem, IonAvatar, IonLabel, IonRow, IonCol, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class NeweventPage {

    public vehicleId:string="";
    public date:string="";
    public type:string = "";
    public eventTypes:any;
    public km:string = "";
    public cost:number = 0;
    public info:string = "";
    public images:string[] = [];
    public eventsArray:Event[] = [];
    public eventToEdit:Event = new Event;
    public eventToEditId:string = "";
    public user:User = new User;
    public vehiclesArray:Vehicle[] = []

  constructor(
    private translate:TranslateService,
    private _translation:TranslationConfigService,
    private dashboard:DashboardPage,
    private router:Router,
    private etypes:EventTypes,
    private _alert:AlertService,
    private _session:SessionService,
    private activatedroute:ActivatedRoute,
    private _hash:HashService,
    private _storage:StorageService,
    private modalController: ModalController,
    private _camera:CameraServices,
    private _admobService:AdmobService,
    private navCtr:NavController,
    private backup:BackupPage
  ) {
    this.eventTypes = etypes.getEventTypes();
    this.user = this._session.currentUser;
  }

  async ionViewWillEnter() {
    this.dashboard.isLoading=true;
    this.translate.setDefaultLang(this._translation.getLanguage());
    this.eventsArray = await this._session.eventsArray;
    this.vehiclesArray = await this._session.vehiclesArray;
    this.eventToEditId = this.activatedroute.snapshot.queryParams['eventToEditId'];
    if(this.eventToEditId){
      this.getEvent();
      this.dashboard.isLoading=false;
    }
    this.dashboard.isLoading=false;
  }

  getEvent(){
    const current = this.eventsArray.find(event => event.id === this.eventToEditId)
    if (current){
      this.eventToEdit = JSON.parse(JSON.stringify(current));
      this.asignPropertis();
    }
  }

  asignPropertis(){
    this.vehicleId = this.eventToEdit.vehicleId;
    this.date = this.eventToEdit.date;
    this.type = this.eventToEdit.type;
    this.km = this.eventToEdit.km;
    this.cost = this.eventToEdit.cost;
    this.info = this.eventToEdit.info;
    this.images = this.eventToEdit.images;
  }

  async cancelCreateEvent(){
    const sure = await this._alert.twoOptionsAlert(this.translate.instant('alert.are_you_sure?'),this.translate.instant('alert.changes_will_not_be_saved'),this.translate.instant('alert.accept'),this.translate.instant('alert.cancel'))
    if(sure){
      this.dashboard.isLoading=true;
      this.navCtr.navigateRoot('/dashboard')
    }
  }

  async createEvent(){
    if(this.eventToEditId){
      this.editEvent()
    }else{
      this.createNew();
    }
  }
  async editEvent(){
    if(!this.vehicleId){
      this._alert.createAlert(this.translate.instant("alert.enter_name_or_model"),this.translate.instant("alert.enter_name_or_model_text"));
    }else if(!this.type){
      this._alert.createAlert(this.translate.instant("alert.enter_type"),this.translate.instant("alert.enter_type_text"));
    }else{
      this.dashboard.isLoading=true;
      const index = this.eventsArray.findIndex(event => event.id === this.eventToEditId);
      if(index !== -1){
         const newEvent = await this.generateEvent();
         this._session.eventsArray[index] = newEvent;
         console.log(this.eventsArray[index]);
         console.log(newEvent)
      }
      this.saveAndExit();
    }
  }


  async generateEvent(){
    let hash;
    if(this.eventToEditId){
      hash = this.eventToEditId;
    }else{
      hash = await this._hash.generateEventPhrase();
    }
    const newEvent:Event = {
      id: hash,
      vehicleId: this.vehicleId,
      date: this.date,
      type: this.type,
      km: this.km,
      cost: this.cost,
      info: this.info,
      images: this.images
    }
    return newEvent;
  }

  async saveAndExit(){
    await this._admobService.showinterstitial();
    this._session.eventsArray = this.eventsArray;
    await this._storage.setStorageItem(storageConstants.USER_EVENTS+this.user.id,this.eventsArray);
    if(this._session.currentUser.backupId && this._session.autoBackup){
      await this.backup.updateData();
    }
    this.navCtr.navigateRoot('/dashboard')
  }

  async createNew(){
    if(!this.vehicleId){
      this._alert.createAlert(this.translate.instant("alert.enter_name_or_model"),this.translate.instant("alert.enter_name_or_model_text"));
    }else if(!this.type){
      this._alert.createAlert(this.translate.instant("alert.enter_type"),this.translate.instant("alert.enter_type_text"));
    }else{
      this.dashboard.isLoading=true;
      const newEvent = await this.generateEvent();
      this.eventsArray.push(newEvent)
      this.saveAndExit();
    }
  }

  async deleteImg(img:any){
    const sure = await this._alert.twoOptionsAlert(this.translate.instant('alert.are_you_sure?'),this.translate.instant('alert.photo_will_permanently_erased'),this.translate.instant('alert.erase'),this.translate.instant('alert.cancel'))
    if(sure){
      const i = this.images.findIndex(image => image === img)
      if(i!=-1){
        this.images.splice(i,1);
      }
    }
  }

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

  async addImage() {
  const photo = await this._camera.takePhoto();
  this.dashboard.isLoading=true;
  if(photo){
    this.images.push(imageConstants.base64Prefix+photo);
  }
  this.dashboard.isLoading=false;

}

}

