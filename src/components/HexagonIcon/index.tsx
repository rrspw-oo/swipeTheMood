import React from 'react';

interface HexagonIconProps {
  className?: string;
  filled?: boolean;
}

const HexagonIcon: React.FC<HexagonIconProps> = ({ className = '', filled = true }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon
        points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="4"
      />
    </svg>
  );
};

export default HexagonIcon;
