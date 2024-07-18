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


@Injectable({
  providedIn: 'root'
})
export class DriveService {

  public token:string = "";
  public folderId: string = "";

  private connected = new BehaviorSubject<boolean>(false)
  public conected$ = this.connected.asObservable();
  private haveFiles = new BehaviorSubject<boolean>(false)
  public haveFiles$ = this.haveFiles.asObservable();

  constructor(
    private _session:SessionService,
    private _alert:AlertService,
    private translate:TranslateService,
    private _translation:TranslationConfigService,
    private _auth:AuthService,
    private _file:FileSystemService,
    private http: HttpClient,
    private _toast:ToastService
  ) {}

  //REFRESCAR TOKEN Y CONECTAR
  async init(){
    this.token = await this._session.getToken();
    if(this.token && (await Network.getStatus()).connected === true){
      await this.connectAccount();
    }else if(this.token && (await Network.getStatus()).connected === false){
      this._alert.createAlert(this.translate.instant("error.no_network"), this.translate.instant("error.no_network_to_backup"));
    }
  }

  async connectAccount():Promise<void>{
    await this._auth.refreshGoogle()
    .then(async(msg)=>{
      this.token = msg.accessToken;
      this._session.setGoogleToken(this.token);
      this.setConnectedAndTryFiles();
    })
    .catch(async (err)=>{
      console.log("error",err);
      await this._auth.loginWithGoogle()
      .then(async(user)=>{
        this.token = user.authentication.accessToken;
        this._session.setGoogleToken(this.token);
        this.setConnectedAndTryFiles();
      })
      .catch(async (err)=>{
        console.log("error",err);
        if(err){
        alert(err);
        }
      })
    })
  }

  async setConnectedAndTryFiles(){
    this.connected.next(true);
    await this.existsFolder();
    const files = await this.listFilesInFolder();
    console.log("files: ", files.files)
    if(files.files.length >0){
      this.changeHaveFiles(true);
    }
  }


  //CAMBIAR VALOR DE OBSERVABLES
  changeConnected(value:boolean){
    this.connected.next(value);
  }
  changeHaveFiles(value:boolean){
    this.haveFiles.next(value);
  }

  //MÉTODOS DE ACCIONES COMPUESTAS, LAS QUE REALIZAN USUARIO O SISTEMA UTILIZANDO LOS MÉTODOS DE CONSULTA SIMPLE.
  //COMPROBAR SI EXISTE CARPETA
  async existsFolder():Promise<void>{
    await this.getFolderId()
    .then(async (folderId)=>{
      if(folderId){
        this.folderId = folderId;
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

      return response.id;
    } catch (error) {
      console.error('Error al crear la carpeta:', error);
      throw error;
    }
  }

  //OBTENER ID DE CARPETA
  async getFolderId(): Promise<any> {
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

      if (response.files && response.files.length > 0 && response.files[0].id) {
        return response.files[0].id;
      }
    } catch (error) {
      console.error('Error al obtener el ID de la carpeta:', error);
    }
  }


  //LISTAR ARCHIVOS
  listFilesInFolder(): Promise<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    const params = new HttpParams()
    .set('q', `'${this.folderId}' in parents and trashed=false`)
    .set('spaces', 'appDataFolder')
    .set('fields', 'nextPageToken, files(id, name)')
    .set('pageSize', '10');

    return firstValueFrom(this.http.get(backupConstants.API_URL_FIL, { headers, params }))
    .then(response => response)
    .catch(error => {
      console.error('Error al listar archivos en la carpeta:', error);
    });
  }

  //SUBIR UN ARCHIVO
  async uploadFile(content: string, fileName: string): Promise<any> {
    if (!this.token) {
      throw new Error("User is not authenticated. Please log in.");
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
      console.error("Error uploading file:", error);
      throw new Error(error.message || "Failed to upload file");
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
      console.error("Error finding file:", error);
      throw new Error(error.message || "Failed to find file");
    }

    console.log(response, response.json)
    const result = await response.json();
    console.log(result)
    const files = result.files;
    console.log(result.files)


    if (files && files.length > 0) {
      return files[0].id;
    } else {
      return null;
    }
  }

  //ACTUALIZAR UN ARCHIVO
  async updateFile(fileId:string, content:string, fileName:string) {

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
      console.error("Error updating file:", error);
      throw new Error(error.message || "Failed to update file");
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
      console.error("Error reading file:", error);
      throw new Error(error.message || "Failed to read file");
    }

    const fileContent = await response.text();
    console.log(fileContent);
    return fileContent;
  }


  //BORRAR UN ARCHIVO
  async deleteFile(fileId: string): Promise<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.token}`
    });

    const params = new HttpParams()
    .set('spaces', this.folderId);


    const observable = this.http.delete(`${backupConstants.API_URL_FIL}/${fileId}`, { headers, params });

    return firstValueFrom(observable)
      .then(response => response)
      .catch(error => {
        console.error('Error al eliminar el archivo:', error);
        throw error; // Propagar el error para manejarlo en el componente
      });
  }


}













