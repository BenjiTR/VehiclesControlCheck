import { UserdataviewPage } from './../userdataview/userdataview.page';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCol, IonRow, IonGrid, IonImg, IonButton, IonButtons, IonMenuButton, IonIcon, IonMenu, MenuController } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationConfigService } from '../../services/translation.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [TranslateModule, RouterModule, IonMenu, IonIcon, IonButtons, IonMenuButton, IonButton, IonImg, IonGrid, IonCol, UserdataviewPage ,IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonRow, IonGrid]
})
export class DashboardPage implements OnInit {

  constructor(
    private menuCtrl: MenuController,
    private _authService: AuthService,
    private router:Router,
    private translate:TranslateService,
    private _translation:TranslationConfigService
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang(this._translation.getLanguage());
  }

  cerrarMenu() {
    this.menuCtrl.close();
  }

  async endSession(){
    await this._authService.signOut()
    .then(() => {
      // Sign-out successful.
      this.router.navigate(['/home'])
    }).catch((error) => {
      // An error happened.
      alert(error)
    });
  }


}
