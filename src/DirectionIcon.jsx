import React from 'react'
import DownIcon from '@mui/icons-material/South';
import UpIcon from '@mui/icons-material/North';
import LeftIcon from '@mui/icons-material/West';
import RightIcon from '@mui/icons-material/East';

const icons = {
  left: LeftIcon,
  right: RightIcon,
  up: UpIcon,
  down: DownIcon
}

export default function DirectionIcon(props) {
  const { size, opacity=1, direction} = props;
  const Icon = icons[direction];
  const iconStyle = {
    fontSize: `${size === 'tiny' ? '15px !important' : size === 'small' ? '35px !important' : '35px !important'}`,
    paddingRight: '2px',
    paddingLeft: '2px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: `${opacity}`,
    color: 'grey',
  }

  return <Icon id={direction} {...props} sx={iconStyle} />;
}
