import { signOut, onAuthStateChanged, getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Injectable } from "@angular/core";
import { TranslationConfigService } from '../services/translation.service';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Platform } from "@ionic/angular";


@Injectable({
    providedIn:"root"
})


export class AuthService{

    public auth:any = getAuth();
    public isActive:Boolean = false;
    public isInTest:Boolean = false;
  constructor(
    private _translation: TranslationConfigService,
    private platform:Platform
  ){
    this.auth.languageCode = this._translation.getLanguage();
    this.initializeApp();
    //console.log(this.isActive)

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
  //console.log("user", this.auth.currentUser)
  return sendEmailVerification(this.auth.currentUser);
}

//CREAR USUARIO
createuserWithEmailAndPassword(email:string, password:string){
  return createUserWithEmailAndPassword(this.auth, email, password)
}

//CAMBIAR NOMBRE DE USUARIO
updateNameProfile(name:string){
  return updateProfile(this.auth.currentUser, {displayName: name})
}

//OBSERVABLE DEL ESTADO DE USUARIO.
userState(){
  onAuthStateChanged(this.auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/auth.user

        const uid = user!.uid;

      this.isActive = true
      // console.log(this.isActive)
      // console.log(user)

      // ...
    } else {
      this.isActive = false;
      // console.log(this.isActive);
      // User is signed out
      // ...
    }
  });
}

//CIERRE DE SESIÓN
signOut(){
  return signOut(this.auth)
}







}

