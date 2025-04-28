import { TitleCasePipe } from '@angular/common';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

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
  isMobile = false;
  totalItems = 0;

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent): void {
    const target = event.target as Window;
    this.isMobile = target.innerWidth < 768;
  }

  ngOnInit() {
    this.isMobile = window.innerWidth < 768;
    this.totalItems = this.dataSource.length;
  }
}
