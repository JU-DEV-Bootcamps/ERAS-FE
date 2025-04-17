import { RISK_COLORS } from '../../../core/constants/riskLevel';

export abstract class ChartBase {
  protected loadDataFromInput(
    categoriesX: string[],
    seriesY: number[],
    colors: string[]
  ) {
    return seriesY.map((yData, index) => ({
      y: yData,
      x: categoriesX[index],
      fillColor:
        (colors && colors[index]) || RISK_COLORS[yData] || RISK_COLORS.default,
    }));
  }
}
