import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonToggle, IonContent, IonHeader, IonTitle, IonToolbar, IonCol, IonRow, IonLabel } from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationConfigService } from 'src/app/services/translation.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: true,
  imports: [FormsModule, IonLabel, IonCol, IonRow, IonToggle, TranslateModule, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class NotificationsPage{

  public isAllowed:boolean = false;
  public errorText:string = "prueba"

  constructor(
    private translate:TranslateService,
    private _translation:TranslationConfigService,
    private _notifications:NotificationsService,
    private _session:SessionService

  ) { }

  async ionViewWillEnter() {
    this.errorText = "";
    this.translate.setDefaultLang(this._translation.getLanguage());
    await this.checkPermissions();
  }

  async checkPermissions():Promise<void>{
    const resp = await this._notifications.checkPermissions();
    this.isAllowedAndActivated(resp.display);
  }

  async requestPermissions():Promise<void>{
    const resp = await this._notifications.requestPermissions();
      this.isAllowedAndActivated(resp.display);
  }

  isAllowedAndActivated(resp:string){
    const remindNotifications = this._session.remindNotitications;
    if (resp === "granted" && remindNotifications){
      this.isAllowed = true;
    }else{
      this.isAllowed=false;
    }
  }

  async togglePermissions(){
    if(this.isAllowed){
      this.isAllowed = false;
      this._session.setReminderNotifications(false)
    }else{
      const resp = await this._notifications.requestPermissions();
      if(resp.display==="granted"){
        this.isAllowed = true;
        this._session.setReminderNotifications(true)
      }else{
        this.isAllowed = false;
        this._session.setReminderNotifications(false);
        this.errorText = await this.translate.instant("notifications.not_allowed_text");
      }
    }
  }



}
