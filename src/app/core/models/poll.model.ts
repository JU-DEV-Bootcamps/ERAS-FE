import { UUID } from 'crypto';
import { BaseModel } from './common/base.model';
import { ComponentModel } from './component.model';

export interface PollModel extends BaseModel {
  name: string;
  version: string;
  uuid: UUID;
  components: ComponentModel[];
}
