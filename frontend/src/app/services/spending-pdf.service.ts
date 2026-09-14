import {
  Injectable
} from '@angular/core';

import {
jsPDF
} from 'jspdf';

import {
AuthUser
} from './auth.service';

import {
Expense
} from './expense.service';

import {
CategorySummary,
PeriodMode
} from '../home/models/home.models';

import {
getMerchantImage
} from '../home/config/merchants.config';


export interface SpendingPdfReportInput {
user: AuthUser;

expenses: Expense[];

categorySummaries:
CategorySummary[];

totalSpent: number;

periodMode: PeriodMode;

periodLabel: string;

selectedYear: number;

selectedMonth?: number;

periodBudget: number;

remainingBudget: number;

budgetPercentage: number;
}


@Injectable({
providedIn: 'root'
})
export class SpendingPdfService {

private readonly pageWidth = 612;
private readonly pageHeight = 792;

private readonly margin = 42;

private readonly colors = {

navy: [
17,
24,
39
] as const,

navyLight: [
31,
41,
55
] as const,

text: [
17,
24,
39
] as const,

secondary: [
107,
114,
128
] as const,

muted: [
156,
163,
175
] as const,

line: [
229,
231,
235
] as const,

soft: [
246,
247,
249
] as const,

white: [
255,
255,
255
] as const
};

private readonly currencyFormatter =
new Intl.NumberFormat(
      'en-US',
      {
        style: 'currency',
        currency: 'USD'
      }
    );


  async downloadReport(
    input: SpendingPdfReportInput
  ): Promise<void> {

    const doc =
      new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'letter',
        compress: true
      });


    const merchantLogos =
      await this.preloadMerchantLogos(
        input.expenses
      );


    this.drawOverviewPage(
      doc,
      input
    );


    this.drawCategoryPages(
      doc,
      input
    );


    await this.drawTransactionPages(
      doc,
      input,
      merchantLogos
    );


    this.drawPageFooters(
      doc,
      input
    );


    doc.save(
      this.buildFilename(
        input
)
);
}


/* =========================
OVERVIEW PAGE
========================= */

