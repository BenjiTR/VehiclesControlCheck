import { UserdataviewPage } from './../userdataview/userdataview.page';
import { Component, OnInit, OnChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonAccordionGroup, IonContent, IonHeader, IonTitle, IonToolbar, IonCol, IonRow, IonGrid, IonImg, IonButton, IonButtons, IonMenuButton, IonIcon, IonMenu, MenuController, IonLabel, IonItem, IonInput, IonAccordion, IonRouterOutlet, NavController, IonNavLink } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationConfigService } from '../../services/translation.service';
import { AdmobService } from 'src/app/services/admob.service';
import { PaddingService } from 'src/app/services/padding.service';
import { MainAnimation, RoadAnimation, SecondaryAnimation } from 'src/app/services/animation.service';
import { SessionService } from 'src/app/services/session.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonNavLink, IonRouterOutlet, IonAccordionGroup, IonAccordion, UserdataviewPage, IonInput, IonItem, IonLabel, TranslateModule, RouterModule, IonMenu, IonIcon, IonButtons, IonMenuButton, IonButton, IonImg, IonGrid, IonCol ,IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonRow, IonGrid],
  animations: [ MainAnimation, RoadAnimation, SecondaryAnimation ]
})
export class DashboardPage implements OnInit, OnDestroy {

  public isLoading:Boolean=true;

  constructor(
    private menuCtrl: MenuController,
    private _authService: AuthService,
    private router:Router,
    private translate:TranslateService,
    private _translation:TranslationConfigService,
    private _admobService:AdmobService,
    private _paddingService:PaddingService,
    private navCtr:NavController,
    private _session:SessionService
  ) { }

  async ngOnInit() {
    this.translate.setDefaultLang(this._translation.getLanguage());
    this._admobService.resumeBanner();
    this.isLoading=true;
  }


  ngOnDestroy(){
    this._admobService.hideBanner();
  }

  cerrarMenu() {
    this.menuCtrl.close();
    this._admobService.resumeBanner();
  }

  goUseTerms(){
    this.navCtr.navigateRoot('/useterms',{queryParams: { goBack: 'dashboard' }});
    this.menuCtrl.close();
  }

  goPrivacy(){
    this.navCtr.navigateRoot('/useterms',{queryParams: { goBack: 'dashboard' }});
    this.menuCtrl.close();
  }

  HideBanner(){
    this._admobService.hideBanner();
  }

  async endSession(){
    this.isLoading=true;
    await this.menuCtrl.close();
    await this._authService.signOut()
    .then(async () => {
      // Sign-out successful.
      this._authService.isActive = false;
      this._authService.isInTest = false;
      await this._admobService.removeBanner();
      this._session.deleteTemporalData();
      this.navCtr.navigateRoot(['/home']);
      this.isLoading=false;
    }).catch((error) => {
      // An error happened.
      alert(error);
    });
  }

  calculatePadding(){
    return this._paddingService.calculatePadding();
  }

}
