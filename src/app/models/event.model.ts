import { LocalNotificationSchema } from "@capacitor/local-notifications";

export class Event {
  id:string = "";
  vehicleId = "";
  date:string="";
  type:string="";
  km:string="";
  cost:number=0;
  info:string="";
  images:string[]=[];
  reminder:boolean=false;
  reminderTittle:string="";
  reminderDate:Date = new Date();
  reminderId:number|undefined;
}
