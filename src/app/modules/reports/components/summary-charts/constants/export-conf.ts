export const STYLE_CONF = {
  width: '1440px',
  margin: 'auto',
  font_size: {
    h2: '1.6em',
    h3: '1.4em',
    h4: '1.2em',
    p: '1.2em',
  },
  container_card: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
};

export const SNACKBAR_CONF = {
  duration: 3000,
  panel_class: ['custom-snackbar', 'high-z-snackbar'],
  message_start: 'Generating PDF...',
  message_end: 'PDF generated successfully',
};

export const DEFAULT_VALUES = {
  fileName: 'report_detail',
};

export const DESKTOP_EXPORT_WIDTH = {
  report: 1000,
  card: 490,
};

export const EXPORT_REDRAW_WAIT_MS = 800;
