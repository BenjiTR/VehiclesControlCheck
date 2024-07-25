import { StorageService } from './storage.service';
import { Injectable } from '@angular/core';
import { SessionService } from './session.service';
import { Network } from '@capacitor/network';
import { AlertService } from './alert.service';
import { TranslateService } from '@ngx-translate/core';
import { TranslationConfigService } from './translation.service';
import { AuthService } from './auth.service';
import { FileSystemService } from './filesystem.service';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { backupConstants } from '../const/backup';
import { ToastService } from './toast.service';
import { DataService } from './data.service';
import { storageConstants } from '../const/storage';


@Injectable({
  providedIn: 'root'
})
export class DriveService {

  public token:string = "";
  public folderId: string = "";
  public noFinishedOperation:boolean=false;

  private connected = new BehaviorSubject<boolean>(false)
  public conected$ = this.connected.asObservable();
  private haveFiles = new BehaviorSubject<boolean>(false)
  public haveFiles$ = this.haveFiles.asObservable();
  private uploading = new BehaviorSubject<boolean>(false)
  public uploading$ = this.uploading.asObservable();
  private downloading = new BehaviorSubject<boolean>(false)
  public downloading$ = this.downloading.asObservable();
  private progress = new BehaviorSubject<any[]>([0.0, 0.0])
  public progress$ = this.progress.asObservable();
  private cleaning = new BehaviorSubject<boolean>(false)
  public cleaning$ = this.cleaning.asObservable();

  constructor(
    private _session:SessionService,
    private _alert:AlertService,
    private translate:TranslateService,
    private _translation:TranslationConfigService,
    private _auth:AuthService,
    private http: HttpClient,
    private _data:DataService,
    private _storage:StorageService
  ) {}

  //REFRESCAR TOKEN Y CONECTAR
  async init(){
    this.token = await this._session.getToken();
    if(this.token && (await Network.getStatus()).connected === true){
      await this.connectAccount();
    }else if(this.token && (await Network.getStatus()).connected === false){
      this._alert.createAlert(this.translate.instant("error.no_network"), this.translate.instant("error.no_network_to_backup"));
    }
    this.noFinishedOperation = await this._storage.getStorageItem(storageConstants.USER_OPS+this._session.currentUser.id);
    console.log(this.noFinishedOperation)
    if(this.noFinishedOperation){
      this.updateInDriveProcess();
    }
  }

  async updateInDriveProcess(){
    const ops = await this._alert.twoOptionsAlert(this.translate.instant('alert.no_fished_op_detected'),this.translate.instant('alert.no_fished_op_detected_text'),this.translate.instant('alert.accept'),this.translate.instant('alert.cancel'))
    if(ops){
      if(this.token && (await Network.getStatus()).connected === false){
        this._alert.createAlert(this.translate.instant("error.no_network"),"");
      }else{
        const sure = await this._alert.twoOptionsAlert(this.translate.instant('alert.are_you_sure?'),this.translate.instant('alert.update_files_text'),this.translate.instant('alert.accept'),this.translate.instant('alert.cancel'));
        if(sure){
          this._storage.setStorageItem(storageConstants.USER_OPS+this._session.currentUser.id,true)
          await this.removeAllElements()
          .then(async()=>{
            await this.uploadFiles();
            this._storage.setStorageItem(storageConstants.USER_OPS+this._session.currentUser.id,false)
          })
          .catch((e)=>{
            console.log(e);
            this._alert.createAlert(this.translate.instant('error.error_cleaning'), this.translate.instant('error.error_cleaning_text'))
          })
        }
      }
    }
  }
  async uploadFiles():Promise<void> {
    if(this.token && (await Network.getStatus()).connected === false){
      this._alert.createAlert(this.translate.instant("error.no_network"),"");
    }else{
      if(!this.folderId){
        await this.createFolder();
      }
      const data = await this._data.buildDriveData();
      this.changeUploading(true);
      const total = data.length;
      const unit = 1/total;
      let value = 0;
      let buffer = 0;

      for(const element of data){
        try {
          buffer += unit;
          this.changeProgress(value, buffer);
          const exist = await this.findFileByName(element.fileName)
          if(exist){
            await this.updateFile(exist, element.content, element.fileName);
          }else{
            await this.uploadFile(element.content, element.fileName);
          }
          value += unit;
          this.changeProgress(value, buffer);
        } catch (err) {
          console.log("Ocurrió un error: ", err);
          break;
        }
      }
      this.changeHaveFiles(true);
      this.changeUploading(false);
    }
  }



