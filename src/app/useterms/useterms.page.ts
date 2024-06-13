import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonItem, IonFooter, IonCard } from '@ionic/angular/standalone';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationConfigService } from '../services/translation.service';

@Component({
  selector: 'app-useterms',
  templateUrl: './useterms.page.html',
  styleUrls: ['./useterms.page.scss'],
  standalone: true,
  imports: [IonCard, TranslateModule, IonFooter, IonItem, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RouterModule]
})
export class UsetermsPage implements OnInit {

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
