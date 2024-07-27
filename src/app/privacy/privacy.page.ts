import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonBackButton, IonFooter, NavController } from '@ionic/angular/standalone';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationConfigService } from '../services/translation.service';
import { AdmobService } from '../services/admob.service';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.page.html',
  styleUrls: ['./privacy.page.scss'],
  standalone: true,
  imports: [TranslateModule, IonFooter, IonBackButton, IonButtons, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RouterModule]
})
export class PrivacyPage implements OnInit {

  public goBack: string = ""

  constructor(
    private translate: TranslateService,
    private _translation:TranslationConfigService,
    private activatedroute:ActivatedRoute,
    private navCtr:NavController,
    private _admob:AdmobService
  ) {}

  ngOnInit(): void {
    this.translate.setDefaultLang(this._translation.getLanguage()) ;
  }

  ionViewWillEnter() {
    this.goBack = this.activatedroute.snapshot.queryParams['goBack'];
    this._admob.hideBanner;
  }

  ionViewWillLeave(){
    this._admob.resumeBanner;
  }


  goback(){
    if(this.goBack){
      this.navCtr.navigateRoot([this.goBack], { queryParams: { reload: true } });
    }else{
      this.navCtr.navigateRoot(['/home'])
    }
  }



}
