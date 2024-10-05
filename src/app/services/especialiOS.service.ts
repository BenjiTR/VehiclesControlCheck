import { Platform } from '@ionic/angular/standalone';
import { Injectable } from "@angular/core";


@Injectable({
  providedIn: "root"
})
export class EspecialiOS{

  constructor(
    private _platform:Platform
  ){

  }

  public preventFocus(event: MouseEvent) {
    if(this._platform.is('ios')){
      event.preventDefault();
    }
  }
}




