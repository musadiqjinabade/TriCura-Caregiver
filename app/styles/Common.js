import { StyleSheet, Platform, Dimensions, PixelRatio } from "react-native";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';


const window = Dimensions.get('window');

export const IMAGE_HEIGHT = window.width / 3;
export const IMAGE_HEIGHT_NEW = window.width / 8;
export const IMAGE_HEIGHT_SMALL = window.width /9;

export const IMAGE_HEIGHT_LOGO = window.width / 3;
export const IMAGE_HEIGHT_MAXXTONLOGO = window.width / 8;

const TEXT_FONT = "Avenir";
const TEXT_FONT_SIZE = Dimensions.get("screen").height > 700 ? 14 : 12;
const PRIMARY_TEXT_COLOR = "#131515";

const NEXA_BOLD_TEXT_FONT = "NexaBold";
const NEXA_Light_TEXT_FONT = "NexaLight";
const SCREEN_HEIGHT = Dimensions.get("screen").height;
const IS_IPHONE_X = SCREEN_HEIGHT === 812 || SCREEN_HEIGHT === 896;
const STATUS_BAR_HEIGHT = Platform.OS === "ios" ? (IS_IPHONE_X ? 44 : 20) : 0;
const HEADER_HEIGHT = Platform.OS === "ios" ? (IS_IPHONE_X ? 88 : 64) : 64;
const NAV_BAR_HEIGHT = HEADER_HEIGHT - STATUS_BAR_HEIGHT;
const pixelRatio = PixelRatio.get();
const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;

const normalize = size => {
    if (pixelRatio >= 2 && pixelRatio < 3) {
        // iphone 5s and older Androids
        if (deviceWidth < 360) {
            return size * 0.95;
        }

        // iphone 5
        if (deviceHeight < 667) {
            return size;
            // iphone 6-6s
        }

        if (deviceHeight >= 667 && deviceHeight <= 735) {
            return size * 1.15;
        }
        // older phablets
        return size * 1.25;
    }

    if (pixelRatio >= 3 && pixelRatio < 3.5) {
        // catch Android font scaling on small machines
        // where pixel ratio / font scale ratio => 3:3
        if (deviceWidth <= 360) {
            return size;
        }

        // Catch other weird android width sizings
        if (deviceHeight < 667) {
            return size * 1.15;
            // catch in-between size Androids and scale font up
            // a tad but not too much
        }

        if (deviceHeight >= 667 && deviceHeight <= 735) {
            return size * 1.2;
        }

        // catch larger devices
        // ie iphone 6s plus / 7 plus / mi note 等等
        return size * 1.27;
    }

    if (pixelRatio >= 3.5) {
        // catch Android font scaling on small machines
        // where pixel ratio / font scale ratio => 3:3
        if (deviceWidth <= 360) {
            return size;
            // Catch other smaller android height sizings
        }

        if (deviceHeight < 667) {
            return size * 1.2;
            // catch in-between size Androids and scale font up
            // a tad but not too much
        }

        if (deviceHeight >= 667 && deviceHeight <= 735) {
            return size * 1.25;
        }

        // catch larger phablet devices
        return size * 1.4;
    }

    return size;
};

export default (styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    backgroundColor:{
        backgroundColor: '#f1f2f4'
    },
    border:{
        borderWidth:1
    },
    full: {
        flex: 1
    },
    column: {
        flexDirection: 'column'
    },
    row: {
        flexDirection: 'row'
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    margin: {
        marginLeft: wp('5%'),
        marginRight: wp('5%')
    },
    headerTextBoldFont: {
        paddingTop:10,
        fontFamily: 'Catamaran-Bold',
        color: '#293D68',
        fontSize: hp('2.5%')
    },
    headerTextRegularFont: {
        marginTop: -5,
        fontFamily: 'Catamaran-Regular',
        color: '#828EA5',
        fontSize: hp('2%')
    },
    line: {
        marginBottom: wp('1.5%'),
        borderWidth: 0.25,
        borderColor: '#828EA5',
        marginTop: hp('2%'),
    },
    fontSize: (value) => {
        return {
            fontSize: hp(value)
        }
    },
    fontSize: (value) => {
        return {
            fontSize: hp(value)
        }
    },
    normalFont: {
        fontFamily: 'Catamaran-Regular'
    },
    boldFont: {
        fontFamily: 'Catamaran-Bold'
    },
    fs: (value) => {
        return {
            fontSize: hp(value)
        }
    },
    pd: (value) => {
        return {
            paddingTop: hp(value),
            paddingBottom: hp(value),
            paddingLeft: hp(value),
            paddingRight: hp(value)
        }
    },
    mr: (value) => {
        return {
            marginTop: hp(value),
            marginBottom: hp(value),
            marginLeft: hp(value),
            marginRight: hp(value)
        }
    },
    pv: (value) => {
        return {
            paddingVertical: hp(value),
        }
    },
    mv: (value) => {
        return {
            marginVertical: hp(value),
        }
    },

    ph: (value) => {
        return {
            paddingHorizontal: hp(value),
        }
    },
    mt: (value) => {
        return {
            marginTop: hp(value),
        }
    },
    mb: (value) => {
        return {
            marginBottom: hp(value),
        }
    },
    ml: (value) => {
        return {
            marginLeft: hp(value),
        }
    },
    pb: (value) => {
        return {
            paddingBottom: hp(value)
        }
    },
    pt: (value) => {
        return {
            paddingTop: hp(value)
        }
    },
    mr: (value) => {
        return {
            marginRight: hp(value),
        }
    },
    rh: (value) => {
        return {
            height: hp(value)
        }
    },
    br: (value) => {
        return {
            borderRadius: hp(value),
            borderWidth: 0.1
        }
    },
    rw: (value) => {
        return {
            width: wp(value)
        }
    },
    normalBorderBottom: {
        borderBottomColor: '#828EA5',
        borderBottomWidth: 0.5
    },
    logo: {
      height: IMAGE_HEIGHT,
      height: IMAGE_HEIGHT_NEW,
      resizeMode: 'contain',
      marginBottom: 5,
      padding:5,
      marginTop:20,justifyContent:'center',alignItems:'center',alignSelf:'center'
    },
    fontcolor:{
        color:'#293D68'
    }
}));
