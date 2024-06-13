import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonBackButton, IonFooter } from '@ionic/angular/standalone';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationConfigService } from '../services/translation.service';

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
    private router:Router
  ) {}

  ngOnInit(): void {
    this.translate.setDefaultLang(this._translation.getLanguage()) ;
  }

  ionViewWillEnter() {
    this.goBack = this.activatedroute.snapshot.queryParams['goBack'];
  }


  goback(){
    if(this.goBack){
      this.router.navigate([this.goBack])
    }else{
      this.router.navigate(['/home'])
    }
  }

}
