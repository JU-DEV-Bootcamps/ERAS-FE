import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupActionButtonComponent } from './group-action-button.component';
import { ActionHandlerFactory } from '@core/factories/action-handler/action-handler.factory';
import { ACTION_CONTEXT } from '@core/factories/action-handler/models/action-context.token';

describe('GroupActionButtonComponent', () => {
  let component: GroupActionButtonComponent;
  let fixture: ComponentFixture<GroupActionButtonComponent>;

  const mockActionHandler = {
    executeAction: jasmine.createSpy('executeAction'),
  };

  const mockFactory = {
    createAction: jasmine
      .createSpy('createAction')
      .and.returnValue(mockActionHandler),
  };

  const mockActionContext = {
    injector: {
      get: jasmine.createSpy('get'),
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupActionButtonComponent],
      providers: [
        { provide: ActionHandlerFactory, useValue: mockFactory },
        { provide: ACTION_CONTEXT, useValue: mockActionContext },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupActionButtonComponent);
    component = fixture.componentInstance;
    component.actions = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
