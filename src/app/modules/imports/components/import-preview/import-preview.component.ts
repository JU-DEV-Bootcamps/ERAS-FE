import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { PollInstance } from '@core/models/poll-instance.model';

import { IMPORT_MESSAGES } from '@core/constants/messages';
import { CosmicLatteService } from '@core/services/api/cosmic-latte.service';

import { ImportAnswersPreviewComponent } from './import-answers-preview/import-answers-preview.component';
import { DialogService } from '@core/services/dialog.service';
import { ConfigurationsModel } from '@core/models/configurations.model';
import { RouteDataService } from '@core/services/route-data.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-import-answers',
  imports: [
    MatProgressSpinnerModule,
    NgIf,
    AsyncPipe,
    ImportAnswersPreviewComponent,
  ],
  templateUrl: './import-preview.component.html',
  styleUrl: './import-preview.component.scss',
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportPreviewComponent implements OnInit {
  private cosmicLatteService: CosmicLatteService = inject(CosmicLatteService);
  private dialogService: DialogService = inject(DialogService);
  private routeDataService: RouteDataService = inject(RouteDataService);
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);

  evaluationId: number | null = null;
  selectedConfiguration: ConfigurationsModel | null = null;
  loadingSubject = new BehaviorSubject<boolean>(true);
  isLoading$ = this.loadingSubject.asObservable();

  importedPollData: PollInstance[] = [];
  columns = ['#', 'name', 'email', 'cohort', 'actions'];
  students = [];

  isMobile = false;

  ngOnInit() {
    const routeData = this.routeDataService.routeData();

    if (!routeData) {
      this.router.navigate(['../'], { relativeTo: this.route });
      return;
    }
    const { evaluationId, pollName, startDate, endDate, configuration } =
      routeData;

    this.evaluationId = evaluationId;
    this.selectedConfiguration = configuration;
    this.checkScreenSize();
    this.loadingSubject.next(true);
    this.cosmicLatteService
      .importAnswerBySurvey(configuration.id, pollName, startDate, endDate)
      .subscribe({
        next: (data: PollInstance[]) => {
          this.importedPollData = data;
          this.loadingSubject.next(false);
          if (data.length < 1) {
            this.dialogService.openDialog(
              IMPORT_MESSAGES.ANSWERS_PREVIEW_EMPTY,
              'success'
            );
          } else {
            this.dialogService.openDialog(
              IMPORT_MESSAGES.ANSWERS_PREVIEW_OK,
              'success'
            );
          }
        },
        error: err => {
          this.loadingSubject.next(false);
          this.dialogService.openDialog(
            IMPORT_MESSAGES.ANSWERS_ERROR,
            'error',
            err?.error?.message
          );
        },
      });
  }

  @HostListener('window:resize', [])
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  handleSavePollState(event: { state: string }) {
    if (event.state == 'pending') {
      this.loadingSubject.next(true);
    } else if (event.state == 'true') {
      this.loadingSubject.next(false);
      this.importedPollData = [];
      this.dialogService
        .openDialog('Polls saved successfully!', 'success')
        .subscribe(() => {
          this.router.navigate(['evaluation-process']);
        });
    } else {
      this.loadingSubject.next(false);
      this.dialogService.openDialog(
        'Error saving polls. Please try again.',
        'error'
      );
    }
  }
}
