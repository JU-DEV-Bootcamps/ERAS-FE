import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';

import { OverflowTooltipDirective } from './overflow-tooltip.directive';

@Component({
  standalone: true,
  imports: [MatTooltipModule, OverflowTooltipDirective],
  template: `
    <span
      appOverflowTooltip
      [tooltipText]="tooltipText"
      style="display: inline-block; width: 50px;"
    >
      {{ content }}
    </span>
  `,
})
class TestHostComponent {
  tooltipText = 'Full content here';
  content = 'Truncated content here';
}

describe('OverflowTooltipDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let el: HTMLElement;
  let tooltip: MatTooltip;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const debugEl = fixture.debugElement.query(
      By.directive(OverflowTooltipDirective)
    );
    el = debugEl.nativeElement;
    tooltip = debugEl.injector.get(MatTooltip);
  });

  it('should create the directive', () => {
    const directive = fixture.debugElement
      .query(By.directive(OverflowTooltipDirective))
      .injector.get(OverflowTooltipDirective);

    expect(directive).toBeTruthy();
  });

  it('should set the tooltip message on mouseenter when content overflows', () => {
    Object.defineProperty(el, 'scrollWidth', {
      configurable: true,
      value: 200,
    });
    Object.defineProperty(el, 'clientWidth', { configurable: true, value: 50 });

    el.dispatchEvent(new Event('mouseenter'));

    expect(tooltip.message).toBe('Full content here');
  });

  it('should set the tooltip message to null on mouseenter when content does not overflow', () => {
    Object.defineProperty(el, 'scrollWidth', { configurable: true, value: 50 });
    Object.defineProperty(el, 'clientWidth', { configurable: true, value: 50 });

    el.dispatchEvent(new Event('mouseenter'));

    expect(tooltip.message).toBeFalsy();
  });

  it('should call hide on the tooltip on mouseleave', () => {
    const hideSpy = spyOn(tooltip, 'hide');

    el.dispatchEvent(new Event('mouseleave'));

    expect(hideSpy).toHaveBeenCalled();
  });
});
