import React, { useState, useRef } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  View,
  PanResponder,
  Easing,
  ViewPropTypes
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
      };
}

// class Rect {
//     constructor(x, y, width, height) {
//       this.x = x;
//       this.y = y;
//       this.width = width;
//       this.height = height;
//     }
  
//     containsPoint(x, y) {
//       return (
//         x >= this.x && y >= this.y && x <= this.x + this.width && y <= this.y + this.height
//       );
//     }
//   }

// Rect.prototype.containsPoint = function (x, y) {
//   return (
//     x >= this.x && y >= this.y && x <= this.x + this.width && y <= this.y + this.height
//   );
// };

Rect.prototype.containsPoint = function (x, y) {
  return (
    x >= this.x && y >= this.y && x <= this.x + this.width && y <= this.y + this.height
  );
};

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
  // decay : { // This has a serious bug
  //   velocity     : 1,
  //   deceleration : 0.997
  // }
};

const Slider = ({
  value,
  disabled,
  minimumValue,
  maximumValue,
  step,
  minimumTrackTintColor,
  maximumTrackTintColor,
  thumbTintColor,
  thumbTouchSize = { width: 40, height: 40 },
  thumbImage,
  style,
  trackStyle,
  thumbStyle,
  debugTouchArea,
  animateTransitions,
  animationType,
  animationConfig,
  onValueChange,
  onSlidingStart,
  onSlidingComplete,
}) => {
  const containerSize = useRef({ width: 0, height: 0 });
  const trackSize = useRef({ width: 0, height: 0 });
  const thumbSize = useRef({ width: 0, height: 0 });
  const allMeasured = useRef(false);
  const previousLeft = useRef(0);
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

  const _handleStartShouldSetPanResponder = (e) => {
    return _thumbHitTest(e);
  };

  const _handleMoveShouldSetPanResponder = () => {
    return false;
  };

  const _handlePanResponderGrant = () => {
    previousLeft.current = _getThumbLeft(_getCurrentValue());
    _fireChangeEvent(onSlidingStart);
  };

  const _handlePanResponderMove = (e, gestureState) => {
    if (disabled) {
      return;
    }
    _setCurrentValue(_getValue(gestureState));
    _fireChangeEvent(onValueChange);
  };

  const _handlePanResponderRequestEnd = () => {
    return false;
  };

  const _handlePanResponderEnd = () => {
    if (disabled) {
      return;
    }
    _setCurrentValue(_getValue());
    _fireChangeEvent(onSlidingComplete);
  };

  const _measureContainer = (x) => {
    _handleMeasure(containerSize, x);
  };

  const _measureTrack = (x) => {
    _handleMeasure(trackSize, x);
  };

  const _measureThumb = (x) => {
    _handleMeasure(thumbSize, x);
  };

  const _handleMeasure = (sizeRef, x) => {
    const { width, height } = x.nativeEvent.layout;
    const size = { width, height };

    const currentSize = sizeRef.current;
    if (currentSize && width === currentSize.width && height === currentSize.height) {
      return;
    }

    sizeRef.current = size;

    if (containerSize.current.width && trackSize.current.width && thumbSize.current.width) {
      allMeasured.current = true;
    }
  };

  const _getRatio = (val) => {
    return (val - minimumValue) / (maximumValue - minimumValue);
  };

  const _getThumbLeft = (val) => {
    const ratio = _getRatio(val);
    return ratio * (containerSize.current.width - thumbSize.current.width);
  };

  const _getValue = (gestureState) => {
    const length = containerSize.current.width - thumbSize.current.width;
    const thumbLeft = previousLeft.current + gestureState.dx;
    const ratio = thumbLeft / length;

    if (step) {
      return Math.max(
        minimumValue,
        Math.min(
          maximumValue,
          minimumValue +
            Math.round(ratio * (maximumValue - minimumValue) / step) * step
        )
      );
    } else {
      return Math.max(
        minimumValue,
        Math.min(
          maximumValue,
          ratio * (maximumValue - minimumValue) + minimumValue
        )
      );
    }
  };

  const _getCurrentValue = () => {
    return valueRef.current.__getValue();
  };

  const _setCurrentValue = (newValue) => {
    valueRef.current.setValue(newValue);
  };

  const _setCurrentValueAnimated = (newValue) => {
    const animationConfig = Object.assign(
      {},
      DEFAULT_ANIMATION_CONFIGS[animationType],
      animationConfig,
      { toValue: newValue }
    );

    Animated[animationType](valueRef.current, animationConfig).start();
  };

  const _fireChangeEvent = (event) => {
    if (event) {
      event(_getCurrentValue());
    }
  };

  const _getTouchOverflowSize = () => {
    const size = {};
    if (allMeasured.current) {
      size.width = Math.max(0, thumbTouchSize.width - thumbSize.current.width);
      size.height = Math.max(0, thumbTouchSize.height - containerSize.current.height);
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
      touchOverflowSize.width / 2 +
        _getThumbLeft(_getCurrentValue()) +
        (thumbSize.current.width - thumbTouchSize.width) / 2,
      touchOverflowSize.height / 2 +
        (containerSize.current.height - thumbTouchSize.height) / 2,
      thumbTouchSize.width,
      thumbTouchSize.height
    );
  };

  return (
    <View
      style={[styles.container, style]}
      onLayout={_measureContainer}
      {...panResponder.current.panHandlers}
    >
      <View
        style={[{ backgroundColor: maximumTrackTintColor }, styles.track, trackStyle]}
        onLayout={_measureTrack}
      />
      <Animated.View
        style={[
          styles.track,
          trackStyle,
          {
            position: 'absolute',
            width: Animated.add(
              valueRef.current.interpolate({
                inputRange: [minimumValue, maximumValue],
                outputRange: [0, containerSize.current.width - thumbSize.current.width],
              }),
              thumbSize.current.width / 2
            ),
            backgroundColor: minimumTrackTintColor,
          },
        ]}
      />
      <Animated.View
        onLayout={_measureThumb}
        style={[
          { backgroundColor: thumbTintColor },
          styles.thumb,
          thumbStyle,
          {
            position: 'absolute',
            transform: [
              {
                translateX: valueRef.current.interpolate({
                  inputRange: [minimumValue, maximumValue],
                  outputRange: [0, containerSize.current.width - thumbSize.current.width],
                }),
              },
              { translateY: 0 },
            ],
          },
        ]}
      >
        {_renderThumbImage()}
      </Animated.View>
      <View style={[defaultStyles.touchArea, _getTouchOverflowStyle()]} />
      {debugTouchArea === true && _renderDebugThumbTouchRect()}
    </View>
  );

  function _renderThumbImage() {
    if (!thumbImage) return null;

    return <Image source={thumbImage} />;
  }

  function _renderDebugThumbTouchRect() {
    const thumbTouchRect = _getThumbTouchRect();
    const positionStyle = {
      left: valueRef.current.interpolate({
        inputRange: [minimumValue, maximumValue],
        outputRange: [0, containerSize.current.width - thumbSize.current.width],
      }),
      top: thumbTouchRect.y,
      width: thumbTouchRect.width,
      height: thumbTouchRect.height,
    };

    return (
      <Animated.View
        style={[defaultStyles.debugThumbTouchArea, positionStyle]}
        pointerEvents="none"
      />
    );
  }
};

