import { RouterModule } from '@angular/router';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonRow, IonCol, IonLabel, IonButton, IonIcon, IonDatetimeButton, IonModal, IonDatetime, IonItem, IonSelect, IonSelectOption, IonItemDivider, IonInput, IonAccordion, IonAccordionGroup } from '@ionic/angular/standalone';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { PaddingService } from 'src/app/services/padding.service';
import { TranslationConfigService } from 'src/app/services/translation.service';
import { Vehicle } from 'src/app/models/vehicles.model';
import { Event } from 'src/app/models/event.model';
import { UserTestService } from 'src/app/services/user-test.service';
import { EventTypes } from 'src/app/const/eventTypes';
import { BarController, BarElement, CategoryScale, Chart, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { AlertService } from 'src/app/services/alert.service';
import { SessionService } from 'src/app/services/session.service';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { ScreenOrientationService } from '../../services/orientation.service'
import { DataService } from 'src/app/services/data.service';
import { FileSystemService } from 'src/app/services/filesystem.service';
import { FilterService } from 'src/app/services/filter.service';

@Component({
  selector: 'app-data',
  templateUrl: './data.page.html',
  styleUrls: ['./data.page.scss'],
  standalone: true,
  providers:[EventTypes, DatePipe, FilterService],
  imports: [IonAccordionGroup, IonAccordion, IonInput, RouterModule, IonItemDivider, IonSelect, IonSelectOption, IonItem, CommonModule, FormsModule, IonDatetime, IonModal, IonDatetimeButton, TranslateModule, IonIcon, IonButton, IonLabel, IonCol, IonRow, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class DataPage implements OnInit {

  public vehiclesArray:Vehicle[] = [];
  public eventsArray:Event[] = [];
  public filteredArray:Event[] = [];
  public startDate:Date = new Date;
  public endDate:Date = new Date;
  public types:string[] = [];
  public eventTypes:any;
  public chart: Chart | undefined;
  private charts: { [key: string]: Chart } = {};
  public filter:string = "";
  public portrait:boolean=true;
  public currency:string ="";


  constructor(
    private _paddingService:PaddingService,
    private translate:TranslateService,
    private _translation:TranslationConfigService,
    private _session:SessionService,
    private etypes:EventTypes,
    private _alert:AlertService,
    private datePipe: DatePipe,
    private screenOrientationService: ScreenOrientationService,
    private _data:DataService,
    private _file:FileSystemService,
    private _filter:FilterService
  ) {
    this.types = this.etypes.getTypes();
    this.eventTypes = etypes.getEventTypes();
    this.screenOrientationService.orientationChange$.subscribe(orientation => {
      if(orientation.type === "landscape-primary" || orientation.type === "landscape-secondary"){
        this.portrait=false;
      }else{
        this.portrait=true;
      }
    });
    this.currency = this._session.currency;
  }

  async ngOnInit() {
    this.vehiclesArray = this._session.vehiclesArray;
    this.eventsArray = this._session.eventsArray;
    this.translate.setDefaultLang(this._translation.getLanguage());
    await this.calculateDates();
    await this.generateData();
    this.startCharts();
  }

  ionViewWillEnter() {
    //ScreenOrientation.unlock();
  }
  ionViewWillLeave() {
    //ScreenOrientation.lock({ orientation: 'portrait' });
  }





  //CHARTS
  async startCharts(): Promise<void> {
    Chart.register(CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip, Legend);
    await this.updateCharts();
  }

  async generateChartData(): Promise<void> {
    await this.updateCharts();
  }

  async updateCharts(): Promise<void> {

    if(!this.correctDates()){
      this._alert.createAlert(this.translate.instant('data.imposible_to_generate'),this.translate.instant('data.start_date_menor'))
    }else{

      Object.values(this.charts).forEach(chart => chart.destroy());
      this.charts = {};

      await this.generateData();

      for (let i = 0; i < this.vehiclesArray.length; i++) {
        const vehicle = this.vehiclesArray[i];
        await this.createChart(vehicle, i);
      }
    }
  }

  private async createChart(vehicle: Vehicle, index: number): Promise<void> {
    const canvasId = 'canvas-' + index;
    const ctx = (document.getElementById(canvasId) as HTMLCanvasElement)?.getContext('2d');

    const costCanvasId = 'cost-canvas-' + index;
    const costCtx = (document.getElementById(costCanvasId) as HTMLCanvasElement)?.getContext('2d');

    if (ctx && costCtx) {
      if (this.charts[canvasId]) {
        this.charts[canvasId].destroy();
      }
      if (this.charts[costCanvasId]) {
        this.charts[costCanvasId].destroy();
      }

      const newChart = new Chart(ctx, {
        type: 'bar',
        data: await this.generateDataForVehicle(vehicle),
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                title: (tooltipItems) => {
                  const datapoint = tooltipItems[0].raw as { y: number };
                  const quantity = datapoint.y;
                  return this.translate.instant('data.quantity', { value: quantity });
                },
                label: () => '', // Esto elimina la etiqueta predeterminada
                afterBody: (tooltipItems) => {
                  const dataItem = tooltipItems[0];
                  const clickedData: any = dataItem.raw;

                  if (clickedData.events && clickedData.events.length > 0) {
                    return clickedData.events.map((event: Event) => {
                      const eventType = this.eventTypes.find((type: { name: string; }) => type.name === event.type);
                      const translatedType = eventType ? eventType.string : event.type;

                      return `${this.translate.instant('event.date')}: ${event.date}\n` +
                             `${this.translate.instant('event.type')}: ${translatedType}\n` +
                             `${this.translate.instant('event.aditional_info')}: ${event.info}\n` +
                             `${this.translate.instant('event.cost')}: ${event.cost} ${this.currency}`;
                    }).join('\n\n');
                  }
                },
              },
            },
            title: {
              text: vehicle.brandOrModel,
              display: false,
            }
          },
          scales: {
            x: {
              title: {
                display: false,
                text: 'Month',
              },
            },
            y: {
              title: {
                display: true,
                text: this.translate.instant('data.n_of_events'),
              },
            },
          },
        },
      });

      const costChart = new Chart(costCtx, {
        type: 'bar',
        data: await this.generateCostDataForVehicle(vehicle),
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false,
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: (tooltipItem) => {
                  const cost = tooltipItem.raw;
                  const translatedText = this.translate.instant('data.cost€', { value: cost, currency: this._session.currency });
                  return translatedText;
                }
              },
            },
            title: {
              text: 'Total Costs',
              display: false,
            }
          },
          scales: {
            x: {
              title: {
                display: false,
                text: 'Month',
              },
            },
            y: {
              title: {
                display: true,
                text: this.translate.instant('data.month_cost'),
              },
            },
          },
        },
      });

      this.charts[canvasId] = newChart;
      this.charts[costCanvasId] = costChart;
    }
  }


  async generateDataForVehicle(vehicle: Vehicle): Promise<any> {
    // Filtra los eventos para el vehículo específico
    const vehicleEvents = this.filteredArray.filter(event => event.vehicleId === vehicle.id);

    // Obtén las etiquetas únicas basadas en los eventos del vehículo
    const labels = this.getUniqueLabelsForVehicle(vehicleEvents);

    // Genera los conjuntos de datos para el vehículo
    const datasets = await this.generateDataSetsForVehicle(vehicle, vehicleEvents);

    return {
      labels: labels,
      datasets: datasets,
    };
  }


  private getUniqueLabelsForVehicle(vehicleEvents: Event[]): string[] {
    const labelsSet = new Set<string>();
    vehicleEvents.forEach(event => {
      const label = this.formatDate(event.date);
      labelsSet.add(label);
    });
    return Array.from(labelsSet).sort((a, b) => {
      const [monthA, yearA] = a.split('-').map(Number);
      const [monthB, yearB] = b.split('-').map(Number);

      // Primero comparar años, luego meses
      if (yearA === yearB) {
        return monthA - monthB;
      } else {
        return yearA - yearB;
      }
    });
  }

  async generateDataSetsForVehicle(vehicle: Vehicle, vehicleEvents: Event[]): Promise<any[]> {
    const datasets: any[] = [];
    const groupedData: any = this.groupByTypeAndMonth(vehicleEvents);

    const labels = this.getUniqueLabelsForVehicle(vehicleEvents);

    for (const [type, monthlyData] of Object.entries(groupedData)) {
      const eventType = this.eventTypes.find((typeObj: { name: string; }) => typeObj.name === type);
      const translatedType = eventType ? this.translate.instant(eventType.string) : type;

      const data = labels.map(label => {
        const eventsForLabel: Event[] = (monthlyData as any)[label] || [];
        return {
          x: label,
          y: eventsForLabel.length,
          events: eventsForLabel
        };
      });

      datasets.push({
        label: translatedType,
        data: data,
        borderColor: this.getColor(type),
        backgroundColor: this.getColor(type, 1),
      });
    }

    return datasets;
  }


  private groupByTypeAndMonth(events: Event[]): any {
    const result: any = {};

    events.forEach(event => {
      const { type, date } = event;
      const monthYear = this.formatDate(date);

      if (!result[type]) {
        result[type] = {};
      }

      if (!result[type][monthYear]) {
        result[type][monthYear] = [];
      }

      result[type][monthYear].push(event);
    });

    return result;
  }

  private formatDate(date: string): string {
    const [month, year] = date.split('-');
    return `${year}-${month}`;
  }

  private getUniqueLabels(): string[] {
    const labelsSet = new Set<string>();
    this.filteredArray.forEach(event => {
      const label = this.formatDate(event.date);
      labelsSet.add(label);
    });
    return Array.from(labelsSet).sort((a, b) => {
      const [monthA, yearA] = a.split('-').map(Number);
      const [monthB, yearB] = b.split('-').map(Number);

      // Primero comparar años, luego meses
      if (yearA === yearB) {
        return monthA - monthB;
      } else {
        return yearA - yearB;
      }
    });
  }

  private getColor(type: string, alpha: number = 1): string {
    const colors: any = {
      'Flat tire': `rgba(255, 205, 86, ${alpha})`,    // Amarillo suave
      'Repair': `rgba(153, 102, 255, ${alpha})`,      // Lila
      'Inspection': `rgba(54, 162, 235, ${alpha})`,   // Azul
      'Refueling': `rgba(75, 192, 192, ${alpha})`,    // Verde aqua
      'Maintenance': `rgba(255, 159, 64, ${alpha})`,  // Naranja
      'Accident': `rgba(255, 99, 132, ${alpha})`,     // Rosa
      'Others': `rgba(201, 203, 207, ${alpha})`       // Gris claro
    };
    return colors[type] || `rgba(0, 0, 0, ${alpha})`;
  }

  async generateCostDataForVehicle(vehicle: Vehicle): Promise<any> {
    // Filtra los eventos para el vehículo específico y dentro del rango de fechas
    const vehicleEvents = this.filteredArray.filter(event => event.vehicleId === vehicle.id);
    const monthlyCosts: { [key: string]: number } = {};

    // Calcula el costo mensual de los eventos filtrados
    vehicleEvents.forEach(event => {
      const monthYear = this.formatDate(event.date);
      if (!monthlyCosts[monthYear]) {
        monthlyCosts[monthYear] = 0;
      }
      monthlyCosts[monthYear] += event.cost;
    });

    // Obtén las etiquetas utilizando la misma lógica de ordenación que en la gráfica de datos
    const labels = this.getUniqueLabelsForVehicle(vehicleEvents);

    // Obtén los datos de costes de forma ordenada
    const monthlyData = labels.map(label => monthlyCosts[label] || 0);

    // Conjunto de datos para el gráfico de costos
    const set = {
      label: 'Cost of Events',
      data: monthlyData,
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 1)',
    };

    return {
      labels: labels,
      datasets: [set]
    };
  }


  //TOTALES
  // Calcular el total de eventos para un vehículo específico
  totalEvents(vehicle: Vehicle): number {
    return this.filteredArray.filter(event => event.vehicleId === vehicle.id).length;
  }

  // Calcular el total de costo para un vehículo específico
  totalCost(vehicle: Vehicle): number {
    return this.filteredArray
      .filter(event => event.vehicleId === vehicle.id)
      .reduce((sum, event) => {
        // Asegúrate de que event.cost es una cadena que puede convertirse en número
        const cost = typeof event.cost === 'string' ? parseFloat(event.cost) : Number(event.cost);
        return sum + (isNaN(cost) ? 0 : cost);
      }, 0);
  }



  async exportData() {
    const data = await this._data.buildCsvData(this.eventTypes);
    //console.log(data)
    await this._file.exportToCSV(data)
    .then(async ()=>{
      await this._alert.createAlert(this.translate.instant('alert.file_created'),this.translate.instant('alert.file_created_text_csv'));
    })
    .catch(async (e)=>{
     //console.log('error:'+e);
      await this._alert.createAlert(this.translate.instant("error.an_error_ocurred"), this.translate.instant("error.file_notcreated_text_csv"))
    })
  }


  //FILTROS
  //BORRAR FILTROS
  eraseFilter(){
    this.filter = "";
    const fakeEvent = { detail: { value: '' } };
  }

  //FILTRO POR PALABRAS O FECHA ESCRITA
  matchesFilter(event: any, filter: string): boolean {
    return this._filter.matchesFilter(event, filter)
  }

  //DEVUELVE EL ARRAY FILTRADO
  async generateData(): Promise<void> {
    this.filteredArray = await this._filter.generateData(this.startDate, this.endDate, this.eventsArray, this.filter, this.types);
  }


    //CAMBIAR FECHAS
  changeDate(property:String, event:CustomEvent){
    const newValue = new Date(event.detail.value);
    if (property === 'startDate') {
      this.startDate = newValue;
    } else if (property === 'endDate') {
      this.endDate = newValue;
    }
  }

  async calculateDates():Promise<void>{
    this.startDate = await this._filter.getFirstDate(this.eventsArray);
    this.endDate = await this._filter.getLastDate(this.eventsArray);
    return;
    }

  //COMPROBAR QUE LA FECHA DE INICIO NO ES MAYOR QUE LA DE FINAL
  correctDates(): boolean {
    return this._filter.correctDates(this.startDate,this.endDate)
  }

  calculatePadding(){
    return this._paddingService.calculatePadding();
  }



}
