// src/app/services/crypto.service.ts
import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { User } from '../models/user.model';
import { backupConstants } from '../const/backup';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  private secretKey: string = '';

  constructor() { }

  init(user:User){
    this.secretKey = user.id
  }

  // Cifra un mensaje
  encryptMessage(message: string, altKey?:boolean): string {
    let key;
    if(altKey){
      key = backupConstants.ALT_KEY;
    }else{
      key = this.secretKey
    }
    const ciphertext = CryptoJS.AES.encrypt(message, key).toString();
    return ciphertext;
  }

  // Descifra un mensaje
  decryptMessage(ciphertext: string, altKey?:boolean): string {
    let key;
    if(altKey){
      key = backupConstants.ALT_KEY;
    }else{
      key = this.secretKey
    }
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const originalMessage = bytes.toString(CryptoJS.enc.Utf8);
    return originalMessage;
  }
}