  async removeAllElements():Promise<void>{
    this.changecleaning(true);
    const oldFiles = await this.listFilesInFolder();
    const total = oldFiles.length;
    const unit = 1/total;
    let value = 0;
    let buffer = 0;

    for(const element of oldFiles){

      buffer += unit;
      this.changeProgress(value, buffer);
      try{
        await this.deleteFile(element.id);
        value += unit;
        this.changeProgress(value, buffer);
      }catch (err){
        console.log(err);
        throw new Error('Error al eliminar de Drive');
      }
    }
    this.changecleaning(false);
    return;
  }

  async connectAccount():Promise<void>{
    await this._auth.refreshGoogle()
    .then(async(msg)=>{
      this.token = msg.accessToken;
      await this._session.setGoogleToken(this.token);
      await this.setConnectedAndTryFiles();
    })
    .catch(async (err)=>{
      //console.log("error",err);
      await this._auth.loginWithGoogle()
      .then(async(user)=>{
        this.token = user.authentication.accessToken;
        await this._session.setGoogleToken(this.token);
        await this.setConnectedAndTryFiles();
      })
      .catch(async (err)=>{
        //console.log("error",err);
        if(err){
        alert(err);
        }
      })
    })
    return;
  }

  async setConnectedAndTryFiles(){
    this.connected.next(true);
    await this.existsFolder();
    return;
  }

  //CAMBIAR VALOR DE OBSERVABLES
  changeConnected(value:boolean){
    this.connected.next(value);
  }
  changeHaveFiles(value:boolean){
    this.haveFiles.next(value);
  }
  changeUploading(value:boolean){
    this.uploading.next(value);
  }
  changeDownloading(value:boolean){
    this.downloading.next(value);
  }
  changeProgress(value:number, buffer:number){
    this.progress.next([value,buffer]);
  }
  changecleaning(value:boolean){
    this.cleaning.next(value);
  }

  //MÉTODOS DE ACCIONES COMPUESTAS, LAS QUE REALIZAN USUARIO O SISTEMA UTILIZANDO LOS MÉTODOS DE CONSULTA SIMPLE.
  //COMPROBAR SI EXISTE CARPETA
  async existsFolder():Promise<void>{
    await this.getFolderId()
    .then(async (folderId)=>{
      if(folderId !== null){
        this.folderId = folderId;
        //console.log("carpeta: ",folderId)
        await this.listFilesInFolder()
        .then((resp)=>{
          if(resp.length >0){
            //console.log("archivos: ",resp)
            this.changeHaveFiles(true);
            //console.log("se cambia")
          }
        })
      }
    })
    return
  }



  //METODOS DE CONSULTA SIMPLE DE DRIVE
  //CREAR CARPETA
  async createFolder(): Promise<string> {
    try {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      });

      const metadata:any = {
        'name': this._session.currentUser.id,
        'mimeType': 'application/vnd.google-apps.folder',
        'parents': ['appDataFolder']
      };

      const response: any = await firstValueFrom(this.http.post(backupConstants.API_URL_FIL, metadata, { headers }));

      this.folderId = response.id;

