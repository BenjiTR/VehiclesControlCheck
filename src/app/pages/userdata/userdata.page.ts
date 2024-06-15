import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonCol, IonRow, IonAvatar, IonItem, IonIcon, IonFab, IonFabButton, IonInput, IonImg } from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationConfigService } from '../../services/translation.service';
import { User } from 'src/app/models/user.model';
import { SessionService } from 'src/app/services/session.service';
import { PaddingService } from 'src/app/services/padding.service';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { CameraServices } from 'src/app/services/camera.service';
import { FileSystemService } from 'src/app/services/filesystem.service';
import { imageConstants } from 'src/app/const/img';
import { StorageService } from 'src/app/services/storage.service';
import { storageConstants } from 'src/app/const/storage';


@Component({
  selector: 'app-userdata',
  templateUrl: './userdata.page.html',
  styleUrls: ['./userdata.page.scss'],
  standalone: true,
  imports: [IonImg,  IonInput, TranslateModule, RouterModule, IonButton, IonFab, IonFabButton, IonIcon, IonItem, IonAvatar, IonRow, IonCol, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class UserdataPage implements OnInit {

  public user:User = new User;
  public isEditing:boolean=false;
  public isLoading=false;

  public img:any;

  constructor(
    private router:Router,
    private translate:TranslateService,
    private _translation:TranslationConfigService,
    private _session:SessionService,
    private _paddingService:PaddingService,
    private _authService:AuthService,
    private _alert:AlertService,
    private _camera:CameraServices,
    private _storage:StorageService
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang(this._translation.getLanguage());
    this.user = {...this._session.currentUser};
  }

  calculatePadding(){
    return this._paddingService.calculatePadding();
  }


  //CAMBIA EL ESTADO DE EDICIÓN
  isEditingToogle(){
    this.isEditing = !this.isEditing
  }

  cancelEditting(){
    this.isEditing=false;
    this.user = {...this._session.currentUser};
    //console.log(this.user)
  }

  async saveNewData(){
    this.isLoading = true;
    if(!this._authService.isInTest && this.user.method === "email"){
      await this._authService.updateNameProfile(this.user.name)
      .then((msg)=>{
        console.log(msg);
        this._session.currentUser.name = this.user.name;
        this.isEditing=false;
        this.isLoading = false;
      })
      .catch((err)=>{
        console.log(err);
      })
    }
    this._session.currentUser.name = this.user.name;
    this.isEditing=false;
    this.isLoading = false;
  }

  async changePassword(){
    this.isLoading=true;
    await this._authService.sendRestorePasswordEmail(this.user.email)
    .then(()=>{
      this._alert.createAlert(this.translate.instant('alert.email_send'),this.translate.instant('alert.restored_email_sended'));
      this.isLoading=false;
    })
    .catch((err)=>{
      console.log(err);
      this.isLoading=false;
    })
  }



  async changeUserImage(){
    const photo = await this._camera.takePhoto();
    if(photo){
      console.log(photo)
      this._session.currentUser.photo = imageConstants.base64Prefix + photo;
      this.user.photo = imageConstants.base64Prefix + photo;
      this._storage.setStorageItem(storageConstants.USER_PHOTO+this.user.id, photo);
    }
  }






}
