export interface ILink {
  id?: number;
  title?: string;
  path: string;
  taskDuration?: number;
  numberOfLinks?: number;
  idRootPage?: number;
  isChecked?: boolean;
}

export interface IDomain {
  id: number;
  domain: string;
  isChecked: boolean;
}
