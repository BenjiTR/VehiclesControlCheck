import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonRow, IonCol, IonImg, IonItem, IonInput, IonIcon, IonFooter, IonButton, IonCheckbox, IonLabel, IonAvatar } from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationConfigService } from '../../services/translation.service';
import { RouterModule, Router } from '@angular/router';
import { SessionService } from 'src/app/services/session.service';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-userdataview',
  templateUrl: './userdataview.page.html',
  styleUrls: ['./userdataview.page.scss'],
  standalone: true,
  imports: [IonAvatar, IonLabel, RouterModule, CommonModule, TranslateModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonRow, IonCol, IonImg, IonItem, IonInput, IonIcon, IonFooter, IonButton, IonCheckbox, IonLabel]
})
export class UserdataviewPage implements OnInit {

  public user:User = new User;

  constructor(
    private translate: TranslateService,
    private _translation: TranslationConfigService,
    private router: Router,
    private _session:SessionService
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang(this._translation.getLanguage());
    this.user = this._session.currentUser;
  }

}
