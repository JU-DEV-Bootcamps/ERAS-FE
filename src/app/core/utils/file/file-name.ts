const generateFileName = (prefix = 'file'): string => {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timePart = now.toTimeString().slice(0, 8).replace(/:/g, '');
  return `${prefix}_${datePart}_${timePart}`;
};

// Wrap in object so function can be mocked by Jasmine.
export const FileNameUtils = {
  generateFileName,
};
