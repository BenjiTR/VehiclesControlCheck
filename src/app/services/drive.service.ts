import { Injectable } from '@angular/core';
import { SessionService } from './session.service';
import { Network } from '@capacitor/network';
import { AlertService } from './alert.service';
import { TranslateService } from '@ngx-translate/core';
import { TranslationConfigService } from './translation.service';
import { AuthService } from './auth.service';
import { FileSystemService } from './filesystem.service';

@Injectable({
  providedIn: 'root'
})
export class DriveService {

  public token:string = "";
  public connected:boolean = false;
  public haveFile:boolean = false;

  constructor(
    private _session:SessionService,
    private _alert:AlertService,
    private translate:TranslateService,
    private _translation:TranslationConfigService,
    private _auth:AuthService,
    private _file:FileSystemService,
  ) {}

  //REFRESCAR TOKEN Y CONECTAR
  async init(){
    this.token = await this._session.getToken();
    if(this.token && (await Network.getStatus()).connected === true){
      //await this.connectAccount();
    }else if(this.token && (await Network.getStatus()).connected === false){
      this._alert.createAlert(this.translate.instant("error.no_network"), this.translate.instant("error.no_network_to_backup"));
    }
  }

  async connectAccount():Promise<void>{
    if(this.token && (await Network.getStatus()).connected === false){
      this._alert.createAlert(this.translate.instant("error.no_network"),"");
    }else{
      await this._auth.refreshGoogle()
      .then(async(msg)=>{
        this.token = msg.accessToken;
        //this._session.setGoogleToken(this.token);
        this.connected = true;
        //await this.existsFile();
      })
      .catch(async (err)=>{
        console.log("error",err);
        await this._auth.loginWithGoogle()
        .then(async(user)=>{
          this.token = user.authentication.accessToken;
          this._session.setGoogleToken(this.token);
          this.connected = true;
          await this.existsFile();
        })
        .catch(async (err)=>{
          console.log("error",err);
          if(err.error){
          alert(err.error);
          }
        })
      })
    }
  }

  //COMPROBAR SI EXISTE EL ARCHIVO
  async existsFile():Promise<void>{
    const fileId = await this.findFileByName(`${this._session.currentUser.id}.vcc`, this.token)
    console.log(fileId);
    if(fileId){
      this.haveFile = true;
      this._session.currentUser.backupId = fileId;
    }
    return;
  }

  //ACTUALIZAR ARCHIVO
  async updateData(){
    if((await Network.getStatus()).connected === false){
      this._alert.createAlert(this.translate.instant("error.no_network"), this.translate.instant("error.no_network_to_backup"));
      this._session.currentUser.backupId = "";
      return
    }else{
      this.token = await this._session.getToken();
      const data = await this._file.buildData();
      const fileId = await this.findFileByName(`${this._session.currentUser.id}.vcc`, this.token)
      console.log(fileId,this.token)
      if(fileId){
        await this.updateFile(fileId,data,this._session.currentUser.id+".vcc",this.token)
        .then((msg)=>{
          console.log(msg)
          return
        })
        .catch((err)=>{
          console.log(err);
          if(err.error){
            alert(err.error);
          }
          return
        })
      }
    }
  }




























  async uploadFile(content: string, fileName: string, token:string): Promise<any> {
    if (!token) {
      throw new Error("User is not authenticated. Please log in.");
    }

    const file = new Blob([content], { type: 'text/plain' });

    const metadata = {
      name: fileName,
      mimeType: 'text/plain'
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: new Headers({ 'Authorization': `Bearer ${token}` }),
      body: form
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Error uploading file:", error);
      throw new Error(error.message || "Failed to upload file");
    }

    return response.json();
  }

  async updateFile(fileId:string, content:string, fileName:string, token:string) {
    if (!token) {
      throw new Error("User is not authenticated. Please log in.");
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
      headers: new Headers({ 'Authorization': `Bearer ${token}` }),
      body: form
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Error updating file:", error);
      throw new Error(error.message || "Failed to update file");
    }

    return response.json();
  }


  async downloadFile(fileId: string, token: string): Promise<string> {
    if (!token) {
      throw new Error("User is not authenticated. Please log in.");
    }

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      method: 'GET',
      headers: new Headers({ 'Authorization': `Bearer ${token}` })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Error reading file:", error);
      throw new Error(error.message || "Failed to read file");
    }

    console.log(response)
    return response.text();
  }

  async findFileByName(fileName: string, token: string): Promise<string | null> {
    console.log(token)
    if (!token) {
      throw new Error("User is not authenticated. Please log in.");
    }

    const query = `name='${fileName}' and trashed=false`;
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`, {
      method: 'GET',
      headers: new Headers({
        'Authorization': `Bearer ${token}`
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
      return files[0].id; // Retorna el ID del primer archivo encontrado
    } else {
      return null; // No se encontró el archivo
    }
  }






}
