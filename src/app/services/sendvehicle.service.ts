import { Vehicle } from './../models/vehicles.model';
import { Injectable, Injector } from '@angular/core';
import { SessionService } from './session.service';
import { SendVehicleData } from '../models/sendvehicle.model';
import { Share } from '@capacitor/share';
import { CryptoService } from './crypto.services';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { LocalNotificationSchema } from '@capacitor/local-notifications';
import { Event } from '../models/event.model';
import { DateService } from './date.service';
import { NotificationsService } from './notifications.service';
import { StorageService } from './storage.service';
import { storageConstants } from '../const/storage';
import { HashService } from './hash.service';
import { CalendarService } from './calendar.service';
import { AlertService } from './alert.service';
import { TranslateService } from '@ngx-translate/core';
import { LoaderService } from './loader.service';
import { Backup } from '../models/backup.model';
import { DataService } from './data.service';
import { DriveService } from './drive.service';
import {NavController} from '@ionic/angular/standalone';
import { FileSystemService } from './filesystem.service';

@Injectable({
  providedIn:'root'
})


export class SendVehicleService{

  private vehiclesArray:Vehicle[]=[]
  private _session: SessionService | undefined;

  constructor(
    private _crypto:CryptoService,
    private _date:DateService,
    private _notifications:NotificationsService,
    private _storage:StorageService,
    private _hash:HashService,
    private _calendar:CalendarService,
    private _alert:AlertService,
    private translate:TranslateService,
    private _loader:LoaderService,
    private _data:DataService,
    private injector: Injector,
    private _drive:DriveService,
    private navCtr:NavController,
    private _file:FileSystemService
  ){}

  private get SessionService(): SessionService {
    if (!this._session) {
      this._session = this.injector.get(SessionService);
    }
    return this._session;
  }

  async SendVehicle(vehicleId:string){

    const allVehicles = await this.SessionService.loadVehicles();
    const correctVehicle = allVehicles.find(v => v.id === vehicleId);

    if (correctVehicle){
      const data:SendVehicleData = await this.setData(correctVehicle);
      const cryptedData:string = this._crypto.encryptMessage(JSON.stringify(data),true);
      await this.share(cryptedData, correctVehicle);
    }else{
      throw "vehicle not found";
    }
  }

  private async setData(vehicle:Vehicle){

    const allEvents = await this.SessionService.loadEvents();
    const vehicleEvents = allEvents.filter(e => e.vehicleId === vehicle.id)

    const data:SendVehicleData = {
      vehicle: vehicle,
      events: vehicleEvents
    }

    return data;
  }

  private async share(data: string, vehicle:Vehicle) {
    const filename = vehicle.brandOrModel+'.vcc';
    const path = `vehicles-control/${filename}`;

    try {
      // Crear el archivo temporal
      const file = await Filesystem.writeFile({
        path: path,
        data: data,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
        recursive:true
      });

      const isPossible = await Share.canShare();
      if (isPossible) {
        await Share.share({
          title: filename,
          url: file.uri,
          dialogTitle: filename,
        });

        // Eliminar el archivo después de compartir
        await Filesystem.deleteFile({
          path: path,
          directory: Directory.Data,
        });
      }
    } catch (error) {
      console.error('Error sharing vehicle data:', error);

    }
  }

  //RECIBIR DATOS
  async addData(url:string){

    await this.readFile(url)
    .then((data)=>{
      if(data && data.vehicles){
        this.processBackupData(data);
      }else if(data && data.vehicle){
        this.preReceiveVehicle(data);
      }else{
        this._alert.createAlert(this.translate.instant('send.invalid_file'), this.translate.instant('send.invalid_file_text')  )
      }
    })
    .catch((err:any)=>{
      console.log("error al decodificar datos",err);
      this._alert.createAlert(this.translate.instant('send.invalid_file'), this.translate.instant('send.invalid_file_text'));
    })
  }

  private async processBackupData(data:Backup){
    const correctUser = await this._file.itsForThisUser(data);
    if(data && data.vehicles && correctUser){
      console.log(data, data.vehicles);
      const want = await this._alert.twoOptionsAlert(this.translate.instant('alert.are_you_sure?'),this.translate.instant('alert.actual_data_will_be_rewrite'),this.translate.instant('alert.accept'),this.translate.instant('alert.cancel'));
      if(want){
        try{
          await this._loader.presentLoader();
          await this.restoreData(data);
          await this.refreshData();
          await this._loader.dismissLoader();
        }catch(err:any){
          this._alert.createAlert(this.translate.instant('send.invalid_file'), this.translate.instant('send.invalid_file_text')+" - "+err);
        }
      }
    }
  }

  async preReceiveVehicle(data:SendVehicleData){
    const want = await this._alert.twoOptionsAlert(this.translate.instant('send.do_you_want_to_save_vehicle'), data.vehicle.brandOrModel + " " +this.translate.instant('send.do_you_want_to_save_vehicle_text'),this.translate.instant('alert.accept'),this.translate.instant('alert.cancel'));
    if(want){
      const exist = await this.exitsThisVehicle(data.vehicle);
      if(exist){
        const sure = await this._alert.twoOptionsAlert(this.translate.instant('send.vehicle_already_exists'), data.vehicle.brandOrModel + " " +this.translate.instant('send.vehicle_already_exists_text'),this.translate.instant('alert.accept'),this.translate.instant('alert.cancel'));
        if(sure){
          this.processReceiveVehicle(data)
        }
      }else{
        this.processReceiveVehicle(data)
      }
    }
  }

  private async processReceiveVehicle(data:SendVehicleData){
    try{
      await this._loader.presentLoader();
      data.vehicle.userId = this.SessionService.currentUser.id;
      await this.addVehicle(data);
      await this.refreshData();
      await this._loader.dismissLoader();
    }catch(err:any){
      this._alert.createAlert(this.translate.instant('send.invalid_file'), this.translate.instant('send.invalid_file_text')+" - "+err);
    }
  }

  private async exitsThisVehicle(vehicle:Vehicle){
    this.vehiclesArray = await this.SessionService.loadVehicles();
    return this.vehiclesArray.some(v=>v.id===vehicle.id);
  }

  private async refreshData(){
    this._drive.changeDownloading("refresh");
    this._drive.changeDownloading("false");
    this.navCtr.navigateRoot(['/dashboard'], { queryParams: { reload: true } });
    return
  }

  private async readFile(url:string){
    let decrypt;
    const read = await Filesystem.readFile({
      path: url,
      encoding: Encoding.UTF8
    })
    try{
      decrypt = JSON.parse(this._crypto.decryptMessage(read.data.toString(),true));
    }catch{
      decrypt = JSON.parse(this._crypto.decryptMessage(read.data.toString()));
    }
    return decrypt;
  }

  private async addVehicle(data:SendVehicleData):Promise<void>{
    try{
      await this.SessionService.insertVehicle(data.vehicle);
      await this.SessionService.insertEvents(data.events);
      await this._notifications.setNotifications(data.events);
    }catch(err:any){
      console.log("error al añadir el vehículo",err);
      this._alert.createAlert(this.translate.instant('send.error_adding_vehicle'),err);
    }
  }

  async restoreData(data:Backup):Promise<void>{
    try{
      await this._data.restoreDeviceData(data);
      await this._notifications.setNotifications(data.events);
    }catch(err:any){
      console.log("error al restaurar backup",err);
      this._alert.createAlert(this.translate.instant('send.error_restoring_backup'),err);
    }
  }

}