      return response.id;
    } catch (error) {
      //console.error('Error al crear la carpeta:', error);
      throw error;
    }
  }

  //OBTENER ID DE CARPETA
  async getFolderId(): Promise<any> {
    //console.log("ID de usuario: ", this._session.currentUser.id);

    try {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.token}`
      });

      const params = new HttpParams()
        .set('q', `mimeType='application/vnd.google-apps.folder' and name='${this._session.currentUser.id}'`)
        .set('spaces', 'appDataFolder')
        .set('fields', 'files(id, name)')
        .set('pageSize', '1');

      const response: any = await firstValueFrom(this.http.get(backupConstants.API_URL_FIL, { headers, params }));

      //console.log("Response de getFolderId:", response);

      if (response.files && response.files.length > 0 && response.files[0].id) {
        return response.files[0].id;
      } else {
        //console.log('No se encontró la carpeta para el usuario actual.');
        return null;
      }
    } catch (error) {
      //console.error('Error al obtener el ID de la carpeta:', error);
      throw new Error('Error al obtener el ID de la carpeta');
    }
  }



  //LISTAR ARCHIVOS
  listFilesInFolder(): Promise<any> {
    //console.log("carpeta: ", this.folderId);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    let params = new HttpParams()
      .set('q', `'${this.folderId}' in parents and trashed=false`)
      .set('spaces', 'appDataFolder')
      .set('fields', 'nextPageToken, files(id, name)')
      .set('pageSize', '10');

    const fetchFiles = async (pageToken?: string): Promise<any[]> => {
      if (pageToken) {
        params = params.set('pageToken', pageToken);
      }

      try {
        const response:any = await firstValueFrom(this.http.get(backupConstants.API_URL_FIL, { headers, params }));
        const files = response.files || [];
        const nextPageToken = response.nextPageToken;

        if (nextPageToken) {
          // Recursively fetch the next page of files
          const nextFiles = await fetchFiles(nextPageToken);
          return files.concat(nextFiles);
        }
        console.log(files);
        return files;
      } catch (error) {
        //console.error('Error al listar archivos en la carpeta:', error);
        throw error;
      }
    };

    return fetchFiles();
  }


  //SUBIR UN ARCHIVO
  async uploadFile(content: string, fileName: string, notComplete?:boolean): Promise<any> {
    if (!this.token) {
      throw new Error("User is not authenticated. Please log in.");
    }

    if(notComplete){
      this.changeUploading(true);
    }

    const file = new Blob([content], { type: 'text/plain' });

    const metadata = {
      name: fileName,
      mimeType: 'text/plain',
      parents: [this.folderId]
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    const response = await fetch(backupConstants.API_URL_UP, {
      method: 'POST',
      headers: new Headers({ 'Authorization': `Bearer ${this.token}` }),
      body: form
    });

    if (!response.ok) {
      const error = await response.json();
      //console.error("Error uploading file:", error);
      throw new Error(error.message || "Failed to upload file");
    }

    if(notComplete){
      this.changeUploading(false);
    }

    return response.json();
  }

  //BUSCAR UN ARCHIVO
  async findFileByName(fileName: string): Promise<any> {
    if (!this.token) {
      throw new Error("User is not authenticated. Please log in.");
    }

    const query = `name='${fileName}' and trashed=false and '${this.folderId}' in parents`;
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&spaces=appDataFolder&fields=files(id,name)`, {
      method: 'GET',
      headers: new Headers({
        'Authorization': `Bearer ${this.token}`
      })
    });

    if (!response.ok) {
      const error = await response.json();
      //console.error("Error finding file:", error);
      throw new Error(error.message || "Failed to find file");
    }

    //console.log(response, response.json)
    const result = await response.json();
    const files = result.files;


    if (files && files.length > 0) {
      return files[0].id;
    } else {
      return null;
    }
  }

  //ACTUALIZAR UN ARCHIVO
  async updateFile(fileId:string, content:string, fileName:string, notComplete?:boolean) {

    if(notComplete){
      this.changeUploading(true);
    }
    const file = new Blob([content], { type: 'text/plain' });

    const metadata = {
      name: fileName,
      mimeType: 'text/plain'
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`, {
      method: 'PATCH',
      headers: new Headers({ 'Authorization': `Bearer ${this.token}` }),
      body: form
    });

    if (!response.ok) {
      const error = await response.json();
      //console.error("Error updating file:", error);
      throw new Error(error.message || "Failed to update file");
    }

    if(notComplete){
      this.changeUploading(false);
    }

    return response.json();
}


  //DESCARGAR UN ARCHIVO
  async downloadFile(fileId: string): Promise<string> {
    if (!this.token) {
      throw new Error("User is not authenticated. Please log in.");
    }

    const response = await fetch(`${backupConstants.API_URL_FIL}/${fileId}?alt=media&spaces=${this.folderId}`, {
      method: 'GET',
      headers: new Headers({ 'Authorization': `Bearer ${this.token}` })
    });

    if (!response.ok) {
      const error = await response.json();
      //console.error("Error reading file:", error);
      throw new Error(error.message || "Failed to read file");
    }

    const fileContent = await response.text();
    return fileContent;
  }


  //BORRAR UN ARCHIVO
  async deleteFile(fileId: string, notAll?:boolean): Promise<any> {
    if(notAll){
      this.changecleaning(true);
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    const params = new HttpParams()
    .set('spaces', this.folderId);


    const observable = this.http.delete(`${backupConstants.API_URL_FIL}/${fileId}`, { headers, params });

    return firstValueFrom(observable)
      .then(response => {
        if(notAll){
          this.changecleaning(false);
        }
        return response;
      })
      .catch(error => {
        //console.error('Error al eliminar el archivo:', error);
        throw error;
      });

  }


}














