import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCol, IonLabel, IonRow, IonImg, IonButton, IonCheckbox, ModalController, IonIcon, IonFooter } from '@ionic/angular/standalone';
import { storageConstants } from 'src/app/const/storage';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-newsmodal',
  templateUrl: './newsmodal.page.html',
  styleUrls: ['./newsmodal.page.scss'],
  standalone: true,
  imports: [IonFooter, TranslateModule, IonIcon, IonCheckbox, IonButton, IonImg, IonRow, IonLabel, IonCol, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class NewsmodalPage implements OnInit {

  public element:number = 1;
  public max:number = 3;
  public understand:boolean = false;

  constructor(
    private modal:ModalController,
  ) { }

  ngOnInit() {
    console.log("nuevo modal")
  }

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
      localStorage.setItem(storageConstants.NEWS_READED, environment.versioncode);
    }
    this.modal.dismiss();
  }

}
