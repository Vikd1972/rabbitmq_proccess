export interface ILink {
  id?: number;
  title?: string;
  path: string;
  taskDuration?: number;
  numberOfLinks?: number;
  idDomain?: number;
  isChecked?: boolean;
}

export interface IDomain {
  id: number;
  domain: string;
  isChecked: boolean;
}
