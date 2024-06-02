import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonRow, IonCol, IonImg, IonItem, IonInput, IonIcon, IonFooter, IonButton, IonCheckbox, IonLabel } from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationConfigService } from '../../services/translation.service';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-newuser',
  templateUrl: './newuser.page.html',
  styleUrls: ['./newuser.page.scss'],
  standalone: true,
  imports: [RouterModule, CommonModule, TranslateModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonRow, IonCol, IonImg, IonItem, IonInput, IonIcon, IonFooter, IonButton, IonCheckbox, IonLabel]
})
export class NewuserPage implements OnInit{

  public showPassword: boolean = false;
  public showRepeatPassword:boolean=false;
  public email:string = "";
  public Error:string = "";
  public password:string = "";
  public repeatPassword:string = "";
  public isLoading:boolean = true;
  public userName:string = "";

  constructor(
    private translate: TranslateService,
    private _translation:TranslationConfigService,
    private _authService:AuthService,
    private _alert:AlertService,
    private router:Router
  ) { }

  ngOnInit(): void {
    this.translate.setDefaultLang(this._translation.getLanguage());
    this.isLoading = false;
  }

    togglePassword(number:number) {
    if(number==1){
      this.showPassword = !this.showPassword;
    }else{
      this.showRepeatPassword = !this.showRepeatPassword;

    }
  }

  sendValidation(){
    if(!this.email || !this.password || !this.repeatPassword ){
      return true
    }else{
      if(this.password !== this.repeatPassword){
        return true
      }
      return false
    }
  }

  async registerNewUser(){

    this.isLoading = true;
    await this._authService.createuserWithEmailAndPassword(this.email, this.password)
    .then(async (userCredential) => {
      // Signed in
      const user = userCredential.user;
      await this._authService.updateNameProfile(this.userName)
        .then(async (message) =>{
          console.log("message actualizar nombre = ", message)
          await this._authService.sendEmailVerificacion()
          .then((message) =>{
            console.log("message al enviar correo de confirmación", message)
            this._alert.createAlert(this.translate.instant('alert.user_created_success'),(this.translate.instant('alert.user_created_success_text')));
            this.Error = "";
            this.isLoading= false;
            this.router.navigate(['/home'])
          })
        })
        .catch((error)=>{
          console.log("error al actualizar nombre", error)
        })
    })
    .catch((error) => {
      this.handleErrors(error.code)
    });













    // this.isLoading = true;
    // await this._auth.registerUser(this.email,this.password)
    // .then((async (data)=>{

    // }))

  }

  //GESTIÓN DE ERRORES
  handleErrors(error:string){
    console.log(error)
    // ..
    this.isLoading= false;
    if(error === "auth/invalid-email"){
      this.Error = this.translate.instant('error.email_no_valid');
    }else if(error === "auth/network-request-failed"){
      this.Error = this.translate.instant('error.no_network');
    }else if(error === "auth/weak-password"){
      this.Error = this.translate.instant('error.password_should_be_6')
      console.log(this.Error)

    }else if(error === "auth/email-already-in-use"){
      this.Error = this.translate.instant('error.email_is_in_use')
    }else{
      this.Error = error;
    }
    console.log(this.Error)
  }



  async signInWithGoogle(){}

}
