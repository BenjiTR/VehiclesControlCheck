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
      brandOrModel: "Vehículo 1",
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
      brandOrModel: "Motocicleta 1",
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
      brandOrModel: "Vehículo 2",
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
    },
  {
      id: "event003",
      vehicleId: "veh789",
      date: "2023-05-18",
      type: "Maintenance",
      km: "20000",
      cost: 300,
      info: "Brake pads replacement",
      images: ["https://via.placeholder.com/150", "https://via.placeholder.com/150"]
  },
  {
      id: "event004",
      vehicleId: "veh123",
      date: "2023-11-12",
      type: "Inspection",
      km: "30000",
      cost: 75,
      info: "Annual vehicle inspection",
      images: []
  },
  {
      id: "event005",
      vehicleId: "veh456",
      date: "2022-06-25",
      type: "Maintenance",
      km: "10000",
      cost: 100,
      info: "Chain adjustment and lubrication",
      images: ["https://via.placeholder.com/150"]
  },
  {
      id: "event006",
      vehicleId: "veh789",
      date: "2021-12-01",
      type: "Accident",
      km: "18000",
      cost: 2000,
      info: "Front bumper replacement",
      images: []
  },
  {
      id: "event007",
      vehicleId: "veh123",
      date: "2023-02-14",
      type: "Maintenance",
      km: "27000",
      cost: 200,
      info: "Battery replacement",
      images: ["https://via.placeholder.com/150"]
  },
  {
      id: "event008",
      vehicleId: "veh456",
      date: "2020-11-30",
      type: "Maintenance",
      km: "3000",
      cost: 50,
      info: "Spark plug replacement",
      images: []
  },
  {
      id: "event009",
      vehicleId: "veh789",
      date: "2022-07-10",
      type: "Maintenance",
      km: "21000",
      cost: 250,
      info: "Air filter replacement",
      images: ["https://via.placeholder.com/150"]
  },
  {
      id: "event010",
      vehicleId: "veh123",
      date: "2024-03-09",
      type: "Accident",
      km: "32000",
      cost: 1700,
      info: "Rear-end collision repair",
      images: []
  },
  {
      id: "event011",
      vehicleId: "veh456",
      date: "2023-01-15",
      type: "Maintenance",
      km: "8000",
      cost: 80,
      info: "Brake fluid replacement",
      images: ["https://via.placeholder.com/150"]
  },
  {
      id: "event012",
      vehicleId: "veh789",
      date: "2023-09-20",
      type: "Inspection",
      km: "23000",
      cost: 100,
      info: "Emission test",
      images: []
  },
  {
      id: "event013",
      vehicleId: "veh123",
      date: "2021-04-18",
      type: "Maintenance",
      km: "22000",
      cost: 160,
      info: "Tire replacement",
      images: ["https://via.placeholder.com/150"]
  },
  {
      id: "event014",
      vehicleId: "veh456",
      date: "2022-09-05",
      type: "Maintenance",
      km: "7000",
      cost: 90,
      info: "Coolant replacement",
      images: []
  },
  {
      id: "event015",
      vehicleId: "veh789",
      date: "2022-12-30",
      type: "Maintenance",
      km: "25000",
      cost: 180,
      info: "Transmission fluid replacement",
      images: ["https://via.placeholder.com/150"]
  },
  {
      id: "event016",
      vehicleId: "veh123",
      date: "2023-06-22",
      type: "Maintenance",
      km: "28000",
      cost: 140,
      info: "Alignment and balancing",
      images: []
  },
  {
      id: "event017",
      vehicleId: "veh456",
      date: "2023-10-10",
      type: "Accident",
      km: "12000",
      cost: 500,
      info: "Side panel replacement",
      images: ["https://via.placeholder.com/150"]
  },
  {
      id: "event018",
      vehicleId: "veh789",
      date: "2021-07-04",
      type: "Maintenance",
      km: "16000",
      cost: 200,
      info: "Wheel alignment",
      images: []
  },
  {
      id: "event019",
      vehicleId: "veh123",
      date: "2022-05-11",
      type: "Maintenance",
      km: "26000",
      cost: 220,
      info: "Fuel injector cleaning",
      images: ["https://via.placeholder.com/150"]
  },
  {
      id: "event020",
      vehicleId: "veh456",
      date: "2021-03-22",
      type: "Inspection",
      km: "9000",
      cost: 60,
      info: "Safety inspection",
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





