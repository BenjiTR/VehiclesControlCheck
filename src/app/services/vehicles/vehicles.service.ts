import { StorageService } from 'src/app/services/storage.service';
import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Vehicle } from "src/app/models/vehicles.model";
import { AlertService } from "../alert.service";
import { SessionService } from "../session.service";
import { storageConstants } from 'src/app/const/storage';
import { CryptoService } from '../crypto.services';
import { EventsService } from '../events/events.service';
import { DriveService } from '../drive.service';
import { SyncService } from '../sync.service';

@Injectable({
  providedIn: "root"
})

export class VehiclesService{

  constructor(
    private translate:TranslateService,
    private _alert:AlertService,
    private _session:SessionService,
    private _storage:StorageService,
    private _crypto:CryptoService,
    private _events:EventsService,
    private _drive:DriveService,
    private _sync:SyncService
  ){

  }



    //ELIMINAR UN VEHÍCULO
    async deleteVehicle(vehicle: Vehicle, vehiclesArray:Vehicle[], noAsk?:boolean):Promise<void> {
      let sure;

      if(!noAsk){
        sure = await this._alert.twoOptionsAlert(
          this.translate.instant('alert.are_you_sure?'),
          this.translate.instant('alert.vehicle_permanently_erased'),
          this.translate.instant('alert.erase'),
          this.translate.instant('alert.cancel')
        );
      }else{
        sure = true;
      }

      if (sure) {
        const index = vehiclesArray.indexOf(vehicle);
        if (index > -1) {
          vehiclesArray.splice(index, 1);
          this._session.vehiclesArray = vehiclesArray;
          await this._storage.setStorageItem(storageConstants.USER_VEHICLES + this._session.currentUser.id, this._crypto.encryptMessage(JSON.stringify(vehiclesArray)));

          const elements = await this._events.GetElementsToClean(vehicle);
          console.log("elementos: ",elements)
          await this._events.deleteLocalElements(vehicle);

          if (this._drive.folderId && this._session.autoBackup) {
            this._storage.setStorageItem(storageConstants.USER_OPS+this._session.currentUser.id,true)
            const id = await this._drive.findFileByName(vehicle.id);
            if (id) {
              await this._drive.deleteFile(id, true);
              await this._sync.deleteFileInList(vehicle.id);
            }
            //Borra todos los eventos y recordatorios asociados
            this.deleteList(elements);
          }
        }
      }
      return;
    }

  async deleteList(elements: any[]):Promise<void> {
    this._drive.changecleaning(true);

    for (const element of elements) {
      const id = await this._drive.findFileByName(element);
      if (id) {
        await this._drive.deleteFile(id);
        this._sync.deleteFileInList(element);
      }
    }
    this._storage.setStorageItem(storageConstants.USER_OPS+this._session.currentUser.id,false)
    this._drive.changecleaning(false);
    return;
  }

}
