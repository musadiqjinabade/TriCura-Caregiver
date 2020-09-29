import React from "react";
import { View, Image, Dimensions, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, StatusBar, Keyboard, Animated, Platform, ActivityIndicator } from 'react-native';
import styles, { IMAGE_HEIGHT, IMAGE_HEIGHT_NEW, IMAGE_HEIGHT_SMALL } from '../styles/Common';
import { ScrollView } from "react-native-gesture-handler";
import styleConstants from '../styles/StyleConstants';
const WIDTH = Dimensions.get("screen").width;
const HEIGHT = Dimensions.get("screen").height;
import { Container, Toast } from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import { withNavigation } from 'react-navigation';
import Globals from '../Globals';
import AsyncStorage from '@react-native-community/async-storage';
import { widthPercentageToDP, heightPercentageToDP } from "react-native-responsive-screen";
import NetInfo from "@react-native-community/netinfo";


class ForgotPasswordScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            AgencyCode: '',
            lengthAgencyValue: '',
            validated: false,
            platform:''
        }
        this.imageHeightnnew = new Animated.Value(IMAGE_HEIGHT_NEW);
        this.imageHeight = new Animated.Value(IMAGE_HEIGHT);
    }

    componentWillMount() {
        if (Platform.OS == 'ios') {
            this.setState({platform:'ios'})
            this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
            this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
        } else {
            this.setState({platform:'android'})
            this.keyboardWillShowSub = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow);
            this.keyboardWillHideSub = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
        }
    }

    checkInternet() {
        return new Promise((resolve, reject) => {
        NetInfo.fetch().then(state => {
        //console.log("Connection type", state.type);
        if (state.isConnected) {    
        resolve(true);
        }
        else {
        resolve(false);
        }
        });
        })
        
        }

    componentWillUnmount() {
        this.keyboardWillShowSub.remove();
        this.keyboardWillHideSub.remove();
    }

    keyboardWillShow = (event) => {
        Animated.timing(this.imageHeight, {
            duration: event.duration,
            toValue: IMAGE_HEIGHT_SMALL,
        }).start();
    };

    keyboardWillHide = (event) => {
        Animated.timing(this.imageHeight, {
            duration: event.duration,
            toValue: IMAGE_HEIGHT,
        }).start();
    };


    keyboardDidShow = (event) => {
        Animated.timing(this.imageHeight, {
            toValue: IMAGE_HEIGHT_SMALL,
        }).start();
    };

    keyboardDidHide = (event) => {
        Animated.timing(this.imageHeight, {
            toValue: IMAGE_HEIGHT,
        }).start();
    };

    showToast = (message) => {
        Toast.show({
            text: message,
            position: "bottom",
            duration: 3000
        })
    }
    GetValueAgencyCode = (ValueHolder) => {
        var Value = ValueHolder.length.toString();
        this.setState({ lengthAgencyValue: Value, AgencyCode: ValueHolder });
    }

    validate = (text) => {
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (reg.test(text) === false) {
            this.setState({ email: text })
            return false;
        }
        else {
            this.setState({ email: text })
            return true;
        }
    }
    async ForgotPassword() {
        this.setState({ signloading: true });
        const axios = require('axios');
        var url = Globals.httpMode + this.state.AgencyCode + Globals.domain + '/api/v1/password';
        console.log("url : ", url);

        try {
            var qs = require('qs');
            //var response = await this.props.data.formRequest.get(url);
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'App-Token': '96ef950f-bfae-4ee5-89a0-f23ab9e50b96',
            }
            try {
                var response = await axios.post(url, qs.stringify({
                    'email': this.state.email,
                    'agency': this.state.AgencyCode,
                    'platform': this.state.platform,
                    'role': 'caregiver'
                }), {
                        headers: headers
                    })
                if (response.status === 200) {
                    console.log("data : ", response.data)
                    this.setState({
                        data: response.data, signloading: false
                    })
                    this.showMessage(this.state.data.message);
                    this.props.navigation.goBack()
                }

                else {
                    this.setState({ signloading: false })
                    this.showMessage(response.data.errors);
                }
            }
            catch (error) {
                this.setState({ signloading: false })
                console.log("error : ", error.response.status);
                switch (error.response.status) {
                    case 404:
                        this.showMessage("Email address not found");
                        break
                    case 403:
                        this.showMessage("Agency code not found");
                        break
                    default:
                        break
                }
            }
        }
        catch (e) {
            console.log("e : ", e);
            var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
            this.setState({
                signloading: false,
            })
            this.showMessage(error);
        }


    }

    showMessage(message) {
        Toast.show({
            text: message,
            duration: 2000
        })
    }

    isValidEmail = (text) => {
        var reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return reg.test(text)
    }

    handleFocus = event => {
        this.setState({ isFocused: true });
        if (this.props.onFocus) {
            this.props.onFocus(event);
        }

    };

    handleBlur = event => {
        this.setState({ isFocused: false });
        if (this.props.onBlur) {
            this.props.onBlur(event);
        }
    };

    render() {
        const { navigate } = this.props.navigation;
        return (
            <Container style={{ flex: 1 }}>
                <StatusBar barStyle="dark-content" hidden={false} backgroundColor="transparent" translucent={false} />

                <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps={true}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={[styles.full]}>
                        <View style={[styles.full, styles.column]}>
                            <View style={[styles.full, styles.center, styles.column]}>
                                <View style={[styles.container, styles.column, { flex: 1, justifyContent: 'center', marginTop: heightPercentageToDP('6%') }]}>
                                    <Animated.Image source={require('../../assets/images/logo_new.png')} style={[styles.logo, { width: widthPercentageToDP('55%'), height: this.imageHeight, }]} />

                                    <Text style={[styles.normalFont, styles.fontSize(2.4), { color: '#3985C4' }]}>Sign in to access the account</Text>
                                </View>
                            </View>
                            <View style={[styles.full, styles.column, styles.pd(4), styles.mt(2), { flex: 2 }]}>
                                <View style={[styles.mb(2), styles.normalBorderBottom]}>
                                    <Text style={[styles.normalFont, styles.fontSize(2)]}>AGENCY CODE</Text>
                                    <TextInput
                                        style={[styles.pv(1), styles.ph(0), styles.boldFont, styles.fontSize(2.5), { color: '#828ea5' }]}
                                        placeholder={'Enter Your Agency Code'}
                                        placeholderTextColor="#828ea5"
                                        onFocus={this.handleFocus}
                                        onBlur={this.handleBlur}
                                        value={this.state.AgencyCode}
                                        onChangeText={ValueHolder => this.GetValueAgencyCode(ValueHolder)} />
                                </View>
                                <View style={[styles.mb(2), styles.normalBorderBottom]}>
                                    <Text style={[styles.normalFont, styles.fontSize(2)]}>EMAIL ADDRESS</Text>
                                    <TextInput
                                        style={[styles.pv(1), styles.ph(0), styles.boldFont, styles.fontSize(2.5), { color: '#828ea5' }]}
                                        placeholder={'Enter Your Email Address'}
                                        placeholderTextColor="#828ea5"
                                        onFocus={this.handleFocus}
                                        onBlur={this.handleBlur}
                                        onChangeText={(email) => this.setState({ email })}
                                        value={this.state.email} />
                                </View>
                                <View style={[styles.full, styles.column]}>
                                    <TouchableOpacity style={[styles.mb(2), styles.mt(2), { flex: 3 }]}
                                        onPress={async () => {
                                            //console.log("internet : ", await this.checkInternet());
                                            if (await this.checkInternet()) {
                                                if (this.state.AgencyCode === null || this.state.AgencyCode === '') { this.showToast("Please Enter Agency Code"); }
                                                else if (this.state.AgencyCode.indexOf(' ') > -1) {
                                                    this.showToast("Invalid Agency Code");
                                                    this.setState({ signloading: false })
                                                }
                                                else if (this.state.email === null || this.state.email === '' || !this.isValidEmail(this.state.email)) {
                                                    this.showToast('Please Enter a Valid Email Address')
                                                    this.setState({ signloading: false })
                                                }
                                                else {
                                                    this.ForgotPassword()
                                                }
                                            }
                                            else {
                                                this.showMessage("No Internet Connectivity!")

                                            }
                                        }}>
                                        <LinearGradient
                                            colors={[styleConstants.gradientStartColor, styleConstants.gradientEndColor]} style={styles.linearGradient}
                                            start={{ x: 0.0, y: 0.25 }} end={{ x: 1.2, y: 1.0 }}
                                            style={[styles.rh(8), styles.center, , styles.br(0.3), {
                                                borderRadius: 5,
                                                borderColor: '#fff',
                                                shadowColor: "#000",
                                                shadowOffset: {
                                                    width: 0,
                                                    height: 2,
                                                },
                                                shadowOpacity: 0.25,
                                                shadowRadius: 3.84,

                                                elevation: 5,
                                            }]}>
                                            {
                                                this.state.signloading === true ? (
                                                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                        <View style={{ paddingRight: 10, backgroundColor: 'transparent' }}>
                                                            <ActivityIndicator size={'small'} color='#FFFFFF' />
                                                        </View>
                                                        <View style={{ backgroundColor: 'transparent' }}>
                                                            <Text style={{ color: '#FFFFFF', fontFamily: 'Catamaran-Bold', }}>Please Wait...</Text>
                                                        </View>
                                                    </View>
                                                ) : (
                                                        <Text style={[styles.boldFont, styles.fontSize(2.5), { color: 'white', textAlign: 'center' }]}>FORGOT PASSWORD</Text>
                                                    )
                                            }
                                        </LinearGradient>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ marginTop: widthPercentageToDP('2%'), flex: 0.7 }} onPress={() => this.props.navigation.goBack()}>
                                        <Text style={[styles.boldFont, styles.fontSize(2), { color: styleConstants.linkTextColor, textAlign: 'center' }]}>Back</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </ScrollView>
            </Container>

        );
    }
}

export default withNavigation(ForgotPasswordScreen);