import { UserdataviewPage } from './../userdataview/userdataview.page';
import { Component, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Platform, IonAccordionGroup, IonContent, IonHeader, IonTitle, IonToolbar, IonCol, IonRow, IonGrid, IonImg, IonButton, IonButtons, IonMenuButton, IonIcon, IonMenu, MenuController, IonLabel, IonItem, IonInput, IonAccordion, IonRouterOutlet, NavController, IonNavLink } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationConfigService } from '../../services/translation.service';
import { AdmobService } from 'src/app/services/admob.service';
import { PaddingService } from 'src/app/services/padding.service';
import { MainAnimation, RoadAnimation, SecondaryAnimation } from 'src/app/services/animation.service';
import { SessionService } from 'src/app/services/session.service';
import { LoaderService } from 'src/app/services/loader.service';
import { Share } from '@capacitor/share';
import { DriveService } from 'src/app/services/drive.service';
import { storageConstants } from 'src/app/const/storage';
import { StorageService } from 'src/app/services/storage.service';
import { AlertService } from 'src/app/services/alert.service';
import { ScreenOrientationService } from '../../services/orientation.service'


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonNavLink, IonRouterOutlet, IonAccordionGroup, IonAccordion, UserdataviewPage, IonInput, IonItem, IonLabel, TranslateModule, RouterModule, IonMenu, IonIcon, IonButtons, IonMenuButton, IonButton, IonImg, IonGrid, IonCol ,IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonRow, IonGrid],
  animations: [ MainAnimation, RoadAnimation, SecondaryAnimation ]
})
export class DashboardPage implements OnInit, OnDestroy {

  public portrait:boolean=true;
  public language:string = "";
  public platform:string = "";

  constructor(
    private menuCtrl: MenuController,
    private _authService: AuthService,
    private router:Router,
    private translate:TranslateService,
    private _translation:TranslationConfigService,
    private _admobService:AdmobService,
    private _paddingService:PaddingService,
    private navCtr:NavController,
    private _session:SessionService,
    private _loader:LoaderService,
    private __drive:DriveService,
    private _storage:StorageService,
    private _alert:AlertService,
    private screenOrientationService: ScreenOrientationService,
    private _platform:Platform
  ) {
    this.translate.setDefaultLang(this._translation.getLanguage());
    this.language = this._translation.getLanguage();
  }

  async ngOnInit() {
    if(this._platform.is('android')){
      this.platform = 'android'
    }else{
      this.platform = 'ios'
    }
    this.translate.setDefaultLang(this._translation.getLanguage());
    this._admobService.resumeBanner();
    this.screenOrientationService.orientationChange$.subscribe(orientation => {
      //console.log('Screen orientation changed:', orientation);
      if(orientation.type === "landscape-primary" || orientation.type === "landscape-secondary"){
        this.portrait=false;
      }else{
        this.portrait=true;
      }
    });

  }


  ngOnDestroy(){
    //console.log("destrozado dash");
    this._admobService.hideBanner();
  }

  cerrarMenu() {
    this.menuCtrl.close();
    this._admobService.resumeBanner();
  }

  goUseTerms() {
    this.router.navigate(['/useterms'], { queryParams: { goBack: 'dashboard' } });
    this.menuCtrl.close();
  }

  goPrivacy() {
    this.router.navigate(['/privacy'], { queryParams: { goBack: 'dashboard' } });
    this.menuCtrl.close();
  }

  HideBanner(){
    this._admobService.hideBanner();
  }

  async endSession(){

    const ops = await this._storage.getStorageItem(storageConstants.USER_OPS + this._session.currentUser.id);
    if(!ops){
      this._loader.presentLoader();
      await this.menuCtrl.close();
      localStorage.setItem('autoInitVcc', '');
      localStorage.setItem('vehiclesPassword','');
      localStorage.setItem('googleSign','');
      if(this._session.currentUser.method === "google"){
        this.closeSessionByGoogle();
      }else{
        this.closeSessionByMail();
      }
    }else{
      await this._alert.createAlert(
        this.translate.instant('alert.imposible_to_close_session'),
        this.translate.instant('alert.imposible_to_close_session_text')
      );
    }

  }

  async closeSessionByGoogle(){
    await this._authService.signOutGoogle()
    .then(async () => {
      this.proccesToClose();
    }).catch((error) => {
      alert(error);
    });
  }

  async closeSessionByMail(){
    await this._authService.signOut()
    .then(async () => {
      this.proccesToClose();
    }).catch((error) => {
      alert(error);
    });
  }

  async proccesToClose(){
    this._authService.isActive = false;
    this._authService.isInTest = false;
    this._admobService.removeBanner();
    this._session.deleteTemporalData();
    this.puttingFalseCloudOptions();
    this.navCtr.navigateRoot(['/home']);
  }

  puttingFalseCloudOptions(){
    this.__drive.changeConnected(false);
    this.__drive.changeDownloading("false");
    this.__drive.changeHaveFiles(false);
    this.__drive.changeUploading(false);
    this.__drive.changecleaning(false);
  }

  calculatePadding(){
    return this._paddingService.calculatePadding();
  }

  goMain(){
    this.router.navigate(['/dashboard/main'])
  }

  async share(){

    this.cerrarMenu();
    const isPossible = await Share.canShare();
    if (isPossible){
      await Share.share({
        text: this.translate.instant('share.check_out_this_amazing_app'),
        url: 'https://play.google.com/store/apps/details?id=com.benjamintr.vehiclescontrol',
      });
    }

  }


}
