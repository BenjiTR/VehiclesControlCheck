import { RouterModule } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonRow, IonCol, IonLabel, IonIcon, IonButton, IonRouterOutlet, IonItem, IonInput, IonTextarea, IonText } from '@ionic/angular/standalone';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { PaddingService } from 'src/app/services/padding.service';
import { TranslationConfigService } from 'src/app/services/translation.service';
import { EmailService } from 'src/app/services/email.service';




@Component({
  selector: 'app-problem',
  templateUrl: './problem.page.html',
  styleUrls: ['./problem.page.scss'],
  standalone: true,
  imports: [IonText, IonTextarea, IonInput, IonItem, IonRouterOutlet, IonButton, RouterModule, IonIcon, TranslateModule, IonLabel, IonCol, IonRow, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ProblemPage implements OnInit {

  public name:string = "";
  public email:string = "";
  public message:string = "";

  constructor(
    private _paddingService:PaddingService,
    private translate:TranslateService,
    private _translation:TranslationConfigService,
    private _email:EmailService
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang(this._translation.getLanguage());
  }

  calculatePadding(){
    return this._paddingService.calculatePadding();
  }

  sendMail(){
    this._email.sendEmail(this.name,this.email,this.message);
  }

  correct(){
    return false
  }
}
