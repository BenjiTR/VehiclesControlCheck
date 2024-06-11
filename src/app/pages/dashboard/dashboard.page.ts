import { UserdataviewPage } from './../userdataview/userdataview.page';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCol, IonRow, IonGrid, IonImg, IonButton, IonButtons, IonMenuButton, IonIcon, IonMenu, MenuController, IonLabel, IonItem, IonInput } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationConfigService } from '../../services/translation.service';
import { AdmobService } from 'src/app/services/admob.service';
import { PaddingService } from 'src/app/services/padding.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [UserdataviewPage, IonInput, IonItem, IonLabel, TranslateModule, RouterModule, IonMenu, IonIcon, IonButtons, IonMenuButton, IonButton, IonImg, IonGrid, IonCol ,IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonRow, IonGrid]
})
export class DashboardPage implements OnInit {

  public isLoading:Boolean=true;

  constructor(
    private menuCtrl: MenuController,
    private _authService: AuthService,
    private router:Router,
    private translate:TranslateService,
    private _translation:TranslationConfigService,
    private _admobService:AdmobService,
    private _paddingService:PaddingService
  ) { }

  async ngOnInit() {
    this.translate.setDefaultLang(this._translation.getLanguage());
    this._admobService.resumeBanner();
    this.isLoading=false;
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

}
