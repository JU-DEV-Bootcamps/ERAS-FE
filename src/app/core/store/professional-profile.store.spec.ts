import { TestBed } from '@angular/core/testing';

import { ProfessionalProfileStore } from './professional-profile.store';
import { ProfessionalProfile } from '@core/models/professional-profile.model';

describe('ProfessionalProfileStore', () => {
  let store: InstanceType<typeof ProfessionalProfileStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(ProfessionalProfileStore);
  });

  it('should start with an empty professional profile', () => {
    expect(store.profile()).toBeTruthy();
    expect(store.profile().courses.length).toBe(0);
  });

  it('should update the profile when setProfessionalProfile is called', () => {
    const newProfile: ProfessionalProfile = {
      position: 'Associate Professor',
      faculty: 'Faculty of Science',
      officeHours: 'Tue/Thu 10:00 AM - 12:00 PM',
      subjectsTaught: ['Statistics'],
      courses: [{ code: 'ST101', name: 'Intro to Statistics' }],
    };

    store.setProfessionalProfile(newProfile);

    expect(store.profile()).toEqual(newProfile);
  });

  describe('updateProfessionalProfile', () => {
    it('should merge the given changes into the current profile', () => {
      const previousProfile = store.profile();

      store.updateProfessionalProfile({
        officeHours: 'Fri 9:00 AM - 11:00 AM',
      });

      expect(store.profile()).toEqual({
        ...previousProfile,
        officeHours: 'Fri 9:00 AM - 11:00 AM',
      });
    });

    it('should leave fields not included in the changes untouched', () => {
      const previousFaculty = store.profile().faculty;

      store.updateProfessionalProfile({ position: 'Associate Professor' });

      expect(store.profile().position).toBe('Associate Professor');
      expect(store.profile().faculty).toBe(previousFaculty);
    });
  });
});
