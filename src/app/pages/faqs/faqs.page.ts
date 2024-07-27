import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonAccordionGroup, IonAccordion, IonItem, IonLabel, IonButton, IonCol, IonRow, IonIcon } from '@ionic/angular/standalone';
import { PaddingService } from 'src/app/services/padding.service';
import { Browser } from '@capacitor/browser';
import { TranslateService, TranslateModule} from '@ngx-translate/core';
import { TranslationConfigService } from 'src/app/services/translation.service';
import { RouterModule } from '@angular/router';
import { urlconstants } from 'src/app/const/url';

@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.page.html',
  styleUrls: ['./faqs.page.scss'],
  standalone: true,
  imports: [RouterModule, IonIcon, TranslateModule, IonRow, IonCol, IonButton, IonLabel, IonItem, IonAccordion, IonAccordionGroup, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class FaqsPage implements OnInit {

  public lang:string = "";

  constructor(
    private _paddingService:PaddingService,
    private translate:TranslateService,
    private _translation:TranslationConfigService
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang(this._translation.getLanguage());
    this.lang = this._translation.getLanguage()
  }

  async openFaqs(){
      await Browser.open({ url: urlconstants.FAQS+this.lang});
  }

  async openQuickstart(){
    await Browser.open({ url: urlconstants.MAN+this.lang});
}


  calculatePadding(){
    return this._paddingService.calculatePadding();
  }


}
