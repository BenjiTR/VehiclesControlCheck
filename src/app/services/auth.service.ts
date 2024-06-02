import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Injectable } from "@angular/core";
import { TranslationConfigService } from '../services/translation.service';


@Injectable({
    providedIn:"root"
})


export class AuthService{

    public auth:any = getAuth();

  constructor(
    private _translation: TranslationConfigService
  ){
    this.auth.languageCode = this._translation.getLanguage();
  }

//LOGIN CON EMAIL Y PASSWORD
loginWithEmailAndPaswword(email:string, password:string){
  return signInWithEmailAndPassword(this.auth, email, password);
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

