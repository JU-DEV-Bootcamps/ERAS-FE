import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupActionButtonComponent } from './group-action-button.component';
import { ActionHandlerFactory } from '@core/factories/action-handler/action-handler.factory';
import { ACTION_CONTEXT } from '@core/factories/action-handler/models/action-context.token';
import { ActionButton } from '@core/factories/action-handler/models/action-button.model';
import { Injector } from '@angular/core';

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
    } as unknown as Injector,
  };

  beforeEach(async () => {
    mockActionHandler.executeAction.calls.reset();
    mockFactory.createAction.calls.reset();

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

  describe('actions input', () => {
    it('should receive and store actions input', () => {
      const actionsList: ActionButton[] = [
        { type: 'CREATE' } as unknown as ActionButton,
        { type: 'EXPORT' } as unknown as ActionButton,
      ];

      component.actions = actionsList;
      fixture.detectChanges();

      expect(component.actions.length).toBe(2);
      expect(component.actions).toEqual(actionsList);
    });
  });

  describe('onActionClick', () => {
    it('should create action handler via factory with action type and context injector, then execute action', () => {
      const mockAction = {
        type: 'EXPORT_PDF',
      } as unknown as ActionButton;

      component.onActionClick(mockAction);

      expect(mockFactory.createAction).toHaveBeenCalledWith(
        'EXPORT_PDF',
        mockActionContext.injector
      );
      expect(mockActionHandler.executeAction).toHaveBeenCalledTimes(1);
    });

    it('should correctly handle different action types', () => {
      const deleteAction = {
        type: 'DELETE_ITEM',
      } as unknown as ActionButton;

      component.onActionClick(deleteAction);

      expect(mockFactory.createAction).toHaveBeenCalledWith(
        'DELETE_ITEM',
        mockActionContext.injector
      );
      expect(mockActionHandler.executeAction).toHaveBeenCalledTimes(1);
    });
  });
});
