import { TestBed } from '@angular/core/testing';
import { FullscreenAction } from './fullscreen.action';
import { ACTION_CONTEXT } from '../models/action-context.token';

describe('FullscreenAction', () => {
  let action: FullscreenAction;
  let hostElement: HTMLElement;

  beforeEach(() => {
    hostElement = document.createElement('div');

    TestBed.configureTestingModule({
      providers: [
        FullscreenAction,
        { provide: ACTION_CONTEXT, useValue: { hostElement } },
      ],
    });

    action = TestBed.inject(FullscreenAction);
  });

  afterEach(() => {
    hostElement.classList.remove('app-fullscreen');
    document.body.classList.remove('no-scroll', 'app-fullscreen-active');
  });

  it('should be created', () => {
    expect(action).toBeTruthy();
  });

  it('should add fullscreen classes on first execution', () => {
    action.executeAction();

    expect(hostElement.classList.contains('app-fullscreen')).toBe(true);
    expect(document.body.classList.contains('no-scroll')).toBe(true);
    expect(document.body.classList.contains('app-fullscreen-active')).toBe(
      true
    );
  });

  it('should remove fullscreen classes on second execution (toggle off)', () => {
    action.executeAction();
    action.executeAction();

    expect(hostElement.classList.contains('app-fullscreen')).toBe(false);
    expect(document.body.classList.contains('no-scroll')).toBe(false);
    expect(document.body.classList.contains('app-fullscreen-active')).toBe(
      false
    );
  });

  it('should toggle classes correctly across multiple executions', () => {
    action.executeAction(); // on
    expect(hostElement.classList.contains('app-fullscreen')).toBe(true);

    action.executeAction(); // off
    expect(hostElement.classList.contains('app-fullscreen')).toBe(false);

    action.executeAction(); // on
    expect(hostElement.classList.contains('app-fullscreen')).toBe(true);
  });

  it('should only affect the injected hostElement, not other elements', () => {
    const otherElement = document.createElement('div');

    action.executeAction();

    expect(hostElement.classList.contains('app-fullscreen')).toBe(true);
    expect(otherElement.classList.contains('app-fullscreen')).toBe(false);
  });
});
