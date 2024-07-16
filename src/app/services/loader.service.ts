import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LoaderPage } from '../loader/loader.page';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {

  public isLoading:boolean = false;

  constructor(private modalController: ModalController) {}

  async presentLoader() {
  if(!this.isLoading){
    this.isLoading=true;
    const modal = await this.modalController.create({
      component: LoaderPage,
      cssClass: 'loader-modal',
      backdropDismiss: false,
    });

    return await modal.present();
  }
}

  async dismissLoader() {
    this.isLoading=false;
    return await this.modalController.dismiss();
  }
}
