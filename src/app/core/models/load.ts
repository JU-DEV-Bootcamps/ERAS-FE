import { ActionData } from '../../shared/components/list/types/action';

export class EventLoad {
  constructor(
    public page: number,
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
