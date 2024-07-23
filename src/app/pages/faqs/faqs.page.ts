import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonAccordionGroup, IonAccordion, IonItem, IonLabel } from '@ionic/angular/standalone';
import { PaddingService } from 'src/app/services/padding.service';

@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.page.html',
  styleUrls: ['./faqs.page.scss'],
  standalone: true,
  imports: [IonLabel, IonItem, IonAccordion, IonAccordionGroup, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class FaqsPage implements OnInit {

  constructor(
    private _paddingService:PaddingService
  ) { }

  ngOnInit() {
    console.log();
  }

  calculatePadding(){
    return this._paddingService.calculatePadding();
  }


}
