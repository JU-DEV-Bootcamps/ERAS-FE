import { TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  NavigationEnd,
  NavigationStart,
  Router,
} from '@angular/router';
import { Subject } from 'rxjs';

import { BreadcrumbsService } from './breadcrumbs.service';
import { Breadcrumb } from './interfaces/breadcrumb.interface';

interface FakeRouteNode {
  children: FakeRouteNode[];
  snapshot: {
    url: { path: string }[];
    data: Record<string, unknown>;
  };
}

function buildNode(
  urlSegments: string[],
  data: Record<string, unknown> = {},
  children: FakeRouteNode[] = []
): FakeRouteNode {
  return {
    children,
    snapshot: {
      url: urlSegments.map(path => ({ path })),
      data,
    },
  };
}

describe('BreadcrumbsService', () => {
  let service: BreadcrumbsService;
  let routerEvents$: Subject<unknown>;
  let rootNode: FakeRouteNode;
  let activatedRouteMock: { root: FakeRouteNode };

  const configureWithRoot = (root: FakeRouteNode) => {
    rootNode = root;
    routerEvents$ = new Subject<unknown>();
    activatedRouteMock = { root: rootNode };

    TestBed.configureTestingModule({
      providers: [
        BreadcrumbsService,
        { provide: Router, useValue: { events: routerEvents$.asObservable() } },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    });

    service = TestBed.inject(BreadcrumbsService);
  };

  afterEach(() => {
    routerEvents$?.complete();
  });

  it('should be created', () => {
    configureWithRoot(buildNode([], {}, []));
    expect(service).toBeTruthy();
  });

  it('should emit an empty array as the initial value', done => {
    configureWithRoot(buildNode([], {}, []));

    service.breadcrumbs.subscribe(crumbs => {
      expect(crumbs).toEqual([]);
      done();
    });
  });

  describe('initializer', () => {
    it('should return [] when root has no children', () => {
      configureWithRoot(buildNode([], {}, []));

      let emitted: Breadcrumb[] = [];
      service.breadcrumbs.subscribe(crumbs => (emitted = crumbs));

      service.initializer();

      expect(emitted).toEqual([]);
    });

    it('should build accumulated urls and only push crumbs with a breadcrumb label', () => {
      const childC = buildNode(['edit'], { breadcrumb: 'Edit' }, []);
      const childB = buildNode(['42'], {}, [childC]); // no breadcrumb label
      const childA = buildNode(['users'], { breadcrumb: 'Users' }, [childB]);
      configureWithRoot(buildNode([], {}, [childA]));

      let emitted: Breadcrumb[] = [];
      service.breadcrumbs.subscribe(crumbs => (emitted = crumbs));

      service.initializer();

      expect(emitted).toEqual([
        { label: 'Users', url: '/users' },
        { label: 'Edit', url: '/users/42/edit' },
      ]);
    });

    it('should skip a level with no url segments without adding an extra slash', () => {
      const childB = buildNode([], { breadcrumb: 'Profile' }, []); // empty url segment
      const childA = buildNode(['account'], { breadcrumb: 'Account' }, [
        childB,
      ]);
      configureWithRoot(buildNode([], {}, [childA]));

      let emitted: Breadcrumb[] = [];
      service.breadcrumbs.subscribe(crumbs => (emitted = crumbs));

      service.initializer();

      expect(emitted).toEqual([
        { label: 'Account', url: '/account' },
        { label: 'Profile', url: '/account' },
      ]);
    });

    it('should only follow the first child when a level has multiple children', () => {
      const firstBranch = buildNode(['first'], { breadcrumb: 'First' }, []);
      const secondBranch = buildNode(['second'], { breadcrumb: 'Second' }, []);
      configureWithRoot(buildNode([], {}, [firstBranch, secondBranch]));

      let emitted: Breadcrumb[] = [];
      service.breadcrumbs.subscribe(crumbs => (emitted = crumbs));

      service.initializer();

      expect(emitted).toEqual([{ label: 'First', url: '/first' }]);
    });
  });

  describe('router events subscription', () => {
    it('should rebuild breadcrumbs on NavigationEnd', () => {
      const childA = buildNode(['dashboard'], { breadcrumb: 'Dashboard' }, []);
      configureWithRoot(buildNode([], {}, [childA]));

      let emitted: Breadcrumb[] = [];
      service.breadcrumbs.subscribe(crumbs => (emitted = crumbs));

      routerEvents$.next(new NavigationEnd(1, '/dashboard', '/dashboard'));

      expect(emitted).toEqual([{ label: 'Dashboard', url: '/dashboard' }]);
    });

    it('should NOT rebuild breadcrumbs on other router events', () => {
      const childA = buildNode(['dashboard'], { breadcrumb: 'Dashboard' }, []);
      configureWithRoot(buildNode([], {}, [childA]));

      let emitted: Breadcrumb[] = [];
      service.breadcrumbs.subscribe(crumbs => (emitted = crumbs));

      routerEvents$.next(new NavigationStart(1, '/dashboard'));

      expect(emitted).toEqual([]);
    });
  });
});
