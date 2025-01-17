export interface User {
  id: string;
  email: string;
  name: string;
  photoUrl: string;
  firstName: string;
  lastName: string;
  authToken: string;
  idToken: string;
  authorizationCode: string;
}

export interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  token: string | null;
}
