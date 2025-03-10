import { Audit } from '../audit.model';

export interface StudentPoll {
  name: string;
  version: string;
  uuid: string;
  audit: Audit | null;
  components: [];
  id: number;
}
