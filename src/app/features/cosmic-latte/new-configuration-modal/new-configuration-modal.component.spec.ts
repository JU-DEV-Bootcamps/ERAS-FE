import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewConfigurationModalComponent } from './new-configuration-modal.component';

describe('NewConfigurationModalComponent', () => {
  let component: NewConfigurationModalComponent;
  let fixture: ComponentFixture<NewConfigurationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewConfigurationModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NewConfigurationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
