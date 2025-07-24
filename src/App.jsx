import React from 'react';
import styled from 'styled-components';
import Draggable from 'react-draggable';
import Button from '@mui/material/Button';
import ScrollPlayer from './ScrollPlayer';
import DragHandle from './DragHandler';
import DirectionIcon from './DirectionIcon';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CommonSelector from './CommonSelector';
import sampleVideo from './assets/mp4_orig_I.mp4?url'

const Container = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
`

const RowFlex = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  margin-bottom: ${props => props.marginBottom || '0px'};
`
const ControlContainer = styled.div`
  position: absolute !important;
  top: 30%;
  right: 5%;
  z-index: 10;
  min-width: 120px;
  background: rgba(0, 0, 0, 0.3);
  padding: 10px;
  padding-top: 2px;
  padding-bottom: 1px;
  border-radius: 5px;
  box-sizing: border-box;

`
const ModeContainer = styled.div`
  display: ${props => !props.showControl && 'none'};
`
const ChangeModeButton = styled(Button)`
  backdrop-filter: blur(10px);
  z-index: 10;
  &:hover {
    border: 1px solid white !important;
  };
`  
const IconContainer = styled.div`
  border: 1px solid;
  padding: 5px;
  padding-right: 13px;  
  padding-left: 13px;  
  border-radius: 5px;
  box-sizing: border-box;
  background: ${props => props.isActive ?'rgba(255, 0, 0, 0.3)':'rgba(0, 0, 0, 0.3)'};
  cursor: pointer;
`
const FactorContainer = styled.div`
  /* padding-top: 6px; */
`
const TinyText = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-family: "Roboto","Helvetica","Arial",sans-serif;
`
const DebugText = styled(ChangeModeButton)``
const CustomInput = styled.input`
  /* margin-left: 0%;
  margin-bottom: 0%;
  margin-top: 6px; */
`
const modes = {
  vertical: 'vertical',
  horizontal: 'horizontal'
}
const directions = {
  horizontal: {
    left: 'left',
    right: 'right',
  },
  vertical: {
    up: 'up',
    down: 'down'
  }
}
const DEFAULT_DIRECTION = {
  horizontal: 'right',
  vertical: 'down'
}

const FACTOR_OPTIONS = [
  1, 2, 3, 4, 5
]

function App() {
  const [showControl, setShowControl] = React.useState(false);
  const [scrollMode, setScrollMode] = React.useState(modes.vertical);
  const [currentDirection, setCurrentDirection] = React.useState(directions.vertical.down);
  const [currentFactor, setCurrentFactor] = React.useState(1);
  const [showDebug, setShowDebug] = React.useState(false);

  const ref = React.useRef(null);

  const queryString = window.location.search;
  const params = new URLSearchParams(queryString);
  const videoUrl = params.get('url')|| sampleVideo;
  console.log(videoUrl)

  const toggleMode = React.useCallback(() => {
    setScrollMode(prevMode => {
      const nextMode = prevMode === modes.vertical ? modes.horizontal : modes.vertical;
      setCurrentDirection(DEFAULT_DIRECTION[nextMode]);
      return nextMode;
    })
  }, [])

  const changeDirection = React.useCallback((e) => {
    const {id: direction} = e.target;
    setCurrentDirection(direction);
  }, [])

  const changeFactor = React.useCallback((paramName, value) => {
    setCurrentFactor(value);
  }, [])

  const toggleCheckbox = React.useCallback(() => {
    setShowDebug(showDebug => !showDebug);
  }, [])

  const toggleShowControl = React.useCallback(() => {
    setShowControl(showControl => !showControl);
  }, [])

  const modeText = scrollMode;
  const reverse = scrollMode === modes.vertical ?
    currentDirection === directions.vertical.up :
    scrollMode === modes.horizontal &&
    currentDirection === directions.horizontal.left

  const iconStyle = {
    fontSize: '25px',
    paddingLeft: 'auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'grey'
  }
  
  const debugText = showDebug ? 'GUIDE OFF':'GUIDE ON';

  return (
    <Container id="root">
      <ScrollPlayer
        src={videoUrl}
        direction={scrollMode}
        reverse={reverse}
        factor={currentFactor}
        showDebug={showDebug}
      ></ScrollPlayer>
      <Draggable nodeRef={ref} bounds="#root" handle="#changeModeDragger">
        <ControlContainer ref={ref}>
          <RowFlex>
            <DragHandle id="changeModeDragger" bounds="#root" size="small" />
            {showControl ? (
              <ExpandLessIcon onClick={toggleShowControl} sx={iconStyle}></ExpandLessIcon>
            ):(
              <ExpandMoreIcon onClick={toggleShowControl} sx={iconStyle}></ExpandMoreIcon>
            )}
          </RowFlex>
          <ModeContainer showControl={showControl}>
            <ChangeModeButton
              variant="outlined" 
              sx={{
                color: "white", 
                opacity: 0.8, 
                fontSize: '10px', 
                width: '100%',
                marginBottom: '5px',
                background: 'rgba(0, 0, 0, 0.3)'
              }}
              onClick={toggleMode}
              ref={ref}
            >
              {modeText}
            </ChangeModeButton>
            <RowFlex marginBottom="5px">
              {Object.keys(directions[scrollMode]).map(direction => (
                <IconContainer
                  key={direction}
                  id={direction}
                  isActive={direction === currentDirection}
                  onClick={changeDirection}
                >
                  <DirectionIcon 
                    direction={direction}
                    size="tiny"
                  ></DirectionIcon>
                </IconContainer>
              ))}
            </RowFlex>
            <FactorContainer>
              <RowFlex marginBottom="5px">
                <TinyText>Factor</TinyText>
                <CommonSelector
                  options={FACTOR_OPTIONS}
                  paramName="factor"
                  value={currentFactor}
                  disabled={false}
                  changeValue={changeFactor}
                  darkStyle
                ></CommonSelector>
              </RowFlex>
            </FactorContainer>
            <RowFlex>
              <DebugText 
                variant="outlined" 
                sx={{
                  color: "white", 
                  opacity: 0.8, 
                  fontSize: '10px', 
                  width: '100%', 
                  marginBottom: '10px',
                  background: `${showDebug? 'rgba(255, 0, 0, 0.3)': 'rgba(0, 0, 0, 0.3)'}`
                }}
                onClick={toggleCheckbox}
              >{debugText}</DebugText>
            </RowFlex>
          </ModeContainer>
        </ControlContainer>
      </Draggable>
    </Container>
  )
}

export default App
