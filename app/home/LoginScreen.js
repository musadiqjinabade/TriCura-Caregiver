import { SafeAreaView, Linking, Alert, View, Image, Dimensions, Text, TextInput, TouchableOpacity, Keyboard, KeyboardAvoidingView, Animated, StatusBar, ActivityIndicator, StyleSheet } from 'react-native';
import styles, { IMAGE_HEIGHT, IMAGE_HEIGHT_NEW, IMAGE_HEIGHT_SMALL } from '../styles/Common';
import styleConstants from '../styles/StyleConstants';
const WIDTH = Dimensions.get("screen").width;
const HEIGHT = Dimensions.get("screen").height;
import LinearGradient from 'react-native-linear-gradient';
import { withNavigation, StackActions, NavigationActions } from 'react-navigation';
import { Container, Toast } from 'native-base';
import { connect } from "react-redux";
import { getUserData, saveUserData } from "../store/actions/userActions";
import Globals from '../Globals';
import AsyncStorage from '@react-native-community/async-storage';
import { widthPercentageToDP, heightPercentageToDP } from "react-native-responsive-screen";
import { ScrollView } from "react-native-gesture-handler";
import firebase from 'react-native-firebase';
import Modal from 'react-native-modalbox';
import React from 'react';
const queryString = require('query-string');
import NetInfo from "@react-native-community/netinfo";

class LoginScreen extends React.Component {


    constructor(props) {
        super(props);
        this.imageHeightnnew = new Animated.Value(IMAGE_HEIGHT_NEW);
        this.imageHeight = new Animated.Value(IMAGE_HEIGHT);
        this.state = {
            agencyCode: null,
            emailAddress: null,
            password: null,
            loading: false,
            isFocused: false,
            token: '',
            userToken: '',
            platform: '',
            resetToken: '',
            resetAgency: '',
            resetPassword: '',
            resetConfirmPassword: ''
        }
    }

    async componentDidMount() {
        
        if (Platform.OS === 'android') {
            Linking.getInitialURL().then(url => {
                this.navigate(url);
            });
        }
        else {
            Linking.getInitialURL().then((url) => {
                if (url) {
                    console.log('Initial url is: ' + url)
                    this.handleOpenURL({ url })
                }
            }).catch(err => console.log('An error occurred', err))
        }

        Linking.getInitialURL().then((url) => {
            if (url) {
                this.navigate(event.url);
            }
        })
            .catch((e) => { })
        Linking.addEventListener('url', this.appWokeUp);
    }

    componentWillUnmount() {
        Linking.removeEventListener('url', this.appWokeUp);
        // Linking.removeEventListener('url', this.handleOpenURL);
    }
    appWokeUp = (event) => {
        // this handles the use case where the app is running in the background and is activated by the listener...
        // Alert.alert('Linking Listener','url  ' + event.url)
        this.navigate(event.url);
    }

    handleOpenURL = (event) => { // D
        this.navigate(event.url);
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

    navigate = (url) => { // E
        const { navigate } = this.props.navigation;
        var parsed = queryString.parseUrl(url);
        this.setState({ resetToken: parsed.query.token, resetAgency: parsed.query.agency })
        console.log('Requesting token = ', parsed.query.token);
        this.refs.modal1.open()

    }


    checkPermission = async () => {
        const enabled = await firebase.messaging().hasPermission();
        if (enabled) {
            this.getFcmToken();
        } else {
            this.requestPermission();
        }
    }

    getFcmToken = async () => {
        const fcmToken = await firebase.messaging().getToken();
        if (fcmToken) {
            console.log("fcm : ", fcmToken);
            this.setState({ token: fcmToken })
            this.messageListener();
            //this.showAlert('Your Firebase Token is:', fcmToken);
        } else {
            this.showAlert('Failed', 'No token received');
        }
    }

    requestPermission = async () => {
        try {
            await firebase.messaging().requestPermission();
            // User has authorised
        } catch (error) {
            // User has rejected permissions
        }
    }

    messageListener = async () => {
        this.notificationListener = firebase.notifications().onNotification((notification) => {
            const { title, body } = notification;
            // this.showAlert(title, body);
        });

        this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
            const { title, body } = notificationOpen.notification;
            // this.showAlert(title, body);
        });

        const notificationOpen = await firebase.notifications().getInitialNotification();
        if (notificationOpen) {
            const { title, body } = notificationOpen.notification;
            // this.showAlert(title, body);
        }

