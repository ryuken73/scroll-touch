import React from 'react'
import DehazeIcon from '@mui/icons-material/Dehaze';

export default function DragHandle(props) {
  const { size, opacity=1 } = props;
  const iconStyle = {
    fontSize: `${size === 'tiny' ? '25px !important' : size === 'small' ? '35px !important' : '35px !important'}`,
    paddingRight: '10px',
    paddingLeft: '2px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: `${opacity}`,
    color: 'grey'
  }

  return <DehazeIcon {...props} sx={iconStyle} />;
}
