import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { ProfessionalProfile } from '@core/models/professional-profile.model';

// Mock data until the backend exposes a professional-profile endpoint
const MOCK_PROFESSIONAL_PROFILE: ProfessionalProfile = {
  position: 'Professor of Computer Science',
  faculty: 'Faculty of Engineering',
  officeHours: 'Mon/Wed 2:00 PM - 4:00 PM',
  activeEvaluations: '4 Ongoing',
  subjectsTaught: [
    'Introduction to UIUX',
    'Advanced Algorithms',
    'Machine Learning',
  ],
  courses: [
    { code: 'CS401', name: 'Neural Network Architectures' },
    { code: 'CS502', name: 'Advanced Machine Learning Seminar' },
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
