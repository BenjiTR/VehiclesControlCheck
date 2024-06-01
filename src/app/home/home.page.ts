import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonRow, IonCol, IonImg, IonItem, IonInput, IonIcon, IonFooter, IonButton, IonCheckbox, IonLabel } from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationConfigService } from '../services/translation.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, IonLabel, IonCheckbox, IonButton, IonFooter, IonIcon, IonInput, IonItem, IonImg, IonCol, IonRow, IonHeader, IonToolbar, IonTitle, IonContent, TranslateModule],
})
export class HomePage implements OnInit{

  public showPassword: boolean = false;
  public email:string = "";
  public Error:string = "";
  public password:string = "";
  public isLoading:boolean = false;
  public rememberSession:boolean =false;

  constructor(
    private translate: TranslateService,
    private _translation:TranslationConfigService,
  ) {}

  ngOnInit(): void {
    this.translate.setDefaultLang(this._translation.getLanguage()) ;

  }

  //CAMBIAR LENGUAJE
  changeLanguage(language:string){
    this._translation.language = language
    this.translate.use(language)
  }

  //TOOGLE PASSWORD
  togglePassword() {
    this.showPassword = !this.showPassword;
  }


  sendValidation(){}

  loginWithEmail(){}

  restorePassword(){}

  signInWithGoogle(){}

}
