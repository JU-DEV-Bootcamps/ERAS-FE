import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditObjectModalComponent } from './modal-edit-object.component';

describe('EditObjectModalComponent', () => {
  let component: EditObjectModalComponent<object>;
  let fixture: ComponentFixture<EditObjectModalComponent<object>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditObjectModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditObjectModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
