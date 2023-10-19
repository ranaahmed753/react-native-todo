import React, { useState, useEffect, useRef } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  PanResponder,
  View,
  Easing,
  
} from "react-native";
import PropTypes from "prop-types";

const TRACK_SIZE = 4;
const THUMB_SIZE = 20;

function Rect(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
}

Rect.prototype.containsPoint = function (x, y) {
  return x >= this.x && y >= this.y && x <= this.x + this.width && y <= this.y + this.height;
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
};

const BalanceSlider = ({
  value: propValue = 9,
  disabled = false,
  minimumValue = 0,
  maximumValue = 1,
  step = 0,
  minimumTrackTintColor = "#3f3f3f",
  maximumTrackTintColor = "#b3b3b3",
  thumbTintColor = "#343434",
  thumbImage,
  debugTouchArea = true,
  animateTransitions = false,
  animationType = "timing",
  animationConfig = {},
  style,
  trackStyle,
  thumbStyle ,
  thumbTouchSize={height:40,width:40},
  ...other
}) => {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [trackSize, setTrackSize] = useState({ width: 0, height: 0 });
  const [thumbSize, setThumbSize] = useState({ width: 0, height: 0 });
  const [allMeasured, setAllMeasured] = useState(false);
  const value = useRef(new Animated.Value(propValue)).current;
  const previousLeft = useRef(0);

  const valueVisibleStyle = {};
  const pan = useRef(new Animated.ValueXY()).current;

  const _panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: ()=> true,
      onStartShouldSetPanResponder: (e,gestureState) => _handleStartShouldSetPanResponder(e,gestureState),
      onPanResponderGrant: (e,gestureState) => _handlePanResponderGrant(e,gestureState),
      onPanResponderMove: (e,gestureState)=>_handlePanResponderMove(e,gestureState),
      onPanResponderRelease: (e,gestureState) => _handlePanResponderEnd(e,gestureState),
      onPanResponderTerminate: (e,gestureState) => _handlePanResponderEnd(e,gestureState),
      onPanResponderRelease: () => {
        pan.extractOffset();
      },
    })
  ).current;

  console.log(_panResponder.panHandlers)

  

  useEffect(() => {
    const newValue = propValue;

    if (value.current.__getValue() !== newValue) {
      if (animateTransitions) {
        _setCurrentValueAnimated(newValue);
      } else {
        _setCurrentValue(newValue);
      }
    }
  }, [value, animateTransitions]);



  const _handleStartShouldSetPanResponder = (e,gestureState) => {
    console.log("onStartShouldSetPanResponderEvent: "+gestureState.event)
    return _thumbHitTest(e);
    //return true
  };

  const _handlePanResponderGrant = (e,gestureState) => {
    console.log("onPanResponderGrant: "+gestureState.dx)
    previousLeft.current = _getThumbLeft(value.current.__getValue());
    _fireChangeEvent("onSlidingStart");
  };

  const _handlePanResponderMove = (e, gestureState) => {
    console.log("onPanResponderMove: "+gestureState.dx)
    if (disabled) {
      return;
    }
    _setCurrentValue(_getValue(gestureState));
    _fireChangeEvent("onValueChange");
  };

  const _handlePanResponderEnd = (e, gestureState) => {
    console.log("onPanResponderEnd: "+gestureState.dx)
    if (disabled) {
      return;
    }
    _setCurrentValue(_getValue(gestureState));
    _fireChangeEvent("onSlidingComplete");
  };

  const _measureContainer = (x) => {
    _handleMeasure("containerSize", x);
  };

  const _measureTrack = (x) => {
    _handleMeasure("trackSize", x);
  };

  const _measureThumb = (x) => {
    _handleMeasure("thumbSize", x);
  };

  const _handleMeasure = (name, x) => {
    const { width, height } = x.nativeEvent.layout;
    const size = { width, height };

    if (
      containerSize.width === size.width &&
      containerSize.height === size.height
    ) {
      return;
    }

    if (name === "containerSize") {
      setContainerSize(size);
    } else if (name === "trackSize") {
      setTrackSize(size);
    } else if (name === "thumbSize") {
      setThumbSize(size);
    }

    if (
      containerSize.width > 0 &&
      trackSize.width > 0 &&
      thumbSize.width > 0
    ) {
      setAllMeasured(true);
    }
  };

  const _getRatio = (v) => {
    return (v - minimumValue) / (maximumValue - minimumValue);
  };

  const _getThumbLeft = (v) => {
    const ratio = _getRatio(v);
    return ratio * (containerSize.width - thumbSize.width);
  };

  const _getValue = (gestureState) => {
    const length = containerSize.width - thumbSize.width;
    const thumbLeft = previousLeft.current + gestureState.dx;

    const ratio = thumbLeft / length;

    if (step) {
      return Math.max(
        minimumValue,
        Math.min(
          maximumValue,
          minimumValue +
            Math.round((ratio * (maximumValue - minimumValue)) / step) *
              step
        )
      );
    } else {
      return Math.max(
        minimumValue,
        Math.min(maximumValue, ratio * (maximumValue - minimumValue) + minimumValue)
      );
    }
  };

  const _getCurrentValue = () => {
    return value.current.__getValue();
  };

  const _setCurrentValue = (v) => {
    value.current.setValue(v);
  };

  const _setCurrentValueAnimated = (v) => {
    const animationTypeConfig = Object.assign(
      {},
      DEFAULT_ANIMATION_CONFIGS[animationType],
      animationConfig,
      { toValue: v }
    );

    Animated[animationType](value.current, animationTypeConfig).start();
  };

  const _fireChangeEvent = (event) => {
    if (typeof event === "function") {
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

    if (debugTouchArea) {
      touchOverflowStyle.backgroundColor = "orange";
      touchOverflowStyle.opacity = 0.5;
    }

    return touchOverflowStyle;
  };

  const _thumbHitTest = (e) => {
    const { nativeEvent } = e;
    const thumbTouchRect = _getThumbTouchRect();
    return thumbTouchRect.containsPoint(
      nativeEvent.locationX,
      nativeEvent.locationY
    );
  };

  const _getThumbTouchRect = () => {
    const touchOverflowSize = _getTouchOverflowSize();
    return new Rect(
      touchOverflowSize.width / 2 +
        _getThumbLeft(_getCurrentValue()) +
        (thumbSize.width - thumbTouchSize.width) / 2,
      touchOverflowSize.height / 2 +
        (containerSize.height - thumbTouchSize.height) / 2,
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
      <Animated.View
        style={[defaultStyles.debugThumbTouchArea, positionStyle]}
        pointerEvents="none"
      />
    );
  };

  const _renderThumbImage = () => {
    if (!thumbImage) return null;
    return <Image source={thumbImage} />;
  };

  return (
    <View {...other} style={[defaultStyles.container, style]} onLayout={_measureContainer}>
      <View
        style={[
          { backgroundColor: maximumTrackTintColor },
          defaultStyles.track,
          trackStyle,
        ]}
        onLayout={_measureTrack}
      />
      <Animated.View
        style={[
          defaultStyles.track,
          trackStyle,
          {
            position: "absolute",
            width: Animated.add(
              _getThumbLeft(_getCurrentValue()),
              thumbSize.width / 2
            ),
            backgroundColor: minimumTrackTintColor,
            ...valueVisibleStyle,
          },
        ]}
      />
      <Animated.View
        onLayout={_measureThumb}
        style={[
          { backgroundColor: thumbTintColor },
          defaultStyles.thumb,
          thumbStyle,
          {
            position: "absolute",
            transform: [
              { translateX: _getThumbLeft(_getCurrentValue()) },
              { translateY: 0 },
            ],
            ...valueVisibleStyle,
          },
        ]}
      >
        {_renderThumbImage()}
      </Animated.View>
      <Animated.View
        style={[
          defaultStyles.touchArea,
          _getTouchOverflowStyle(),
        ]}
        {..._panResponder.panHandlers}
      >
        {debugTouchArea && _renderDebugThumbTouchRect()}
      </Animated.View>
    </View>

    
    
  );
};

