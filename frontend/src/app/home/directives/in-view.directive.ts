import {
  Directive,
ElementRef,
EventEmitter,
NgZone,
OnDestroy,
OnInit,
Output
} from '@angular/core';


@Directive({
selector: '[appInView]',
standalone: true
})
export class InViewDirective
implements OnInit, OnDestroy {

@Output()
readonly inViewChange =
new EventEmitter<boolean>();

private observer:
IntersectionObserver | null = null;

private currentState:
boolean | null = null;


constructor(
    private readonly elementRef:
      ElementRef<HTMLElement>,

    private readonly ngZone:
      NgZone
  ) {}


  ngOnInit(): void {

    this.observer =
      new IntersectionObserver(
        entries => {

          const entry =
            entries[0];

          if (!entry) {
            return;
          }

          /*
           * Consider the donut visible
           * once at least 20% of it
           * enters the viewport.
           *
           * This makes the animation
           * start slightly before the
           * whole chart is visible.
           */
          const isVisible =
            entry.isIntersecting &&
            entry.intersectionRatio >= 0.20;

          if (
            this.currentState ===
            isVisible
          ) {
            return;
          }

          this.currentState =
            isVisible;

          this.ngZone.run(
            () => {

              this.inViewChange.emit(
                isVisible
              );
            }
          );
        },
        {
          threshold: [
            0,
            0.20,
            0.50,
            0.80,
            1
          ]
        }
      );


    this.observer.observe(
      this.elementRef.nativeElement
    );
  }


  ngOnDestroy(): void {

    this.observer?.disconnect();

    this.observer = null;
  }
}
