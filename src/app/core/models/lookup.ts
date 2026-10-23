export interface Lookup {
  label: string;
  value: string | number;
}

export interface LookupExtended extends Lookup {
  colors: {
    label: string;
    background: string;
  };
}
