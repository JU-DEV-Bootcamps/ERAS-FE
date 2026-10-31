import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserManualModel } from '@core/models/user-manual.model';
import { UserManualsApiService } from '@core/services/api/user-manuals.service';
import { USER_MANUALS_MESSAGES } from '@core/constants/messages';

@Component({
  selector: 'app-user-manuals',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './user-manuals.component.html',
  styleUrl: './user-manuals.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserManualsComponent {
  private readonly api = inject(UserManualsApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly messages = USER_MANUALS_MESSAGES;
  readonly manuals = signal<UserManualModel[]>([]);
  readonly error = signal<string | null>(null);

  constructor() {
    this.api
      .list()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: manuals => this.manuals.set(manuals),
        error: () => this.error.set(this.messages.LOAD_ERROR),
      });
  }

  download(manual: UserManualModel): void {
    this.api
      .download(manual.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: blob => this.save(blob, manual.fileName),
        error: () => this.error.set(this.messages.LOAD_ERROR),
      });
  }

  private save(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }
}
