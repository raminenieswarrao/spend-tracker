import {
  CommonModule
} from '@angular/common';

import {
Component,
Input,
OnChanges
} from '@angular/core';

import {
Expense
} from '../../../services/expense.service';

import {
InViewDirective
} from '../../directives/in-view.directive';

import {
calculateMerchantSummaries
} from '../../utils/expense-analytics.util';

import {
DonutSlice,
MerchantSpendSummary
} from '../../models/analytics.models';

import {
CategorySummary
} from '../../models/home.models';


@Component({
selector: 'app-spending-analytics',

standalone: true,

imports: [
CommonModule,
InViewDirective
],

templateUrl:
'./spending-analytics.component.html',

styleUrls: [
'./spending-analytics.component.scss'
]
})
export class SpendingAnalyticsComponent
implements OnChanges {

@Input()
expenses: Expense[] = [];

@Input()
categorySummaries:
CategorySummary[] = [];

@Input()
totalSpent = 0;

@Input()
periodLabel = '';

selectedCategoryValue:
string | null = null;

showAllMerchants = false;

donutInView = false;

readonly merchantPreviewLimit = 5;

private readonly donutRadius = 76;

private readonly donutStrokeWidth = 28;

private readonly donutCircumference =
2 *
Math.PI *
this.donutRadius;


ngOnChanges(): void {

    if (
      this.categorySummaries.length === 0
    ) {

      this.clearCategorySelection();

      return;
    }

    if (
      this.selectedCategoryValue
    ) {

      const selectedCategoryStillExists =
        this.categorySummaries.some(
          category =>
            category.value ===
            this.selectedCategoryValue
        );

      if (
        !selectedCategoryStillExists
      ) {

        this.clearCategorySelection();
      }
    }
  }


  onDonutVisibilityChange(
    visible: boolean
  ): void {

    /*
     * False resets the CSS animation.
     *
     * When the donut comes back into
     * the viewport, true is applied
     * again and the drawing animation
     * starts from the beginning.
     */
    this.donutInView =
      visible;

    if (!visible) {

      this.clearCategorySelection();
    }
  }


  selectCategory(
    category: string
  ): void {

    if (
      this.selectedCategoryValue ===
      category
    ) {
      return;
    }

    this.selectedCategoryValue =
      category;

    this.showAllMerchants =
      false;
  }


  clearCategorySelection(): void {

    this.selectedCategoryValue =
      null;

    this.showAllMerchants =
      false;
  }


  onAnalyticsPointerLeave(
    event: PointerEvent
  ): void {

    if (
      event.pointerType === 'mouse'
    ) {

      this.clearCategorySelection();
    }
  }


  onDonutPointerMove(
    event: PointerEvent
  ): void {

    if (
      event.pointerType !== 'mouse'
    ) {
      return;
    }

    this.selectCategoryFromPointer(
      event
    );
  }


  onDonutPointerDown(
    event: PointerEvent
  ): void {

    this.selectCategoryFromPointer(
      event
    );
  }


  toggleMerchantList(): void {

    this.showAllMerchants =
      !this.showAllMerchants;
  }


  get selectedCategory():
    CategorySummary | null {

    if (
      !this.selectedCategoryValue
    ) {
      return null;
    }

    return (
      this.categorySummaries.find(
        category =>
          category.value ===
          this.selectedCategoryValue
      ) ?? null
    );
  }


  get merchantSummaries():
    MerchantSpendSummary[] {

    if (
      !this.selectedCategoryValue
    ) {
      return [];
    }

    return calculateMerchantSummaries(
      this.expenses,
      this.selectedCategoryValue
    );
  }


  get visibleMerchantSummaries():
    MerchantSpendSummary[] {

    if (
      this.showAllMerchants
    ) {

      return this.merchantSummaries;
    }

    return this.merchantSummaries.slice(
      0,
      this.merchantPreviewLimit
    );
  }


  get hiddenMerchantCount(): number {

    return Math.max(
      this.merchantSummaries.length -
      this.merchantPreviewLimit,
      0
    );
  }


  get donutSlices():
    DonutSlice[] {

    let usedLength = 0;

    return this.categorySummaries.map(
      (
        category,
        index
      ) => {

        const sliceLength =
          (
            category.percentage /
            100
          ) *
          this.donutCircumference;

        const sliceGap =
          this.donutCircumference -
          sliceLength;

        const slice:
          DonutSlice = {

            value:
              category.value,

            label:
              category.label,

            color:
              category.color,

            amount:
              category.amount,

            percentage:
              category.percentage,

            dashArray:
              `${sliceLength} ${sliceGap}`,

            dashOffset:
              -usedLength,

            sliceLength,

            sliceGap,

            animationDelayMs:
              index * 110
          };

        usedLength +=
          sliceLength;

        return slice;
      }
    );
  }


  private selectCategoryFromPointer(
    event: PointerEvent
  ): void {

    const svg =
      event.currentTarget as
        SVGSVGElement;

    if (!svg) {
      return;
    }

    const rect =
      svg.getBoundingClientRect();

    if (
      rect.width <= 0 ||
      rect.height <= 0
    ) {
      return;
    }


    /*
     * Convert browser coordinates
     * into our SVG 200 x 200 viewBox.
     */

    const x =
      (
        (
          event.clientX -
          rect.left
        ) /
        rect.width
      ) * 200;

    const y =
      (
        (
          event.clientY -
          rect.top
        ) /
        rect.height
      ) * 200;


    const dx =
      x - 100;

    const dy =
      y - 100;


    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );


    const innerRadius =
      this.donutRadius -
      (
        this.donutStrokeWidth /
        2
      );

    const outerRadius =
      this.donutRadius +
      (
        this.donutStrokeWidth /
        2
      );


    /*
     * Only respond when the cursor
     * is actually on the donut ring.
     */

    if (
      distance < innerRadius ||
      distance > outerRadius
    ) {
      return;
    }


    /*
     * Calculate cursor angle.
     *
     * 0 degrees = right side.
     * Browser Y coordinates increase
     * downward, giving us clockwise
     * movement.
     */

    let angle =
      Math.atan2(
        dy,
        dx
      ) *
      (
        180 /
        Math.PI
      );


    if (
      angle < 0
    ) {

      angle += 360;
    }


    const percentagePosition =
      (
        angle /
        360
      ) * 100;


    let cumulativePercentage = 0;


    for (
      const category
      of this.categorySummaries
    ) {

      cumulativePercentage +=
        category.percentage;


      if (
        percentagePosition <
        cumulativePercentage
      ) {

        this.selectCategory(
          category.value
        );

        return;
      }
    }


    /*
     * Floating-point fallback.
     */

    const lastCategory =
      this.categorySummaries[
        this.categorySummaries.length - 1
      ];


    if (
      lastCategory
    ) {

      this.selectCategory(
        lastCategory.value
      );
    }
  }
}
