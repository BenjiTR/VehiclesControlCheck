import { Injectable } from "@angular/core";

@Injectable({
  providedIn:'root',
})

export class UserTestService {

  public userCredential:any = {
    "email": "virtualBenji@virtual.com",
    "givenName": "Virtual Benji",
    "id": "00000000000000000001",
    //Junto con la imagen, cambiar el tipo de autenticación a google o email
    //"imageUrl": "https://lh3.googleusercontent.com/a/ACg8ocKccliM8oeIVCgQxe-PzT1gBy0iD-M5uXzBZEbwNy9O7mBEml2M=s96-c",
    "imageUrl": "",
    "name": "Virtual Benji",
    "authentication": {
        "accessToken": "ya29.a0AXooCgsbAJ18BqrX4ptJDkZE82NEFxVOtUOkLme_Hj-6oaga71w14oomfg_fmC3dMHSIpe-f6qt3V6FMULIP_bp8U9xRPHbQ27gC_e8j2s9OqKNdmSxz_3L4QoKSNcQseewNShqKXh96VFtFtraFADm6Y_W1tdAebPYOaCgYKAfcSARISFQHGX2MiGwB4WQgw4JJBxCl0iMH55w0171",
        "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjY3NGRiYmE4ZmFlZTY5YWNhZTFiYzFiZTE5MDQ1MzY3OGY0NzI4MDMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiMzI5NDMyOTYwOTg1LTBmMG9qMnFiaDNncDBtYmdyMGszMmhtaTBiNmdiaTA2LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiMzI5NDMyOTYwOTg1LTBmMG9qMnFiaDNncDBtYmdyMGszMmhtaTBiNmdiaTA2LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTAxOTc0Mzc2NzE2NTIzMjg5NzQ5IiwiZW1haWwiOiJiZW5qYW1pbnRyZW5hc0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6ImRxVTQ3UVdaNDhTTlIxS3JhelkxQkEiLCJuYmYiOjE3MTc0MTUzOTIsIm5hbWUiOiJCZW5qaSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLY2NsaU04b2VJVkNnUXhlLVB6VDFnQnkwaUQtTTV1WHpCWkVid055OU83bUJFbWwyTT1zOTYtYyIsImdpdmVuX25hbWUiOiJCZW5qaSIsImlhdCI6MTcxNzQxNTY5MiwiZXhwIjoxNzE3NDE5MjkyLCJqdGkiOiI0ODRmMzcyNzQ1ZWRlYzE0M2U1OGM0Y2RmODA0MDRiZTQ1NDliYTc4In0.d-FDBKbOyyAf9KofprXafFvs2VN6lu_IFps74xIvpL02kltJ1TEGhkT7pB4HuhP65kWU28yEuxoKcEBHVnwAJAECDQvRd-jETyR5C8gf8PBSAr8PNYcbG0YLJYw3m0Gnv4A4pB2lhz-aGHBvbCr9w5KG2p5NfQIPoprZ-oF67X9E03msj1GO1ZJHIu-AqJk7hViC2C8ZJvepSOF_rS6AuyUfpIZyHWRRQetvzT7tWJVsf3ElEDo80q8mTGj1avF37wMgy6CYPuu_QbDN9UAgg_3f5sQ70gLsoFm0ccY4Dn9heU4k6_P_IddwDaUHvUxA97NGqrs3IFGy6qP76zxwFw",
        "refreshToken": ""
    }
};


}
