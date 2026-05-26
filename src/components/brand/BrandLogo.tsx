import React from 'react';
import { Link } from 'react-router-dom';
import { BRAND } from '../../constants/brand';
import { useTheme } from '../../hooks/useTheme';
import { ROUTES } from '../../constants';

export type BrandLogoVariant = 'sidebar' | 'login' | 'inline';

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  collapsed?: boolean;
  className?: string;
  /** When set, wraps logo in a dashboard link */
  linkToDashboard?: boolean;
}

const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'inline',
  collapsed = false,
  className = '',
  linkToDashboard = false,
}) => {
  const { theme, isDark } = useTheme();

  const src =
    variant === 'login'
      ? BRAND.logos.login
      : isDark
        ? BRAND.logos.dark
        : BRAND.logos.light;

  const imgClass =
    variant === 'sidebar'
      ? `app-sidebar-logo-img transition-opacity duration-200 ${collapsed ? '' : ''}`
      : variant === 'login'
        ? 'login-logo'
        : 'h-8 w-auto max-w-[11rem] object-contain';

  const wrapperClass =
    variant === 'sidebar'
      ? `app-sidebar-logo sidebar-logo-item ${collapsed ? 'app-sidebar-logo--collapsed justify-center px-2' : ''} ${className}`
      : className;

  const img = (
    <img key={theme} src={src} alt={BRAND.logoAlt} className={imgClass} />
  );

  const content =
    variant === 'login' ? (
      <div className={`login-logo-wrap ${className}`}>{img}</div>
    ) : (
      img
    );

  if (linkToDashboard || variant === 'sidebar') {
    return (
      <Link
        to={ROUTES.DASHBOARD}
        className={wrapperClass}
        aria-label="Go to dashboard"
      >
        {variant === 'sidebar' ? img : content}
      </Link>
    );
  }

  return <div className={wrapperClass}>{content}</div>;
};

export default BrandLogo;