Slider.propTypes = {
  value: PropTypes.number,
  disabled: PropTypes.bool,
  minimumValue: PropTypes.number,
  maximumValue: PropTypes.number,
  step: PropTypes.number,
  minimumTrackTintColor: PropTypes.string,
  maximumTrackTintColor: PropTypes.string,
  thumbTintColor: PropTypes.string,
  thumbImage: Image.propTypes.source,
  thumbTouchSize: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
  }),
  onValueChange: PropTypes.func,
  onSlidingStart: PropTypes.func,
  onSlidingComplete: PropTypes.func,
  style: ViewPropTypes.style,
  trackStyle: ViewPropTypes.style,
  thumbStyle: ViewPropTypes.style,
  debugTouchArea: PropTypes.bool,
  animateTransitions: PropTypes.bool,
  animationType: PropTypes.oneOf(['spring', 'timing']),
  animationConfig: PropTypes.object,
};

Slider.defaultProps = {
  value: 0,
  minimumValue: 0,
  maximumValue: 1,
  step: 0,
  minimumTrackTintColor: '#3f3f3f',
  maximumTrackTintColor: '#b3b3b3',
  thumbTintColor: '#343434',
  thumbTouchSize: { width: 40, height: 40 },
  debugTouchArea: false,
  animationType: 'timing',
};

const styles = StyleSheet.create({
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
});

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

export default Slider;