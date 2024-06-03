import { signInWithCredential, GoogleAuthProvider, getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Injectable } from "@angular/core";
import { TranslationConfigService } from '../services/translation.service';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Platform } from "@ionic/angular";


@Injectable({
    providedIn:"root"
})


export class AuthService{

    public auth:any = getAuth();

  constructor(
    private _translation: TranslationConfigService,
    private platform:Platform
  ){
    this.auth.languageCode = this._translation.getLanguage();
    this.initializeApp();
  }


  initializeApp() {
    this.platform.ready().then(() => {
      GoogleAuth.initialize({ grantOfflineAccess: true })

    });
  }


//LOGIN CON EMAIL Y PASSWORD
loginWithEmailAndPaswword(email:string, password:string){
  return signInWithEmailAndPassword(this.auth, email, password);
}

//LOGIN CON GOOGLE
async loginWithGoogle(){
  return GoogleAuth.signIn();

}

//RESTAURAR EL PASSWORD
sendRestorePasswordEmail(email:string){
  return sendPasswordResetEmail(this.auth, email)
}

//ENVIAR EMAIL DE VERIFICACIÓN
sendEmailVerificacion(){
  console.log("user", this.auth.currentUser)
  return sendEmailVerification(this.auth.currentUser);
}

//CREAR USUARIO
createuserWithEmailAndPassword(email:string, password:string){
  return createUserWithEmailAndPassword(this.auth, email, password)
}

//CAMBIAR NOMBRE DE USUARIO
updateNameProfile(userName:string){
  return updateProfile(this.auth.currentUser, {displayName: userName})
}







}

