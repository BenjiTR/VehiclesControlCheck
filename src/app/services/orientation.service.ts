import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ScreenOrientation, ScreenOrientationResult } from '@capacitor/screen-orientation';

@Injectable({
  providedIn: 'root'
})
export class ScreenOrientationService {
  private orientationChangeSubject = new Subject<ScreenOrientationResult>();

  constructor() {
    this.initializeOrientationListener();
  }

  private async initializeOrientationListener() {
    // Add listener for screen orientation changes
    await ScreenOrientation.addListener('screenOrientationChange', (orientation: ScreenOrientationResult) => {
      this.orientationChangeSubject.next(orientation);
    });
  }

  // Expose an observable to subscribe to orientation changes
  get orientationChange$(): Observable<ScreenOrientationResult> {
    return this.orientationChangeSubject.asObservable();
  }
}
