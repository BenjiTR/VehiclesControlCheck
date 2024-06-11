import { Injectable } from "@angular/core";

@Injectable({
  providedIn:'root'
})

export class PaddingService{

  private screenHeight = window.innerHeight;

  constructor() { }

  calculatePadding(): number {
    // Si la pantalla es menor que 680px de altura, aplicar un padding progresivo
    if (this.screenHeight < 680) {
      return (680 - this.screenHeight) * 0.5; // Ajusta el factor 0.1
    }
    // Si la pantalla es mayor o igual a 680px de altura, no aplicar padding extra
    return 0;
  }

}
