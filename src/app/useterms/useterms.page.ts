import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonItem, IonFooter } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationConfigService } from '../services/translation.service';

@Component({
  selector: 'app-useterms',
  templateUrl: './useterms.page.html',
  styleUrls: ['./useterms.page.scss'],
  standalone: true,
  imports: [TranslateModule, IonFooter, IonItem, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RouterModule]
})
export class UsetermsPage implements OnInit {

  constructor(
    private translate: TranslateService,
    private _translation:TranslationConfigService,
  ) {}

  ngOnInit(): void {
    this.translate.setDefaultLang(this._translation.getLanguage()) ;
  }


}
