import { Vehicle } from './../models/vehicles.model';
import { Injectable } from '@angular/core';
import { SessionService } from './session.service';
import { SendVehicleData } from '../models/sendvehicle.model';
import { share } from 'rxjs';
import { Share } from '@capacitor/share';
import { CryptoService } from './crypto.services';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';


@Injectable({
  providedIn:'root'
})


export class SendVehicleService{

  constructor(
    private _session:SessionService,
    private _crypto:CryptoService
  ){}

  async SendVehicle(vehicleId:string){

    const allVehicles = await this._session.loadVehicles();
    const correctVehicle = allVehicles.find(v => v.id === vehicleId);

    if (correctVehicle){
      const data:SendVehicleData = await this.setData(correctVehicle);
      const cryptedData:string = this._crypto.encryptMessage(JSON.stringify(data));
      await this.share(cryptedData, correctVehicle);
    }else{
      throw "vehicle not found";
    }


  }

  async setData(vehicle:Vehicle){

    const allEvents = await this._session.loadEvents();
    const vehicleEvents = allEvents.filter(e => e.vehicleId === vehicle.id)

    const data:SendVehicleData = {
      vehicle: vehicle,
      events: vehicleEvents
    }

    return data;
  }



  async share(data: string, vehicle:Vehicle) {
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

}
