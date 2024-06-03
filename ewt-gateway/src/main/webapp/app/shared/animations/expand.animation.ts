import { trigger, state, style, transition, animate } from '@angular/animations';

export const expandAnimation = trigger('expandAnimation', [
  state(
    'collapsed',
    style({
      height: '0px',
      overflow: 'hidden',
    })
  ),
  state(
    'expanded',
    style({
      height: '*',
      overflow: 'visible',
    })
  ),
  transition('collapsed => expanded', animate('500ms 100ms cubic-bezier(0.4, 0, 0.2, 1)')),
  transition('expanded => collapsed', animate('500ms 100ms cubic-bezier(0.4, 0, 0.2, 1)')),
]);
