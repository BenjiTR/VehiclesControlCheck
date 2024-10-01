import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonImg, ModalController, IonIcon, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-imgmodal',
  templateUrl: './imgmodal.page.html',
  styleUrls: ['./imgmodal.page.scss'],
  standalone: true,
  imports: [IonButton, IonIcon, IonGrid, IonRow, IonCol, IonImg, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ImgmodalPage {

  @Input() img!:any;
  photoViewer: any;

  constructor(
    private modalController: ModalController
  ) { }


  closeModal() {
    this.modalController.dismiss();
  }

  openImage() {
    this.photoViewer.show(this.img);
  }

}
