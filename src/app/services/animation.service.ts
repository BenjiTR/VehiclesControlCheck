import { Injectable } from "@angular/core";
import { trigger, transition, style, animate, keyframes, query } from '@angular/animations';


@Injectable({
    providedIn:'root'
})


export class AnimationService{}



export const MainAnimation = trigger('main', [
    transition(':enter', [
        style({ display: 'none' }),
        animate('150ms 150ms', keyframes([
        style({ transform: 'rotateY(-90deg)', display: 'block', opacity: 0, offset: 0 }),
        style({ transform: 'rotateY(0deg)', opacity: 1, offset: 1 }),
        ])),
    ]),
    transition(':leave', [
        animate('150ms', keyframes([
        style({ transform: 'rotateY(0deg)', opacity: 1, offset: 0 }),
        style({ transform: 'rotateY(90deg)', opacity: 0, offset: 1 }),
        ])),
    ]),
    ]);


export const RoadAnimation = trigger('road', [
        transition(':enter', [
        style({ display:'none'}),
        animate('150ms 150ms', keyframes([
            style({ transform: 'rotateY(-90deg) rotate(0deg)', display:'block', opacity: 0, offset: 0 }),
            style({ transform: 'rotateY(0deg) rotate(deg)', opacity: 1, offset: 1 }),
        ])),
        ]),
        transition(':leave', [
        animate('150ms', keyframes([
            style({ transform: 'rotateY(0deg) rotate(14deg)', opacity: 1, offset: 0 }),
            style({ transform: 'rotateY(90deg) rotate(14deg)', opacity: 0, offset: 1 }),
        ])),
        ]),
    ]);


export const SecondaryAnimation = trigger('secondary', [
        transition(':enter', [
        style({ display:'none'}),
        animate('150ms 150ms', keyframes([
            style({ transform: 'rotateY(-90deg)', display:'block', opacity: 0, offset: 0 }),
            style({ transform: 'rotateY(0deg)', opacity: 1, offset: 1 }),
        ])),
        ]),
        transition(':leave', [
        animate('150ms', keyframes([
            style({ transform: 'rotateY(0deg)', opacity: 1, offset: 0 }),
            style({ transform: 'rotateY(90deg)', opacity: 0, offset: 1 }),
        ])),
        ]),
    ]);

    export const GrowShrinkAnimation = trigger('growShrink', [
      transition(':enter', [
        style({ width: '0%', overflow: 'hidden' }),
        animate('150ms ease-in', keyframes([
          style({ width: '0%', offset: 0 }),
          style({ width: '100%', offset: 1 }),
        ])),
      ]),
      transition(':leave', [
        animate('150ms ease-out', keyframes([
          style({ width: '100%', offset: 0 }),
          style({ width: '0%', offset: 1 }),
        ])),
      ]),
    ]);

    export const slideInOutAnimation = trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }), // Inicia fuera de la vista (a la izquierda)
        animate('150ms ease-in',
          style({ transform: 'translateX(0)', opacity: 1 }) // Se desplaza hacia su posición normal
        )
      ]),
      transition(':leave', [
        animate('150ms ease-out',
          style({ transform: 'translateX(-100%)', opacity: 0 }) // Se desplaza hacia la izquierda y desaparece
        )
      ])
    ]);

    export const SlideUpDownAnimation = trigger('slideUpDown', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)', opacity: 0 }), // Empieza desplazado hacia arriba
        animate('150ms ease-in', keyframes([
          style({ transform: 'translateY(-100%)', opacity: 0, offset: 0 }), // Fuera de la vista al inicio
          style({ transform: 'translateY(0)', opacity: 1, offset: 1 }) // Desplaza hacia su posición original
        ]))
      ]),
      transition(':leave', [
        animate('150ms ease-out', keyframes([
          style({ transform: 'translateY(0)', opacity: 1, offset: 0 }), // Posición original
          style({ transform: 'translateY(-100%)', opacity: 0, offset: 1 }) // Desplaza hacia arriba y desaparece
        ]))
      ])
    ]);

