import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { ProfessionalProfile } from '@core/models/professional-profile.model';

// Mock data until the backend exposes a professional-profile endpoint
const MOCK_PROFESSIONAL_PROFILE: ProfessionalProfile = {
  position: '-',
  faculty: '-',
  officeHours: 'Mon/Fri 2:00 PM - 4:00 PM',
  activeEvaluations: '-',
  subjectsTaught: ['First subject', 'Another subject'],
  courses: [
    { code: 'CODE1', name: 'Course 1' },
    { code: 'CODE2', name: 'Course 2' },
  ],
};

interface ProfessionalProfileState {
  profile: ProfessionalProfile;
}

const initialState: ProfessionalProfileState = {
  profile: MOCK_PROFESSIONAL_PROFILE,
};

const ProfessionalProfileStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(store => ({
    setProfessionalProfile(profile: ProfessionalProfile): void {
      patchState(store, { profile });
    },
    updateProfessionalProfile(changes: Partial<ProfessionalProfile>): void {
      patchState(store, state => ({
        profile: { ...state.profile, ...changes },
      }));
    },
  }))
);

export { ProfessionalProfileStore };
