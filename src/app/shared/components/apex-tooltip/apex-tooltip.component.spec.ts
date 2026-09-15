import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApexTooltipComponent } from './apex-tooltip.component';

describe('ApexTooltipComponent', () => {
  let component: ApexTooltipComponent;
  let fixture: ComponentFixture<ApexTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApexTooltipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ApexTooltipComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render the html input inside .apex-cdk-tooltip container', () => {
    component.html = '<span class="test-label">Contenido de prueba</span>';
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const tooltipDiv = element.querySelector('.apex-cdk-tooltip');

    expect(tooltipDiv).not.toBeNull();
    expect(tooltipDiv?.innerHTML).toContain('Contenido de prueba');
  });

  it('should expose ChangeDetectorRef through constructor injection', () => {
    expect(component.cdr).toBeDefined();
  });
});