private drawOverviewPage(
    doc: jsPDF,
    input: SpendingPdfReportInput
  ): void {

    this.drawHero(
      doc,
      input
    );


    this.drawSummaryCards(
      doc,
      input
    );


    this.drawBudgetProgress(
      doc,
      input
    );


    if (
      input.periodMode === 'YEAR'
    ) {

      this.drawYearOverview(
        doc,
        input
      );

      return;
    }


    this.drawMonthOverview(
      doc,
      input
    );
  }


  private drawHero(
    doc: jsPDF,
    input: SpendingPdfReportInput
  ): void {

    doc.setFillColor(
      ...this.colors.navy
    );

    doc.rect(
      0,
      0,
      this.pageWidth,
      130,
      'F'
    );


    doc.setTextColor(
      209,
      213,
      219
    );

    doc.setFont(
      'helvetica',
      'bold'
    );

    doc.setFontSize(
      9
    );

    doc.text(
      'SPEND TRACKER',
      this.margin,
      30
    );


    doc.setTextColor(
      ...this.colors.white
    );

    doc.setFontSize(
      25
    );

    doc.text(
      'Spending Statement',
      this.margin,
      59
    );


    doc.setFont(
      'helvetica',
      'normal'
    );

    doc.setFontSize(
      10
    );

    doc.setTextColor(
      209,
      213,
      219
    );

    doc.text(
      input.user.name,
      this.margin,
      84
    );

    doc.text(
      input.user.email,
      this.margin,
      101
    );


    doc.setFont(
      'helvetica',
      'bold'
    );

    doc.setFontSize(
      14
    );

    doc.setTextColor(
      ...this.colors.white
    );

    doc.text(
      input.periodLabel,
      this.pageWidth -
        this.margin,
      55,
      {
        align: 'right'
      }
    );


    doc.setFont(
      'helvetica',
      'normal'
    );

    doc.setFontSize(
      9
    );

    doc.setTextColor(
      209,
      213,
      219
    );

    doc.text(
      `Generated ${this.formatGeneratedDate()}`,
      this.pageWidth -
        this.margin,
      76,
      {
        align: 'right'
      }
    );
  }


  /* =========================
     SUMMARY
     ========================= */

  private drawSummaryCards(
    doc: jsPDF,
    input: SpendingPdfReportInput
  ): void {

    const y = 153;

    const gap = 10;

    const availableWidth =
      this.pageWidth -
      (
        this.margin * 2
      );

    const cardWidth =
      (
        availableWidth -
        gap * 3
      ) /
      4;


    const items = [
      {
        label: 'TOTAL SPENT',
        value:
          this.money(
            input.totalSpent
)
},
{
label: 'BUDGET',
value:
this.money(
            input.periodBudget
)
},
{
label: 'REMAINING',
value:
this.money(
            input.remainingBudget
)
},
{
label: 'TRANSACTIONS',
value:
String(
            input.expenses.length
)
}
];


items.forEach(
      (
        item,
        index
      ) => {

        const x =
          this.margin +
          index *
          (
            cardWidth +
            gap
          );


        doc.setFillColor(
          ...this.colors.soft
        );

        doc.roundedRect(
          x,
          y,
          cardWidth,
          64,
          10,
          10,
          'F'
        );


        doc.setFont(
          'helvetica',
          'bold'
        );

        doc.setFontSize(
          7
        );

        doc.setTextColor(
          ...this.colors.muted
        );

        doc.text(
          item.label,
          x + 12,
          y + 19
        );


        doc.setFontSize(
          15
        );

        doc.setTextColor(
          ...this.colors.text
        );

        doc.text(
          item.value,
          x + 12,
          y + 44
        );
      }
    );
  }


  private drawBudgetProgress(
    doc: jsPDF,
    input: SpendingPdfReportInput
  ): void {

    const x =
      this.margin;

    const y =
      243;

    const width =
      this.pageWidth -
      this.margin * 2;


    doc.setFont(
      'helvetica',
      'bold'
    );

    doc.setFontSize(
      10
    );

    doc.setTextColor(
      ...this.colors.text
    );

    doc.text(
      'Budget usage',
      x,
      y
    );


    doc.setFont(
      'helvetica',
      'normal'
    );

    doc.setTextColor(
      ...this.colors.secondary
    );

    doc.text(
      `${Math.round(
        input.budgetPercentage
      )}%`,
      x + width,
      y,
      {
        align: 'right'
      }
    );


    doc.setFillColor(
      229,
      231,
      235
    );

    doc.roundedRect(
      x,
      y + 12,
      width,
      7,
      3,
      3,
      'F'
    );


    const progressWidth =
      width *
      (
        Math.min(
          input.budgetPercentage,
          100
        ) /
        100
      );


    if (
      progressWidth > 0
    ) {

      doc.setFillColor(
        ...this.colors.navy
      );

      doc.roundedRect(
        x,
        y + 12,
        progressWidth,
        7,
        3,
        3,
        'F'
      );
    }
  }


  /* =========================
     MONTH OVERVIEW
     ========================= */

  private drawMonthOverview(
    doc: jsPDF,
    input: SpendingPdfReportInput
  ): void {

    doc.setFont(
      'helvetica',
      'bold'
    );

    doc.setFontSize(
      15
    );

    doc.setTextColor(
      ...this.colors.text
    );

    doc.text(
      'Spending by Category',
      this.margin,
      310
    );


    doc.setFont(
      'helvetica',
      'normal'
    );

    doc.setFontSize(
      9
    );

    doc.setTextColor(
      ...this.colors.muted
    );

    doc.text(
      input.periodLabel,
      this.margin,
      326
    );


    const donut =
      this.createDonutChart(
        input.categorySummaries,
        input.totalSpent
      );


    doc.addImage(
      donut,
      'PNG',
      55,
      355,
      220,
      220
    );


    this.drawTopCategories(
      doc,
      input.categorySummaries,
      315,
      365,
      250
    );
  }


  /* =========================
     YEAR OVERVIEW
     ========================= */

  private drawYearOverview(
    doc: jsPDF,
    input: SpendingPdfReportInput
  ): void {

    doc.setFont(
      'helvetica',
      'bold'
    );

    doc.setFontSize(
      15
    );

    doc.setTextColor(
      ...this.colors.text
    );

    doc.text(
      `Monthly Spending · ${input.selectedYear}`,
      this.margin,
      310
    );


    const monthlyTotals =
      this.getMonthlyTotals(
        input.expenses
      );


    const maxAmount =
      Math.max(
        ...monthlyTotals.map(
          month =>
            month.amount
        ),
        1
      );


    let y = 340;


    monthlyTotals.forEach(
      month => {

        doc.setFont(
          'helvetica',
          'normal'
        );

        doc.setFontSize(
          9
        );

        doc.setTextColor(
          ...this.colors.secondary
        );

        doc.text(
          month.label,
          this.margin,
          y + 7
        );


        const barX =
          this.margin + 35;

        const barWidth = 330;


        doc.setFillColor(
          238,
          240,
          243
        );

        doc.roundedRect(
          barX,
          y,
          barWidth,
          8,
          4,
          4,
          'F'
        );


        const valueWidth =
          (
            month.amount /
            maxAmount
          ) *
          barWidth;


        if (
          valueWidth > 0
        ) {

          doc.setFillColor(
            ...this.colors.navy
          );

          doc.roundedRect(
            barX,
            y,
            valueWidth,
            8,
            4,
            4,
            'F'
          );
        }


        doc.setFont(
          'helvetica',
          'bold'
        );

        doc.setTextColor(
          ...this.colors.text
        );

        doc.text(
          this.money(
            month.amount
          ),
          this.pageWidth -
            this.margin,
          y + 7,
          {
            align: 'right'
          }
        );


        y += 26;
      }
    );
  }


  /* =========================
     TOP CATEGORIES
     ========================= */

  private drawTopCategories(
    doc: jsPDF,
    summaries:
      CategorySummary[],
    x: number,
    y: number,
    width: number
  ): void {

    const topCategories =
      [...summaries]
        .sort(
          (
            first,
            second
          ) =>
            second.amount -
            first.amount
)
.slice(
          0,
          6
        );


    topCategories.forEach(
      category => {

        const rgb =
          this.hexToRgb(
            category.color
          );


        doc.setFillColor(
          rgb.r,
          rgb.g,
          rgb.b
        );

        doc.circle(
          x + 4,
          y + 4,
          4,
          'F'
        );


        doc.setFont(
          'helvetica',
          'normal'
        );

        doc.setFontSize(
          10
        );

        doc.setTextColor(
          ...this.colors.secondary
        );

        doc.text(
          category.label,
          x + 16,
          y + 7
        );


        doc.setFont(
          'helvetica',
          'bold'
        );

        doc.setTextColor(
          ...this.colors.text
        );

        doc.text(
          this.money(
            category.amount
          ),
          x + width,
          y + 7,
          {
            align: 'right'
          }
        );


        doc.setFont(
          'helvetica',
          'normal'
        );

        doc.setFontSize(
          8
        );

        doc.setTextColor(
          ...this.colors.muted
        );

        doc.text(
          `${Math.round(
            category.percentage
          )}%`,
          x + width,
          y + 19,
          {
            align: 'right'
          }
        );


        doc.setFillColor(
          238,
          240,
          243
        );

        doc.roundedRect(
          x + 16,
          y + 18,
          135,
          4,
          2,
          2,
          'F'
        );


        doc.setFillColor(
          rgb.r,
          rgb.g,
          rgb.b
        );

        doc.roundedRect(
          x + 16,
          y + 18,
          135 *
            (
              category.percentage /
              100
            ),
          4,
          2,
          2,
          'F'
        );


        y += 36;
      }
    );
  }


  /* =========================
     CATEGORY PAGES
     ========================= */

  private drawCategoryPages(
    doc: jsPDF,
    input: SpendingPdfReportInput
  ): void {

    doc.addPage();


    let y =
      this.drawSectionHeader(
        doc,
        input,
        'Category Breakdown'
      );


    const summaries =
      [...input.categorySummaries]
        .sort(
          (
            first,
            second
          ) =>
            second.amount -
            first.amount
        );


    for (
      const category
      of summaries
    ) {

      if (
        y > 704
      ) {

        doc.addPage();

        y =
          this.drawSectionHeader(
            doc,
            input,
            'Category Breakdown'
          );
      }


      y =
        this.drawCategoryRow(
          doc,
          category,
          y
        );
    }
  }


  private drawCategoryRow(
    doc: jsPDF,
    category:
      CategorySummary,
    y: number
  ): number {

    const rgb =
      this.hexToRgb(
        category.color
      );


    doc.setFillColor(
      248,
      249,
      250
    );

    doc.roundedRect(
      this.margin,
      y,
      42,
      42,
      11,
      11,
      'F'
    );


    doc.setFillColor(
      rgb.r,
      rgb.g,
      rgb.b
    );

    doc.circle(
      this.margin + 21,
      y + 21,
      7,
      'F'
    );


    const textX =
      this.margin + 58;


    doc.setFont(
      'helvetica',
      'normal'
    );

    doc.setFontSize(
      11
    );

    doc.setTextColor(
      ...this.colors.text
    );

    doc.text(
      category.label,
      textX,
      y + 15
    );


    doc.setFontSize(
      8
    );

    doc.setTextColor(
      ...this.colors.muted
    );

    doc.text(
      `${Math.round(
        category.percentage
      )}% of total spending`,
      textX,
      y + 31
    );


    doc.setFont(
      'helvetica',
      'bold'
    );

    doc.setFontSize(
      11
    );

    doc.setTextColor(
      ...this.colors.text
    );

    doc.text(
      this.money(
        category.amount
      ),
      this.pageWidth -
        this.margin,
      y + 16,
      {
        align: 'right'
      }
    );


    const barX =
      textX;

    const barY =
      y + 39;

    const barWidth =
      this.pageWidth -
      this.margin -
      barX;


    doc.setFillColor(
      238,
      240,
      243
    );

    doc.roundedRect(
      barX,
      barY,
      barWidth,
      4,
      2,
      2,
      'F'
    );


    doc.setFillColor(
      rgb.r,
      rgb.g,
      rgb.b
    );

    doc.roundedRect(
      barX,
      barY,
      barWidth *
        (
          category.percentage /
          100
        ),
      4,
      2,
      2,
      'F'
    );


    doc.setDrawColor(
      ...this.colors.line
    );

    doc.line(
      this.margin,
      y + 56,
      this.pageWidth -
        this.margin,
      y + 56
    );


    return y + 68;
  }


  /* =========================
     TRANSACTION PAGES
     ========================= */

  private async drawTransactionPages(
    doc: jsPDF,
    input: SpendingPdfReportInput,
    merchantLogos:
      Map<string, string>
  ): Promise<void> {

    doc.addPage();


    let y =
      this.drawSectionHeader(
        doc,
        input,
        'Transactions'
      );


    const sortedExpenses =
      [...input.expenses]
        .sort(
          (
            first,
            second
          ) => {

            const dateComparison =
              second.expenseDate
                .localeCompare(
                  first.expenseDate
                );

            if (
              dateComparison !== 0
            ) {

              return dateComparison;
            }

            return (
              Number(
                second.id
              ) -
              Number(
                first.id
)
);
}
);


for (
      const expense
      of sortedExpenses
    ) {

      const hasDescription =
        Boolean(
          expense.description
            ?.trim()
        );


      const rowHeight =
        hasDescription
          ? 68
          : 54;


      if (
        y + rowHeight >
        724
      ) {

        doc.addPage();

        y =
          this.drawSectionHeader(
            doc,
            input,
            'Transactions'
          );
      }


      y =
        await this.drawTransactionRow(
          doc,
          expense,
          merchantLogos,
          y
        );
    }
  }


  private async drawTransactionRow(
    doc: jsPDF,
    expense: Expense,
    merchantLogos:
      Map<string, string>,
    y: number
  ): Promise<number> {

    const merchant =
      expense.merchant
        ?.trim() ||
      this.toDisplayCategory(
        expense.category
      );


    const imagePath =
      getMerchantImage(
        expense.category,
        merchant
      );


    doc.setFillColor(
      246,
      247,
      249
    );

    doc.roundedRect(
      this.margin,
      y,
      38,
      38,
      11,
      11,
      'F'
    );


    if (
      imagePath
    ) {

      const logo =
        merchantLogos.get(
          imagePath
        );


      if (
        logo
      ) {

        doc.addImage(
          logo,
          'PNG',
          this.margin + 5,
          y + 5,
          28,
          28
        );
      }
    }


    const textX =
      this.margin + 52;


    doc.setFont(
      'helvetica',
      'bold'
    );

    doc.setFontSize(
      10.5
    );

    doc.setTextColor(
      ...this.colors.text
    );

    doc.text(
      this.truncateText(
        doc,
        merchant,
        275
      ),
      textX,
      y + 14
    );


    let metaY =
      y + 31;


    const description =
      expense.description
        ?.trim();


    if (
      description
    ) {

      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.setFontSize(
        8.5
      );

      doc.setTextColor(
        ...this.colors.secondary
      );

      doc.text(
        this.truncateText(
          doc,
          description,
          305
        ),
        textX,
        y + 30
      );


      metaY =
        y + 46;
    }


    const meta = [
      this.formatExpenseDate(
        expense.expenseDate
      ),

      this.toDisplayCategory(
        expense.category
      ),

      expense.paymentMethod
        ?.trim()
    ]
      .filter(
        Boolean
)
.join(
        '  •  '
      );


    doc.setFont(
      'helvetica',
      'normal'
    );

    doc.setFontSize(
      8.5
    );

    doc.setTextColor(
      ...this.colors.muted
    );

    doc.text(
      this.truncateText(
        doc,
        meta,
        330
      ),
      textX,
      metaY
    );


    doc.setFont(
      'helvetica',
      'bold'
    );

    doc.setFontSize(
      10.5
    );

    doc.setTextColor(
      ...this.colors.text
    );

    doc.text(
      `-${this.money(
        Number(
          expense.amount
        )
)}`,
this.pageWidth -
this.margin,
y + 17,
{
align: 'right'
}
);


const rowHeight =
description
? 68
: 54;


doc.setDrawColor(
      ...this.colors.line
    );

    doc.line(
      this.margin,
      y + rowHeight - 8,
      this.pageWidth -
        this.margin,
      y + rowHeight - 8
    );


    return y + rowHeight;
  }


  /* =========================
     SECTION HEADER
     ========================= */

  private drawSectionHeader(
    doc: jsPDF,
    input: SpendingPdfReportInput,
    title: string
  ): number {

    doc.setFont(
      'helvetica',
      'bold'
    );

    doc.setFontSize(
      8
    );

    doc.setTextColor(
      ...this.colors.muted
    );

    doc.text(
      'SPEND TRACKER',
      this.margin,
      35
    );


    doc.setFontSize(
      8
    );

    doc.setFont(
      'helvetica',
      'normal'
    );

    doc.text(
      input.periodLabel,
      this.pageWidth -
        this.margin,
      35,
      {
        align: 'right'
      }
    );


    doc.setFont(
      'helvetica',
      'bold'
    );

    doc.setFontSize(
      21
    );

    doc.setTextColor(
      ...this.colors.text
    );

    doc.text(
      title,
      this.margin,
      70
    );


    doc.setDrawColor(
      ...this.colors.line
    );

    doc.line(
      this.margin,
      86,
      this.pageWidth -
        this.margin,
      86
    );


    return 105;
  }


  /* =========================
     FOOTERS
     ========================= */

  private drawPageFooters(
    doc: jsPDF,
    input: SpendingPdfReportInput
  ): void {

    const totalPages =
      doc.getNumberOfPages();


    for (
      let page = 1;
      page <= totalPages;
      page++
    ) {

      doc.setPage(
        page
      );


      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.setFontSize(
        8
      );

      doc.setTextColor(
        ...this.colors.muted
      );


      doc.text(
        `Spend Tracker • ${input.user.name}`,
        this.margin,
        this.pageHeight - 20
      );


      doc.text(
        `Page ${page} of ${totalPages}`,
        this.pageWidth -
          this.margin,
        this.pageHeight - 20,
        {
          align: 'right'
        }
      );
    }
  }


  /* =========================
     DONUT IMAGE
     ========================= */

  private createDonutChart(
    summaries:
      CategorySummary[],
    totalSpent: number
  ): string {

    const canvas =
      document.createElement(
        'canvas'
      );

    canvas.width = 440;
    canvas.height = 440;


    const context =
      canvas.getContext(
        '2d'
      );


    if (
      !context
    ) {

      return '';
    }


    const center =
      220;

    const radius =
      150;

    const strokeWidth =
      56;


    context.lineWidth =
      strokeWidth;

    context.lineCap =
      'butt';


    context.strokeStyle =
      '#eef0f3';

    context.beginPath();

    context.arc(
      center,
      center,
      radius,
      0,
      Math.PI * 2
    );

    context.stroke();


    let startAngle =
      -Math.PI / 2;


    summaries.forEach(
      category => {

        const angle =
          (
            category.percentage /
            100
          ) *
          Math.PI *
          2;


        context.beginPath();

        context.strokeStyle =
          category.color;

        context.arc(
          center,
          center,
          radius,
          startAngle,
          startAngle + angle
        );

        context.stroke();


        startAngle +=
          angle;
      }
    );


    context.fillStyle =
      '#ffffff';

    context.beginPath();

    context.arc(
      center,
      center,
      radius -
        strokeWidth /
        2 -
        6,
      0,
      Math.PI * 2
    );

    context.fill();


    context.fillStyle =
      '#111827';

    context.textAlign =
      'center';

    context.font =
      'bold 38px Arial';

    context.fillText(
      this.money(
        totalSpent
      ),
      center,
      center + 2
    );


    context.fillStyle =
      '#9ca3af';

    context.font =
      '20px Arial';

    context.fillText(
      'spent',
      center,
      center + 36
    );


    return canvas.toDataURL(
      'image/png'
    );
  }


  /* =========================
     MERCHANT IMAGES
     ========================= */

  private async preloadMerchantLogos(
    expenses: Expense[]
  ): Promise<
    Map<string, string>
  > {

    const paths =
      new Set<string>();


    for (
      const expense
      of expenses
    ) {

      const merchant =
        expense.merchant
          ?.trim();


      if (
        !merchant
      ) {
        continue;
      }


      const path =
        getMerchantImage(
          expense.category,
          merchant
        );


      if (
        path
      ) {

        paths.add(
          path
        );
      }
    }


    const entries =
      await Promise.all(

        [...paths].map(
          async path => {

            try {

              const dataUrl =
                await this.convertAssetToPng(
                  path
                );


              return [
                path,
                dataUrl
              ] as const;

            } catch (
              error
            ) {

              console.warn(
                'Unable to load PDF merchant image',
                path,
                error
              );


              return [
                path,
                ''
              ] as const;
            }
          }
)
);


return new Map(
      entries.filter(
        entry =>
          Boolean(
            entry[1]
)
)
);
}


