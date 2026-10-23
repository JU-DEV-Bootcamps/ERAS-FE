import {
  Directive,
  effect,
  inject,
  input,
  TemplateRef,
  untracked,
  ViewContainerRef,
} from '@angular/core';
import { ERASRoles } from '@core/models/profile.model';
import { UserDataService } from '@core/services/access/user-data.service';

@Directive({
  selector: '[appHasERASRoles]',
})
export class HasERASRolesDirective {
  private templateRef = inject(TemplateRef);
  private viewContainerRef = inject(ViewContainerRef);
  private _userDataService = inject(UserDataService);
  appHasERASRoles = input<ERASRoles[]>([]);

  private hasView = false;

  constructor() {
    effect(() => {
      const userRole = this._userDataService.user()?.role;
      const allowed =
        !!userRole && (this.appHasERASRoles() ?? []).includes(userRole);

      untracked(() => this.updateView(allowed));
    });
  }

  private updateView(allowed: boolean): void {
    if (allowed && !this.hasView) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!allowed && this.hasView) {
      this.viewContainerRef.clear();
      this.hasView = false;
    }
  }
}
