import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonRow, IonCol, IonImg, IonItem, IonInput, IonIcon, IonFooter, IonButton, IonCheckbox, IonLabel, IonAvatar, IonPopover } from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationConfigService } from '../../services/translation.service';
import { RouterModule, Router } from '@angular/router';
import { SessionService } from 'src/app/services/session.service';
import { User } from 'src/app/models/user.model';
import { DriveService } from 'src/app/services/drive.service';

@Component({
  selector: 'app-userdataview',
  templateUrl: './userdataview.page.html',
  styleUrls: ['./userdataview.page.scss'],
  standalone: true,
  imports: [IonPopover, IonAvatar, IonLabel, RouterModule, CommonModule, TranslateModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonRow, IonCol, IonImg, IonItem, IonInput, IonIcon, IonFooter, IonButton, IonCheckbox, IonLabel]
})
export class UserdataviewPage implements OnInit {

  public user:User = new User;
  public token:string = "";
  public connected:boolean = false;
  public hasFiles:boolean = false;
  public auto:boolean = false;

  constructor(
    private translate: TranslateService,
    private _translation: TranslationConfigService,
    private router: Router,
    private _session:SessionService,
    private _drive:DriveService
  ) {
    this._drive.conected$.subscribe(value=>{
      this.connected = value;
    })
    this._drive.haveFiles$.subscribe(value=>{
      this.hasFiles = value;
    })
  }

  async ngOnInit() {
    this.translate.setDefaultLang(this._translation.getLanguage());
    this.user = this._session.currentUser;
    // console.log(this.user)
    this.token = await this._session.getToken();
    this.auto = await this._session.getAutoBackup();
  }
  ionViewWillEnter(){
    this.user = this._session.currentUser;
  }

}
