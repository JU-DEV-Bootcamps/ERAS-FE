import { Component, OnInit } from '@angular/core';
import { BreadcrumbsService } from '../../../core/services/breadcrumbs.service';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-breadcrumb',
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css',
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: { label: string; url: string }[] = [];

  constructor(private breadcrumbService: BreadcrumbsService) {}

  ngOnInit(): void {
    this.breadcrumbs = this.breadcrumbService.breadcrumbs;
  }
}
