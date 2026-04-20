export interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
  roleIds?: number[];
  children?: MenuItem[];
}
