import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonRow, IonCol, IonLabel, IonButton, IonIcon } from '@ionic/angular/standalone';
import { TranslateService } from '@ngx-translate/core';
import { PaddingService } from 'src/app/services/padding.service';
import { TranslationConfigService } from 'src/app/services/translation.service';

@Component({
  selector: 'app-data',
  templateUrl: './data.page.html',
  styleUrls: ['./data.page.scss'],
  standalone: true,
  imports: [IonIcon, IonButton, IonLabel, IonCol, IonRow, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class DataPage implements OnInit {

  constructor(
    private _paddingService:PaddingService,
    private translate:TranslateService,
    private _translation:TranslationConfigService
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang(this._translation.getLanguage());
  }

  calculatePadding(){
    return this._paddingService.calculatePadding();
  }

}
