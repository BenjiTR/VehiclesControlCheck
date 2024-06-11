import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonCol, IonRow, IonAvatar, IonItem, IonIcon, IonFab, IonFabButton, IonInput } from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationConfigService } from '../../services/translation.service';
import { User } from 'src/app/models/user.model';
import { SessionService } from 'src/app/services/session.service';
import { PaddingService } from 'src/app/services/padding.service';

@Component({
  selector: 'app-userdata',
  templateUrl: './userdata.page.html',
  styleUrls: ['./userdata.page.scss'],
  standalone: true,
  imports: [ IonInput, TranslateModule, RouterModule, IonButton, IonFab, IonFabButton, IonIcon, IonItem, IonAvatar, IonRow, IonCol, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class UserdataPage implements OnInit {

  public user:User = new User;
  public isEditing:boolean=false;

  constructor(
    private router:Router,
    private translate:TranslateService,
    private _translation:TranslationConfigService,
    private _session:SessionService,
    private _paddingService:PaddingService
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang(this._translation.getLanguage());
    this.user = this._session.currentUser;
  }

  calculatePadding(){
    return this._paddingService.calculatePadding();
  }

  changeUserImage(){}

  cancelEditting(){}

  saveNewData(){}

  changePassword(){}

  isEditingToogle(){}

}
