import logoSvg from '../assets/logo.svg';

/** Central product / company branding — use instead of hardcoded strings */
export const BRAND = {
  productName: 'DGTOOHL 360',
  productShort: 'DGTOOHL360',
  companyName: 'Mobiyoung',
  tagline: 'A MOBIYOUNG PRODUCT',
  appTitle: 'Lead Management System',
  copyright: (year = new Date().getFullYear()) =>
    `© ${year} Mobiyoung. All rights reserved.`,
  exportAuthor: 'DGTOOHL360 LMS',
  exportCompany: 'DGTOOHL360',
  exportFooter: 'Generated from DGTOOHL360 LMS',
  logos: {
    light: logoSvg,
    dark: '/logo-white.png',
    login: '/logo.png',
    svg: logoSvg,
  },
  logoAlt: 'DGTOOHL 360',
} as const;
