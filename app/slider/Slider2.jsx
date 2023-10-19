import React, { useState, useRef, useEffect } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  PanResponder,
  View,
  Easing,
  ViewPropTypes,
} from 'react-native';
import PropTypes from 'prop-types';

const TRACK_SIZE = 4;
const THUMB_SIZE = 20;

function Rect(x, y, width, height) {
  return {
    x,
    y,
    width,
    height,
    containsPoint(x, y) {
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

function Slider2({
  value = 0,
  disabled = false,
  minimumValue = 0,
  maximumValue = 1,
  step = 0,
  minimumTrackTintColor = '#3f3f3f',
  maximumTrackTintColor = '#b3b3b3',
  thumbTintColor = '#343434',
  thumbTouchSize = { width: 40, height: 40 },
  onValueChange={},
  onSlidingStart,
  onSlidingComplete,
  style,
  trackStyle,
  thumbStyle,
  thumbImage,
  debugTouchArea = false,
  animateTransitions = true,
  animationType = 'timing',
  animationConfig = {},
}) {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [trackSize, setTrackSize] = useState({ width: 0, height: 0 });
  const [thumbSize, setThumbSize] = useState({ width: 0, height: 0 });
  const [allMeasured, setAllMeasured] = useState(false);
  const valueRef = useRef(new Animated.Value(value));
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: _handleStartShouldSetPanResponder,
      onMoveShouldSetPanResponder: _handleMoveShouldSetPanResponder,
      onPanResponderGrant: _handlePanResponderGrant,
      onPanResponderMove: _handlePanResponderMove,
      onPanResponderRelease: _handlePanResponderEnd,
      onPanResponderTerminationRequest: _handlePanResponderRequestEnd,
      onPanResponderTerminate: _handlePanResponderEnd,
    })
  );

  const _handleStartShouldSetPanResponder = (e, gestureState) => {
    return _thumbHitTest(e);
  };

  const _handleMoveShouldSetPanResponder = (e, gestureState) => {
    return false;
  };

  const _handlePanResponderGrant = () => {
    _previousLeft = _getThumbLeft(_getCurrentValue());
    _fireChangeEvent('onSlidingStart');
  };

  const _handlePanResponderMove = (e, gestureState) => {
    if (disabled) {
      return;
    }

    _setCurrentValue(_getValue(gestureState));
    _fireChangeEvent('onValueChange');
  };

  const _handlePanResponderRequestEnd = (e, gestureState) => {
    return false;
  };

  const _handlePanResponderEnd = (e, gestureState) => {
    if (disabled) {
      return;
    }

    _setCurrentValue(_getValue(gestureState));
    _fireChangeEvent('onSlidingComplete');
  };

  const _measureContainer = (x) => {
    _handleMeasure('containerSize', x);
  };

  const _measureTrack = (x) => {
    _handleMeasure('trackSize', x);
  };

  const _measureThumb = (x) => {
    _handleMeasure('thumbSize', x);
  };

  const _handleMeasure = (name, x) => {
    const { width, height } = x.nativeEvent.layout;
    const size = { width, height };

    const storeName = `_${name}`;
    const currentSize = storeName.current;
    if (currentSize && width === currentSize.width && height === currentSize.height) {
      return;
    }
    storeName.current = size;

    if (_containerSize.current && _trackSize.current && _thumbSize.current) {
      setContainerSize(_containerSize.current);
      setTrackSize(_trackSize.current);
      setThumbSize(_thumbSize.current);
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
      return Math.max(
        minimumValue,
        Math.min(
          maximumValue,
          minimumValue +
            Math.round(ratio * ((maximumValue - minimumValue) / step)) * step
        )
      );
    } else {
      return Math.max(minimumValue, Math.min(maximumValue, ratio * (maximumValue - minimumValue) + minimumValue));
    }
  };

  const _getCurrentValue = () => {
    return valueRef.current.__getValue();
  };

  const _setCurrentValue = (value) => {
    valueRef.current.setValue(value);
  };

  const _setCurrentValueAnimated = (value) => {
    const animationTypeConfig = Object.assign(
      {},
      DEFAULT_ANIMATION_CONFIGS[animationType],
      animationConfig,
      { toValue: value }
    );

    Animated[animationType](valueRef.current, animationTypeConfig).start();
  };

  const _fireChangeEvent = (event) => {
    if (event) {
      event(_getCurrentValue());
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

    if (debugTouchArea === true) {
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

    return new Rect(
      touchOverflowSize.width / 2 + _getThumbLeft(_getCurrentValue()) + (thumbSize.width - thumbTouchSize.width) / 2,
      touchOverflowSize.height / 2 + (containerSize.height - thumbTouchSize.height) / 2,
      thumbTouchSize.width,
      thumbTouchSize.height
    );
  };

  const _renderDebugThumbTouchRect = () => {
    const thumbLeft = _getThumbLeft(_getCurrentValue());
    const thumbTouchRect = _getThumbTouchRect();
    const positionStyle = {
      left: thumbLeft,
      top: thumbTouchRect.y,
      width: thumbTouchRect.width,
      height: thumbTouchRect.height,
    };

    return (
      <Animated.View style={[defaultStyles.debugThumbTouchArea, positionStyle]} pointerEvents="none" />
    );
  };

  const _renderThumbImage = () => {
    if (!thumbImage) return null;
    return <Image source={thumbImage} />;
  };

  const _getPropsForComponentUpdate = (props) => {
    const {
      value,
      onValueChange,
      onSlidingStart,
      onSlidingComplete,
      style,
      trackStyle,
      thumbStyle,
      ...otherProps
    } = props;

    return otherProps;
  };

  return (
    <View {..._getPropsForComponentUpdate(props)} style={[mainStyles.container, style]} onLayout={_measureContainer}>
      <View style={[{ backgroundColor: maximumTrackTintColor }, mainStyles.track, trackStyle]} onLayout={_measureTrack} />
      <Animated.View
        style={[
          mainStyles.track,
          trackStyle,
          {
            position: 'absolute',
            width: Animated.add(_getThumbLeft(_getCurrentValue()), thumbSize.width / 2),
            backgroundColor: minimumTrackTintColor,
            ...valueVisibleStyle,
          },
        ]}
      />
      <Animated.View
        onLayout={_measureThumb}
        style={[
          { backgroundColor: thumbTintColor },
          mainStyles.thumb,
          thumbStyle,
          {
            position: 'absolute',
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: THUMB_SIZE / 2,
            transform: [
              { translateX: _getThumbLeft(_getCurrentValue()) },
              { translateY: 0 },
              ...valueVisibleStyle,
            ],
          },
        ]}
      >
        {_renderThumbImage()}
      </Animated.View>
      <View style={[defaultStyles.touchArea, _getTouchOverflowStyle()]} {...panResponder.current.panHandlers}>
        {debugTouchArea === true && _renderDebugThumbTouchRect()}
      </View>
    </View>
  );
}

const mainStyles = StyleSheet.create({
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

export default Slider2;