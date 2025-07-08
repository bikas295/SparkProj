import { SvgIcon } from '@mui/material';

const ParcelPinIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 64 64" fontSize="large">
    {/* Cuboid Parcel */}
    <rect x="16" y="24" width="32" height="20" fill="#C89F73" />
    <polygon points="16,24 32,16 48,24 32,32" fill="#A97449" />
    <polygon points="48,24 48,44 32,52 32,32" fill="#8B5E3C" />
    {/* Map Pin */}
    <path d="M32 16 C24 16, 24 28, 32 36 C40 28, 40 16, 32 16 Z" fill="#E53935" />
    <circle cx="32" cy="22" r="4" fill="white" />
  </SvgIcon>
);

export default ParcelPinIcon; 