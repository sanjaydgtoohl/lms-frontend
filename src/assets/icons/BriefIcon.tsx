import * as React from "react";

const BriefIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="26" height="29" viewBox="0 0 26 29" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g filter="url(#filter0_d_737_39261)">
      <path d="M21 12C21 8.22876 21 6.34315 19.8284 5.17157C18.6569 4 16.7712 4 13 4C9.22876 4 7.34315 4 6.17157 5.17157C5 6.34315 5 8.22876 5 12V18C5 18.9428 5 19.4142 5.29289 19.7071C5.58579 20 6.05719 20 7 20H13C16.7712 20 18.6569 20 19.8284 18.8284C21 17.6569 21 15.7712 21 12Z" stroke="#33363F" strokeWidth="2"/>
      <path d="M10 10L16 10" stroke="#33363F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 14H13" stroke="#33363F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <defs>
      <filter id="filter0_d_737_39261" x="-3" y="0" width="32" height="32" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_737_39261"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_737_39261" result="shape"/>
      </filter>
    </defs>
  </svg>
);

export default BriefIcon;