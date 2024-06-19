import { Injectable } from "@angular/core";

@Injectable({
  providedIn:'root'
})

export class PaddingService{

  private screenHeight = window.innerHeight;

  constructor() { }

  calculatePadding(): number {


      return this.screenHeight * 0.1; // Ajusta el factor 0.1

  }

}
