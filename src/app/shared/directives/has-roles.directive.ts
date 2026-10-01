import {
  Directive,
  inject,
  Input,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { ERASRoles } from '@core/models/profile.model';
import { UserDataService } from '@core/services/access/user-data.service';

@Directive({
  selector: '[appHasERASRoles]',
})
export class HasERASRolesDirective implements OnInit {
  private templateRef = inject(TemplateRef);
  private viewContainerRef = inject(ViewContainerRef);
  private _userDataService = inject(UserDataService);
  @Input() appHasERASRoles: ERASRoles[] = [];

  ngOnInit(): void {
    this.updateView();
  }

  private updateView(): void {
    const hasPermissions = this.hasViewPermissions();

    if (hasPermissions) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainerRef.clear();
    }
  }

  private hasViewPermissions(): boolean {
    const userRole = this._userDataService.user()?.role;

    if (!userRole) return false;

    return this.appHasERASRoles.includes(userRole);
  }
}
