import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { Platform } from '@ionic/angular';
import { LoaderService } from './loader.service';
import { AlertService } from './alert.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class VersionService {
  private currentVersion = environment.versioncode; // Versión actual de tu app
  private versionUrl = 'https://vehicles-control-ck.web.app/version.json'; // URL del archivo en Firebase Hosting

  constructor(
    private http: HttpClient,
    private platform: Platform,
    private _loader:LoaderService,
    private _alert:AlertService,
    private translate:TranslateService
  ) {}

  async checkVersion() {
    try {
      const data = await firstValueFrom(this.http.get<{ version: string }>(this.versionUrl));
      if (data && data.version !== this.currentVersion) {
        await this._loader.dismissLoader();
        await this.promptUpdate();
        await this._loader.presentLoader();
      }
    } catch (error) {
      console.error('Error al verificar la versión:', error);
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
