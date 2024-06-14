import { storageConstants } from 'src/app/const/storage';
import { UserdataviewPage } from './../userdataview/userdataview.page';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonAccordionGroup, IonContent, IonHeader, IonTitle, IonToolbar, IonCol, IonRow, IonGrid, IonImg, IonButton, IonButtons, IonMenuButton, IonIcon, IonMenu, MenuController, IonLabel, IonItem, IonInput, IonAccordion } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationConfigService } from '../../services/translation.service';
import { AdmobService } from 'src/app/services/admob.service';
import { PaddingService } from 'src/app/services/padding.service';
import { MainAnimation, RoadAnimation, SecondaryAnimation } from 'src/app/services/animation.service';
import { StorageService } from 'src/app/services/storage.service';
import { Vehicle } from 'src/app/models/vehicles.model';
import { User } from 'src/app/models/user.model';
import { Event } from 'src/app/models/event.model';
import { SessionService } from 'src/app/services/session.service';
import { UserTestService } from 'src/app/services/user-test.service';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonAccordionGroup, IonAccordion, UserdataviewPage, IonInput, IonItem, IonLabel, TranslateModule, RouterModule, IonMenu, IonIcon, IonButtons, IonMenuButton, IonButton, IonImg, IonGrid, IonCol ,IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonRow, IonGrid],
  animations: [ MainAnimation, RoadAnimation, SecondaryAnimation ]
})
export class DashboardPage implements OnInit {

  public isLoading:Boolean=true;
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
    private _admobService:AdmobService,
    private _paddingService:PaddingService,
    private _session:SessionService,
    private _alert:AlertService,
    private _storage:StorageService
  ) { }

  async ngOnInit() {
    this.vehiclesArray = await this._session.loadVehicles();
    this.translate.setDefaultLang(this._translation.getLanguage());
    this._admobService.resumeBanner();
    this.isLoading=false;
  }

  ionViewWillEnter(){
    this.user = this._session.currentUser;
  }

  cerrarMenu() {
    this.menuCtrl.close();
    this._admobService.resumeBanner();
  }

  HideBanner(){
    this._admobService.hideBanner();
  }

  async endSession(){
    this.isLoading=true;
    await this.menuCtrl.close();
    await this._authService.signOut()
    .then(() => {
      // Sign-out successful.
      this._authService.isActive = false;
      this._authService.isInTest = false;
      this._admobService.hideBanner();
      this.router.navigate(['/home']);
      this.isLoading=false;
    }).catch((error) => {
      // An error happened.
      alert(error);
    });
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
      this._storage.setStorageItem(storageConstants.USER_VEHICLES+this.user.userId,this.vehiclesArray);
    }
  }

}
