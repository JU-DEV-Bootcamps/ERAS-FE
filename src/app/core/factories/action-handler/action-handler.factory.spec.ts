import { TestBed } from '@angular/core/testing';
import { Injector } from '@angular/core';
import { ActionHandlerFactory } from './action-handler.factory';
import { ActionType } from './models/action-type.enum';
import { FullscreenAction } from './actions/fullscreen.action';
import { ACTION_CONTEXT } from './models/action-context.token';

describe('ActionHandlerFactory', () => {
  let factory: ActionHandlerFactory;
  let injector: Injector;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ActionHandlerFactory,
        FullscreenAction,
        {
          provide: ACTION_CONTEXT,
          useValue: { hostElement: document.createElement('div') },
        },
      ],
    });

    factory = TestBed.inject(ActionHandlerFactory);
    injector = TestBed.inject(Injector);
  });

  it('should be created', () => {
    expect(factory).toBeTruthy();
  });

  it('should return a FullscreenAction instance for ActionType.FULLSCREEN', () => {
    const action = factory.createAction(ActionType.FULLSCREEN, injector);

    expect(action).toBeInstanceOf(FullscreenAction);
  });

  it('should resolve the action via the provided injector', () => {
    const getSpy = spyOn(injector, 'get').and.callThrough();

    factory.createAction(ActionType.FULLSCREEN, injector);

    expect(getSpy).toHaveBeenCalledWith(FullscreenAction);
  });

  it('should throw an error for an unsupported action type', () => {
    const unsupportedType = 'UNKNOWN' as ActionType;

    expect(() => factory.createAction(unsupportedType, injector)).toThrowError(
      `Unsupported action type: ${unsupportedType}`
    );
  });
});
