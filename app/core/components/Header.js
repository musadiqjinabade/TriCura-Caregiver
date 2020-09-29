import React from "react";
import { ImageBackground, View, Image, SafeAreaView, TouchableOpacity, StatusBar, Platform, Text } from 'react-native';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import styles from '../../styles/Common';
import styleConstants from '../../styles/StyleConstants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import OfflineNotice from './OfflineNotice'
import SvgUri from 'react-native-svg-uri';



const Header = ({
    expanded,
    label,
    onBack,
    onLogo,
    Agency_logo
}) => {
    if (expanded || Agency_logo) {
        var isSVG = false;
        var InvalidSVG = true;
        if(Agency_logo){
        console.log("url : ", Agency_logo)
            if (Agency_logo.agency_logo) {
                const res = Agency_logo.agency_logo.split('?');
                var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
                if(regex .test(Agency_logo.agency_logo)) {
                    if (res[0].includes(".svg")) {
                        isSVG = true;
                    InvalidSVG = true

                    }
                    else {
                        isSVG = false;
                    InvalidSVG = true

                    }
                }
                else{
                    InvalidSVG = false
                }
            }
        }
        console.log('isSVG:',isSVG,InvalidSVG)

        return (
            <SafeAreaView>
                <OfflineNotice/>
                <StatusBar barStyle="light-content" hidden={false} backgroundColor="transparent" translucent={true} />
                <View >
                    <ImageBackground
                        fadeDuration={0}
                        style={[styles.row, styles.rh(12.5), { width: "100%",height:hp('14%'), marginTop: Platform.OS === 'android' ? hp('-0.1%') : hp('-5%') }]}
                        resizeMode='stretch'
                        source={require('../../../assets/images/background.png')}>
                        <View style={[styles.full, styles.row, { justifyContent: 'flex-start', alignItems: 'center', height: hp('6.2%'), padding: wp('1.5%'), marginLeft: wp('2%'), marginRight: wp('2%'), marginTop: hp("4%") }]}>
                            {
                                onBack ? (
                                    <TouchableOpacity style={[styles.row, { justifyContent: 'flex-start', flexDirection: 'row' }]} onPress={() => {
                                        onBack()
                                    }}>
                                        <Animatable.Image animation={'fadeInDown'} duration={700} style={[{ padding: wp('1%'), marginVertical: wp('4%'), width: wp('5.5%'), height: hp('4%'), aspectRatio: 1, marginRight: wp('3%') }]}
                                            fadeDuration={0}
                                            source={require('../../../assets/images/left-arrow.png')} />

                                        <Animatable.Text animation={'fadeInDown'} duration={700} style={[styles.fontSize(2.5), { fontWeight: 'bold', marginVertical: wp('2%'), color: 'white',padding:hp('0.7%') }]}>{label}</Animatable.Text>

                                    </TouchableOpacity>
                                ) : null
                            }
                            {
                                onBack ? (null
                                ) : (<View style={[{ justifyContent: 'flex-start' }]}>
                                    <Animatable.Text animation={'fadeInDown'} duration={700} style={[styles.fontSize(2.5), { fontWeight: 'bold', color: 'white' }]}>{label}</Animatable.Text>
                                </View>
                                    )
                            }


                            <View style={[styles.row, styles.full, { justifyContent: 'flex-end', }]}>
                                {
                                    onLogo ? (
                                        <TouchableOpacity onPress={() => {
                                            onLogo()
                                        }}> 
                                            { 
                                            InvalidSVG?
                                            Agency_logo != null && Agency_logo.agency_logo != null ?
                                            isSVG ? <SvgUri
                                            width={wp('30%')}
                                            height={wp('8%')}
                                            source={{ uri: Agency_logo.agency_logo }}
                                        />:
                                                <Animatable.Image animation={'fadeInDown'} duration={700} style={{ width: wp('25%'), height: wp('7%'), resizeMode: 'contain' }}
                                                    fadeDuration={0}
                                                    source={{ uri: Agency_logo.agency_logo }} /> : (
                                                        <Animatable.Image animation={'fadeInDown'} duration={700} style={{ width: wp('25%'), height: wp('7%'), resizeMode: 'contain' }}
                                                        fadeDuration={0}
                                                        source={require('../../../assets/images/CareDaily.png')} />
                                                )
                                                :
                                                <Animatable.Image animation={'fadeInDown'} duration={700} style={{ width: wp('25%'), height: wp('7%'), resizeMode: 'contain' }}
                                    fadeDuration={0}
                                    source={require('../../../assets/images/CareDaily.png')} />
                                            }
                                        </TouchableOpacity>
                                    ) :  <Animatable.Image animation={'fadeInDown'} duration={700} style={{ width: wp('25%'), height: wp('7%'), resizeMode: 'contain' }}
                                    fadeDuration={0}
                                    source={require('../../../assets/images/CareDaily.png')} />

                                }
                            </View>
                        </View>
                    </ImageBackground>
                </View>
                {/* <OfflineNotice /> */}

            </SafeAreaView>

        )
    }
    else {
        return (
            <SafeAreaView style={{ marginTop: Platform.OS === 'android' ? null : hp('-5%') }} >
                <StatusBar barStyle="light-content" hidden={false} backgroundColor="transparent" translucent={true} />
                <Animatable.View style={[styles.rh(11), { width: "100%" }]}>
                    <LinearGradient
                        colors={[styleConstants.gradientStartColor, styleConstants.gradientEndColor]}
                        style={[styles.row, styles.rh(11), styles.center, styles.ph(2), { justifyContent: 'flex-start' }]}
                        start={{ x: 0.0, y: 0.25 }} end={{ x: 1.2, y: 1.0 }}>
                        <View style={[styles.full, styles.row, { marginTop: wp("6%") }]}>
                            {
                                onBack ? (
                                    <TouchableOpacity onPress={() => {
                                        onBack()
                                    }}
                                        style={[styles.row, styles.pt(1.0), { justifyContent: 'flex-start', paddingVertical: wp('4%') }]}>
                                        <Animatable.Image animation={'fadeInUp'} duration={500} style={[{ width: wp('5%'), height: wp('5%'), resizeMode: 'stretch', marginRight: wp('3%') }]}
                                            fadeDuration={0}
                                            source={require('../../../assets/images/left-arrow.png')} />
                                    </TouchableOpacity>
                                ) : null
                            }
                            <Animatable.Text animation={'fadeInUp'} duration={500} style={[styles.boldFont, styles.fontSize(2.5), { color: 'white' }]}>{label}</Animatable.Text>
                        </View>

                    </LinearGradient>
                </Animatable.View>
            </SafeAreaView>
        )
    }
}
export default Header;