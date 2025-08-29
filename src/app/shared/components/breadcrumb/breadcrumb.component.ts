import { Component, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { BreadcrumbsService } from '@core/services/breadcrumbs.service';
import { Breadcrumb } from '@core/services/interfaces/breadcrumb.interface';

@Component({
  selector: 'eras-breadcrumb',
  imports: [RouterLink, MatIconModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs = signal<Breadcrumb[]>([]);
  breadcrumbService = inject(BreadcrumbsService);

  ngOnInit() {
    this.breadcrumbService.breadcrumbs.subscribe(breadcrumb => {
      this.breadcrumbs.set(breadcrumb);
    });
  }
}
