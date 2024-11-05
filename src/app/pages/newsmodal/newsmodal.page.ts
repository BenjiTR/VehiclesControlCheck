import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCol, IonLabel, IonRow, IonImg, IonButton, IonCheckbox, ModalController, IonIcon, IonFooter } from '@ionic/angular/standalone';
import { storageConstants } from 'src/app/const/storage';
import { environment } from 'src/environments/environment.prod';
import { SessionService } from 'src/app/services/session.service';
import { AlertService } from 'src/app/services/alert.service';
import { Network } from '@capacitor/network';
import { DriveService } from 'src/app/services/drive.service';
import { StorageService } from 'src/app/services/storage.service';
import { DataService } from 'src/app/services/data.service';
import { SyncService } from 'src/app/services/sync.service';
import { Subscription } from 'rxjs';
import { CalendarService } from 'src/app/services/calendar.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-newsmodal',
  templateUrl: './newsmodal.page.html',
  styleUrls: ['./newsmodal.page.scss'],
  standalone: true,
  imports: [IonFooter, TranslateModule, IonIcon, IonCheckbox, IonButton, IonImg, IonRow, IonLabel, IonCol, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class NewsPage {

  public element:number = 1;
  public max:number = 6;
  public understand:boolean = false;
  public token:string = "";
  public connected:boolean = false;
  public haveFiles:boolean = false;
  public creatingFile:boolean = false;
  public downloading:string = "false";

  private downloadingSubscription: Subscription;
  private haveFileSubscription:Subscription;
  private creatingFileSubscription: Subscription;
  private connectedSubscription: Subscription;

  constructor(
    private mController:ModalController,
    private _session:SessionService,
    private _alert:AlertService,
    private translate:TranslateService,
    private _drive:DriveService,
    private _storage:StorageService,
    private _data:DataService,
    private _sync:SyncService,
    private _calendar:CalendarService,
    private _loader:LoaderService,
  ) {
    this.downloadingSubscription = this._drive.downloading$.subscribe(data=>{
      this.downloading = data;
    });
    this.haveFileSubscription = this._drive.haveFiles$.subscribe(data=>{
      this.haveFiles=data;
    });
    this.creatingFileSubscription = this._drive.creatingFile$.subscribe(data=>{
      this.creatingFile=data;
    });
    this.connectedSubscription = this._drive.conected$.subscribe(async data=>{
      this.connected = data;
      const suggestions = localStorage.getItem(storageConstants.SUGGESTIONS+this._session.currentUser.id);
      const id = await this._calendar.findVehicleControlCalendar();
      if(this.connected && !id && suggestions !== 'false'){
        const sure = await this._alert.twoOptionsAlert(this.translate.instant('alert.do_you_want_connect_calendar'),this.translate.instant('alert.do_you_want_connect_calendar_text'),this.translate.instant('alert.accept'),this.translate.instant('alert.cancel'))
        if(sure){
          await this._loader.presentLoader();
          try{
            await this._calendar.connectCalendar();
          }catch(err:any){
            throw err;
          }
          await this._loader.dismissLoader();
        }
      }
      if(this.connected && !this.haveFiles && suggestions !== 'false'){
        const sure = await this._alert.twoOptionsAlert(this.translate.instant('alert.files_not_found'),this.translate.instant('alert.files_not_found_text'),this.translate.instant('alert.accept'),this.translate.instant('alert.cancel'))
        if(sure){
          this.uploadFiles();
        }
      }
      if(this.connected){
        localStorage.setItem(storageConstants.SUGGESTIONS+this._session.currentUser.id,'false');
      }
    })
  }



  next(){
    if(this.element<this.max)
    this.element++
  }

  previous(){
      this.element--
  }

  changeUnderstand(event:any){
    this.understand = event.detail.checked;
  }

  close(){
    if(this.understand){
      //console.log(storageConstants.NEWS_READED+this._session.currentUser.id);
      localStorage.setItem(storageConstants.NEWS_READED+this._session.currentUser.id, environment.versioncode);
    }
    this.mController.dismiss();
  }

  async uploadFiles():Promise<void> {
    if(this.token && (await Network.getStatus()).connected === false){
      this._alert.createAlert(this.translate.instant("error.no_network"),"");
    }else{
      this._drive.changeCreatingFile(true);
      this._storage.setStorageItem(storageConstants.USER_OPS+this._session.currentUser.id,true);

      const data = await this._data.buildDriveData();
      this._drive.changeProgress(0,0)
      this._drive.changeUploading(true);
      const total = data.length;
      const unit = 1/total;
      let value = 0;
      let buffer = 0;

      let synFileList:string[] = [];

      for(const element of data){
        try {
          buffer += unit;
          this._drive.changeProgress(value, buffer);
          const exist = await this._drive.findFileByName(element.fileName)
          if(exist){
            await this._drive.updateFile(exist, element.content, element.fileName);
          }else{
            await this._drive.uploadFile(element.content, element.fileName);
          }
          value += unit;
          this._drive.changeProgress(value, buffer);
          synFileList.push(element.fileName)
        } catch (err) {
          console.log("Ocurrió un error: ", err);
          break;
        }
      }
      this._sync.setSyncFile(synFileList);
      this._drive.changeCreatingFile(false);
      this._storage.setStorageItem(storageConstants.USER_OPS+this._session.currentUser.id,false)
      this._drive.changeHaveFiles(true);
      this._drive.changeUploading(false);
    }
  }

  async updateData(alternativeAks?:boolean){
    if(this.token && (await Network.getStatus()).connected === false){
      this._alert.createAlert(this.translate.instant("error.no_network"),"");
    }else{
      let title;
      let text;
      if(alternativeAks){
        title = this.translate.instant('alert.do_you_want?');
        text = this.translate.instant('alert.update_files_text');
      }else{
        title = this.translate.instant('alert.are_you_sure?');
        text = this.translate.instant('alert.update_files_text');
      }
      const sure = await this._alert.twoOptionsAlert(title,text,this.translate.instant('alert.accept'),this.translate.instant('alert.cancel'));
      if(sure){
        this.updateProcess();
      }
    }
  }

  async updateProcess(){
    this._drive.changeCreatingFile(true);
    this._storage.setStorageItem(storageConstants.USER_OPS+this._session.currentUser.id,true);
        await this.removeAllElements()
        .then(async()=>{
          await this.uploadFiles();
          this._drive.changeCreatingFile(false);
          this._storage.setStorageItem(storageConstants.USER_OPS+this._session.currentUser.id,false);
        })
        .catch((e)=>{
          console.log(e);
          this._drive.changeCreatingFile(false);
          this._alert.createAlert(this.translate.instant('error.error_cleaning'), this.translate.instant('error.error_cleaning_text'));
        })
  }

     //ELIMINAR TODOS LOS ELEMENTOS DE DRIVE
     async removeAllElements():Promise<void>{
      this._drive.changecleaning(true);
      const oldFiles = await this._drive.listFilesInFolder();
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
          throw new Error('Error al eliminar de Drive');
        }
      }
      this._drive.changecleaning(false);
      return;
    }


  async deleteFile(id:string){
    await this._drive.deleteFile(id);
  }

}
