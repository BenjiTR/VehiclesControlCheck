import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Platform } from '@ionic/angular';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(
    private platform: Platform
  ) {
    this.initializeApp();
    this.blockScreen();
  }

  async blockScreen(){
    await ScreenOrientation.lock({ orientation: 'portrait' });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      let clientId: string;

      if (this.platform.is('android')) {
        clientId = '329432960985-0f0oj2qbh3gp0mbgr0k32hmi0b6gbi06.apps.googleusercontent.com';
      } else if (this.platform.is('ios')) {
        clientId = '329432960985-97l9q80p1v5qb14lc5ef321jameit40s.apps.googleusercontent.com';
      } else {
        clientId = '329432960985-0f0oj2qbh3gp0mbgr0k32hmi0b6gbi06.apps.googleusercontent.com';
      }

      // Inicializar GoogleAuth con el clientId específico para la plataforma
      GoogleAuth.initialize({
        clientId,
        scopes: ['profile', 'email', 'https://www.googleapis.com/auth/drive.appdata'],
        grantOfflineAccess: true,
      });
    });
  }
}
