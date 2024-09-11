import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
  providers: [DatePipe],
})
export class AppComponent {
  constructor() {
    this.blockScreen();
  }

  async blockScreen(){
    await ScreenOrientation.lock({ orientation: 'portrait' });
  }
}
