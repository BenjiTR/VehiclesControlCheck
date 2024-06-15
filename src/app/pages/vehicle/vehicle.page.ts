import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonLabel, IonButton, IonCheckbox, IonCol, IonFooter, IonIcon, IonImg, IonInput, IonItem, IonRow, IonAvatar, IonSegmentButton, IonSegment } from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { User } from 'src/app/models/user.model';
import { MainAnimation, RoadAnimation, SecondaryAnimation } from 'src/app/services/animation.service';
import { TranslationConfigService } from 'src/app/services/translation.service';
import { Vehicle } from 'src/app/models/vehicles.model';
import { DashboardPage } from '../dashboard/dashboard.page';
import { HashService } from 'src/app/services/hash.service';
import { SessionService } from 'src/app/services/session.service';
import { StorageService } from 'src/app/services/storage.service';
import { storageConstants } from 'src/app/const/storage';
import { AlertService } from 'src/app/services/alert.service';

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
  public dateOfBuy: Date = new Date;
  public kmOfBuy: string = "";
  public typeOfFuel: string = "";
  public insuranceCompany: string = "";
  public insurancePolicy: string = "";
  public insuranceRenewalDate: string = "";
  public roadsideAssistanceNumber: string = "";
  public user:User = new User;
  public vehiclesArray:Vehicle[] = [];

  constructor(
    private translate:TranslateService,
    private _translation:TranslationConfigService,
    private router:Router,
    private dashboard:DashboardPage,
    private _hash:HashService,
    private _session:SessionService,
    private _storage:StorageService,
    private _alert:AlertService
  ) {
    this.user = this._session.currentUser;
  }

  ngOnInit() {
    this.translate.setDefaultLang(this._translation.getLanguage());
  }

  cancelCreateVehicle(){
    this.router.navigate(['/dashboard']);
  }

  async createVehicle(){
    if(this.brandOrModel){
      this.dashboard.isLoading=true;

      this.vehiclesArray = this._session.vehiclesArray;
      let hash = await this._hash.generateVehiclePhrase();

      const newvehicle:Vehicle = {
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

      this.vehiclesArray.push(newvehicle)
      this._session.vehiclesArray = this.vehiclesArray;
      this._storage.setStorageItem(storageConstants.USER_VEHICLES+this.user.id,this.vehiclesArray);
      this.router.navigate(['/dashboard/main']);
      this.dashboard.isLoading=false;
    }else{
      this._alert.createAlert(this.translate.instant("alert.enter_name_or_model"),this.translate.instant("alert.enter_name_or_model_text"));
    }
  }

}
