import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DriveService {

  constructor() {
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
