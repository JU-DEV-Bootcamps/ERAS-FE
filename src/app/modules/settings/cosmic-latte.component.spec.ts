import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { ConfigurationsModel } from '@core/models/configurations.model';
import { ERASRoles } from '@core/models/profile.model';
import { ServiceProviderModel } from '@core/models/service-providers.model';
import { UserDataService } from '@core/services/access/user-data.service';
import { ConfigurationsService } from '@core/services/api/configurations.service';
import { CosmicLatteService } from '@core/services/api/cosmic-latte.service';
import { ServiceProvidersService } from '@core/services/api/service-providers.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { CosmicLatteComponent } from './cosmic-latte.component';

describe('CosmicLatteComponent', () => {
  let component: CosmicLatteComponent;
  let fixture: ComponentFixture<CosmicLatteComponent>;
  let configurations: jasmine.SpyObj<ConfigurationsService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let toast: jasmine.SpyObj<ToastNotificationService>;

  const formResult = {
    configurationName: 'X',
    baseURL: 'https://cl.example.com',
    apiKey: '12345678901234567890123456789012',
    serviceProvider: 3,
  };

  beforeEach(async () => {
    configurations = jasmine.createSpyObj('ConfigurationsService', [
      'getConfigurationsByUserId',
      'createConfiguration',
    ]);
    configurations.getConfigurationsByUserId.and.returnValue(of([]));
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    dialog.open.and.returnValue({ afterClosed: () => of(formResult) } as never);
    toast = jasmine.createSpyObj('ToastNotificationService', ['showToast']);

    await TestBed.configureTestingModule({
      imports: [CosmicLatteComponent],
      providers: [
        { provide: ConfigurationsService, useValue: configurations },
        { provide: ToastNotificationService, useValue: toast },
        {
          provide: ServiceProvidersService,
          useValue: { getAllServiceProviders: () => of([]) },
        },
        {
          provide: UserDataService,
          useValue: { user: () => ({ id: 'user-1' }) },
        },
        {
          provide: CosmicLatteService,
          useValue: jasmine.createSpyObj('CosmicLatteService', ['healthCheck']),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CosmicLatteComponent);
    component = fixture.componentInstance;
    (component as unknown as { dialog: MatDialog }).dialog = dialog;
    fixture.detectChanges();
  });

  it('should send the configuration of the current user', () => {
    configurations.createConfiguration.and.returnValue(
      of({} as ConfigurationsModel)
    );

    component.createConfiguration();

    expect(configurations.createConfiguration).toHaveBeenCalledWith(
      jasmine.objectContaining({
        userId: 'user-1',
        configurationName: 'X',
        baseURL: 'https://cl.example.com',
        serviceProviderId: 3,
      })
    );
  });

  it('should confirm the save and reload the list when the configuration is created', () => {
    configurations.createConfiguration.and.returnValue(
      of({} as ConfigurationsModel)
    );
    configurations.getConfigurationsByUserId.calls.reset();

    component.createConfiguration();

    expect(toast.showToast).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: 'success',
        title: 'Configuration saved',
      })
    );
    expect(configurations.getConfigurationsByUserId).toHaveBeenCalledWith(
      'user-1'
    );
  });

  it('should show the reason and keep the list untouched when the API rejects the name', () => {
    spyOn(console, 'error');
    configurations.createConfiguration.and.returnValue(
      throwError(() => ({ error: "A configuration named 'X' already exists." }))
    );
    configurations.getConfigurationsByUserId.calls.reset();

    component.createConfiguration();

    expect(toast.showToast).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: 'error',
        title: 'Configuration not saved',
        message: "A configuration named 'X' already exists.",
      }),
      true
    );
    expect(configurations.getConfigurationsByUserId).not.toHaveBeenCalled();
  });

  it('should use a generic message when the failure has no details', () => {
    spyOn(console, 'error');
    configurations.createConfiguration.and.returnValue(
      throwError(() => new Error('network'))
    );

    component.createConfiguration();

    expect(toast.showToast).toHaveBeenCalledWith(
      jasmine.objectContaining({
        type: 'error',
        message: 'The configuration could not be saved. Please try again.',
      }),
      true
    );
  });

  it('should not call the API when the dialog is closed without saving', () => {
    dialog.open.and.returnValue({ afterClosed: () => of(undefined) } as never);

    component.createConfiguration();

    expect(configurations.createConfiguration).not.toHaveBeenCalled();
    expect(toast.showToast).not.toHaveBeenCalled();
  });
});

