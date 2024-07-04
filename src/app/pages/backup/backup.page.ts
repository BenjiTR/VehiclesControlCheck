import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCol, IonButton, IonRow } from '@ionic/angular/standalone';
import { FileSystemService } from 'src/app/services/filesystem.service';
import { StorageService } from 'src/app/services/storage.service';
import { storageConstants } from 'src/app/const/storage';
import { SessionService } from 'src/app/services/session.service';
import { Backup } from 'src/app/models/backup.model';
import { NotificationsService } from 'src/app/services/notifications.service';
import { LocalNotificationSchema } from '@capacitor/local-notifications';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-backup',
  templateUrl: './backup.page.html',
  styleUrls: ['./backup.page.scss'],
  standalone: true,
  imports: [IonRow, IonButton, IonCol, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class BackupPage implements OnInit {

  public token:string = "";

  constructor(
    private _file:FileSystemService,
    private _storage:StorageService,
    private _session:SessionService,
    private _notifications:NotificationsService,
    private _auth:AuthService
  ) {
  }

  ngOnInit() {
    console.log("entra")
  }

  async setBackup(){
    const resp = await this._file.createBackupFile();
    console.log(resp)
  }

  async getBackup(){
    const resp:Backup = await this._file.readBackupFile();
    if(resp){
      await this._storage.setStorageItem(storageConstants.USER_VEHICLES+this._session.currentUser.id,resp.vehicles);
      await this._storage.setStorageItem(storageConstants.USER_EVENTS+this._session.currentUser.id,resp.events);
      await this._storage.setStorageItem(storageConstants.USER_REMINDER+this._session.currentUser.id,resp.remindersOptions);
      const preparedReminders = await this.setDates(resp.reminders);
      console.log(preparedReminders)
      await this._notifications.createNotification(preparedReminders);
    }
    console.log(resp)
  }

  async setDates(reminders:LocalNotificationSchema[]):Promise<LocalNotificationSchema[]>{
    reminders.forEach(element => {
      element.schedule!.at! = new Date(element.schedule!.at!)
    });
    return reminders;
  }

  async uploadFile(){
    if(this.token){
      console.log(this.token)
    }else{
      this.token = await this.connectAccount();
    }
  }

  async connectAccount():Promise<string>{
    const user = await this._auth.loginWithGoogle();
    return user.authentication.accessToken;
  }

}
