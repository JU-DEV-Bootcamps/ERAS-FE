import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { ProfessionalProfile } from '@core/models/professional-profile.model';

// Empty until the professional info section loads the saved profile from the backend.
const EMPTY_PROFESSIONAL_PROFILE: ProfessionalProfile = {
  position: '',
  faculty: '',
  officeHours: '',
  subjectsTaught: [],
  courses: [],
};

interface ProfessionalProfileState {
  profile: ProfessionalProfile;
}

const initialState: ProfessionalProfileState = {
  profile: EMPTY_PROFESSIONAL_PROFILE,
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
