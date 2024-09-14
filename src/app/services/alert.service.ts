import { Injectable } from "@angular/core";
import { AlertController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { firstValueFrom } from "rxjs";


@Injectable({
    providedIn:'root',
})


export class AlertService{

    constructor(
        private alert:AlertController,
        private translate:TranslateService
    ){

    }

     //Alerta de error
     async errAlert(message:string){

      return new Promise<boolean>(async(resolve) => {

          const txButton = await firstValueFrom(this.translate.get('alert.accept'));

          const alert = await this.alert.create({
              cssClass:"alert",
              header:message,
              backdropDismiss: false, // Evitar que la alerta se cierre al hacer clic fuera de ella
              buttons:[
                  {
                      text:txButton,
                      role:"cancel",
                      handler: () => {
                        resolve(true);
                      },
                  },
              ],
          });
          await alert.present();
      })

  }

    //Alerta Básica
    async createAlert(message:string, textAlert:string){

        return new Promise<boolean>(async(resolve) => {

            const txButton = await firstValueFrom(this.translate.get('alert.accept'));

            const alert = await this.alert.create({
                cssClass:"alert",
                header:message,
                message:textAlert,
                backdropDismiss: false, // Evitar que la alerta se cierre al hacer clic fuera de ella
                buttons:[
                    {
                        text:txButton,
                        role:"cancel",
                        handler: () => {
                          resolve(true);
                        },
                    },
                ],
            });
            await alert.present();
        })

    }

    //Alerta dos opciones
    async twoOptionsAlert(message:string, textAlert:string, Opt1:string, OptCancel:string ){

        return new Promise<boolean>(async(resolve)=>{
            const opts = await this.alert.create({
                cssClass:"alert-two-options",
                header: message,
                message: textAlert,
                backdropDismiss: false, // Evitar que la alerta se cierre al hacer clic fuera de ella
                buttons: [
                  {
                    text: Opt1,
                    role: "confirm",
                    handler: () => {

                      resolve(true);
                    },
                  },
                  {
                    text: OptCancel,
                    role: "cancel",
                    handler: () => {

                      resolve(false);
                    },
                  },
                ],
              });

                await opts.present();

            });
    }
}
