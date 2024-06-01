import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification, } from "firebase/auth";
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


loginWithEmailAndPaswword(email:string, password:string){
  return signInWithEmailAndPassword(this.auth, email, password);
}
sendRestorePasswordEmail(email:string){
  return sendPasswordResetEmail(this.auth, email)
}
sendEmailVerificacion(){
  return sendEmailVerification(this.auth.currentUser);
}

}