private async convertAssetToPng(
    path: string
  ): Promise<string> {

    const response =
      await fetch(
        path
      );


    if (
      !response.ok
    ) {

      throw new Error(
        `Unable to load ${path}`
      );
    }


    const blob =
      await response.blob();


    const objectUrl =
      URL.createObjectURL(
        blob
      );


    try {

      const image =
        await this.loadImage(
          objectUrl
        );


      const canvas =
        document.createElement(
          'canvas'
        );

      canvas.width = 96;
      canvas.height = 96;


      const context =
        canvas.getContext(
          '2d'
        );


      if (
        !context
      ) {

        throw new Error(
          'Unable to create image canvas.'
        );
      }


      context.clearRect(
        0,
        0,
        96,
        96
      );


      const maxSize = 82;


      const scale =
        Math.min(
          maxSize /
            image.naturalWidth,
          maxSize /
            image.naturalHeight
        );


      const width =
        image.naturalWidth *
        scale;

      const height =
        image.naturalHeight *
        scale;


      context.drawImage(
        image,
        (
          96 -
          width
        ) /
        2,
        (
          96 -
          height
        ) /
        2,
        width,
        height
      );


      return canvas.toDataURL(
        'image/png'
      );

    } finally {

      URL.revokeObjectURL(
        objectUrl
      );
    }
  }


  private loadImage(
    src: string
  ): Promise<HTMLImageElement> {

    return new Promise(
      (
        resolve,
        reject
      ) => {

        const image =
          new Image();


        image.onload =
          () =>
            resolve(
              image
            );


        image.onerror =
          () =>
            reject(
              new Error(
                'Unable to decode image.'
)
);


image.src = src;
}
);
}


