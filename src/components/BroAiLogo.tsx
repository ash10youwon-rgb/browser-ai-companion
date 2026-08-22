import React from "react";

interface BroAiLogoProps {
  className?: string;
  size?: number;
}

export const BroAiLogo: React.FC<BroAiLogoProps> = ({ className = "h-7 w-7", size }) => {
  return (
    <svg
      width={size || 28}
      height={size || 28}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Antennas / Ears */}
      <circle cx="16" cy="4" r="2" fill="#38BDF8" />
      <path d="M16 6V8" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
      <rect x="2" y="13" width="3" height="6" rx="1.5" fill="#94A3B8" />
      <rect x="27" y="13" width="3" height="6" rx="1.5" fill="#94A3B8" />

      {/* Robot Face Screen Outer Frame */}
      <rect
        x="4"
        y="8"
        width="24"
        height="18"
        rx="6"
        stroke="#E2E8F0"
        strokeWidth="2"
        fill="#0D1526"
      />

      {/* Eye 1 */}
      <path
        d="M10 15C10 13.8954 10.8954 13 12 13C13.1046 13 14 13.8954 14 15"
        stroke="#38BDF8"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Eye 2 */}
      <path
        d="M18 15C18 13.8954 18.8954 13 20 13C21.1046 13 22 13.8954 22 15"
        stroke="#38BDF8"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Smile */}
      <path
        d="M13 19.5C14.2 21 17.8 21 19 19.5"
        stroke="#38BDF8"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Neck/Stand */}
      <path d="M12 26H20" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 26V28" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};
