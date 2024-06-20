import { AuthService } from './../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonRow, IonCol, IonImg, IonItem, IonInput, IonIcon, IonFooter, IonButton, IonCheckbox, IonLabel } from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationConfigService } from '../services/translation.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AlertService } from '../services/alert.service';
import { User } from '../models/user.model';
import { SessionService } from '../services/session.service';
import { UserTestService } from '../services/user-test.service';
import { AdmobService } from '../services/admob.service';


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
    private translate:TranslateService,
    private _translation:TranslationConfigService,
    private _authService:AuthService,
    private _alert:AlertService,
    private _session:SessionService,
    private router:Router,
    private _userTestService:UserTestService,
    private _admobService:AdmobService,
  ) {}

  async ngOnInit(){
    this.isLoading=true;
    this._admobService.initialize();
    this._admobService.showConsent();
    this._admobService.showBanner();
    this._admobService.hideBanner();
    this.translate.setDefaultLang(this._translation.getLanguage());
    this.tryRememberSession();
    this.isLoading=false;
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

  //VALIDACIÓN DEL BOTÓN
  sendValidation(){
    if(!this.email || !this.password){
      return true
    }else{
      return false
    }
  }

  //TEST USER
  loginWithTest(){
    const user = this._userTestService.userCredential;
    this.loginExecute(user, "test");
  }

  //AUTENTICACIÓN CON EMAIL
  async loginWithEmail(){

    this.isLoading=true;
    this.Error="";
    this.handlerRememberSession()
    this._authService.loginWithEmailAndPaswword(this.email, this.password)
      .then(async (userCredential) => {
        // Signed in
        const user = userCredential.user;
        //console.log(user)
        // ...
        if(!user.emailVerified){
          //preguntamos y reenviamos el correo
          const verify = await this._alert.twoOptionsAlert(this.translate.instant('alert.email_no_verified'),this.translate.instant('alert.email_no_verified_text'),this.translate.instant('alert.resend'),this.translate.instant('alert.cancel'))
          if(verify){
            this._authService.sendEmailVerificacion()
            .then(()=>{
              this._alert.createAlert(this.translate.instant('alert.email_resend'),this.translate.instant('alert.email_no_verified_text'));
            })
            .catch((err)=>{
              this.handleErrors(err.code);
            })
          }
        this.isLoading = false;
        }else{
          this.loginExecute(user)
        }
      })
      .catch(async (error) => {
        this.handleErrors(error.code);
      });
    this.isLoading=false;
  }

  //AUTENTICACIÓN CON GOOGLE
  async signInWithGoogle(){
    this.isLoading=true;
    this._authService.loginWithGoogle()
    .then((user)=>{
      this.loginExecute(user, "google")
    })
    .catch((error)=>{
      this.handleErrors(error.code);
    })
  }

  //RECORDAR INICIO DE SESIÓN
  tryRememberSession(){
    const remMail = localStorage.getItem('vehiclesUser');
    const remPassword = localStorage.getItem('vehiclesPassword');
    if(remMail && remPassword){
      this.rememberSession= true;
      this.email = remMail;
      this.password = remPassword;
    }
    this.isLoading=false;
  }

  //RESTAURAR PASSWORD
  async restorePassword(){
    if(!this.email){
      this._alert.createAlert(this.translate.instant('alert.write_a_correct_email'),this.translate.instant('alert.write_a_correct_email_text'));
    }else{
    this.isLoading=true
    await this._authService.sendRestorePasswordEmail(this.email)
      .then(()=>{
        this._alert.createAlert(this.translate.instant('alert.email_send'),this.translate.instant('alert.restored_email_sended'));
        this.isLoading=false;
      })
      .catch((err)=>{
        //console.log(err);
        this.handleErrors(err.code)
        this.isLoading=false;
      })
    }
  }

  //MANEJO DE RECORDAR LA SESIÓN
  handlerRememberSession(){
    if(this.rememberSession){
      localStorage.setItem('vehiclesUser', this.email);
      localStorage.setItem('vehiclesPassword',this.password);
    }else{
      localStorage.setItem('vehiclesUser', '');
      localStorage.setItem('vehiclesPassword','');
    }
  }

  //MANEJO DE ERRORES
  async handleErrors(errorCode:string){
    //console.log("Error: ", errorCode);
    if(errorCode === "auth/invalid-email"){
      this.Error = this.translate.instant('error.email_format_incorrect')
    }else if(errorCode === "auth/wrong-password"){
      this.Error = this.translate.instant('error.wrong_password')
    }else if(errorCode === "auth/invalid-credential"){
      this.Error = this.translate.instant('error.invalid_credencial')
    }else if(errorCode === "auth/too-many-requests"){
      //ERROR QUE DA OPCIÓN A RESTAURAR CONTRASEÑA
      const changepsw = await this._alert.twoOptionsAlert(this.translate.instant('alert.temporarily_disabled'),this.translate.instant('alert.temporarily_disabled_text'), this.translate.instant('alert.restore_password'),this.translate.instant('alert.cancel'))
      if(changepsw){
        this.restorePassword()
      }
    }else if(errorCode === "Firebase: Error (auth/network-request-failed)."){
      this.Error = this.translate.instant('error.auth/network-request-failed')
    }else{
      this.Error = errorCode;
    }
  }

  //CONFIRMAR Y EJECUTAR LOGIN
  async loginExecute(user:any, method?:string){
    if(method && method === "google"){
      const currentUser:User = new User();
      currentUser.name = user.givenName;
      currentUser.photo = user.imageUrl;
      currentUser.id = user.id;
      currentUser.method = "google";
      currentUser.email = user.email;
      this._session.currentUser = currentUser
      this._authService.isActive=true;
    }else if(method && method === "test"){
      const currentUser:User = new User();
      currentUser.name = user.givenName;
      currentUser.photo = user.imageUrl;
      currentUser.id = user.id;
      currentUser.method = "email";
      currentUser.email = user.email;
      this._authService.isInTest = true;
      currentUser.photo = await this._session.searchphoto(currentUser.method, currentUser.id);
      this._session.currentUser = currentUser
    }else{
      //observable del estado de autenticación
      this._authService.userState();

      const currentUser:User = new User();
      currentUser.name = user.displayName;
      currentUser.id = user.uid;
      currentUser.method = "email";
      currentUser.email = user.email;
      currentUser.photo = await this._session.searchphoto(currentUser.method, currentUser.id);
      this._session.currentUser = currentUser;
      this._session.getReminderNotifications();
    }
    this.router.navigate(["\dashboard"])
    this.isLoading=false;
  }

}
