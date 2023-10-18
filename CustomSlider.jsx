import React, { useState, useEffect } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  PanResponder,
  View,
  Easing,
  ViewPropTypes,
} from "react-native";
import PropTypes from 'prop-types';

const TRACK_SIZE = 4;
const THUMB_SIZE = 20;

function Rect(x, y, width, height) {
  return {
    x,
    y,
    width,
    height,
    containsPoint: function (x, y) {
      return x >= this.x && y >= this.y && x <= this.x + this.width && y <= this.y + this.height;
    },
  };
}

const DEFAULT_ANIMATION_CONFIGS = {
  spring: {
    friction: 7,
    tension: 100,
  },
  timing: {
    duration: 150,
    easing: Easing.inOut(Easing.ease),
    delay: 0,
  },
};

function CustomSlider({
  value = 0,
  disabled = false,
  minimumValue = 0,
  maximumValue = 1,
  step = 0,
  minimumTrackTintColor = '#3f3f3f',
  maximumTrackTintColor = '#b3b3b3',
  thumbTintColor = '#343434',
  thumbTouchSize = { width: 40, height: 40 },
  onValueChange,
  onSlidingStart,
  onSlidingComplete,
  style,
  trackStyle,
  thumbStyle,
  thumbImage,
  debugTouchArea = false,
  animateTransitions = false,
  animationType = 'timing',
  animationConfig,
}) {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [trackSize, setTrackSize] = useState({ width: 0, height: 0 });
  const [thumbSize, setThumbSize] = useState({ width: 0, height: 0 });
  const [allMeasured, setAllMeasured] = useState(false);
  const [animatedValue] = useState(new Animated.Value(value));

  const _panResponder = PanResponder.create({
    onStartShouldSetPanResponder: _handleStartShouldSetPanResponder,
    onPanResponderGrant: _handlePanResponderGrant,
    onPanResponderMove: _handlePanResponderMove,
    onPanResponderRelease: _handlePanResponderEnd,
    onPanResponderTerminationRequest: _handlePanResponderRequestEnd,
    onPanResponderTerminate: _handlePanResponderEnd,
  });

  useEffect(() => {
    if (allMeasured) {
      animatedValue.setValue(value);
    }
  }, [allMeasured, value]);

  const _handleStartShouldSetPanResponder = (e) => {
    return _thumbHitTest(e);
  };

  const _handlePanResponderGrant = () => {
    const previousLeft = _getThumbLeft(animatedValue.__getValue());
    if (onSlidingStart) {
      onSlidingStart(previousLeft);
    }
  };

  const _handlePanResponderMove = (e, gestureState) => {
    if (disabled) return;

    const newValue = _getValue(gestureState);
    animatedValue.setValue(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  const _handlePanResponderRequestEnd = () => {
    return false;
  };

  const _handlePanResponderEnd = () => {
    if (disabled) return;

    const newValue = animatedValue.__getValue();
    if (onSlidingComplete) {
      onSlidingComplete(newValue);
    }
  };

  const _handleMeasure = (name, layout) => {
    const { width, height } = layout;
    const size = { width, height };

    switch (name) {
      case 'containerSize':
        setContainerSize(size);
        break;
      case 'trackSize':
        setTrackSize(size);
        break;
      case 'thumbSize':
        setThumbSize(size);
        break;
      default:
        break;
    }

    if (containerSize && trackSize && thumbSize) {
      setAllMeasured(true);
    }
  };

  const _getRatio = (value) => {
    return (value - minimumValue) / (maximumValue - minimumValue);
  };

  const _getThumbLeft = (value) => {
    const ratio = _getRatio(value);
    return ratio * (containerSize.width - thumbSize.width);
  };

  const _getValue = (gestureState) => {
    const length = containerSize.width - thumbSize.width;
    const thumbLeft = _previousLeft + gestureState.dx;

    const ratio = thumbLeft / length;

    if (step) {
      return Math.max(minimumValue, Math.min(maximumValue, minimumValue + Math.round(ratio * (maximumValue - minimumValue) / step) * step));
    } else {
      return Math.max(minimumValue, Math.min(maximumValue, ratio * (maximumValue - minimumValue) + minimumValue));
    }
  };

  const _getCurrentValue = () => {
    return animatedValue.__getValue();
  };

  const _setCurrentValue = (value) => {
    animatedValue.setValue(value);
  };

  const _setCurrentValueAnimated = (value) => {
    const animationTypeConfig = Object.assign(
      {},
      DEFAULT_ANIMATION_CONFIGS[animationType],
      animationConfig,
      { toValue: value }
    );

    Animated[animationType](animatedValue, animationTypeConfig).start();
  };

  const _fireChangeEvent = (event) => {
    if (event === 'onSlidingStart' && onSlidingStart) {
      onSlidingStart(_previousLeft);
    } else if (event === 'onValueChange' && onValueChange) {
      onValueChange(_getCurrentValue());
    } else if (event === 'onSlidingComplete' && onSlidingComplete) {
      onSlidingComplete(_getCurrentValue());
    }
  };

  const _getTouchOverflowSize = () => {
    const size = {};
    if (allMeasured) {
      size.width = Math.max(0, thumbTouchSize.width - thumbSize.width);
      size.height = Math.max(0, thumbTouchSize.height - containerSize.height);
    }
    return size;
  };

  const _getTouchOverflowStyle = () => {
    const { width, height } = _getTouchOverflowSize();
    const touchOverflowStyle = {};
    if (width !== undefined && height !== undefined) {
      const verticalMargin = -height / 2;
      touchOverflowStyle.marginTop = verticalMargin;
      touchOverflowStyle.marginBottom = verticalMargin;
      const horizontalMargin = -width / 2;
      touchOverflowStyle.marginLeft = horizontalMargin;
      touchOverflowStyle.marginRight = horizontalMargin;
    }
    if (debugTouchArea) {
      touchOverflowStyle.backgroundColor = 'orange';
      touchOverflowStyle.opacity = 0.5;
    }
    return touchOverflowStyle;
  };

  const _thumbHitTest = (e) => {
    const nativeEvent = e.nativeEvent;
    const thumbTouchRect = _getThumbTouchRect();
    return thumbTouchRect.containsPoint(nativeEvent.locationX, nativeEvent.locationY);
  };

  const _getThumbTouchRect = () => {
    const touchOverflowSize = _getTouchOverflowSize();
    return Rect(
      touchOverflowSize.width / 2 + _getThumbLeft(_getCurrentValue()) + (thumbSize.width - thumbTouchSize.width) / 2,
      touchOverflowSize.height / 2 + (containerSize.height - thumbTouchSize.height) / 2,
      thumbTouchSize.width,
      thumbTouchSize.height
    );
  };

  const _renderDebugThumbTouchRect = (thumbLeft) => {
    const thumbTouchRect = _getThumbTouchRect();
    const positionStyle = {
      left: thumbLeft,
      top: thumbTouchRect.y,
      width: thumbTouchRect.width,
      height: thumbTouchRect.height,
    };

    return (
      <Animated.View
        style={[defaultStyles.debugThumbTouchArea, positionStyle]}
        pointerEvents='none'
      />
    );
  };

  const _renderThumbImage = () => {
    if (thumbImage) {
      return <Image source={thumbImage} />;
    }
    return null;
  };

  return (
    <View style={[defaultStyles.container, style]} onLayout={_measureContainer}>
      <View style={[{ backgroundColor: maximumTrackTintColor }, defaultStyles.track, trackStyle]} onLayout={_measureTrack} />
      <Animated.View style={[defaultStyles.track, trackStyle, minimumTrackStyle]} />
      <Animated.View onLayout={_measureThumb} style={[{ backgroundColor: thumbTintColor }, defaultStyles.thumb, thumbStyle, thumbTransformStyle]}>
        {_renderThumbImage()}
      </Animated.View>
      <View style={[defaultStyles.touchArea, touchOverflowStyle]} {..._panResponder.panHandlers}>
        {debugTouchArea && _renderDebugThumbTouchRect(thumbLeft)}
      </View>
    </View>
  );

  // Rest of the code remains mostly the same
}

const defaultStyles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
  },
  track: {
    height: TRACK_SIZE,
    borderRadius: TRACK_SIZE / 2,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
  },
  touchArea: {
    position: 'absolute',
    backgroundColor: 'transparent',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  debugThumbTouchArea: {
    position: 'absolute',
    backgroundColor: 'green',
    opacity: 0.5,
  },
});

export default CustomSlider;