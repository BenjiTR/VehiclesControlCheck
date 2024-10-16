import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCol, IonLabel, IonRow, IonImg, IonButton, IonCheckbox, ModalController, IonIcon, IonFooter } from '@ionic/angular/standalone';
import { storageConstants } from 'src/app/const/storage';
import { environment } from 'src/environments/environment.prod';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-newsmodal',
  templateUrl: './newsmodal.page.html',
  styleUrls: ['./newsmodal.page.scss'],
  standalone: true,
  imports: [IonFooter, TranslateModule, IonIcon, IonCheckbox, IonButton, IonImg, IonRow, IonLabel, IonCol, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class NewsPage {

  public element:number = 1;
  public max:number = 3;
  public understand:boolean = false;

  constructor(
    private mController:ModalController,
    private _session:SessionService
  ) { }



  next(){
    if(this.element<this.max)
    this.element++
  }

  previous(){
      this.element--
  }

  changeUnderstand(event:any){
    this.understand = event.detail.checked;
  }

  close(){
    if(this.understand){
      //console.log(storageConstants.NEWS_READED+this._session.currentUser.id);
      localStorage.setItem(storageConstants.NEWS_READED+this._session.currentUser.id, environment.versioncode);
    }
    this.mController.dismiss();
  }

}
