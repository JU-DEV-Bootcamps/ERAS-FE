import { Injectable, signal } from '@angular/core';
import { PreselectedPoll } from '@modules/imports/models/preselected-poll';

@Injectable({
  providedIn: 'root',
})
export class RouteDataService {
  private _routeData = signal<PreselectedPoll | null>(null);

  readonly routeData = this._routeData.asReadonly();

  updateRouteData(data: PreselectedPoll) {
    this._routeData.set(data);
  }
}
