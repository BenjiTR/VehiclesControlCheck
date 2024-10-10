import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Platform, IonHeader, IonToolbar, IonTitle, IonContent, IonRow, IonCol, IonImg, IonItem, IonInput, IonIcon, IonFooter, IonButton, IonCheckbox, IonLabel, IonAvatar, IonPopover } from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationConfigService } from '../../services/translation.service';
import { RouterModule, Router } from '@angular/router';
import { SessionService } from 'src/app/services/session.service';
import { User } from 'src/app/models/user.model';
import { DriveService } from 'src/app/services/drive.service';
import { Subscription } from 'rxjs';

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
  public uploading:boolean = false;
  public downloading:string = "false";
  public cleaning:boolean = false;
  public autoBk:boolean = true;
  public platform:string = "";

  private connectedSubscription:Subscription;
  private haveFilesSubscription:Subscription;
  private uploadingSubscription:Subscription;
  private downloadingSubscription:Subscription;
  private cleaningSubscription:Subscription;
  private autoBkSubscription:Subscription;

  constructor(
    private translate: TranslateService,
    private _translation: TranslationConfigService,
    private router: Router,
    private _session:SessionService,
    private _drive:DriveService,
    private _platform:Platform
  ) {
    this.connectedSubscription = this._drive.conected$.subscribe(async value=>{
      this.token = await this._session.getToken();
      //console.log(this.token)
      this.connected = value;
    })
    this.haveFilesSubscription = this._drive.haveFiles$.subscribe(value=>{
      this.hasFiles = value;
    })
    this.uploadingSubscription = this._drive.uploading$.subscribe(value=>{
      this.uploading = value;
    })
    this.downloadingSubscription = this._drive.downloading$.subscribe(value=>{
      this.downloading = value;
    })
    this.cleaningSubscription = this._drive.cleaning$.subscribe(value=>{
      this.cleaning = value;
    })
    this.autoBkSubscription = this._drive.autoBk$.subscribe(value=>{
      //console.log(value)
      this.autoBk = value;
    })
    if(this._platform.is('android')){
      this.platform = 'android'
    }else{
      this.platform = 'ios'
    }
  }

  async ngOnInit() {
    this.translate.setDefaultLang(this._translation.getLanguage());
    this.user = await this._session.getUser();
    this.autoBk = await this._session.getAutoBackup();
    if(this.autoBk === null){
      this.autoBk = true;
    };
  }
  async ionViewWillEnter(){
    this.user = this._session.currentUser;
  }

  OnDestroy(){
    if(this.connectedSubscription){
      this.connectedSubscription.unsubscribe();
    }
    if(this.haveFilesSubscription){
      this.haveFilesSubscription.unsubscribe();
    }
    if(this.uploadingSubscription){
      this.uploadingSubscription.unsubscribe();
    }
    if(this.downloadingSubscription){
      this.downloadingSubscription.unsubscribe();
    }
    if(this.cleaningSubscription){
      this.cleaningSubscription.unsubscribe();
    }
  }

}
