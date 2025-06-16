export interface MapClass {
  table?: {
    table?: string;
    header?: string;
    row?: string;
    cell?: string;
  };
  card?: {
    card?: string;
    content: string;
    actions: string;
  };
  paginator?: string;
}
