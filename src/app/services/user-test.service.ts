import { Injectable } from "@angular/core";
import { Vehicle } from "../models/vehicles.model";
import { Event } from "../models/event.model";
import { LocalNotificationSchema } from "@capacitor/local-notifications";

@Injectable({
  providedIn:'root',
})

export class UserTestService {

  public userCredential:any = {
    "email": "virtualuser@virtual.com",
    "givenName": "Virtual User",
    "id": "00000000000000000001",
    "imageUrl": "",
    "name": "Virtual User",
    "authentication": {
        "accessToken": "ya29.a0AXooCgsbAJ18BqrX4ptJDkZE82NEFxVOtUOkLme_Hj-6oaga71w14oomfg_fmC3dMHSIpe-f6qt3V6FMULIP_bp8U9xRPHbQ27gC_e8j2s9OqKNdmSxz_3L4QoKSNcQseewNShqKXh96VFtFtraFADm6Y_W1tdAebPYOaCgYKAfcSARISFQHGX2MiGwB4WQgw4JJBxCl0iMH55w0171",
        "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjY3NGRiYmE4ZmFlZTY5YWNhZTFiYzFiZTE5MDQ1MzY3OGY0NzI4MDMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiMzI5NDMyOTYwOTg1LTBmMG9qMnFiaDNncDBtYmdyMGszMmhtaTBiNmdiaTA2LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiMzI5NDMyOTYwOTg1LTBmMG9qMnFiaDNncDBtYmdyMGszMmhtaTBiNmdiaTA2LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTAxOTc0Mzc2NzE2NTIzMjg5NzQ5IiwiZW1haWwiOiJiZW5qYW1pbnRyZW5hc0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6ImRxVTQ3UVdaNDhTTlIxS3JhelkxQkEiLCJuYmYiOjE3MTc0MTUzOTIsIm5hbWUiOiJCZW5qaSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLY2NsaU04b2VJVkNnUXhlLVB6VDFnQnkwaUQtTTV1WHpCWkVid055OU83bUJFbWwyTT1zOTYtYyIsImdpdmVuX25hbWUiOiJCZW5qaSIsImlhdCI6MTcxNzQxNTY5MiwiZXhwIjoxNzE3NDE5MjkyLCJqdGkiOiI0ODRmMzcyNzQ1ZWRlYzE0M2U1OGM0Y2RmODA0MDRiZTQ1NDliYTc4In0.d-FDBKbOyyAf9KofprXafFvs2VN6lu_IFps74xIvpL02kltJ1TEGhkT7pB4HuhP65kWU28yEuxoKcEBHVnwAJAECDQvRd-jETyR5C8gf8PBSAr8PNYcbG0YLJYw3m0Gnv4A4pB2lhz-aGHBvbCr9w5KG2p5NfQIPoprZ-oF67X9E03msj1GO1ZJHIu-AqJk7hViC2C8ZJvepSOF_rS6AuyUfpIZyHWRRQetvzT7tWJVsf3ElEDo80q8mTGj1avF37wMgy6CYPuu_QbDN9UAgg_3f5sQ70gLsoFm0ccY4Dn9heU4k6_P_IddwDaUHvUxA97NGqrs3IFGy6qP76zxwFw",
        "refreshToken": ""
    }
  };

  public vehicles: Vehicle[] = [
    {
      typeOfVehicle: "4W",
      brandOrModel: "Toyota Corolla",
      carRegistration: "ABC1234",
      dateOfBuy: '2021-03-15',
      kmOfBuy: "20000",
      typeOfFuel: "Petrol",
      insuranceCompany: "Allianz",
      insurancePolicy: "POL123456789",
      insuranceRenewalDate: "2024-03-15",
      roadsideAssistanceNumber: "18001234567",
      userId: "00000000000000000001",
      id: "veh123"
    },
    {
      typeOfVehicle: "2W",
      brandOrModel: "Yamaha YZF-R3",
      carRegistration: "XYZ5678",
      dateOfBuy: '2019-07-22',
      kmOfBuy: "5000",
      typeOfFuel: "Petrol",
      insuranceCompany: "Geico",
      insurancePolicy: "POL987654321",
      insuranceRenewalDate: "2023-07-22",
      roadsideAssistanceNumber: "18007654321",
      userId: "00000000000000000001",
      id: "veh456"
    },
    {
      typeOfVehicle: "4W",
      brandOrModel: "Ford F-150",
      carRegistration: "LMN3456",
      dateOfBuy:'2020-10-10',
      kmOfBuy: "15000",
      typeOfFuel: "Diesel",
      insuranceCompany: "State Farm",
      insurancePolicy: "POL112233445",
      insuranceRenewalDate: "2023-10-10",
      roadsideAssistanceNumber: "18009876543",
      userId: "00000000000000000001",
      id: "veh789"
    }
  ];

  public events: Event[] = [
    {
        id: "event001",
        vehicleId: "veh123",
        date: "2022-01-10",
        type: "Maintenance",
        km: "25000",
        cost: 150,
        info: "Oil change and tire rotation",
        images: ["https://via.placeholder.com/150"]
    },
    {
        id: "event002",
        vehicleId: "veh456",
        date: "2021-08-05",
        type: "Accident",
        km: "6000",
        cost: 1200,
        info: "Minor collision repair",
        images: []
    }
  ];


  async createTestreminders(reminderArray:LocalNotificationSchema[]):Promise<LocalNotificationSchema[]>{
    for (let index = 0; index < 3; index++) {
      const reminder:LocalNotificationSchema = {
        channelId:"VCC",
        title:"test - "+index,
        body:"this is a not real notification, number "+index,
        largeBody:"this is a largueBody not real notification, number "+index,
        summaryText:"this is a summaryText, not real notification, number "+index,
        id:index,
        schedule: {at: new Date((new Date().getTime() + index * 60 * 1000))},
        extra:{
          vehicleId:"veh123",
          userId:"000000000000000000001",
          titleWithoutCar:"test - "+index
        }
      }
      reminderArray.push(reminder);
    };
    return reminderArray
  }



}





