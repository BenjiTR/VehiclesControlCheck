import { LocalNotificationSchema } from "@capacitor/local-notifications";
import { Event } from "./event.model";
import { Vehicle } from "./vehicles.model";

export class Backup {
  vehicles:Vehicle[] = [];
  events:Event[] = [];
  remindersOptions:boolean = false;
  autoBackup:boolean=true;
  photo:string="";
  tags:string[]=[];
}
