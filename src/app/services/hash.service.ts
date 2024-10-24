import { Injectable, Injector } from "@angular/core";
import { SessionService } from "./session.service";
import { Vehicle } from "../models/vehicles.model";
import { Event } from "../models/event.model";


@Injectable({
  providedIn: "root"
})


export class HashService {

  public vehicles:Vehicle[] = [];
  public events:Event[] = [];
  private _session: SessionService | undefined;

  constructor(
    private injector: Injector
  ){}


  private get SessionService(): SessionService {
    if (!this._session) {
      this._session = this.injector.get(SessionService);
    }
    return this._session;
  }

  public async generateVehiclePhrase(): Promise<string> {
    this.vehicles = await this.SessionService.vehiclesArray;

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

  public async generateEventPhrase(): Promise<string> {
    this.vehicles = await this.SessionService.vehiclesArray;

    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const caracteresLongitud = caracteres.length;

    let resultado = 'E';
    let hashExists = true;

    while (hashExists) {
      resultado = 'E';  // Reset the hash to start with 'V' again
      for (let i = 0; i < 8; i++) {
        resultado += caracteres.charAt(Math.floor(Math.random() * caracteresLongitud));
      }

      // Check if the generated hash exists in any vehicle's id
      hashExists = this.vehicles.some(vehicle => vehicle.id === resultado);
    }

    return resultado;
  }

  public async generateCalendarPhrase(): Promise<string> {
    this.vehicles = await this.SessionService.vehiclesArray;

    const caracteres = 'abcdefghijklmnopqrstuv0123456789';
    const caracteresLongitud = caracteres.length;

    let resultado = 'c';
    let hashExists = true;

    while (hashExists) {
      resultado = 'c';  // Reset the hash to start with 'V' again
      for (let i = 0; i < 8; i++) {
        resultado += caracteres.charAt(Math.floor(Math.random() * caracteresLongitud));
      }

      // Check if the generated hash exists in any vehicle's id
      hashExists = this.vehicles.some(vehicle => vehicle.id === resultado);
    }
    //console.log(resultado)
    return resultado;
  }

  public async generateSyncPhrase(): Promise<string> {
    this.vehicles = await this.SessionService.vehiclesArray;

    const caracteres = 'abcdefghijklmnopqrstuv0123456789';
    const caracteresLongitud = caracteres.length;

    let resultado = '';
    let hashExists = true;

    while (hashExists) {
      resultado = '';
      for (let i = 0; i < 8; i++) {
        resultado += caracteres.charAt(Math.floor(Math.random() * caracteresLongitud));
      }

      // Check if the generated hash exists in any vehicle's id
      hashExists = this.vehicles.some(vehicle => vehicle.id === resultado);
    }
    //console.log(resultado)
    return resultado;
  }




}