/* =========================
YEAR CALCULATIONS
========================= */

private getMonthlyTotals(
    expenses: Expense[]
  ): {
    month: number;
    label: string;
    amount: number;
  }[] {

    const monthFormatter =
      new Intl.DateTimeFormat(
        'en-US',
        {
          month: 'short'
        }
      );


    return Array.from(
      {
        length: 12
      },
      (
        _,
        index
      ) => {

        const month =
          index + 1;


        const amount =
          expenses
            .filter(
              expense => {

                const parts =
                  expense.expenseDate
                    .split(
                      '-'
                    );


                return (
                  Number(
                    parts[1]
                  ) ===
                  month
                );
              }
)
.reduce(
              (
                total,
                expense
              ) =>
                total +
                Number(
                  expense.amount
                ),
              0
            );


        return {
          month,

          label:
            monthFormatter.format(
              new Date(
                2000,
                index,
                1
)
),

amount
};
}
);
}


/* =========================
HELPERS
========================= */

private money(
    amount: number
  ): string {

    return this.currencyFormatter
      .format(
        Number(
          amount
        ) || 0
      );
  }


  private formatExpenseDate(
    value: string
  ): string {

    const [
      year,
      month,
      day
    ] =
      value
        .split(
          '-'
)
.map(
          Number
        );


    if (
      !year ||
      !month ||
      !day
    ) {

      return value;
    }


    return new Intl.DateTimeFormat(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }
    ).format(
      new Date(
        year,
        month - 1,
        day
)
);
}