BalanceSlider.propTypes = {
  value: PropTypes.number,
  disabled: PropTypes.bool,
  minimumValue: PropTypes.number,
  maximumValue: PropTypes.number,
  step: PropTypes.number,
  minimumTrackTintColor: PropTypes.string,
  maximumTrackTintColor: PropTypes.string,
  thumbTintColor: PropTypes.string,
  thumbImage: Image.propTypes.source,
  debugTouchArea: PropTypes.bool,
  animateTransitions: PropTypes.bool,
  animationType: PropTypes.oneOf(["spring", "timing"]),
  animationConfig: PropTypes.object,
  onValueChange: PropTypes.func,
  onSlidingStart: PropTypes.func,
  onSlidingComplete: PropTypes.func,
  thumbTouchSize: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
  }),
};

BalanceSlider.defaultProps = {
  value: 0,
  minimumValue: 0,
  maximumValue: 1,
  step: 0,
  minimumTrackTintColor: "#3f3f3f",
  maximumTrackTintColor: "#b3b3b3",
  thumbTintColor: "#343434",
  thumbTouchSize: { width: 40, height: 40 },
  debugTouchArea: false,
  animationType: "timing",
};

const defaultStyles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: "center",
  },
  track: {
    height: TRACK_SIZE,
    borderRadius: TRACK_SIZE / 2,
  },
  thumb: {
    position: "absolute",
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
  },
  touchArea: {
    position: "absolute",
    backgroundColor: "transparent",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  debugThumbTouchArea: {
    position:'absolute',
    backgroundColor: "transparent",
    opacity: 0.5,
  },

 
});

export default BalanceSlider;