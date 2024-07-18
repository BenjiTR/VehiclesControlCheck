import { transition } from '@angular/animations';
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(
    private toastController: ToastController,
    private translate:TranslateService) { }

  async showToast(message: string) {
    const dismiss = this.translate.instant('toast.dismiss');
    const toast = await this.toastController.create({
      message: message,
      duration: 6000,
      position: 'top',
      buttons :[
        {
          text: dismiss,
          role: 'cancel'
        }
      ]
    });
    toast.present();
  }
}
