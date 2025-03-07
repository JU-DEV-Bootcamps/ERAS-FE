import { RISK_COLORS } from '../../../core/constants/riskLevel';

export abstract class ChartBase {
  abstract seriesY: () => number[];
  abstract colors: () => string[];
  abstract categoriesX: () => string[];

  protected loadDataFromInput() {
    if (
      this.seriesY.length !== this.categoriesX.length ||
      this.categoriesX.length !== this.colors.length
    ) {
      throw new Error(
        `Data for chart should have ${this.colors.length} length by default. Otherwise replace colors and categories input.`
      );
    }
    return this.seriesY().map((yData, index) => {
      return {
        y: yData,
        x: this.categoriesX()[index],
        fillColor: this.colors()[index] || RISK_COLORS.default,
      };
    });
  }
}
