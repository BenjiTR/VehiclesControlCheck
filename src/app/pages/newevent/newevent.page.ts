import { imageConstants } from './../../const/img';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonTextarea, IonContent, IonHeader, IonTitle, IonToolbar, IonRow, IonCol, IonLabel, IonAvatar, IonItem, IonIcon, IonButton, IonSelectOption, ModalController, IonSelect, IonInput, IonImg, NavController, IonText, IonList } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { EventTypes } from 'src/app/const/eventTypes';
import { AlertService } from 'src/app/services/alert.service';
import { TranslationConfigService } from 'src/app/services/translation.service';
import { Event } from '../../models/event.model'
import { AdmobService } from 'src/app/services/admob.service';
import { SessionService } from 'src/app/services/session.service';
import { HashService } from 'src/app/services/hash.service';
import { StorageService } from 'src/app/services/storage.service';
import { storageConstants } from 'src/app/const/storage';
import { User } from 'src/app/models/user.model';
import { Vehicle } from 'src/app/models/vehicles.model';
import { ImgmodalPage } from '../imgmodal/imgmodal.page';
import { CameraServices } from 'src/app/services/camera.service';
import { LoaderService } from 'src/app/services/loader.service';
import { DriveService } from 'src/app/services/drive.service';
import { CryptoService } from 'src/app/services/crypto.services';
import { Network } from '@capacitor/network';

