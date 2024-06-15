import { Injectable } from "@angular/core";
import { SessionService } from "./session.service";
import { Vehicle } from "../models/vehicles.model";
import { Event } from "../models/event.model";
@Injectable({
  providedIn: "root"
})


export class HashService {

  public vehicles:Vehicle[] = [];
  public events:Event[] = [];

  constructor(
    private _session:SessionService
  ){}




  public async generateVehiclePhrase(): Promise<string> {
    this.vehicles = await this._session.vehiclesArray;

    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const caracteresLongitud = caracteres.length;

    let resultado = 'V';
    let hashExists = true;

    while (hashExists) {
      resultado = 'V';  // Reset the hash to start with 'V' again
      for (let i = 0; i < 4; i++) {
        resultado += caracteres.charAt(Math.floor(Math.random() * caracteresLongitud));
      }

      // Check if the generated hash exists in any vehicle's id
      hashExists = this.vehicles.some(vehicle => vehicle.id === resultado);
    }

    return resultado;
  }



}
