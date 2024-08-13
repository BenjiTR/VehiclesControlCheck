// src/app/services/crypto.service.ts
import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { User } from '../models/user.model';

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
  encryptMessage(message: string): string {
    const ciphertext = CryptoJS.AES.encrypt(message, this.secretKey).toString();
    return ciphertext;
  }

  // Descifra un mensaje
  decryptMessage(ciphertext: string): string {
    const bytes = CryptoJS.AES.decrypt(ciphertext, this.secretKey);
    const originalMessage = bytes.toString(CryptoJS.enc.Utf8);
    return originalMessage;
  }
}
