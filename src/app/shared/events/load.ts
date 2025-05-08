import { ActionData } from '../components/list/types/action';

export class EventLoad {
  constructor(
    public pageIndex: number,
    public pageSize: number
  ) {}
}

export interface EventAction {
  event: Event;
  item: unknown;
  data: ActionData;
}
export type EventUpdate = EventAction;

export type EventRemove = EventAction;
