import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessionalInfoComponent } from './professional-info.component';

describe('ProfessionalInfoComponent', () => {
  let component: ProfessionalInfoComponent;
  let fixture: ComponentFixture<ProfessionalInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionalInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfessionalInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the professional profile data from the store', () => {
    const text: string = fixture.nativeElement.textContent;

    expect(text).toContain(component.profile().position);
    expect(text).toContain(component.profile().faculty);
    expect(text).toContain(component.profile().officeHours);
    expect(text).toContain(component.profile().activeEvaluations);
  });

  it('should render a chip for every subject taught', () => {
    const chips: NodeListOf<HTMLElement> =
      fixture.nativeElement.querySelectorAll('.chip');

    expect(chips.length).toBe(component.profile().subjectsTaught.length);
  });

  it('should render a row for every course currently taught', () => {
    const rows: NodeListOf<HTMLElement> =
      fixture.nativeElement.querySelectorAll('.courses-table tbody tr');

    expect(rows.length).toBe(component.profile().courses.length);
  });

  describe('edit button', () => {
    it('should emit "edit" when clicked', () => {
      const editSpy = jasmine.createSpy('edit');
      component.edit.subscribe(editSpy);

      const button: HTMLButtonElement =
        fixture.nativeElement.querySelector('.edit-button');
      button.click();

      expect(editSpy).toHaveBeenCalled();
    });
  });
});
