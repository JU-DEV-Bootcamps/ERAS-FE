import { RISK_COLORS } from '../../../core/constants/riskLevel';

export abstract class ChartBase {
  protected loadDataFromInput(
    categoriesX: string[],
    seriesY: number[],
    colors: string[]
  ) {
    if (
      seriesY.length !== categoriesX.length ||
      categoriesX.length !== colors.length
    ) {
      throw new Error(
        `Data for chart should have ${colors.length} length by default. Otherwise replace colors and categories input.`
      );
    }
    return seriesY.map((yData, index) => {
      return {
        y: yData,
        x: categoriesX[index],
        fillColor: colors[index] || RISK_COLORS.default,
      };
    });
  }
}
