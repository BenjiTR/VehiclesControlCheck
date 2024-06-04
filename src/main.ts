import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

//FIREBASE
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

//TRANSLATE
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient, HttpClientModule} from '@angular/common/http';




if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),
    importProvidersFrom(IonicModule.forRoot({innerHTMLTemplatesEnabled: true})),
    provideIonicAngular(),
    provideRouter(routes),
    importProvidersFrom(  HttpClientModule,
      TranslateModule.forRoot({
          loader: {
              provide: TranslateLoader,
              useFactory: HttpLoaderFactory,
              deps: [HttpClient]
          }
      }))
  ],
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
