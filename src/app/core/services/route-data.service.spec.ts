import { TestBed } from '@angular/core/testing';
import { RouteDataService } from './route-data.service';
import { PreselectedPoll } from '@modules/imports/models/preselected-poll';

describe('RouteDataService', () => {
  let service: RouteDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RouteDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have null as initial value for routeData signal', () => {
    expect(service.routeData()).toBeNull();
  });

  it('should update routeData signal when updateRouteData is called', () => {
    const mockData = {
      id: 1,
      name: 'Sample Poll',
    } as unknown as PreselectedPoll;

    service.updateRouteData(mockData);

    expect(service.routeData()).toEqual(mockData);
  });
});