        this.messageListener = firebase.messaging().onMessage((message) => {
            console.log(JSON.stringify(message));
        });
    }

    showAlert = (title, message) => {
        Alert.alert(
            title,
            message,
            [
                { text: 'OK', onPress: () => console.log('OK Pressed') },
            ],
            { cancelable: false },
        );
    }

    componentWillMount() {
        this.checkPermission();
        if (Platform.OS == 'ios') {
            this.setState({ platform: 'ios' })
            this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
            this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
        } else {
            this.setState({ platform: 'android' })
            this.keyboardWillShowSub = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow);
            this.keyboardWillHideSub = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
        }
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
            //toValue: IMAGE_HEIGHT_NEW
        }).start();
    };


    keyboardDidShow = (event) => {
        Animated.timing(this.imageHeight, {
            toValue: IMAGE_HEIGHT_SMALL,
            //toValue: IMAGE_HEIGHT_SMALL
        }).start();
    };

    keyboardDidHide = (event) => {
        Animated.timing(this.imageHeight, {
            toValue: IMAGE_HEIGHT,
            //toValue: IMAGE_HEIGHT_NEW

        }).start();
    };

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

    async addDeviceToken() {
        this.setState({ loading: true });
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = Globals.httpMode + agency_code + Globals.domain + '/api/v1/devices';

        try {
            var qs = require('qs');
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'App-Token': '96ef950f-bfae-4ee5-89a0-f23ab9e50b96',
                'Authentication-Token': this.state.userToken
            }
            try {
                var response = await axios.post(url, qs.stringify({
                    'device[device_token]': this.state.token,
                    'device[platform]': this.state.platform
                }), {
                        headers: headers
                    })
                if (response.status === 200) {
                    console.log("response : ", response.data);
                    await AsyncStorage.setItem('fcm_token', this.state.token);
                    const resetAction = StackActions.reset({
                        index: 0,
                        actions: [
                            NavigationActions.navigate({
                                routeName: "InitialScreen"
                            })
                        ]
                    });
                    this.props.navigation.dispatch(resetAction);
                }
                else {
                    this.showMessage(response.error);
                }
            }
            catch (error) {
                console.log("error : ", error);
            }
        }
        catch (e) {
            console.log("e : ", e);
            var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
            this.setState({
                loading: false,
            })
            this.showMessage(error);
        }

    }

    async login() {
        this.setState({ signloading: true }, async () => {
            var error = null;
            if (this.state.agencyCode === null || this.state.agencyCode === '') {
                error = 'Please enter agency code'
                this.setState({ signloading: false })
            }
            else if (this.state.agencyCode.indexOf(' ') > -1) {
                error = 'Invalid agency code'
                this.setState({ signloading: false })
            }
            else if (this.state.emailAddress === null || this.state.emailAddress === '' || !this.isValidEmail(this.state.emailAddress)) {
                error = 'Please enter a valid email address'
                this.setState({ signloading: false })

            }
            else if (this.state.password === null || this.state.password === '' || this.state.password.length < 8) {
                error = 'Password must contain atleast 8 characters!'
                this.setState({ signloading: false })

            }

            else if (this.state.password.length < 8) {
                error = 'Password must contain at least 8 characters!'
                this.setState({ signloading: false })
            }

            if (error) {
                this.showMessage(error);
                this.setState({ signloading: false })

                return;
            }
            else {
                this.setState({ signloading: true });
                var url = Globals.httpMode + this.state.agencyCode  + Globals.domain + '/api/v1/sessions';
                var requestBody = qs.stringify({
                    'user[email]': this.state.emailAddress,
                    'user[password]': this.state.password,
                });
                console.log("sessions",url)
                try {
                    var response = await this.props.data.formRequest.post(url, requestBody);
                    if (_.get(response, 'data.access_token', false)) {
                        var data = _.get(response, 'data', null);
                        this.setState({
                            signloading: true,
                            userToken: data.access_token
                        }, async () => {
                            var userData = null;
                            userData = data.user[Object.keys(data.user)[0]];
                            var role = userData.role;
                            if (role === 'caregiver') {
                                await AsyncStorage.setItem('agency_code', this.state.agencyCode);
                                await this.props.saveUserData(data);
                                this.addDeviceToken();
                            }
                            else {
                                this.setState({ signloading: false })
                                this.showMessage('You are not authorized to use this application.');
                            }
                        })
                    }
                    else {
                        var error = _.get(response, 'data.errors', 'Something went wrong!');
                        this.setState({
                            signloading: false,
                        });
                        if (typeof (error) === 'string') {
                            this.showMessage(error);
                        }
                        else {
                            this.showMessage('Something went wrong!');
                        }
                    }
                }
                catch (e) {
                    var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
                    console.log("error : ", e);
                    this.setState({
                        signloading: false,
                    })
                    this.showMessage(error);
                }
            }
        });

    }

    async resetNewPassword() {
        this.setState({ saveloading: true });
        const axios = require('axios');

        var url = Globals.httpMode + this.state.resetAgency + Globals.domain + '/api/v1/password';
        try {
            var qs = require('qs');
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'App-Token': '96ef950f-bfae-4ee5-89a0-f23ab9e50b96'
            }
            try {
                var response = await axios.put(url, qs.stringify({
                    'reset_password_token': this.state.resetToken,
                    'password': this.state.resetPassword,
                    'password_confirmation': this.state.resetConfirmPassword
                }), {
                        headers: headers
                    })
                if (response.status === 200) {
                    this.setState({
                        data: response.data, saveloading: false
                    }, () => {
                        if (this.state.data.message === 'Update successfully') {
                            this.showMessage("Updated successfully");
                            this.refs.modal1.close()
                        }
                        else {
                            this.showMessage(this.state.data.message);
                        }
                    })
                }
                else {
                    this.setState({ saveloading: false });
                    this.showMessage("Invalid Credentials");
                }
            }
            catch (error) {
                if (error.response.status === 422) {
                    this.setState({ saveloading: false });
                    this.showMessage("Invalid Token");
                }
            }
        }
        catch (e) {
            var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
            this.setState({
                saveloading: false,
            })
            this.showMessage(error);
        }

    }

    render() {
        const { navigate } = this.props.navigation;
        const { onFocus, onBlur, ...otherProps } = this.props;

        return (
            <SafeAreaView style={[styles.full, styles.backgroundColor]}>
                <Container style={{ flex: 1 }}>
                    <StatusBar barStyle="dark-content" hidden={false} backgroundColor="transparent" translucent={false} />

                    <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps={true}>

                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={[styles.full]}>
                            <View style={[styles.full, styles.center, styles.column]}>
                                <View style={[styles.container, styles.column, { flex: 1, justifyContent: 'center', marginTop: widthPercentageToDP('3%') }]}>
                                    <Animated.Image source={require('../../assets/images/logo_new.png')} style={[styles.logo, { width: widthPercentageToDP('55%'), height: this.imageHeight, }]} />

                                    <Text style={[styles.normalFont, styles.fontSize(2.4), { color: '#3985C4' }]}>Sign in to access the account</Text>
                                </View>
                            </View>

                            {/* <ScrollView style={{flex:1}}> */}
                            <View style={[styles.full, styles.column]}>
                                <View style={[styles.full, styles.column, styles.pd(4), styles.mt(2), { flex: 2, marginBottom: this.state.isFocused ? widthPercentageToDP('6%') : null }]}>
                                    <View style={[styles.mb(2), styles.normalBorderBottom]}>
                                        <Text style={[styles.normalFont, styles.fontSize(2), styles.fontcolor]}>AGENCY CODE</Text>
                                        <TextInput
                                            autoCapitalize='none'
                                            style={[styles.pv(1), styles.ph(0), styles.boldFont, styles.fontSize(2.5), { color: '#828ea5', fontFamily: 'Catamaran-Medium' }]}
                                            placeholder={'Enter Your Agency Code'}
                                            onFocus={this.handleFocus}
                                            onBlur={this.handleBlur}
                                            placeholderTextColor="#828ea5"
                                            onChangeText={(text) => {
                                                this.setState({
                                                    agencyCode: text
                                                })
                                            }}
                                        />
                                    </View>
                                    <View style={[styles.mb(2), styles.normalBorderBottom]}>
                                        <Text style={[styles.normalFont, styles.fontSize(2)]}>EMAIL ADDRESS</Text>
                                        <TextInput
                                            autoCapitalize='none'
                                            style={[styles.pv(1), styles.ph(0), styles.fontSize(2.5), { color: '#828ea5', fontFamily: 'Catamaran-Medium' }]}
                                            placeholder={'Enter Your Email Address'}
                                            placeholderTextColor="#828ea5"
                                            onFocus={this.handleFocus}
                                            onBlur={this.handleBlur}
                                            onChangeText={(text) => {
                                                this.setState({
                                                    emailAddress: text, isFocused: true
                                                })
                                            }}
                                            value={this.state.email}
                                        />
                                    </View>
                                    <View style={[styles.mb(2), styles.normalBorderBottom]}>
                                        <Text style={[styles.normalFont, styles.fontSize(2)]}>PASSWORD</Text>
                                        <TextInput
                                            autoCapitalize='none'
                                            secureTextEntry={true}
                                            style={[styles.pv(1), styles.ph(0), styles.boldFont, styles.fontSize(2.5), { color: '#828ea5', fontFamily: 'Catamaran-Medium' }]}
                                            placeholder={'Enter Your Password'}
                                            onFocus={this.handleFocus}
                                            onBlur={this.handleBlur}
                                            placeholderTextColor="#828ea5"
                                            onChangeText={(text) => {
                                                this.setState({
                                                    password: text
                                                })
                                            }}
                                        />
                                    </View>
                                    <View style={[styles.full, styles.column, { borderRadius: 5 }]}>
                                        <TouchableOpacity style={[styles.mb(2), styles.full]}
                                            onPress={async () => {
                                                //console.log("internet : ", await this.checkInternet());
                                                if (await this.checkInternet()) {
                                                    this.login();
                                                }
                                                else {
                                                    this.showToast("No Internet Connectivity!")
                                                }
                                            }
                                            }>
                                            <LinearGradient
                                                colors={[styleConstants.gradientStartColor, styleConstants.gradientEndColor]} style={styles.linearGradient}
                                                start={{ x: 0.0, y: 0.25 }} end={{ x: 1.2, y: 1.0 }}
                                                style={[styles.rh(7), styles.center, , styles.br(0.3), {
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
                                                            <Text style={[styles.boldFont, styles.fontSize(2.5), { color: 'white', textAlign: 'center' }]}> SIGN IN </Text>
                                                        )
                                                }
                                            </LinearGradient>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.mt(4), styles.full]} onPress={() => navigate('ForgotPasswordScreen')}>
                                            <Text style={[styles.boldFont, styles.fontSize(2), { color: styleConstants.linkTextColor, textAlign: 'center' }]}>Forgot Password ?</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                            <View style={[styles.column,]}>

                            </View>
                            {/* </ScrollView> */}
                        </KeyboardAvoidingView>
                    </ScrollView>



                </Container>


                <Modal style={[screenStyles.modal, screenStyles.modal2]} position={"center"} ref={"modal1"} swipeArea={20}
                    backdropPressToClose={false}  >
                    <ScrollView keyboardShouldPersistTaps={false}>
                        <View style={{ flex: 1, width: widthPercentageToDP('85%'), justifyContent: 'center', alignContent: 'center', backgroundColor: '#fff', borderRadius: 4, flexDirection: 'column', paddingHorizontal: widthPercentageToDP('1%'), paddingVertical: widthPercentageToDP('1%') }} >
                            <TouchableOpacity style={[styles.mb(0.1), { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-end', marginRight: widthPercentageToDP('3%') }]}
                                onPress={() => { this.refs.modal1.close() }}>
                                <View style={{ marginLeft: widthPercentageToDP('6%') }}></View>
                                <Text style={[styles.boldFont, styles.fontSize(3), { justifyContent: 'center', alignSelf: 'center', color: '#3B5793', marginLeft: widthPercentageToDP('2%') }]}>Reset Password</Text>
                                <Image style={[{ height: heightPercentageToDP('5%'), width: widthPercentageToDP('5%'), resizeMode: 'contain', alignSelf: 'flex-end' }]}
                                    source={require('../../assets/images/error.png')} />
                            </TouchableOpacity>
                            <View style={[styles.normalBorderBottom, { margin: widthPercentageToDP('5%') }]}>
                                <Text style={[styles.normalFont, styles.fontSize(2)]}>NEW PASSWORD</Text>
                                <TextInput
                                    autoCapitalize='none'
                                    secureTextEntry={true}
                                    style={[styles.pv(1), styles.ph(0), styles.boldFont, styles.fontSize(2.5), { color: '#828ea5', fontFamily: 'Catamaran-Medium' }]}
                                    placeholder={'Enter New Password'}
                                    onFocus={this.handleFocus}
                                    onBlur={this.handleBlur}
                                    placeholderTextColor="#828ea5"
                                    onChangeText={(text) => {
                                        this.setState({
                                            resetPassword: text
                                        })
                                    }}
                                />
                            </View>
                            <View style={[styles.normalBorderBottom, { margin: widthPercentageToDP('5%') }]}>
                                <Text style={[styles.normalFont, styles.fontSize(2)]}>CONFIRM PASSWORD</Text>
                                <TextInput
                                    autoCapitalize='none'
                                    secureTextEntry={true}
                                    style={[styles.pv(1), styles.ph(0), styles.boldFont, styles.fontSize(2.5), { color: '#828ea5', fontFamily: 'Catamaran-Medium' }]}
                                    placeholder={'Enter New Confirm Password'}
                                    onFocus={this.handleFocus}
                                    onBlur={this.handleBlur}
                                    placeholderTextColor="#828ea5"
                                    onChangeText={(text) => {
                                        this.setState({
                                            resetConfirmPassword: text
                                        })
                                    }}
                                />
                            </View>
                            <View style={{ justifyContent: 'center', alignSelf: 'center', flexDirection: 'row', marginBottom: widthPercentageToDP('3%'), marginTop: widthPercentageToDP('3%') }}>
                                <TouchableOpacity style={{ justifyContent: 'flex-start', alignSelf: 'center', padding: widthPercentageToDP('3%'), borderRadius: 8 }}
                                    onPress={async () => {
                                        //console.log("internet : ", await this.checkInternet());
                                        if (await this.checkInternet()) {
                                            var numOrSpecial = '0123456789`~!@#$%^&*()-_=+{}[]|\/><,.:;?';
                                            var passInvalid = '';
                                            var repPassInvalid = '';
                                            for (var i = 0; i < this.state.resetPassword.length; i++) {
                                                if (numOrSpecial.indexOf(this.state.resetPassword[i]) > -1) {
                                                    passInvalid = 'Valid pass';
                                                }
                                            }
                                            for (var i = 0; i < this.state.resetConfirmPassword.length; i++) {
                                                if (numOrSpecial.indexOf(this.state.resetConfirmPassword[i]) > -1) {
                                                    repPassInvalid = 'Valid repeat pass';
                                                }
                                            }

                                            if (this.state.resetPassword === '' && this.state.resetPassword.length < 8) {
                                                this.showMessage("Password must contain atleast 8 characters!")
                                            }
                                            else if (this.state.resetConfirmPassword === '' && this.state.resetConfirmPassword.length < 8) {
                                                this.showMessage("Password must contain atleast 8 characters!")
                                            }
                                            else if (passInvalid != "Valid pass" || repPassInvalid != "Valid repeat pass") {
                                                this.showMessage('Must include one or more special character/number.');
                                            }
                                            else if (this.state.resetPassword !== this.state.resetConfirmPassword) {
                                                this.showMessage('Password not matching');
                                            }
                                            else {
                                                this.resetNewPassword();
                                            }
                                        }
                                        else {
                                            this.showToast("No Internet Connectivity!")
                                        }

                                    }}>
                                    <LinearGradient
                                        colors={[styleConstants.gradientStartColor, styleConstants.gradientEndColor]}
                                        // style={styles.linearGradient}
                                        start={{ x: 0.0, y: 0.25 }} end={{ x: 1.2, y: 1.0 }}
                                        style={[styles.rh(7), styles.center, styles.br(0.3), {
                                            width: this.state.reimloading ? widthPercentageToDP('35%') : widthPercentageToDP('35%'),
                                            height: widthPercentageToDP('13%'),
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
                                            this.state.saveloading === true ? (
                                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                    <View style={{ paddingRight: 10, backgroundColor: 'transparent' }}>
                                                        <ActivityIndicator size={'small'} color='#FFFFFF' />
                                                    </View>
                                                    <View style={{ backgroundColor: 'transparent' }}>
                                                        <Text style={{ color: '#FFFFFF', fontFamily: 'Catamaran-Bold', }}>Please Wait...</Text>
                                                    </View>
                                                </View>
                                            ) : (
                                                    <Text style={[styles.boldFont, { color: '#ffffff', justifyContent: 'center', alignSelf: 'center', fontSize: widthPercentageToDP('4%') }]}>RESET</Text>
                                                )
                                        }
                                        {/* <Text style={[commonStyles.boldFont, { color: '#ffffff', justifyContent: 'center', alignSelf: 'center', marginHorizontal: wp('2%') }]}>OK</Text> */}

                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </Modal>
            </SafeAreaView>
        );
    }
}

const screenStyles = StyleSheet.create({
    modal: {
        marginTop: widthPercentageToDP('3%'),
        justifyContent: 'center',
        alignItems: 'center',
        position: "absolute",
        backgroundColor: 'rgba(0, 0, 0, 0)',
    },
    modal2: {
        maxHeight: 500,
        minHeight: 80
    },
});

const mapStateToProps = state => ({
    data: state.user.data
});

const mapDispatchToProps = dispatch => ({
    getUserData: () => dispatch(getUserData()),
    saveUserData: data => dispatch(saveUserData(data)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withNavigation(LoginScreen));
