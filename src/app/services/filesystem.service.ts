import {Injectable } from '@angular/core';
import { Filesystem, Directory, Encoding, WriteFileResult, ReadFileResult } from '@capacitor/filesystem';
import { Backup } from '../models/backup.model';
import { SessionService } from './session.service';

@Injectable({
  providedIn:'root'
})

export class FileSystemService{


  constructor(
    private _session:SessionService
  ){
  }

  async checkPermission():Promise<string>{
    const perm = await Filesystem.checkPermissions();
    if (perm.publicStorage === "granted"){
      console.log("permiso de escritura concedido");
      return perm.publicStorage;
    }else{
      const request = await Filesystem.requestPermissions();
      return request.publicStorage;
    }
  }

  async createBackupFile():Promise<WriteFileResult>{
    return await Filesystem.writeFile({
      path: this._session.currentUser.id +'.vcc',
      data: await this.buildData(),
      directory: Directory.Documents,
      encoding: Encoding.UTF8
    })
  }

  async buildData():Promise<string>{
    const backup:Backup = {
      vehicles: await this._session.loadVehicles(),
      events: await this._session.loadEvents(),
      reminders: await this._session.loadReminders(),
      remindersOptions: await this._session.getReminderNotifications()
    }
    console.log(backup ,JSON.stringify(backup))
    return JSON.stringify(backup);
  }


  async readBackupFile():Promise<Backup>{
    const backup = await Filesystem.readFile({
      path: this._session.currentUser.id+'.vcc',
      directory: Directory.Documents,
      encoding: Encoding.UTF8
    })
    return JSON.parse(backup.data.toString())
  }




}
