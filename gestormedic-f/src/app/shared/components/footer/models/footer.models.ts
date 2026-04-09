
export interface FooterLink {
  label: string;
  route?: string;
  href?: string;
  external?: boolean;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}