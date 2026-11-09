import { TitleCasePipe } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { ViewportService } from '@core/services/layout/viewport.service';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-table-with-redirect',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    TitleCasePipe,
    CommonModule,
    MatCardModule,
    RouterModule,
  ],
  templateUrl: './table-with-redirect.component.html',
  styleUrls: ['./table-with-redirect.component.scss'],
})
export class TableWithRedirectComponent implements OnInit {
  @Input() columns: string[] = [];
  @Input() dataSource: Record<string, unknown>[] = [];
  @Input() uuidField = '';
  @Input() redirectPath = '';
  @Input() itemStorage = '';
  @Input() icon = '';

  readonly isMobile = inject(ViewportService).isMobile;
  totalItems = 0;

  constructor(private router: Router) {}

  ngOnInit() {
    this.totalItems = this.dataSource.length;
  }

  redirectToDetail(item: Record<string, unknown>): void {
    const uuid = item[this.uuidField];
    if (uuid && this.redirectPath && this.itemStorage) {
      localStorage.setItem(this.itemStorage, uuid as string);
      this.router.navigate([this.redirectPath]);
    } else {
      console.error('Missing uuid, redirectPath, or itemStorage');
    }
  }
}
