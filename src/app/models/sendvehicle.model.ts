import { Event } from "./event.model";
import { Vehicle } from "./vehicles.model";

export class SendVehicleData {
  vehicle:Vehicle = new Vehicle();
  events:Event[] = [];
}
