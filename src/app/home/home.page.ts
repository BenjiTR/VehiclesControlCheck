import { AuthService } from './../services/auth.service';
import { Component, OnInit, getPlatform, OnDestroy } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonRow, IonCol, IonImg, IonItem, IonInput, IonIcon, IonFooter, IonButton, IonCheckbox, IonLabel, Platform, NavController, IonPopover } from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationConfigService } from '../services/translation.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AlertService } from '../services/alert.service';
import { User } from '../models/user.model';
import { SessionService } from '../services/session.service';
import { UserTestService } from '../services/user-test.service';
import { AdmobService } from '../services/admob.service';
import { NotificationsService } from '../services/notifications.service';
import { FileSystemService } from '../services/filesystem.service';
import { StorageService } from '../services/storage.service';
import { Network } from '@capacitor/network';
import { LoaderService } from '../services/loader.service';



@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonPopover, RouterModule, CommonModule, FormsModule, IonLabel, IonCheckbox, IonButton, IonFooter, IonIcon, IonInput, IonItem, IonImg, IonCol, IonRow, IonHeader, IonToolbar, IonTitle, IonContent, TranslateModule],
})
export class HomePage implements OnInit, OnDestroy{



  public showPassword: boolean = false;
  public email:string = "";
  public Error:string = "";
  public password:string = "";
  public rememberSession:boolean =false;
  public emailLabel: string = "";
  public passwordLabel: string = "";


  constructor(
    private translate:TranslateService,
    private _translation:TranslationConfigService,
    private _authService:AuthService,
    private _alert:AlertService,
    private _session:SessionService,
    private _userTestService:UserTestService,
    private _admobService:AdmobService,
    private _notification:NotificationsService,
    private _platform:Platform,
    private navCtr:NavController,
    private _file:FileSystemService,
    private _storage:StorageService,
    private _loader:LoaderService
  ) {
    this.translate.get('home.email').subscribe((translation: string) => {
      this.emailLabel = translation;
    });
    this.translate.get('home.password').subscribe((translation: string) => {
      this.passwordLabel = translation;
    });
  }

  async ngOnInit(){
    await this._loader.presentLoader();
    await this.translate.setDefaultLang(this._translation.getLanguage());
    await this.tryRememberSession();
    await this._admobService.initialize();
    this._admobService.showConsent();
    await this._admobService.showBanner();
    await this._admobService.hideBanner();
    await this.checkNotifications();
    await this._file.checkPermission();
    await this._loader.dismissLoader();
  }

  ngOnDestroy(){
    ("Home destruido");
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
  async loginWithTest(){
    await this._loader.presentLoader();
    const user = this._userTestService.userCredential;
    this.loginExecute(user, "test");
  }

  //AUTENTICACIÓN CON EMAIL
  async loginWithEmail(){
    await this._loader.presentLoader();
    this.Error="";
    this.handlerRememberSession();
    if(this.email === "testusermail.test" && this.password === "testing"){
      this.loginWithTest();
    }else{
    this._authService.loginWithEmailAndPaswword(this.email, this.password)
      .then(async (userCredential) => {
        // Signed in
        const user = userCredential.user;
        if(!user.emailVerified){
          //preguntamos y reenviamos el correo
          const verify = await this._alert.twoOptionsAlert(this.translate.instant('alert.email_no_verified'),this.translate.instant('alert.email_no_verified_text'),this.translate.instant('alert.resend'),this.translate.instant('alert.cancel'))
          if(verify){
            this._authService.sendEmailVerificacion()
            .then(()=>{
              this._alert.createAlert(this.translate.instant('alert.email_resend'),this.translate.instant('alert.email_no_verified_text'));
            })
            .catch((err)=>{
              this.handleErrors(err.message);
            })
          }
        await this._loader.dismissLoader();
        }else{
          this.loginExecute(user)
        }
      })
      .catch(async (error) => {
        this.handleErrors(error.code);
        await this._loader.dismissLoader();
      });
    }
  }

  //AUTENTICACIÓN CON GOOGLE
  async signInWithGoogle(){
    if((await Network.getStatus()).connected === true){
      await this._loader.presentLoader();
      //Primero prueba a refrescar
      await this._authService.refreshGoogle()
      .then(async (authentication)=>{
        const user:any = await this._authService.fetchUserInfo(authentication.accessToken)
        //console.log(user)
        if(user){
          //Como la información en si no trae el toquen, lo insertamos para poder ejecutar bien el proceso de login y guardar los datos
          this.loginExecute(user, "googlerefresh", authentication.accessToken)
        }
      })
      .catch((err)=>{
          //Si no hace el login normal
          this._authService.loginWithGoogle()
          .then((user)=>{
            this.loginExecute(user, "google")
          })
          .catch(async (error)=>{
            this.handleErrors(error.code);
            await this._loader.dismissLoader();
          })
      })
    }else{
      this._alert.createAlert(this.translate.instant("error.no_network"),"");
    }
  }

  //RECORDAR INICIO DE SESIÓN
  async tryRememberSession():Promise<void>{
    const remMail = await localStorage.getItem('vehiclesUser');
    const remPassword = await localStorage.getItem('vehiclesPassword');
    if(remMail && remPassword){
      this.rememberSession= true;
      this.email = remMail;
      this.password = remPassword;
    }
    return;
  }

  //RESTAURAR PASSWORD
  async restorePassword(){
    if(!this.email){
      this._alert.createAlert(this.translate.instant('alert.write_a_correct_email'),this.translate.instant('alert.write_a_correct_email_text'));
    }else{
    await this._loader.presentLoader()
    await this._authService.sendRestorePasswordEmail(this.email)
      .then(async ()=>{
        this._alert.createAlert(this.translate.instant('alert.email_send'),this.translate.instant('alert.restored_email_sended'));
        await this._loader.dismissLoader();
      })
      .catch(async (err)=>{
        //console.log(err);
        this.handleErrors(err.code)
        await this._loader.dismissLoader();
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
    }else if(errorCode === "auth/network-request-failed"){
      this.Error = this.translate.instant('error.auth/network-request-failed')
    }else{
      this.Error = errorCode;
    }
  }

  //CONFIRMAR Y EJECUTAR LOGIN
  async loginExecute(user:any, method?:string, token?:string){
    if(method && method === "googlerefresh"){
      //console.log(user)
      const currentUser:User = new User();
      currentUser.name = user.given_name;
      currentUser.photo = user.picture;
      currentUser.id = user.sub;
      currentUser.method = "google";
      currentUser.email = user.email;
      currentUser.token = token!;
      this._session.currentUser = currentUser;
      this._authService.isActive=true;
    }else if(method && method === "google"){
      const currentUser:User = new User();
      currentUser.name = user.givenName;
      currentUser.photo = user.imageUrl;
      currentUser.id = user.id;
      currentUser.method = "google";
      currentUser.email = user.email;
      currentUser.token = user.authentication.accessToken;
      this._session.currentUser = currentUser;
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
    }
    this.navCtr.navigateRoot(["\dashboard"]);
  }

  async checkNotifications():Promise<void>{
    if(this._platform.is("android")){
      const res = await this._notification.checkPermissions();
      if(res.display==="granted"){
        //console.log("Permiso para mostrar notificaciones concedido");
        return;
      }else{
        await this._notification.requestPermissions();
        return;
      }
    }else{
      return;
    }
  }


}
