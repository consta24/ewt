import { trigger, state, style, transition, animate } from '@angular/animations';

export const expandFadeAnimation = trigger('expandFadeAnimation', [
  state(
    'collapsed',
    style({
      height: '0px',
      overflow: 'hidden',
      opacity: 0,
    })
  ),
  state(
    'expanded',
    style({
      height: '*',
      overflow: 'visible',
      opacity: 1,
    })
  ),
  transition('collapsed => expanded', [animate('200ms ease-in', style({ height: '*' })), animate('400ms ease-in', style({ opacity: 1 }))]),
  transition('expanded => collapsed', [
    animate('400ms ease-out', style({ opacity: 0 })),
    animate('200ms ease-out', style({ height: '0px' })),
  ]),
]);
