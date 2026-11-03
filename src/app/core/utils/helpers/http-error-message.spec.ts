import { getHttpErrorMessage } from './http-error-message';

describe('getHttpErrorMessage', () => {
  const fallback = 'Something went wrong';

  it('should return the message the API sent as plain text', () => {
    expect(
      getHttpErrorMessage(
        { error: "A configuration named 'X' already exists." },
        fallback
      )
    ).toBe("A configuration named 'X' already exists.");
  });

  it('should return the title of a problem-details response', () => {
    expect(
      getHttpErrorMessage({ error: { title: 'Bad request' } }, fallback)
    ).toBe('Bad request');
  });

  it('should fall back when there is no usable message', () => {
    expect(getHttpErrorMessage({ error: '   ' }, fallback)).toBe(fallback);
    expect(getHttpErrorMessage({ error: {} }, fallback)).toBe(fallback);
    expect(getHttpErrorMessage({ error: null }, fallback)).toBe(fallback);
    expect(getHttpErrorMessage(new Error('boom'), fallback)).toBe(fallback);
    expect(getHttpErrorMessage(null, fallback)).toBe(fallback);
    expect(getHttpErrorMessage(undefined, fallback)).toBe(fallback);
  });
});
