import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonRow, IonCol, IonImg, IonItem, IonInput, IonIcon, IonFooter, IonButton, IonCheckbox, IonLabel } from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationConfigService } from '../services/translation.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonLabel, IonCheckbox, IonButton, IonFooter, IonIcon, IonInput, IonItem, IonImg, IonCol, IonRow, IonHeader, IonToolbar, IonTitle, IonContent, TranslateModule],
})
export class HomePage implements OnInit{
  constructor(
    private translate: TranslateService,
    private _translation:TranslationConfigService,
  ) {}

  ngOnInit(): void {
    this.translate.setDefaultLang(this._translation.getLanguage()) ;
    console.log(this._translation.getDeviceLanguage())

  }

  changeLanguage(language:string){
    this.translate.use(language)
  }


}
