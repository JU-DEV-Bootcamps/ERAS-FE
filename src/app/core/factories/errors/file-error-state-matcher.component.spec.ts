import { FormControl, NgForm } from '@angular/forms';
import { FileErrorStateMatcher } from './file-error-state-matcher.component';

describe('FileErrorStateMatcher', () => {
  let matcher: FileErrorStateMatcher;

  beforeEach(() => {
    matcher = new FileErrorStateMatcher();
  });

  it('should be created', () => {
    expect(matcher).toBeTruthy();
  });

  it('should default hasErrors to false', () => {
    expect(matcher.hasErrors()).toBe(false);
  });

  it('should update hasErrors when setHasErrors is called', () => {
    matcher.setHasErrors(true);
    expect(matcher.hasErrors()).toBe(true);

    matcher.setHasErrors(false);
    expect(matcher.hasErrors()).toBe(false);
  });

  describe('isErrorState', () => {
    it('should return false when hasErrors is false', () => {
      matcher.setHasErrors(false);

      expect(matcher.isErrorState(null, null)).toBe(false);
    });

    it('should return true when hasErrors is true', () => {
      matcher.setHasErrors(true);

      expect(matcher.isErrorState(null, null)).toBe(true);
    });

    it('should ignore the control and form arguments', () => {
      matcher.setHasErrors(true);

      const result = matcher.isErrorState(
        new FormControl(),
        new NgForm([], [])
      );

      expect(result).toBe(true);
    });
  });
});
