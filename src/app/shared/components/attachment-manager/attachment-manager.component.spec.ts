import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachmentManagerComponent } from './attachment-manager.component';

describe('AttachmentManagerComponent', () => {
  let component: AttachmentManagerComponent;
  let fixture: ComponentFixture<AttachmentManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttachmentManagerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AttachmentManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
