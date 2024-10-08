import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { Platform } from '@ionic/angular';
import { LoaderService } from './loader.service';
import { AlertService } from './alert.service';
import { TranslateService } from '@ngx-translate/core';
import { FirestoreService } from './firestore.service';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class VersionService {
  private currentVersion = environment.versioncode; // Versión actual de tu app
  private db = getFirestore(); // Asegúrate de inicializar la base de datos correctamente


  constructor(
    private platform: Platform,
    private _loader:LoaderService,
    private _alert:AlertService,
    private translate:TranslateService,
    private _firestore:FirestoreService
  ) {}


  async getDocument(collection: string, documentId: string) {
    try {
      const docRef = doc(this.db, collection, documentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        console.log("No such document!");
        return null;
      }
    } catch (error) {
      console.error("Error getting document:", error);
      throw error;
    }
  }
  async checkVersion() {
    if(this.platform.is("android")||this.platform.is("desktop")){
      try {
        const data = await this.getDocument("data","YpznogpkCYFRvhPN8rB7");
         if (data && data['versioncode'] > this.currentVersion) {
           await this._loader.dismissLoader();
           await this.promptUpdate();
           await this._loader.presentLoader();
        }
      } catch (error) {
        console.error('Error al verificar la versión:', error);
      }
    }
  }

  async promptUpdate() {
    const sure = await this._alert.twoOptionsAlert(this.translate.instant('alert.new_version_avaliable'),this.translate.instant('alert.new_version_avaliable_text'),this.translate.instant('alert.accept'),this.translate.instant('alert.cancel'))
      if(sure){
        if (this.platform.is('android')||this.platform.is('desktop')) {
          window.open('https://play.google.com/store/apps/details?id=com.benjamintr.vehiclescontrol', '_system');
          }
      }
  }
}