@Component({
  selector: 'app-newevent',
  templateUrl: './newevent.page.html',
  styleUrls: ['./newevent.page.scss'],
  standalone: true,
  imports: [IonList, IonText, IonTextarea, IonImg, IonInput, TranslateModule, IonSelect, IonSelectOption, IonButton, IonIcon, IonItem, IonAvatar, IonLabel, IonRow, IonCol, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class NeweventPage {

  @ViewChild('textareaElement', { static: false })
  textareaElement!: IonTextarea; // Referencia al IonTextarea


  public vehicleId: string = "";
  public date: string = "";
  public type: string = "";
  public eventTypes: any;
  public km: string = "";
  public cost: number = 0;
  public info: string = "";
  public images: string[] = [];
  public eventsArray: Event[] = [];
  public eventToEdit: Event = new Event;
  public eventToEditId: string = "";
  public user: User = new User;
  public vehiclesArray: Vehicle[] = [];

  public showSuggestions: boolean = false;
  public tags: string[] = [];
  public filteredTags: string[] = [];
  public currentTag: string = '';

  constructor(
    private translate: TranslateService,
    private _translation: TranslationConfigService,
    private router: Router,
    private etypes: EventTypes,
    private _alert: AlertService,
    private _session: SessionService,
    private activatedroute: ActivatedRoute,
    private _hash: HashService,
    private _storage: StorageService,
    private modalController: ModalController,
    private _camera: CameraServices,
    private _admobService: AdmobService,
    private navCtr: NavController,
    private _loader: LoaderService,
    private _drive: DriveService,
    private _crypto: CryptoService
  ) {
    this.eventTypes = etypes.getEventTypes();
    this.user = this._session.currentUser;
  }

  async ionViewWillEnter() {
    await this._loader.presentLoader();
    this.getTags();
    this.translate.setDefaultLang(this._translation.getLanguage());
    this.eventsArray = await this._session.eventsArray;
    this.vehiclesArray = await this._session.vehiclesArray;
    this.eventToEditId = this.activatedroute.snapshot.queryParams['eventToEditId'];
    if (this.eventToEditId) {
      this.getEvent();
    }
    await this._loader.dismissLoader();
  }

  async getTags(){
    const tempTags = await this._storage.getStorageItem(storageConstants.USER_TAGS + this._session.currentUser.id);
    if(tempTags){
      this.tags = JSON.parse(this._crypto.decryptMessage(tempTags));
    }
  }

  getEvent() {
    const current = this.eventsArray.find(event => event.id === this.eventToEditId)
    if (current) {
      this.eventToEdit = JSON.parse(JSON.stringify(current));
      this.asignPropertis();
    }
  }

  asignPropertis() {
    this.vehicleId = this.eventToEdit.vehicleId;
    this.date = this.eventToEdit.date;
    this.type = this.eventToEdit.type;
    this.km = this.eventToEdit.km;
    this.cost = this.eventToEdit.cost;
    this.info = this.eventToEdit.info;
    this.images = this.eventToEdit.images;
  }

  async cancelCreateEvent() {
    const sure = await this._alert.twoOptionsAlert(this.translate.instant('alert.are_you_sure?'), this.translate.instant('alert.changes_will_not_be_saved'), this.translate.instant('alert.accept'), this.translate.instant('alert.cancel'))
    if (sure) {
      this.navCtr.navigateRoot('/dashboard')
    }
  }

  async createEvent() {
    if (this.eventToEditId) {
      this.editEvent()
    } else {
      this.createNew();
    }
  }
  async editEvent() {
    if (!this.vehicleId) {
      this._alert.createAlert(this.translate.instant("alert.enter_name_or_model"), this.translate.instant("alert.enter_name_or_model_text"));
    } else if (!this.type) {
      this._alert.createAlert(this.translate.instant("alert.enter_type"), this.translate.instant("alert.enter_type_text"));
    } else if (!this.date) {
      this._alert.createAlert(this.translate.instant("alert.enter_date"), this.translate.instant("alert.enter_date_text"));
    } else {
      await this._loader.presentLoader();
      const index = this.eventsArray.findIndex(event => event.id === this.eventToEditId);
      if (index !== -1) {
        const newEvent = await this.generateEvent();
        this._session.eventsArray[index] = newEvent;

        this.saveAndExit(newEvent);
      }
    }
  }


  async generateEvent() {
    let hash;
    if (this.eventToEditId) {
      hash = this.eventToEditId;
    } else {
      hash = await this._hash.generateEventPhrase();
    }
    const newEvent: Event = {
      id: hash,
      vehicleId: this.vehicleId,
      date: this.date,
      type: this.type,
      km: this.km,
      cost: this.cost,
      info: this.info,
      images: this.images
    }
    return newEvent;
  }

  async saveAndExit(event: Event) {
    await this._admobService.showinterstitial();
    this._session.eventsArray = this.eventsArray;
    this._storage.setStorageItem(storageConstants.USER_EVENTS + this.user.id, this._crypto.encryptMessage(JSON.stringify(this.eventsArray)));
    if (this._drive.folderId && this._session.autoBackup) {
      await this.uploadFile('event',event);
    }
    this.navCtr.navigateRoot(['/dashboard'], { queryParams: { reload: false } });
  }

  async createNew() {
    if (!this.vehicleId) {
      this._alert.createAlert(this.translate.instant("alert.enter_name_or_model"), this.translate.instant("alert.enter_name_or_model_text"));
    } else if (!this.type) {
      this._alert.createAlert(this.translate.instant("alert.enter_type"), this.translate.instant("alert.enter_type_text"));
    } else if (!this.date) {
      this._alert.createAlert(this.translate.instant("alert.enter_date"), this.translate.instant("alert.enter_date_text"));
    } else {
      await this._loader.presentLoader();
      const newEvent = await this.generateEvent();
      this.eventsArray.push(newEvent)
      this.saveAndExit(newEvent);
    }
  }

  async deleteImg(img: any) {
    const sure = await this._alert.twoOptionsAlert(this.translate.instant('alert.are_you_sure?'), this.translate.instant('alert.photo_will_permanently_erased'), this.translate.instant('alert.erase'), this.translate.instant('alert.cancel'))
    if (sure) {
      const i = this.images.findIndex(image => image === img)
      if (i != -1) {
        this.images.splice(i, 1);
      }
    }
  }

  async openModal(img: string) {
    const modal = await this.modalController.create({
      component: ImgmodalPage,
      componentProps: {
        img: img
      }
    });

    await modal.present();
  }

  async addImage() {
    const photo = await this._camera.takePhoto();
    await this._loader.presentLoader();
    if (photo) {
      this.images.push(imageConstants.base64Prefix + photo);
    }
    await this._loader.dismissLoader();
  }

  //etiquetas
  onInputChange(event: any) {
    const inputValue = event.target.value;

    // Buscar la última palabra que empieza con '#'
    const tagMatch = inputValue.match(/#\w*$/);

    if (tagMatch) {
      this.currentTag = tagMatch[0];

      // Filtrar las etiquetas existentes
      this.filteredTags = this.tags.filter(tag => tag.startsWith(this.currentTag));
      this.showSuggestions = true;
    } else {
      this.showSuggestions = false;
    }
  }

  selectTag(tag: string) {
    // Insertar la etiqueta seleccionada en el texto
    this.info = this.info.replace(/#\w*$/, tag + ' ');
    this.showSuggestions = false;
  }

  // Función para agregar la almohadilla al final del texto
  addHashtag() {
    if (!this.info.endsWith(' ')) {
      this.info += ' ';
    }

    this.info += '#';
    this.filteredTags = this.tags;
    this.showSuggestions = true;

    setTimeout(() => {
      this.textareaElement.setFocus();
      this.setCursorAtEnd();
    }, 0);
  }

  // Función para posicionar el cursor al final del textarea
  setCursorAtEnd() {
    this.textareaElement.getInputElement().then(input => {
      const length = input.value.length;
      input.setSelectionRange(length, length);
    });
  }

  // Función para agregar una nueva etiqueta al storage
  async addNewTag() {
    const newTag = this.currentTag.trim();

    // Evitar duplicados
    if (newTag && !this.tags.includes(newTag)) {
      this.tags.push(newTag);
      // Guardar en el storage
      await this._storage.setStorageItem(storageConstants.USER_TAGS + this._session.currentUser.id, this._crypto.encryptMessage(JSON.stringify(this.tags)));
      // Actualizar la lista de sugerencias
      this.filteredTags = this.tags.filter(tag => tag.startsWith(newTag));
      this.showSuggestions = false;
      //subir a DRIVE
      this.uploadFile('tags',this.tags);
    }
  }

  async deleteTag(tag: string) {
    const index = this.tags.indexOf(tag);
    if (index !=-1) {
      this.tags.splice(index, 1);
    }
    await this._storage.setStorageItem(storageConstants.USER_TAGS + this._session.currentUser.id, this._crypto.encryptMessage(JSON.stringify(this.tags)));
     //subir a DRIVE
     this.uploadFile('tags',this.tags);
  }

  async uploadFile(fileType:string, file:any):Promise<void>{

    //console.log(fileType, file);

    let fileName;
    let encripted;

    if(fileType === "event"){
      fileName = file.id;
      encripted = this._crypto.encryptMessage(JSON.stringify(file))
    }else{
      fileName = 'tags';
      encripted = this._crypto.encryptMessage(JSON.stringify(file))
    }

    //console.log(fileName, encripted);

    this._storage.setStorageItem(storageConstants.USER_OPS + this._session.currentUser.id, true)
    if ((await Network.getStatus()).connected === true) {
      const exist = await this._drive.findFileByName(fileName)
      if (exist) {
        //console.log(exist);
        this._drive.updateFile(exist, encripted, fileName, true);
      } else {
        this._drive.uploadFile(encripted, fileName, true);
      }
      this._storage.setStorageItem(storageConstants.USER_OPS + this._session.currentUser.id, false)
    } else {
      this._alert.createAlert(this.translate.instant("error.no_network"), this.translate.instant("error.no_network_to_backup"));
      this._drive.folderId = "";
    }
    return;
  }


}

