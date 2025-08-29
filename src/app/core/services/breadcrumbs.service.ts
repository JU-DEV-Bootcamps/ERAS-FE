import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { BehaviorSubject, filter } from 'rxjs';
import { Breadcrumb } from './interfaces/breadcrumb.interface';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbsService {
  private breadcrumbs$ = new BehaviorSubject<Breadcrumb[]>([]);

  get breadcrumbs() {
    return this.breadcrumbs$.asObservable();
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const breadcrumbs = this.buildBreadCrumb(this.route.root);
        this.breadcrumbs$.next(breadcrumbs);
      });
  }

  initializer() {
    this.breadcrumbs$.next(this.buildBreadCrumb(this.route.root));
  }

  private buildBreadCrumb(
    route: ActivatedRoute,
    url = '',
    breadcrumbs: Breadcrumb[] = []
  ): Breadcrumb[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url
        .map(segment => segment.path)
        .join('/');

      if (routeURL) {
        url += `/${routeURL}`;
      }

      const label = child.snapshot.data['breadcrumb'];
      if (label) {
        breadcrumbs.push({ label, url });
      }

      return this.buildBreadCrumb(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}
