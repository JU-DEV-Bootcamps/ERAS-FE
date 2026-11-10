import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { InterventionActivityModel } from '@core/models/intervention-activity.model';
import { InterventionService } from '@core/services/api/intervention.service';
import { InterventionActivityHistoryComponent } from './intervention-activity-history.component';

// Built from local parts so the expected text does not depend on the time zone of the machine.
const iso = (y: number, m: number, d: number, h: number, min: number): string =>
  new Date(y, m - 1, d, h, min).toISOString();

const created: InterventionActivityModel = {
  id: 1,
  type: 'Created',
  description: 'Intervention created',
  occurredAtUtc: iso(2026, 11, 2, 9, 0),
  userName: 'Ana Pérez',
};

const commented: InterventionActivityModel = {
  id: 2,
  type: 'CommentAdded',
  description: 'Comment added',
  occurredAtUtc: iso(2026, 11, 4, 15, 30),
  userName: 'Luis Gómez',
};

describe('InterventionActivityHistoryComponent', () => {
  let fixture: ComponentFixture<InterventionActivityHistoryComponent>;
  let service: jasmine.SpyObj<InterventionService>;

  async function render(
    events: InterventionActivityModel[]
  ): Promise<HTMLElement> {
    service.getActivity.and.returnValue(of(events));
    fixture = TestBed.createComponent(InterventionActivityHistoryComponent);
    fixture.componentRef.setInput('assessmentId', 1);
    fixture.componentRef.setInput('interventionId', 5);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(() => {
    service = jasmine.createSpyObj<InterventionService>('InterventionService', [
      'getActivity',
    ]);
    TestBed.configureTestingModule({
      imports: [InterventionActivityHistoryComponent],
      providers: [{ provide: InterventionService, useValue: service }],
    });
  });

  it('[680-add-activity-history-to-intervention-details/AC-14] lists description, YYYY-MM-DD HH:mm time and user name in the order received', async () => {
    const el = await render([created, commented]);

    expect(el.textContent).toContain('Activity history');
    const entries = Array.from(el.querySelectorAll('.activity-entry'));
    expect(entries.length).toBe(2);
    expect(entries[0].textContent).toContain('Intervention created');
    expect(entries[0].textContent).toContain('2026-11-02 09:00');
    expect(entries[0].textContent).toContain('Ana Pérez');
    expect(entries[1].textContent).toContain('Comment added');
    expect(entries[1].textContent).toContain('2026-11-04 15:30');
    expect(entries[1].textContent).toContain('Luis Gómez');
    expect(service.getActivity).toHaveBeenCalledWith(1, 5);
  });

  it('should show one bullet for each entry', async () => {
    const el = await render([created, commented]);

    expect(el.querySelectorAll('.activity-entry .activity-bullet').length).toBe(
      2
    );
  });

  it('[680-add-activity-history-to-intervention-details/AC-15] is read only, no edit or delete action', async () => {
    const el = await render([created, commented]);

    expect(el.querySelectorAll('button, input, textarea, a').length).toBe(0);
  });

  it('[680-add-activity-history-to-intervention-details/AC-16] shows only the creation entry without empty rows', async () => {
    const el = await render([created]);

    expect(el.querySelectorAll('.activity-entry').length).toBe(1);
    expect(el.textContent).not.toContain('No activity recorded yet.');
  });

  it('[680-add-activity-history-to-intervention-details/AC-17] shows "No activity recorded yet." when there are no events', async () => {
    const el = await render([]);

    expect(el.querySelectorAll('.activity-entry').length).toBe(0);
    expect(el.textContent).toContain('No activity recorded yet.');
  });

  it('[680-add-activity-history-to-intervention-details/AC-18] shows the user name as plain text', async () => {
    const name = '<b>Ana</b><script>alert(1)</script>';
    const el = await render([{ ...created, userName: name }]);

    expect(el.querySelector('.activity-user')?.textContent).toContain(name);
    expect(el.querySelector('b')).toBeNull();
    expect(el.querySelector('script')).toBeNull();
  });
});
