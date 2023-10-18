
import {Dimensions, Platform} from 'react-native';
import {moderateScale} from './responsive';

const {width, height} = Dimensions.get('window');
const {width: screenWidth, height: screenHeight} = Dimensions.get('screen');

export const COLORS = {
  PRIMARY: 'rgba(255, 185, 0, 1)',
  PRIMARY10: 'rgba(255, 185, 0, 0.1)',
  PRIMARY20: 'rgba(255, 185, 0, 0.2)',
  PRIMARY02: 'rgba(255, 185, 0, 0.02)',
  BACKGROUND: '#FFFFFF',
  white: '#FFFFFF',
  black: '#000000',
}

export const SIZES = {
    tiny: 4,
    base: 8,
    radius: 12,
    radius5: 5,
    padding: 24,
    containerPaddingHorizontal: moderateScale(18, 0.3),
    listFooterComponentSpacing: 200, 
    largeTitle: 40,
    body1: 30,
    body2: 22,
    body24: 24,
    body3: 16,
    body4: 14,
    body5: 12,
    body6: 10,
    body20: 20,
    body21: 18,
    body40: 40,
    body141: 141
}

export const iconSize = (size = 20) => ({width: size, height: size});

const isIOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';
const appTheme = {COLORS, SIZES, FONTS, LINEHEIGHT, isAndroid, isIOS};

export default appTheme;