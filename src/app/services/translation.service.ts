import { Injectable } from "@angular/core";
import { TranslateService } from '@ngx-translate/core';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeEn from '@angular/common/locales/en';
import localeEs from '@angular/common/locales/es';

@Injectable({
    providedIn: 'root'
})

export class TranslationConfigService {

        public language:string;
        public deviceLanguage:string;

    constructor(
        private translate: TranslateService,
    ){
        this.language="";
        this.deviceLanguage="";
        this.translate.addLangs(['fr', 'en', 'es']);
        registerLocaleData(localeEn);
        registerLocaleData(localeFr);
        registerLocaleData(localeEs);
    }




    getLanguage() {
        const availableLanguages = this.translate.getLangs();
        const deviceLanguage = this.getDeviceLanguage();
      console.log(this.language)
        if(this.language && availableLanguages.includes(this.language) ){
            return this.language
        }else{
            return deviceLanguage
        }
    }

    getDeviceLanguage(): string {
      this.deviceLanguage = this.translate.getBrowserLang() || 'es';
      return this.deviceLanguage;
    }
}