private formatGeneratedDate():
    string {

    return new Intl.DateTimeFormat(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      }
    ).format(
      new Date()
    );
  }


  private toDisplayCategory(
    value: string
  ): string {

    return value
      .toLowerCase()
      .split(
        '_'
)
.map(
        word =>
          word.charAt(0)
            .toUpperCase() +
          word.slice(1)
)
.join(
        ' '
)
.replace(
        'And',
        '&'
      );
  }


  private truncateText(
    doc: jsPDF,
    value: string,
    maxWidth: number
  ): string {

    if (
      doc.getTextWidth(
        value
      ) <=
      maxWidth
    ) {

      return value;
    }


    let text =
      value;


    while (
      text.length > 0 &&
      doc.getTextWidth(
        `${text}...`
      ) >
      maxWidth
    ) {

      text =
        text.slice(
          0,
          -1
        );
    }


    return `${text}...`;
  }


  private hexToRgb(
    hex: string
  ): {
    r: number;
    g: number;
    b: number;
  } {

    const normalized =
      hex.replace(
        '#',
        ''
      );


    return {
      r:
        parseInt(
          normalized.substring(
            0,
            2
          ),
          16
        ),

      g:
        parseInt(
          normalized.substring(
            2,
            4
          ),
          16
        ),

      b:
        parseInt(
          normalized.substring(
            4,
            6
          ),
          16
)
};
}


private buildFilename(
    input: SpendingPdfReportInput
  ): string {

    const period =
      input.periodLabel
        .trim()
        .replace(
          /\s+/g,
          '-'
        );


    return (
      `Spend-Tracker-${period}.pdf`
    );
  }
}
