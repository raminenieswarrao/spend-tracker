import {
  ComponentFixture,
TestBed
} from '@angular/core/testing';

import {
SpendingAnalyticsComponent
} from './spending-analytics.component';


describe(
  'SpendingAnalyticsComponent',
  () => {

    let component:
      SpendingAnalyticsComponent;

    let fixture:
      ComponentFixture<
        SpendingAnalyticsComponent
      >;


    beforeEach(
      async () => {

        await TestBed
          .configureTestingModule({
            imports: [
              SpendingAnalyticsComponent
            ]
          })
          .compileComponents();

        fixture =
          TestBed.createComponent(
            SpendingAnalyticsComponent
          );

        component =
          fixture.componentInstance;

        fixture.detectChanges();
      }
    );


    it(
      'should create',
      () => {

        expect(
          component
        ).toBeTruthy();
      }
    );
  }
);
