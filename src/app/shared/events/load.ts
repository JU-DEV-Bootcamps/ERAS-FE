export class EventLoad {
  constructor(
    public pageIndex: number,
    public pageSize: number
  ) {}
}

export interface EventAction {
  event: Event;
  data: unknown;
}
export type EventUpdate = EventAction;

export type EventRemove = EventAction;
