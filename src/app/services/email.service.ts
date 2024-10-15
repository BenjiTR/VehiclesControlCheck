import { Injectable } from "@angular/core";
import emailjs, { EmailJSResponseStatus } from '@emailjs/browser';
import { AlertService } from "./alert.service";
import { TranslateService } from "@ngx-translate/core";


@Injectable({
  providedIn:'root'
})

export class EmailService{


  public isInit:boolean=false;

  constructor(
    private _alert:AlertService,
    private translate:TranslateService
  ){

  }

  async init():Promise<void>{
    emailjs.init({
      publicKey: 'F-ktdkeNxdWIsym_S',
      // Do not allow headless browsers
      blockHeadless: true,
      blockList: {
        // Block the suspended emails

        watchVariable: 'userEmail',
      },
      limitRate: {
        // Set the limit rate for the application
        id: 'app',
        // Allow 1 request per 10s
        throttle: 10000,
      },
    });
    this.isInit = true;
    return;
  }

  async sendEmail(from_name:string, from_email:string, message:string) {
    if(!this.isInit){
      await this.init();
    }
    const templateParams = {
      from_name: from_name,
      from_email: from_email,
      message: message,
    };

    emailjs.send('service_ngqe0xj', 'template_cld340o', templateParams)
      .then((result) => {
        console.log(result.text);
        this._alert.createAlert(this.translate.instant('alert.email_send'), "")
      }, (error) => {
        console.error(error.text);
       this._alert.createAlert(this.translate.instant('alert.an_error_ocurred_try_again'),"")
      });
  }


}
