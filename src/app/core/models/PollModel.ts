import { UUID } from 'crypto';

export interface PolModel {
  name: string;
  version: string;
  uuid: UUID;
  audit?: {
    createdBy: string;
    modifiedBy: string;
    createdAt: Date;
    modifiedAt: Date;
  };
  components: [];
  id: number;
}
