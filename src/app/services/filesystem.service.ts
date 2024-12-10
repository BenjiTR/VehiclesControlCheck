import {Injectable } from '@angular/core';
import { Filesystem, Directory, Encoding, WriteFileResult, ReadFileResult, ReaddirResult } from '@capacitor/filesystem';
import { Backup } from '../models/backup.model';
import { SessionService } from './session.service';
import { StorageService } from './storage.service';
import { NotificationsService } from './notifications.service';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { TranslateService } from '@ngx-translate/core';
import { DateService } from './date.service';
import { DataService } from './data.service';
import { CryptoService } from './crypto.services';
import { Share } from '@capacitor/share';

@Injectable({
  providedIn:'root'
})

export class FileSystemService{


  constructor(
    private _session:SessionService,
    private _storage:StorageService,
    private _notifications:NotificationsService,
    private translate:TranslateService,
    private _date:DateService,
    private _data:DataService,
    private _crypto:CryptoService
  ){
  }

  async checkPermission():Promise<string>{
    const perm = await Filesystem.checkPermissions();
    if (perm.publicStorage === "granted"){
      return perm.publicStorage;
    }else{
      const request = await Filesystem.requestPermissions();
      return request.publicStorage;
    }
  }

  async createBackupFile():Promise<WriteFileResult>{
    return await Filesystem.writeFile({
      path: "vehicles-control/"+this._session.currentUser.id +'.vcc',
      data: await this._data.buildDeviceData(),
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
      recursive:true
    })
  }


  async restoreBackup(): Promise<Backup | void> {
    try {
      const result = await FilePicker.pickFiles({
        types: ['application/octet-stream'],
        limit: 1
      });

      if (result.files) {
        const file = result.files[0];

        // Verifica la extensión del archivo
        if (file.name.endsWith('.vcc') && file.path) {
          // Lee el contenido del archivo
          const readFile = await Filesystem.readFile({
            path: file.path,
            encoding: Encoding.UTF8
          });

          const data = JSON.parse(this._crypto.decryptMessage(readFile.data.toString()));
          const correctUser = await this.itsForThisUser(data);

          if (!correctUser) {
            throw new Error('Usuario incorrecto');
          }

          await this._data.restoreDeviceData(data);
          //console.log("datos", data);
          return data; // Este return ahora se propagará correctamente.
        } else {
          throw new Error('Archivo no válido');
        }
      }
    } catch (e) {
      console.error('Error al leer el archivo:', e);
      throw e;
    }
  }



  async itsForThisUser(data:Backup):Promise<boolean>{
    return data.vehicles.some(vehicle => vehicle.userId === this._session.currentUser.id);
  }


  async exportToCSV(csvContent:any) {
    //console.log(csvContent)
      return await Filesystem.writeFile({
        path:"vehicles-control/"+this._session.currentUser.id +'.csv',
        data: csvContent,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
        recursive:true
      });
    }


    //IMAGENES
    public async shareImg(data: string, fileName:string):Promise<void> {
      const path = `vehicles-control/${fileName}`;

      try {
        const file = await Filesystem.writeFile({
          path: path,
          data: data,
          directory: Directory.Documents,
          recursive:true
        });

        const isPossible = await Share.canShare();
        if (isPossible) {
          await Share.share({
            title: fileName,
            url: file.uri,
            dialogTitle: fileName,
          });

          // Eliminar el archivo después de compartir
          await Filesystem.deleteFile({
            path: path,
            directory: Directory.Documents,
          });
        }
        return;
      } catch (error) {
        console.error('Error sharing vehicle data:', error);
        throw error
      }
    }

    async downloadImg(data: string, fileName:string) {
      let fileExists:ReaddirResult |undefined;
      const directoryPath = 'vehicles-control/img/';

      await Filesystem.readdir({
        path: directoryPath,
        directory: Directory.Documents
      })
      .then((data)=>{
        fileExists = data;
      })
      .catch((err:any)=>{
        console.log( err)
      })

      try {

        const path = `${directoryPath}${fileName}`;

        // Escribir el archivo con el nombre generado
        await Filesystem.writeFile({
          path: path,
          data: data,
          directory: Directory.Documents,
          recursive: true
        });

        return;
      } catch (error) {
        console.error('Error saving vehicle image:', error);
        throw error;
      }
    }


}