describe('CosmicLatteComponent - configuration card width', () => {
  const LOGO =
    'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
  let frame: HTMLIFrameElement;

  const configuration = (id: number) =>
    ({
      id,
      userId: 'user-1',
      configurationName: `Config ${id}`,
      baseURL: 'https://cl.example.com',
      encryptedKey: 'key',
      serviceProviderId: 1,
    }) as ConfigurationsModel;

  /**
   * A @media rule answers to the window, not to the host width, so the page is
   * moved into an iframe as wide as the screen under test, with the styles of
   * this document and the padding of the layout shell around it.
   */
  const renderOnScreen = async (width: number) => {
    await TestBed.configureTestingModule({
      imports: [CosmicLatteComponent],
      providers: [
        {
          provide: ConfigurationsService,
          useValue: {
            getConfigurationsByUserId: () =>
              of([configuration(1), configuration(2)]),
          },
        },
        {
          provide: ServiceProvidersService,
          useValue: {
            getAllServiceProviders: () =>
              of([
                {
                  id: 1,
                  serviceProviderName: 'Cosmic Latte',
                  serviceProviderLogo: LOGO,
                } as ServiceProviderModel,
              ]),
          },
        },
        {
          provide: UserDataService,
          useValue: { user: () => ({ id: 'user-1', role: ERASRoles.ADMIN }) },
        },
        {
          provide: CosmicLatteService,
          useValue: {
            healthCheck: () =>
              of({ status: true, dateTime: '2026-11-01T12:00:00Z' }),
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(CosmicLatteComponent);
    fixture.detectChanges();

    frame = document.createElement('iframe');
    frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${width}px;height:800px;border:0`;
    document.body.appendChild(frame);
    const doc = frame.contentDocument!;
    doc.open();
    doc.write('<!doctype html><html><head></head><body></body></html>');
    doc.close();
    doc.body.style.margin = '0';
    doc.documentElement.style.overflow = 'hidden';
    doc.body.style.overflow = 'hidden';

    const sheetsLoaded: Promise<void>[] = [];
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach(node => {
      const copy = node.cloneNode(true) as HTMLElement;
      if (copy instanceof HTMLLinkElement) {
        sheetsLoaded.push(
          new Promise(resolve => {
            copy.onload = copy.onerror = () => resolve();
          })
        );
      }
      doc.head.appendChild(copy);
    });
    await Promise.all(sheetsLoaded);

    const shell = doc.createElement('div');
    shell.style.cssText = `box-sizing:border-box;padding:0 ${width < 768 ? 12 : 20}px`;
    shell.appendChild(fixture.nativeElement);
    doc.body.appendChild(shell);

    const area = doc.querySelector('.card-grid-container') as HTMLElement;
    const cards = Array.from(
      doc.querySelectorAll('app-configuration-card')
    ) as HTMLElement[];
    return {
      area: area.getBoundingClientRect(),
      cards: cards.map(card => card.getBoundingClientRect()),
      firstTrack: parseFloat(
        frame.contentWindow!.getComputedStyle(area).gridTemplateColumns
      ),
    };
  };

  afterEach(() => frame?.remove());

  it('[675-limit-configuration-card-width-on-small-screens/AC-1] caps the card at 350px and starts it at the left of the card area on a 500px screen', async () => {
    // GIVEN an "ERAS Administrator" with configurations on a 500px wide screen
    // WHEN they open the Settings page
    const { area, cards } = await renderOnScreen(500);

    // THEN each card is 350px wide, starting at the left edge of the card area
    expect(cards.length).toBe(2);
    cards.forEach(card => {
      expect(card.width).toBeCloseTo(350, 0);
      expect(card.left).toBeCloseTo(area.left, 0);
    });
  });

  it('[675-limit-configuration-card-width-on-small-screens/AC-2] fills the available width, under 350px, and stacks the cards on a 375px screen', async () => {
    // GIVEN an "ERAS Administrator" with configurations on a 375px wide screen
    // WHEN they open the Settings page
    const { area, cards } = await renderOnScreen(375);

    // THEN each card is as wide as the card area, which is under 350px
    expect(cards.length).toBe(2);
    cards.forEach(card => expect(card.width).toBeCloseTo(area.width, 0));
    expect(area.width).toBeLessThan(350);
    // AND the cards are stacked
    expect(cards[1].top).toBeGreaterThanOrEqual(cards[0].bottom - 1);
  });

  it('[675-limit-configuration-card-width-on-small-screens/AC-3] keeps the grid column width with no cap on a 1280px screen', async () => {
    // GIVEN an "ERAS Administrator" with configurations on a 1280px wide screen
    // WHEN they open the Settings page
    const { area, cards, firstTrack } = await renderOnScreen(1280);

    // THEN each card keeps the width of its grid column, with no cap
    expect(firstTrack).toBeGreaterThan(350);
    expect(cards[0].width).toBeCloseTo(firstTrack, 0);
    // AND it still starts at the left edge of the card area
    expect(cards[0].left).toBeCloseTo(area.left, 0);
  });
});
