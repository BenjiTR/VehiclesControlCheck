import {Injectable} from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({
  providedIn:'root'
})

export class CameraServices{

  constructor(){
  }


  public async takePhoto() {
    // Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Prompt,
      quality: 75
    });

    return capturedPhoto.base64String;
  }


}
