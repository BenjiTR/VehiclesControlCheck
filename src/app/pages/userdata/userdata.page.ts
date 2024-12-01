import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar, IonCol, IonRow, IonAvatar, IonItem, IonIcon, IonFab, IonFabButton, IonInput, IonImg, NavController } from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationConfigService } from '../../services/translation.service';
import { User } from 'src/app/models/user.model';
import { SessionService } from 'src/app/services/session.service';
import { PaddingService } from 'src/app/services/padding.service';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { CameraServices } from 'src/app/services/camera.service';
import { imageConstants } from 'src/app/const/img';
import { StorageService } from 'src/app/services/storage.service';
import { storageConstants } from 'src/app/const/storage';
import { DriveService } from 'src/app/services/drive.service';
import { CryptoService } from 'src/app/services/crypto.services';
import { LoaderService } from 'src/app/services/loader.service';
import { SyncService } from 'src/app/services/sync.service';
import { HashService } from 'src/app/services/hash.service';
import { VehiclesService } from 'src/app/services/vehicles/vehicles.service';
import { Vehicle } from 'src/app/models/vehicles.model';


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
  public img:any;

  constructor(
    private navCtr:NavController,
    private translate:TranslateService,
    private _translation:TranslationConfigService,
    private _session:SessionService,
    private _paddingService:PaddingService,
    private _authService:AuthService,
    private _alert:AlertService,
    private _camera:CameraServices,
    private _storage:StorageService,
    private _drive:DriveService,
    private _crypto:CryptoService,
    private _loader:LoaderService,
    private _sync:SyncService,
    private _hash:HashService,
    private _vehicles:VehiclesService
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
  }

  async saveNewData(){
    await this._loader.presentLoader();
    if(!this._authService.isInTest && this.user.method === "email"){
      await this._authService.updateNameProfile(this.user.name)
      .then(async (msg)=>{
        //console.log(msg);
        this._session.currentUser.name = this.user.name;
        this.isEditing=false;
        await this._loader.dismissLoader();
      })
      .catch((err)=>{
        //console.log(err);
      })
    }
    this._session.currentUser.name = this.user.name;
    this.isEditing=false;
    await this._loader.dismissLoader();
  }

  async changePassword(){
    await this._loader.presentLoader();
    await this._authService.sendRestorePasswordEmail(this.user.email)
    .then(async ()=>{
      this._alert.createAlert(this.translate.instant('alert.email_send'),this.translate.instant('alert.restored_email_sended'));
      await this._loader.dismissLoader();
    })
    .catch(async (err)=>{
      //console.log(err);
      await this._loader.dismissLoader();
    })
  }



  async changeUserImage(){
   if(this.user.method==="email"){
    const photo = await this._camera.takePhoto();
    if(photo){
      await this._loader.presentLoader();
      //console.log(photo)
      this._session.currentUser.photo = imageConstants.base64Prefix + photo;
      this.user.photo = imageConstants.base64Prefix + photo;
      const encrypted = this._crypto.encryptMessage(photo)
      //console.log(photo, encrypted)
      this._storage.setStorageItem(storageConstants.USER_PHOTO+this.user.id, encrypted);
      this.saveInCloud(encrypted)
      await this._loader.dismissLoader();
    }
   }
  }

  async saveInCloud(photo:string){
    //console.log(this._drive.folderId, this._session.autoBackup)
    if(this._drive.folderId && this._session.autoBackup){
      const newSyncHash = await this._hash.generateSyncPhrase();
      const fileName = "photo";
      const DriveFileName = fileName+"-"+newSyncHash;
      const exist = await this._drive.findFileByName(fileName)
          if(exist){
            this._drive.updateFile(exist, photo, DriveFileName);
          }else{
            this._drive.uploadFile(photo, DriveFileName);
          }
      this._sync.updateSyncList(DriveFileName);
    }
  }

  async deleteAccountWithEmail(){

    try{
      await this._loader.presentLoader();
      await this.deleteData();
      //await this._authService.deleteAccountWithEmail()
      await this.removeAllElements();
      localStorage.setItem('autoInitVcc',"false");
      await this._loader.dismissLoader();
      await this._alert.createAlert(this.translate.instant('alert.user_delete'), this.translate.instant('alert.user_delete_with_exit'));
      this.navCtr.navigateRoot(['/home']);
    }catch(err:any){
      await this._loader.dismissLoader();
      console.log(err);
      this._alert.createAlert(this.translate.instant('error.an_error_ocurred'), err.message);
    }
  }

  async deleteAccount(){
    const sure = await this._alert.twoOptionsAlert(this.translate.instant('alert.are_you_sure?'),this.translate.instant('userpage.delete_user_text'),this.translate.instant('alert.accept'),this.translate.instant('alert.cancel'))
    if(sure){
      if(this._session.currentUser.method === 'email'){
        this.deleteAccountWithEmail()
      }
    }
  }

  async deleteData():Promise<void>{

    const vehiclesArray = this._session.vehiclesArray;

    for(let vehicle of vehiclesArray){
      await this._vehicles.deleteVehicle(vehicle, vehiclesArray, true)
    }

    return;
  }

  async removeAllElements():Promise<void>{

    this._drive.changecleaning(true);
    const oldFiles = await this._drive.listFilesInFolder();
    console.log(oldFiles)
    const total = oldFiles.length;
    const unit = 1/total;
    let value = 0;
    let buffer = 0;

    for(const element of oldFiles){

      buffer += unit;
      this._drive.changeProgress(value, buffer);
      try{
        await this.deleteFile(element.id);
        value += unit;
        this._drive.changeProgress(value, buffer);
      }catch (err){
        console.log(err);
        throw new Error('Error al eliminar de Drive '+ element.id);
      }
    }
    this._drive.changecleaning(false);
    return;
  }

  async deleteFile(id:string){
    await this._drive.deleteFile(id);
  }


}
