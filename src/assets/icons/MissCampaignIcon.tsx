import React from 'react';

interface IconProps {
  className?: string;
}

const MissCampaignIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M13.3334 4.66667V11.3333C13.3334 13.3333 12.3334 14.6667 10.0001 14.6667H6.00008C3.66675 14.6667 2.66675 13.3333 2.66675 11.3333V4.66667C2.66675 2.66667 3.66675 1.33334 6.00008 1.33334H10.0001C12.3334 1.33334 13.3334 2.66667 13.3334 4.66667Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.33341 3.33334H6.66675"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 12.6667C8.73638 12.6667 9.33333 12.0697 9.33333 11.3333C9.33333 10.597 8.73638 10 8 10C7.26362 10 6.66667 10.597 6.66667 11.3333C6.66667 12.0697 7.26362 12.6667 8 12.6667Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default MissCampaignIcon;
