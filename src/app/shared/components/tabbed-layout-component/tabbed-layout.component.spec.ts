import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { TabbedLayoutComponent } from './tabbed-layout.component';

@Component({ template: '' })
class EmptyPageComponent {}

describe('TabbedLayoutComponent', () => {
  let fixture: ComponentFixture<TabbedLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabbedLayoutComponent],
      providers: [
        provideRouter([
          { path: 'dynamic-charts', component: EmptyPageComponent },
          { path: 'summary-charts', component: EmptyPageComponent },
          { path: 'polls-answered', component: EmptyPageComponent },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TabbedLayoutComponent);
    fixture.componentRef.setInput('tabs', [
      { label: 'Dynamic Charts', route: 'dynamic-charts' },
      { label: 'Summary Charts', route: 'summary-charts' },
      { label: 'Polls Answered', route: 'polls-answered' },
    ]);
    document.body.appendChild(fixture.nativeElement);
    Object.assign((fixture.nativeElement as HTMLElement).style, {
      display: 'block',
      width: '375px',
    });
    fixture.detectChanges();
  });

  afterEach(() => fixture.nativeElement.remove());

  it('[674-improve-reports-charts-mobile-view/AC-2] keeps the three report tabs tappable and the page without horizontal scroll on mobile', async () => {
    const host = fixture.nativeElement as HTMLElement;
    const nav = host.querySelector<HTMLElement>('.tabs-nav')!;
    const tabs = Array.from(host.querySelectorAll<HTMLElement>('.tab-item'));

    expect(tabs.map(tab => tab.textContent?.trim())).toEqual([
      'Dynamic Charts',
      'Summary Charts',
      'Polls Answered',
    ]);
    expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth);

    const navRect = nav.getBoundingClientRect();
    tabs.forEach(tab => {
      const rect = tab.getBoundingClientRect();
      expect(rect.left).toBeGreaterThanOrEqual(navRect.left);
      expect(rect.right).toBeLessThanOrEqual(navRect.right + 1);
    });

    tabs[2].click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(TestBed.inject(Router).url).toBe('/polls-answered');
    expect(tabs[2].classList).toContain('active-tab');
  });
});
