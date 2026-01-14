import { Type } from '@angular/core';

export interface Span {
  breakpoint: number;
  rowspan: number;
  colspan: number;
}
interface BaseTile<T> {
  component: Type<T>;
  inputs: Partial<T>;
}
interface StaticTile<T> extends BaseTile<T> {
  rowspan: number;
  colspan: number;
}
interface DynamicTile<T> extends BaseTile<T> {
  spans: Span[];
}
export type Tile<T> = StaticTile<T> | DynamicTile<T>;

interface BaseGrid {
  rows: number;
  cols: number;
  rowHeight: string;
  gutterSize: number;
}
interface StaticGrid extends BaseGrid {
  type: 'static';
  tiles: StaticTile<unknown>[];
}
interface DynamicGrid extends BaseGrid {
  type: 'dynamic';
  tiles: DynamicTile<unknown>[];
}
export type Grid = StaticGrid | DynamicGrid;

export const isStaticGrid = (
  grid: Grid,
  tile: Tile<unknown>
): tile is StaticTile<unknown> => {
  return grid.type === 'static';
};
