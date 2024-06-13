import { Injectable } from "@angular/core";
import { trigger, transition, style, animate, keyframes } from '@angular/animations';


@Injectable({
    providedIn:'root'
})


export class AnimationService{}



export const MainAnimation = trigger('main', [
    transition(':enter', [
        style({ display: 'none' }),
        animate('300ms 300ms', keyframes([
        style({ transform: 'rotateY(-90deg)', display: 'block', opacity: 0, offset: 0 }),
        style({ transform: 'rotateY(0deg)', opacity: 1, offset: 1 }),
        ])),
    ]),
    transition(':leave', [
        animate('300ms', keyframes([
        style({ transform: 'rotateY(0deg)', opacity: 1, offset: 0 }),
        style({ transform: 'rotateY(90deg)', opacity: 0, offset: 1 }),
        ])),
    ]),
    ]);


export const RoadAnimation = trigger('road', [
        transition(':enter', [
        style({ display:'none'}),
        animate('300ms 300ms', keyframes([
            style({ transform: 'rotateY(-90deg) rotate(0deg)', display:'block', opacity: 0, offset: 0 }),
            style({ transform: 'rotateY(0deg) rotate(deg)', opacity: 1, offset: 1 }),
        ])),
        ]),
        transition(':leave', [
        animate('300ms', keyframes([
            style({ transform: 'rotateY(0deg) rotate(14deg)', opacity: 1, offset: 0 }),
            style({ transform: 'rotateY(90deg) rotate(14deg)', opacity: 0, offset: 1 }),
        ])),
        ]),
    ]);


export const SecondaryAnimation = trigger('secondary', [
        transition(':enter', [
        style({ display:'none'}),
        animate('300ms 300ms', keyframes([
            style({ transform: 'rotateY(-90deg)', display:'block', opacity: 0, offset: 0 }),
            style({ transform: 'rotateY(0deg)', opacity: 1, offset: 1 }),
        ])),
        ]),
        transition(':leave', [
        animate('300ms', keyframes([
            style({ transform: 'rotateY(0deg)', opacity: 1, offset: 0 }),
            style({ transform: 'rotateY(90deg)', opacity: 0, offset: 1 }),
        ])),
        ]),
    ]);
