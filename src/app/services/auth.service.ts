import { Injectable } from "@angular/core";
import { Platform } from "@ionic/angular";
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { TranslationConfigService } from '../services/translation.service';
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";

@Injectable({
  providedIn: "root"
})
export class AuthService {

  public isActive: Boolean = false;
  public isInTest: Boolean = false;

  constructor(
    private _translation: TranslationConfigService,
    private platform: Platform,
  ) {
    FirebaseAuthentication.setLanguageCode({
      languageCode: this._translation.getLanguage()
    });
    this.initializeApp();
  }

  initializeApp() {
    // Initialize any platform-specific setups if needed
    this.platform.ready().then(() => {
      let clientId;
      if(this.platform.is('android')){
        clientId = '329432960985-0f0oj2qbh3gp0mbgr0k32hmi0b6gbi06.apps.googleusercontent.com'
      }else{
        clientId = '329432960985-97l9q80p1v5qb14lc5ef321jameit40s.apps.googleusercontent.com'
      }

      GoogleAuth.initialize({
        clientId:clientId,
        scopes: ['profile', 'email','https://www.googleapis.com/auth/drive.appdata'],
        grantOfflineAccess: true,
      });
    });
  }


  // LOGIN CON EMAIL Y PASSWORD
  async loginWithEmailAndPaswword(email: string, password: string): Promise<any> {
    const result = await FirebaseAuthentication.signInWithEmailAndPassword({
      email: email,
      password: password,
    });
    return result.user;
  }

  // BORRAR CUENTA
  async deleteAccountWithEmail() {
    await FirebaseAuthentication.deleteUser();
  }

  async deleteAccountWithGoogle() {
    const result = await FirebaseAuthentication.signInWithGoogle();
    return await FirebaseAuthentication.deleteUser();
  }

//LOGIN CON GOOGLE
async loginWithGoogle(){
  return GoogleAuth.signIn();
}

async refreshGoogle(){
  return GoogleAuth.refresh();
}

  // RESTAURAR EL PASSWORD
  async sendRestorePasswordEmail(email: string) {
    return FirebaseAuthentication.sendPasswordResetEmail({ email });
  }

  // ENVIAR EMAIL DE VERIFICACIÓN
  async sendEmailVerificacion() {
    const user = await FirebaseAuthentication.getCurrentUser();
    if (user) {
      return FirebaseAuthentication.sendEmailVerification();
    }
    throw new Error('No user is signed in.');
  }

  // CREAR USUARIO
  async createuserWithEmailAndPassword(email: string, password: string) {
    const result = await FirebaseAuthentication.createUserWithEmailAndPassword({
      email,
      password,
    });
    return result.user;
  }

  // CAMBIAR NOMBRE DE USUARIO
  async updateNameProfile(name: string) {
    const user = await FirebaseAuthentication.getCurrentUser();
    if (user) {
      return FirebaseAuthentication.updateProfile({ displayName: name });
    }
    throw new Error('No user is signed in.');
  }

  // OBSERVABLE DEL ESTADO DE USUARIO
  userState() {
    FirebaseAuthentication.addListener('authStateChange', (state) => {
      const user = state.user;
      if (user) {
        this.isActive = true;
      } else {
        this.isActive = false;
      }
    });
  }

  // CIERRE DE SESIÓN
  async signOut() {
    await FirebaseAuthentication.signOut();
  }

  //CIERRE DE SESIÓN GOOGLE
  async signOutGoogle(){
    return GoogleAuth.signOut();
  }

  // Método para obtener la información del usuario usando el token de acceso
  async fetchUserInfo(accessToken: string) {
    const userInfoEndpoint = 'https://www.googleapis.com/oauth2/v3/userinfo';

    try {
      const response = await fetch(userInfoEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Error fetching user info');
      }

      const userInfo = await response.json();
      return userInfo;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }
}
