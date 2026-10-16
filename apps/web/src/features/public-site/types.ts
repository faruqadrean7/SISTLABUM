/**
 * Definisi tipe data untuk Website Publik SMP Laboratorium UM
 */

export interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface QuickLinkItem {
  label: string;
  href: string;
}

export interface ContactInfo {
  schoolName: string;
  affiliation: string;
  address: string;
  phone: {
    display: string;
    tel: string;
  };
  whatsapp: {
    display: string;
    url: string;
  };
  email: {
    display: string;
    mailto: string;
  };
  copyright: string;
}
