import { HeatMapData } from '../../../../core/models/heatmap-data.model';

//NOTE: function to fill deafult data
export const fillDefaultData = (data: HeatMapData[]) => {
  const maxSize = Math.max(...data.map(obj => obj.data.length));

  const defaultSerie = { x: 'No answer', y: -1 };

  data.forEach(d => {
    while (d.data.length < maxSize) {
      d.data.push(defaultSerie);
    }
  });
  return data;
};
