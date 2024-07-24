import { RouterModule } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonRow, IonCol, IonLabel, IonIcon } from '@ionic/angular/standalone';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { PaddingService } from 'src/app/services/padding.service';
import { TranslationConfigService } from 'src/app/services/translation.service';

@Component({
  selector: 'app-problem',
  templateUrl: './problem.page.html',
  styleUrls: ['./problem.page.scss'],
  standalone: true,
  imports: [RouterModule, IonIcon, TranslateModule, IonLabel, IonCol, IonRow, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ProblemPage implements OnInit {

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
