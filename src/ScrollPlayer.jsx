import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { reverse, throttle } from 'lodash'; // lodash.throttle 사용
import './VideoPlayer.css';

const ProgressBar = styled.div`
  position: absolute;
  z-index: 10;
  opacity: 0.7;
`
const barDepth = '5px';
const ProgressBarHorizontal = styled(ProgressBar)`
  bottom: 0%;
  left: 50%;
  transform: translate(-50%, 0%);
  width: ${props => `${100 / props.factor}%`};
  height: ${barDepth};
  background: ${props => `linear-gradient(
    ${props.reverse ? 'to left':'to right'},
    red ${props.progress}%,
    transparent ${props.progress}%
  )`};
`
const ProgressBarVertical = styled(ProgressBar)`
  top: 50%;
  left: 0%;
  transform: translate(0%, -50%);
  width: ${barDepth};
  height: ${props => `${100 / props.factor}%`};
  background: ${props => `linear-gradient(
    ${props.reverse ? 'to top':'to bottom'},
    red ${props.progress}%,
    transparent ${props.progress}%
  )`};
`

const VideoPlayer = ({
  src, // 비디오 소스 URL
  direction = 'vertical', // 'vertical' 또는 'horizontal'
  reverse = false, // 상->하 또는 좌->우가 역방향인지 여부
  factor = 1, // 이동 거리 스케일링 팩터
  showDebug = false
}) => {
  const videoRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [startPos, setStartPos] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const rafRef = useRef(null); // requestAnimationFrame 참조

  console.log(direction, reverse, factor);

  // 비디오 메타데이터 로드 및 프리로드
  useEffect(() => {
    const video = videoRef.current;
    video.preload = 'auto'; // 비디오 프리로드 설정
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  // 이벤트 시작 (터치 또는 마우스)
  const handleStart = React.useCallback((x, y, e) => {
    setStartPos({
      x,
      y,
      time: videoRef.current.currentTime,
    });
    if (e.type === 'touchstart') {
      e.preventDefault(); // 터치 시 기본 스크롤 방지
    }
  }, []);

  // 비디오 시간 업데이트 (requestAnimationFrame으로 동기화)
  const updateVideoTime = React.useCallback((newTime) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current); // 이전 요청 취소
    }
    rafRef.current = requestAnimationFrame(() => {
      const video = videoRef.current;
      newTime = Math.max(0, Math.min(duration, newTime)); // 시간 범위 제한
      video.currentTime = newTime;
      setCurrentTime(newTime);
      // if (video.paused) {
      //   video.play().catch(() => {}); // 재생 실패 무시
      // }
    });
  }, [duration]);

  // 이벤트 이동 (쓰로틀링 적용)
  const handleMove = throttle((x, y) => {
    if (!startPos || !duration) return;
    const video = videoRef.current;

    // 이동 거리 계산
    const delta =
      direction === 'vertical'
        ? y - startPos.y
        : x - startPos.x;

    // 방향에 따라 재생 방향 결정
    const isForward = reverse
      ? delta < 0 // reverse가 true면 상->하(또는 좌->우)가 역방향
      : delta > 0; // reverse가 false면 상->하(또는 좌->우)가 정방향

    // 이동 거리를 비디오 시간으로 변환
    const windowSize =
      direction === 'vertical' ? window.innerHeight : window.innerWidth;
    const timeDelta = (Math.abs(delta) / (windowSize / factor)) * duration;
    const newTime = startPos.time + (isForward ? timeDelta : -timeDelta);

    updateVideoTime(newTime); // requestAnimationFrame으로 시간 업데이트
  }, 16); // 약 60FPS에 맞게 16ms로 쓰로틀링

  // 이벤트 종료
  const handleEnd = React.useCallback(() => {
    setStartPos(null);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current); // 남은 요청 정리
    }
    videoRef.current.pause(); // 이동 종료 시 일시정지
  }, []);

  // 터치 이벤트 핸들러
  const handleTouchStart = React.useCallback((e) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY, e);
  }, [handleStart]);

  const handleTouchMove = React.useCallback((e) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  }, [handleMove]);

  const handleTouchEnd = React.useCallback((e) => {
    handleEnd();
    e.preventDefault();
  },[handleEnd]);

  // 마우스 이벤트 핸들러
  const handleMouseDown = React.useCallback((e) => {
    handleStart(e.clientX, e.clientY, e);
  }, [handleStart]);

  // 마우스 이벤트는 document에 바인딩
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (startPos) handleMove(e.clientX, e.clientY);
    };
    const handleGlobalMouseUp = () => {
      if (startPos) handleEnd();
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [startPos, duration, direction, reverse, factor, handleMove, handleEnd]);

  const currentProgress = (currentTime / duration) * 100;
  console.log(currentProgress)
  // 디버깅용 시간 표시
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <video
        ref={videoRef}
        src={src}
        style={{
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      />
      {showDebug && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 20,
            color: 'white',
            padding: '5px',
            zIndex: 2,
            fontSize: '14px',
            backdropFilter: 'blur(10px)',
            borderRadius: '10px',
          }}
        >
          Current Time: {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
        </div>
      )}
      {showDebug && direction === 'horizontal' && (
        <ProgressBarHorizontal 
          direction={direction}
          factor={factor}
          progress={currentProgress}
          reverse={reverse}
        ></ProgressBarHorizontal>
      )}
      {showDebug && direction === 'vertical' && (
        <ProgressBarVertical 
          direction={direction}
          factor={factor}
          progress={currentProgress}
          reverse={reverse}
        ></ProgressBarVertical>
      )}
    </div>
  );
};

export default React.memo(VideoPlayer);