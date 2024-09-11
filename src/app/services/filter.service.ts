import { inject, Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Event } from '../models/event.model';
import { EventTypes } from '../const/eventTypes';
import { SessionService } from './session.service';

@Injectable({
  providedIn:'root',
})


export class FilterService{

  public eventTypes:any;
  public eventsArray:Event[]=[];

  constructor(
    private datePipe: DatePipe,
    private etypes:EventTypes,
    private _session:SessionService
  ) {
    this.eventTypes = etypes.getEventTypes();
    this.eventsArray = this._session.eventsArray;
  }

  //FILTRO POR PALABRAS O FECHA ESCRITA
  matchesFilter(event: any, filter: string): boolean {
    // Convertimos el filtro a minúsculas para la comparación
    const lowerCaseFilter = filter.toLowerCase();

    for (const key in event) {
      if (event.hasOwnProperty(key) && key !== 'images') {
        let value;
        if (key === 'date') {
          value = this.datePipe.transform(event[key], 'dd/MM/yyyy');
        } else if (key === 'type') {
          value = this.getTranslatedType(event[key]);
        } else {
          value = event[key].toString();
        }

        // Convertimos el valor a minúsculas para la comparación
        if (value && value.toLowerCase().includes(lowerCaseFilter)) {
          return true;
        }
      }
    }
    return false;
  }

  //APOYO PARA FILTRAR POR TIPO, ESCRIBIENDO EN INPUT
  getTranslatedType(type: string): string {
    const eventType = this.eventTypes.find((eventType: { name: string; }) => eventType.name === type);
    return eventType ? eventType.string : type;
  }

  //FILTRO POR FECHA
  correctDates(startDate:Date, endDate:Date): boolean {
    // Obtener el año y el mes para la fecha de inicio
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth();

    // Obtener el año y el mes para la fecha de fin
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();

    // Comparar los años primero
    if (startYear < endYear) {
      return true;
    } else if (startYear > endYear) {
      return false;
    }

    // Si los años son iguales, comparar los meses
    return startMonth <= endMonth;
  }

  //DEVUELVE LA FECHA MAS TEMPRANA DEL ARRAY DE EVENTOS
  async getFirstDate(eventsArray:Event[]):Promise<Date>{
    //Es la primera acción que requiere el array de eventos, por lo que lo refrescamos
    this.eventsArray = this._session.eventsArray;
    // Inicializa las fechas con el primer elemento del array
    let earliestDate = new Date();
    // Recorre el array para encontrar la fecha más temprana
    this.eventsArray.forEach(event => {
      const eventDate = new Date(event.date);
      if (eventDate < earliestDate) {
        earliestDate = eventDate;
      }
    });
    //Devuelve la mas temprana
    return earliestDate;
  }

  //DEVUELVE LA FECHA MAS TEMPRANA DEL ARRAY DE EVENTOS
  async getLastDate(eventsArray:Event[]):Promise<Date>{
    // Inicializa las fechas con el primer elemento del array
    let lastestDate = new Date();
    // Recorre el array para encontrar la fecha más temprana
    this.eventsArray.forEach(event => {
      const eventDate = new Date(event.date);
      if (eventDate > lastestDate) {
        lastestDate = eventDate;
      }
    });
    //Devuelve la mas temprana
    return lastestDate;
  }

  //DEVUELVE EL ARRAY FILTRADO
  async generateData(recivedStartDate:Date, recivedEndDate:Date, eventsArray:Event[], filter:string, types:string[]): Promise<Event[]> {
    // Asegúrate de que `startDate` y `endDate` sean Date y no estén en formato incorrecto
    const startDate = new Date(recivedStartDate);
    const endDate = new Date(recivedEndDate);

    // Ajustar la fecha de inicio al primer día del mes
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    // Ajustar la fecha de fin al último día del mes
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);
    endDate.setHours(23, 59, 59, 999);

    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();

    let filteredEventsArray;

    // Filtrar el array de eventos
    filteredEventsArray = eventsArray.filter(event => {
      const eventDate = new Date(event.date).getTime();
      const eventType = event.type;

      // Comprobar si la fecha del evento está dentro del rango
      const isDateInRange = eventDate >= startTimestamp && eventDate <= endTimestamp;

      // Comprobar si el tipo de evento está en el array de tipos permitidos
      const isTypeValid = types.includes(eventType);

    // Comprobar si el evento coincide con el filtro de texto
    const isTextMatch = this.matchesFilter(event, filter);

    // Retornar true solo si todas las condiciones son válidas
    return isDateInRange && isTypeValid && isTextMatch;

    });
    return filteredEventsArray;
  }

}
