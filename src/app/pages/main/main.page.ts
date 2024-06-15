import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonAccordion, IonAccordionGroup, IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonMenu, IonMenuButton, IonRouterOutlet, IonRow, IonTitle, IonToolbar, MenuController } from '@ionic/angular/standalone';
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

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
  standalone: true,
  imports: [IonRouterOutlet, IonAccordionGroup, IonAccordion, UserdataviewPage, IonInput, IonItem, IonLabel, TranslateModule, RouterModule, IonMenu, IonIcon, IonButtons, IonMenuButton, IonButton, IonImg, IonGrid, IonCol ,IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonRow, IonGrid],
  animations: [ MainAnimation, RoadAnimation, SecondaryAnimation ]
})
export class MainPage implements OnInit {

  public creatingElement:Boolean=false;
  public vehiclesArray:Vehicle[]=[];
  public eventArray:Event[]=[];
  public user:User = new User;
  public editingVehicle:Boolean = false;
  public currentVehicle:string = "";

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
    private dashboard:DashboardPage
  ) { }

  async ngOnInit() {
    this.dashboard.isLoading=true;
    this.vehiclesArray = await this._session.loadVehicles();
    this.translate.setDefaultLang(this._translation.getLanguage());
    this.dashboard.isLoading=false;
  }

  async ionViewWillEnter(){
    this.user = this._session.currentUser;
    this.vehiclesArray = await this._session.loadVehicles();
  }

  calculatePadding(){
    return this._paddingService.calculatePadding();
  }



  createElement(){
    this.creatingElement = !this.creatingElement;
  }

  editVehicle(vehicle:Vehicle){
    return vehicle;
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




}
