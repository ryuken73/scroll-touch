import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import styled from 'styled-components';

const CustomSelect = styled.select`
  padding: 6px 10px 5px 10px;
  background: ${props => props.darkStyle && 'rgba(0, 0, 0, 0.3)'};
  color: ${props => props.darkStyle && 'white'};
  border: ${props => props.darkStyle && '0px solid'};
  width: 100%;
  border-radius: 5px;
`

export default function CommonSelector(props) {
  const {
    options,
    paramName,
    value,
    changeValue,
    disabled,
    darkStyle
  } = props;

  const handleChange = React.useCallback((event) => {
    changeValue(paramName, event.target.value)
  }, [changeValue, paramName]);

  return (
    <FormControl disabled size="small">
      <CustomSelect
        value={value}
        onChange={handleChange}
        disabled={disabled}
        darkStyle={darkStyle}
      >
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </CustomSelect>
    </FormControl>
  );
}
