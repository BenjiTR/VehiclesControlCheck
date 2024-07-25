import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonLabel, IonButton, IonCheckbox, IonCol, IonFooter, IonIcon, IonImg, IonInput, IonItem, IonRow, IonAvatar, IonSegmentButton, IonSegment, NavController } from '@ionic/angular/standalone';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { User } from 'src/app/models/user.model';
import { MainAnimation, RoadAnimation, SecondaryAnimation } from 'src/app/services/animation.service';
import { TranslationConfigService } from 'src/app/services/translation.service';
import { Vehicle } from 'src/app/models/vehicles.model';
import { HashService } from 'src/app/services/hash.service';
import { SessionService } from 'src/app/services/session.service';
import { StorageService } from 'src/app/services/storage.service';
import { storageConstants } from 'src/app/const/storage';
import { AlertService } from 'src/app/services/alert.service';
import { AdmobService } from 'src/app/services/admob.service';
import { LoaderService } from 'src/app/services/loader.service';
import { DriveService } from 'src/app/services/drive.service';

@Component({
  selector: 'app-vehicle',
  templateUrl: './vehicle.page.html',
  styleUrls: ['./vehicle.page.scss'],
  standalone: true,
  imports: [IonSegment, IonSegmentButton, IonAvatar, RouterModule, CommonModule, TranslateModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonRow, IonCol, IonImg, IonItem, IonInput, IonIcon, IonFooter, IonButton, IonCheckbox, IonLabel],
  animations: [ MainAnimation, RoadAnimation, SecondaryAnimation ]
})
export class VehiclePage implements OnInit {

  public name:string = "";
  public photoURL:string="";
  public creatingVehicle:boolean=false;
  public typeOfVehicle:string="2W";
  public brandOrModel: string = "";
  public carRegistration: string = "";
  public dateOfBuy: string="";
  public kmOfBuy: string = "";
  public typeOfFuel: string = "";
  public insuranceCompany: string = "";
  public insurancePolicy: string = "";
  public insuranceRenewalDate: string = "";
  public roadsideAssistanceNumber: string = "";
  public user:User = new User;
  public vehiclesArray:Vehicle[] = [];
  public vehicleToEdit:Vehicle = new Vehicle;
  public vehicleToEditId:string = "";

  constructor(
    private translate:TranslateService,
    private _translation:TranslationConfigService,
    private _hash:HashService,
    private _session:SessionService,
    private _storage:StorageService,
    private _alert:AlertService,
    private activatedroute:ActivatedRoute,
    private _admobService:AdmobService,
    private navCtr:NavController,
    private _loader:LoaderService,
    private _drive:DriveService
  ) {
    this.user = this._session.currentUser;
  }

  ngOnInit() {
    this.translate.setDefaultLang(this._translation.getLanguage());
  }

  ionViewWillEnter() {
    this.vehiclesArray = this._session.vehiclesArray;
    this.vehicleToEditId = this.activatedroute.snapshot.queryParams['vehicleToEditId'];
    if(this.vehicleToEditId){
      this.getVehicle();
    }
  }

  getVehicle(){
    const current = this.vehiclesArray.find(vehicle => vehicle.id === this.vehicleToEditId)
    if (current){
      this.vehicleToEdit = current;
      this.asignPropertis();
    }
  }

  asignPropertis(){
    this.typeOfVehicle = this.vehicleToEdit.typeOfVehicle
    this.brandOrModel = this.vehicleToEdit.brandOrModel
    this.carRegistration = this.vehicleToEdit.carRegistration
    this.dateOfBuy = this.vehicleToEdit.dateOfBuy
    this.kmOfBuy = this.vehicleToEdit.kmOfBuy
    this.typeOfFuel = this.vehicleToEdit.typeOfFuel
    this.insuranceCompany = this.vehicleToEdit.insuranceCompany
    this.insurancePolicy = this.vehicleToEdit.insurancePolicy
    this.insuranceRenewalDate = this.vehicleToEdit.insuranceRenewalDate
    this.roadsideAssistanceNumber = this.vehicleToEdit.roadsideAssistanceNumber
  }

  async cancelCreateVehicle(){
    const sure = await this._alert.twoOptionsAlert(this.translate.instant('alert.are_you_sure?'),this.translate.instant('alert.changes_will_not_be_saved'),this.translate.instant('alert.accept'),this.translate.instant('alert.cancel'))
    if(sure){
      this.navCtr.navigateRoot('/dashboard/main')
    }
  }

  async createVehicle(){
    if(this.vehicleToEditId){
      this.editVehicle()
    }else{
      this.createNew();
    }
  }

  async editVehicle(){
    if(this.brandOrModel){
      await this._loader.presentLoader();
      const index = this.vehiclesArray.findIndex(vehicle => vehicle.id === this.vehicleToEditId);
      if(index !== -1){
        const newVehicle = await this.generateVehicle();
        this.vehiclesArray[index] = newVehicle;
        this.saveAndExit(newVehicle);
      }
    }else{
      this._alert.createAlert(this.translate.instant("alert.enter_name_or_model"),this.translate.instant("alert.enter_name_or_model_text"));
    }
  }

  async createNew(){
    if(this.brandOrModel){
      await this._loader.presentLoader();
      const newVehicle = await this.generateVehicle();
      this.vehiclesArray.push(newVehicle)
      this.saveAndExit(newVehicle);
    }else{
      this._alert.createAlert(this.translate.instant("alert.enter_name_or_model"),this.translate.instant("alert.enter_name_or_model_text"));
    }
  }

  async generateVehicle(){
    let hash;
    if(this.vehicleToEditId){
      hash = this.vehicleToEditId;
    }else{
      hash = await this._hash.generateVehiclePhrase();

    }
    const newVehicle:Vehicle = {
      typeOfVehicle:this.typeOfVehicle ,
      brandOrModel: this.brandOrModel ,
      carRegistration: this.carRegistration ,
      dateOfBuy: this.dateOfBuy ,
      kmOfBuy: this.kmOfBuy ,
      typeOfFuel: this.typeOfFuel ,
      insuranceCompany: this.insuranceCompany ,
      insurancePolicy: this.insurancePolicy ,
      insuranceRenewalDate: this.insuranceRenewalDate ,
      roadsideAssistanceNumber: this.roadsideAssistanceNumber ,
      userId: this.user.id,
      id:hash
    }
    return newVehicle;
  }

  async saveAndExit(vehicle:Vehicle){
    await this._admobService.showinterstitial();
    this._session.vehiclesArray = this.vehiclesArray;
    this._storage.setStorageItem(storageConstants.USER_VEHICLES+this.user.id,this.vehiclesArray);
    if(this._drive.folderId && this._session.autoBackup){
      this._storage.setStorageItem(storageConstants.USER_OPS+this._session.currentUser.id,true)
      const fileName = vehicle.id;
      const exist = await this._drive.findFileByName(fileName)
        if(exist){
          await this._drive.updateFile(exist, JSON.stringify(vehicle), fileName, true);
        }else{
          await this._drive.uploadFile(JSON.stringify(vehicle), fileName, true);
        }
        this._storage.setStorageItem(storageConstants.USER_OPS+this._session.currentUser.id,false)
    }
    this.navCtr.navigateRoot(['/dashboard'], { queryParams: { reload: true } });
  }

}
