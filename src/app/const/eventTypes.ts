import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class EventTypes {
  eventTypes: any[] = [];
  types: string[] = [];


  constructor(private translate: TranslateService) {
    this.initializeEventTypes();
  }

  private initializeEventTypes() {
    this.eventTypes = [
      { name: 'Flat tire', string: this.translate.instant('eventypes.flat_tire') },
      { name: 'Repair', string: this.translate.instant('eventypes.repair') },
      { name: 'Inspection', string: this.translate.instant('eventypes.inspection') },
      { name: 'Refueling', string: this.translate.instant('eventypes.refueling') },
      { name: 'Maintenance', string: this.translate.instant('eventypes.maintenance') },
      { name: 'Accident', string: this.translate.instant('eventypes.accident') },
      { name: 'Others', string: this.translate.instant('eventypes.others') }

    ];
    this.types = [
      'Flat tire',
      'Repair',
      'Inspection',
      'Refueling',
      'Maintenance',
      'Accident',
      'Others'

    ];
  }

  getEventTypes(): any[] {
    return this.eventTypes.sort((a, b) => a.string.localeCompare(b.string));
  }
  getTypes():string[] {
    return this.types;
  }
}
