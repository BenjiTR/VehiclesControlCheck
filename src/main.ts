import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

//FIREBASE
import { initializeApp } from "firebase/app";
import { CapacitorConfig } from '@capacitor/cli';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

//TRANSLATE
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

//ANIMACIONES
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';


if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    BrowserAnimationsModule,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),
    importProvidersFrom(IonicStorageModule.forRoot()),
    importProvidersFrom(IonicModule.forRoot({innerHTMLTemplatesEnabled: true})),
    provideIonicAngular(),
    provideRouter(routes),
    importProvidersFrom(IonicModule.forRoot({ innerHTMLTemplatesEnabled: true })),
    provideHttpClient(withInterceptorsFromDi()), // Actualiza HttpClientModule aquí
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    )
  ]
});

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}

const firebaseConfig = {
  apiKey: "AIzaSyBEUQrzovOog0EiV91wqLo004DyJukGqTY",
  authDomain: "vehicles-control-ck.firebaseapp.com",
  projectId: "vehicles-control-ck",
  storageBucket: "vehicles-control-ck.appspot.com",
  messagingSenderId: "329432960985",
  appId: "1:329432960985:web:9d24d527e86415364b93c8",
  measurementId: "G-GYSN7J9W02"
};

const config: CapacitorConfig = {
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"],
    },
    GoogleAuth: {
      clientId:'329432960985-0f0oj2qbh3gp0mbgr0k32hmi0b6gbi06.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
      scopes: ['profile', 'email','https://www.googleapis.com/auth/drive.appdata','https://www.googleapis.com/auth/calendar','https://www.googleapis.com/auth/calendar.events']
    }
  },
};

export default config;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

defineCustomElements(window);
if (environment.production) {
  enableProdMode();
}
