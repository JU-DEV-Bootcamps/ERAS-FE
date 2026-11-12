const PHONE_WIDTH = 375;
const PHONE_HEIGHT = 667;

/**
 * Test helper. Puts a rendered form modal inside a panel laid out like the
 * full-screen dialog of a 375px phone and expects that its header, every
 * form field and its two action buttons are inside the panel.
 */
export function expectFitsMobileDialog(host: HTMLElement): void {
  const panel = document.createElement('div');
  panel.className = 'mobile-fullscreen-dialog';
  panel.style.cssText = `width: ${PHONE_WIDTH}px; height: ${PHONE_HEIGHT}px; max-width: none; overflow: hidden;`;
  host.parentElement?.insertBefore(panel, host);
  panel.appendChild(host);
  host.style.cssText =
    'display: flex; flex-direction: column; height: 100%; min-height: 0;';

  const panelRect = panel.getBoundingClientRect();
  expect(panelRect.width).toBe(PHONE_WIDTH);

  const header = host.querySelector('.modal-header');
  expect(header).not.toBeNull();
  expect(header!.getBoundingClientRect().right).toBeLessThanOrEqual(
    panelRect.right
  );

  const fields = Array.from(host.querySelectorAll('mat-form-field'));
  expect(fields.length).toBeGreaterThan(0);
  fields.forEach(field => {
    const rect = field.getBoundingClientRect();
    expect(rect.left).toBeGreaterThanOrEqual(panelRect.left);
    expect(rect.right).toBeLessThanOrEqual(panelRect.right);
  });

  const buttons = Array.from(
    host.querySelectorAll<HTMLButtonElement>('mat-dialog-actions button')
  );
  expect(buttons.length).toBe(2);
  buttons.forEach(button => {
    const rect = button.getBoundingClientRect();
    expect(rect.width).toBeGreaterThan(0);
    expect(rect.left).toBeGreaterThanOrEqual(panelRect.left);
    expect(rect.right).toBeLessThanOrEqual(panelRect.right);
    expect(rect.top).toBeGreaterThanOrEqual(panelRect.top);
    expect(rect.bottom).toBeLessThanOrEqual(panelRect.bottom);
  });
}
