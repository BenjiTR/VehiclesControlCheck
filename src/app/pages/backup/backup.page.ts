import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCol, IonButton, IonRow, IonIcon, IonLabel, IonItem, IonCardContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, NavController, Platform, IonItemDivider, IonPopover } from '@ionic/angular/standalone';
import { FileSystemService } from 'src/app/services/filesystem.service';
import { StorageService } from 'src/app/services/storage.service';
import { storageConstants } from 'src/app/const/storage';
import { SessionService } from 'src/app/services/session.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { LocalNotificationSchema } from '@capacitor/local-notifications';
import { AuthService } from 'src/app/services/auth.service';
import { DriveService } from 'src/app/services/drive.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslationConfigService } from '../../services/translation.service';
import { Router, RouterModule } from '@angular/router';
import { Network } from '@capacitor/network';
import { AlertService } from 'src/app/services/alert.service';
import { LoaderService } from 'src/app/services/loader.service';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'app-backup',
  templateUrl: './backup.page.html',
  styleUrls: ['./backup.page.scss'],
  standalone: true,
  imports: [IonPopover, IonItemDivider, RouterModule, IonCardSubtitle, IonCardTitle, IonCardHeader, IonCard, IonCardContent, IonItem, IonLabel, IonIcon, TranslateModule, IonRow, IonButton, IonCol, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class BackupPage implements OnInit {

  public token:string = "";
  public connected:boolean = false;
  public haveFiles:boolean = true;
  public creatingFile:boolean = false;

  constructor(
    private _file:FileSystemService,
    private _storage:StorageService,
    private _session:SessionService,
    private _notifications:NotificationsService,
    private _auth:AuthService,
    private _drive:DriveService,
    private translate:TranslateService,
    private _translation:TranslationConfigService,
    private _platform:Platform,
    private navCtr:NavController,
    private _alert:AlertService,
    private _loader:LoaderService
  ) { }

  async ngOnInit() {
    this.translate.setDefaultLang(this._translation.getLanguage());
    this.getData();
  }

  ionViewWillLeave() {
    console.log("sale backup")
  }

  async getData(){
    this.connected = await firstValueFrom(this._drive.conected$);
    this.haveFiles = await firstValueFrom(this._drive.haveFiles$);
  }


  async connectAccount(){
    await this._loader.presentLoader();
    await this._drive.connectAccount();
    this.getData();
    await this._loader.dismissLoader();

  }


  //DISPOSITIVO
  async saveDataOnDevice(){
    this.creatingFile = true;
    await this._file.createBackupFile()
    .then(async()=>{
      this.creatingFile = false;
      await this._alert.createAlert(this.translate.instant('alert.file_created'),this.translate.instant('alert.file_created_text'));
    })
    .catch((err)=>{
      console.log(err);
      this.creatingFile = false;
      if(err.message && err.message === "FILE_NOTCREATED"){
        this._alert.createAlert(this.translate.instant("error.file_notcreated"), this.translate.instant("error.file_notcreated_text"))
      }else{
        alert(err.message);
      }
    })
  }

  async restoreByDevice(){
    const sure = await this._alert.twoOptionsAlert(this.translate.instant('alert.are_you_sure?'),this.translate.instant('alert.actual_data_will_be_rewrite'),this.translate.instant('alert.accept'),this.translate.instant('alert.cancel'))
    if(sure){
      this.creatingFile = true;
      await this._file.restoreBackup()
      .then(()=>{
        this.creatingFile = false;
        this._alert.createAlert(this.translate.instant('alert.file_restored'),this.translate.instant('alert.file_restored_text'));
        this.navCtr.navigateRoot(['/dashboard'], { queryParams: { reload: true } });
      })
      .catch((err)=>{
        this.creatingFile = false;
        console.log(err)
        if(err.message &&err.message === "Archivo no válido"){
          this._alert.createAlert(this.translate.instant('error.invalid_file'),this.translate.instant('error.invalid_file_text'));
        }else if(err.message &&err.message === "Usuario incorrecto"){
          this._alert.createAlert(this.translate.instant('error.incorrect_user'),this.translate.instant('error.incorrect_user_text'));
        }else if(err.message !== "pickFiles canceled."){
          alert(err.message);
        }
      })
    }
  }



//DRIVE
  async updateData(){
    await this._loader.presentLoader();
    //await this._drive.updateData();
    await this._loader.dismissLoader();

  }

  async uploadFile():Promise<void> {
    if(this.token && (await Network.getStatus()).connected === false){
      this._alert.createAlert(this.translate.instant("error.no_network"),"");
    }else{
       await this._loader.presentLoader();

      const data = await this._file.buildData();
      console.log(data, this._session.currentUser.id)
      // Subir el contenido del archivo a Google Drive
      // await this._drive.uploadFile(data, `${this._session.currentUser.id}.vcc`,this.token)
      // .then((msg)=>{
      //   console.log(msg);
      //   this._drive.changeHaveFiles(true);

      // })
      // .catch((err)=>{
      //   console.log(err)
      //   if(err.error){
      //     alert(err.error);
      //   }
      // })
      await this._loader.dismissLoader();

    }
  }

  unconnectAccount(){
    this._session.setGoogleToken("");
    this._drive.changeConnected(false);
    this._drive.changeHaveFiles(false);
    this.getData();
    this._auth.signOutGoogle();
  }



  async uploadSampleFile(): Promise<void> {
    const file:any = {
      fileName: 'prueba.vcc',
      content: JSON.stringify([1, 2, 3, 4, 5,6,7,8,9,10]) // Contenido de prueba
    };
      try {
        const response = await this._drive.updateFile("1EYHvlvBC8ig49WgiSP1TBUO5NjtEGJrF4pKSDdGvOh-nSu1dIg", file.content, file.fileName);
        const responsefileId = response.id; // Guardar el ID del archivo subido
        console.log('Archivo subido exitosamente:', response);
      } catch (error) {
        console.error('Error al subir el archivo:', error);
      }
  }




  async readFileFromDrive() {
    try {
      // Primero, encuentra el archivo por su nombre
      const file = await this._drive.findFileByName('prueba.vcc',);

      if (!file) {
        console.log('El archivo no fue encontrado.');
        return;
      }
      console.log(file)
      // Luego, descarga el contenido del archivo usando su fileId
      const content = await this._drive.downloadFile(file);

      //console.log('Contenido del archivo:', content);
    } catch (error) {
      console.error('Error al leer el archivo desde Drive:', error);
    }




    //  await this._loader.presentLoader();

    // const fileId = await this._drive.findFileByName(`${this._session.currentUser.id}.vcc`, this.token)
    // if (fileId) {
    //   const result = await this._drive.downloadFile(fileId, this.token);
    //   console.log(result)
    //   if(result){
    //     const resp = JSON.parse(result)
    //     await this._storage.setStorageItem(storageConstants.USER_VEHICLES+this._session.currentUser.id,resp.vehicles)
    //     console.log(resp.vehicles)
    //     await this._storage.setStorageItem(storageConstants.USER_EVENTS+this._session.currentUser.id,resp.events);
    //     await this._storage.setStorageItem(storageConstants.USER_REMINDER+this._session.currentUser.id,resp.remindersOptions);
    //     const preparedReminders = await this.setDates(resp.reminders);
    //     console.log(preparedReminders)
    //     if(this._platform.is("android")){
    //       await this._notifications.createNotification(preparedReminders);
    //     }
    //     this.navCtr.navigateRoot('/dashboard');
    //   }
    // } else {
    //   console.log(`File with name '${`${this._session.currentUser.id}.vcc`}' not found.`);
    //   await this._loader.dismissLoader();

    // }
  }


  async createFolder(){
    const resp = await this._drive.createFolder();
    console.log(resp)
  }

  async readAll(){
    const resp = await this._drive.listFilesInFolder();
    console.log(resp)
  }

  async deleteFile(){
    await this._drive.deleteFile("1EYHvlvBC8ig49WgiSP1TBUO5NjtEGJrF4pKSDdGvOh-nSu1dIg")
  }


  async setDates(reminders:LocalNotificationSchema[]):Promise<LocalNotificationSchema[]>{
    reminders.forEach(element => {
      element.schedule!.at! = new Date(element.schedule!.at!)
    });
    return reminders;
  }



}


