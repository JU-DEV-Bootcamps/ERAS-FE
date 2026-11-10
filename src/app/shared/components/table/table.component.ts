import { TitleCasePipe } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { ViewportService } from '@core/services/layout/viewport.service';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    TitleCasePipe,
    CommonModule,
    MatCardModule,
  ],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent<T extends object> implements OnInit {
  @Input() dataSource: T[] = [];
  @Input() columns: (keyof T)[] = [];
  readonly isMobile = inject(ViewportService).isMobile;
  totalItems = 0;

  ngOnInit() {
    this.totalItems = this.dataSource.length;
  }
}
