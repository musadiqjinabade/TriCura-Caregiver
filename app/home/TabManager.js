import React, {Fragment,useEffect} from "react";
import { View, Image, Text, TouchableOpacity, RefreshControl, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import styles from '../styles/Common';
import Modal from 'react-native-modalbox';
import LinearGradient from 'react-native-linear-gradient';
import styleConstants from '../styles/StyleConstants';
import DashboardScreen from './DashboardScreen';
import MyCalendarScreen from '../shift/MyCalendarScreen';
import NotificationScreen from '../Notification/NotificationScreen';
import ProfileScreen from '../profile/ProfileScreen';
import { ScrollView } from "react-native-gesture-handler";
import NetInfo from "@react-native-community/netinfo";
import { Toast } from "native-base";
import Header from '../core/components/Header';
import { connect } from "react-redux";
import { withNavigation, StackActions, NavigationActions } from 'react-navigation';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, widthPercentageToDP } from 'react-native-responsive-screen';
import firebase from 'react-native-firebase';
const iconDashboard = require('../../assets/images/dashboard.png');
const iconDashboardSelected = require('../../assets/images/dashboard-selected.png');
const iconCalendar = require('../../assets/images/my-calendar.png');
const iconCalendarSelected = require('../../assets/images/my-calendar-selected.png');
const iconNotification = require('../../assets/images/notification.png');
const iconNotificationSelected = require('../../assets/images/notification-selected.png');
const iconProfile = require('../../assets/images/caregiver.png');
import Globals from '../Globals';

class TabManager extends React.Component {

    state = {
        selectedIndex: 0,
        expanded: true,
        data:'',
        date:new Date(),
        signloading:false
    }

    async componentDidMount() {
        if (await this.checkInternet()) {

            console.log("data:", this.props.data.access_token_expires_at)
        const accessTokenDate = moment(this.props.data.access_token_expires_at).unix();
        var CurrentDate = moment().unix();
        console.log(CurrentDate,CurrentDate > accessTokenDate,CurrentDate," acces : ", accessTokenDate)
        if (CurrentDate > accessTokenDate) {
            this.refs.modal1.open()
        }
        this.getProfile();
    } else {
            this.showToast("No Internet Connectivity!")

        }
    }

    async getProfile() {
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = Globals.httpMode + agency_code + Globals.domain + '/api/v1/users/' + Object.keys(this.props.data.user)[0];
        console.log('url:', url)

        try {
            var access_token = this.props.data.access_token;
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'App-Token': '96ef950f-bfae-4ee5-89a0-f23ab9e50b96',
                'Authentication-Token': access_token
            }
            try {
                var response = await axios.get(url, {
                    headers: headers
                })
                if (response.status === 200) {
                    console.log("data : ", response.data)
                    this.setState({
                        data: response.data.user, loading: false
                    })
                }
                else {
                    this.showToast("Invalid Credentials");
                }
            }
            catch (error) {
                console.log("error : ", error);
            }
        }
        catch (e) {
            var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
            this.setState({
                loading: false,
            })
            this.showToast(error);
        }
    }
    
    checkPermission = async () => {
        const enabled = await firebase.messaging().hasPermission();
        if (enabled) {
            this.getFcmToken();
        } else {
            this.requestPermission();
        }
    }
    


    showToast(message) {
        Toast.show({
            text: message,
            duration: 2000
        })
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
            console.log('Notification received');
            if(Platform.OS=='ios'){

                const notif = new firebase.notifications.Notification()
                .setNotificationId(Date.now().toString())
                .setTitle(notification.title)
                .setBody(notification.body)

                console.log('Notificatio',notification);

                
                notif.android.setChannelId('default');
                notif.android.setSmallIcon('ic_launcher');
                notif.android.setLargeIcon('ic_launcher');
                notif.android.setBigText(notification.data.body, notification.data.title, null);
                firebase.notifications().displayNotification(notif);
            }
            });

        const channel = new firebase.notifications.Android.Channel('fcm_FirebaseNotifiction_default_channel', 'Demo app name', firebase.notifications.Android.Importance.High)
            .setDescription('Demo app description')
            .setSound('sampleaudio.wav')

        firebase.notifications().android.createChannel(channel);

        this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
            const { title, body } = notificationOpen.notification;
            console.log('onNotification2:');

        });

        const notificationOpen = await firebase.notifications().getInitialNotification();
        if (notificationOpen) {
            const { title, body } = notificationOpen.notification;
            console.log('onNotification3:');

        }

        this.messageListener = firebase.messaging().onMessage((message) => {
            console.log('message:',JSON.stringify(message));
        });
    }




    async navigateToLogin(data) {
        console.log("data:",data)

        // await AsyncStorage.removeItem('agency_code', null);
        // await AsyncStorage.removeItem('USER_DATA', null);
        var agency_code = await AsyncStorage.getItem('agency_code');
        var fcm_token = await AsyncStorage.getItem('fcm_token');

        this.setState({ signloading: true });
        var url = Globals.httpMode + agency_code + Globals.domain + '/api/v1/sessions/'+Object.keys(data.user)[0]+'?device_token='+fcm_token;
        console.log('url',url)
        var requestBody = qs.stringify({
            'device_token': data.access_token
        });
        try {
            var response = await this.props.data.formRequest.delete(url, requestBody);
            console.log('response',response)
                this.setState({
                    signloading: true,
                }, async () => {
                    if(response.status){
                        await AsyncStorage.removeItem('agency_code', null);
                        await AsyncStorage.removeItem('USER_DATA', null);
                        await AsyncStorage.removeItem('agency_email', null);
                        this.setState({signloading:false})

                    const resetAction = StackActions.reset({
                        index: 0,
                        actions: [
                            NavigationActions.navigate({
                                routeName: "LoginScreen"
                            })
                        ]
                    });
                    this.props.navigation.dispatch(resetAction);
                    }
                    
                })
        }
        catch (e) {
            var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
            console.log("error : ", e);
            this.setState({
                signloading: false,
            })
            this.showToast(error);
        }
        
    }


    componentWillUnmount() {
        this.checkPermission();
        this.notificationListener;
        this.notificationOpenedListener;
    }


    checkInternet() {
        return new Promise((resolve, reject) => {
            NetInfo.fetch().then(state => {
                if (state.isConnected) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
            });
        })

    }


    componentWillMount() {
        this.checkPermission();
        this.notificationListener;
        this.notificationOpenedListener;
        this.setState({ selectedIndex: 0, loading: false });
    }

    _onRefresh = () => {
        if (this.state.selectedIndex == 0) {
            this.getSelectedScreen()
            console.log('000')
        }
        else if (this.state.selectedIndex == 1) {
            console.log('1')
            this.getSelectedScreen()
        }
        else if (this.state.selectedIndex == 2) {
            console.log('2')
            this.getSelectedScreen()
        }
        else {
            console.log('10')
            this.getSelectedScreen()

        }
        this.setState({ loading: true }, () => {
            this.componentWillMount();
        });
    }

    icons = [
        {
            label: 'Dashboard',
            normal: iconDashboard,
            selected: iconDashboardSelected
        },
        {
            label: 'My Calendar',
            normal: iconCalendar,
            selected: iconCalendarSelected
        },
        {
            label: 'Notifications',
            normal: iconNotification,
            selected: iconNotificationSelected
        }
    ]

    getSelectedScreen() {
        if (this.state.selectedIndex === 0) {
            return <DashboardScreen
                onAssignToMe={(date) => {
                        this.setState({ selectedIndex: 1, date:date })
                    console.log('current date:',this.state.date)
                }} />;
        }
        else if (this.state.selectedIndex === 1) {
            return <MyCalendarScreen 
                    oncurrentdate ={this.state.date}/>;
        }
        else if (this.state.selectedIndex === 2) {
            return <NotificationScreen />;
        }
        else if (this.state.selectedIndex === 4) {
            return <ProfileScreen />;
        }
    }

    render() {
        console.log('index:', Object.keys(this.props.data.user)[0])
        const { navigate } = this.props.navigation;
        const userData = this.props.data.user[Object.keys(this.props.data.user)[0]];
        const avatar_url = userData.avatar_url;
        const Avatar_Data = this.state.data[Object.keys(this.state.data)[0]];
        console.log('user_avatar 1:', Avatar_Data?Avatar_Data.avatar_url:null)



        return (
            <View style={[styles.full, styles.backgroundColor]}>
                <View style={{ flex: 1 }}>
                    <View style={[styles.full]}>
                        {this.getSelectedScreen()}
                    </View>
                </View>

                <View style={[styles.rh(10), styles.row, styles.center, { backgroundColor: 'white', borderTopColor: '#e2e4e9', borderTopWidth: 0.2, borderTopWidth: 1, }]}>
                    {
                        this.icons.map((item, index) => {
                            return (
                                <TouchableOpacity
                                    onPress={async () => {
                                        if (await this.checkInternet()) {
                                            this.setState({
                                                selectedIndex: index
                                            },()=>{
                                                if(this.state.selectedIndex == 1){
                                                    this.setState({date:new Date()})
                                                }
                                            })
                                        }
                                        else {
                                            this.showToast("No Internet Connectivity!")

                                        }
                                    }}
                                    style={[styles.full, styles.column, styles.center]}>
                                    <Image
                                        style={[
                                            styles.rh(3),
                                            styles.rw(5),
                                        ]}
                                        resizeMode='contain'
                                        source={this.state.selectedIndex === index ? this.icons[index].selected : this.icons[index].normal}
                                    />
                                    <Text
                                        style={[
                                            styles.boldFont,
                                            styles.fontSize(1.5),
                                            {
                                                color: this.state.selectedIndex === index ? styleConstants.linkTextColor : styleConstants.inactiveLinkColor
                                            }
                                        ]}>
                                        {this.icons[index].label}
                                    </Text>
                                </TouchableOpacity>
                            )
                        })
                    }
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={async () => {
                            if (await this.checkInternet()) {
                                this.setState({
                                    selectedIndex: this.icons.length + 1
                                })
                            }
                            else {
                                this.showToast("No Internet Connectivity!")

                            }
                        }}
                        style={[
                            styles.full,
                            styles.center,
                            styles.pb(0.5)
                        ]}>
                        <View style={[
                            styles.br(0.5),
                            {
                                justifyContent: 'center',
                                alignSelf: 'center',
                                borderColor: 'white',
                                shadowRadius: 10,
                                shadowColor: styleConstants.gradientStartColor,
                                elevation: 1,
                                // borderWidth:1
                            }
                        ]} >
                            {
                                Avatar_Data && Avatar_Data.avatar_url ? <Image
                                    style={[
                                        styles.rh(6),
                                        styles.rw(6),
                                        styles.br(0.5),
                                        {
                                            aspectRatio: 1,
                                            justifyContent: 'center',
                                            alignSelf: 'center',
                                            alignContent: 'center',
                                            alignItems: 'center',
                                            // borderRadius: 25
                                        }
                                    ]}
                                    resizeMode={"cover"}
                                            resizeMethod={"resize"}
                                    source={{ uri: Avatar_Data.avatar_url }}
                                /> : (
                                        <View style={[
                                            // styles.rh(6),
                                            // styles.rw(6),

                                            {
                                                aspectRatio: 1,
                                                borderWidth:Platform.OS === 'ios'?1:null,
                                                borderColor:'grey',
                                                borderRadius: Platform.OS === 'ios'?5:null
                                            }
                                        ]}>
                                            <Text style={[styles.normalFont, styles.fs(4), { color: styleConstants.gradientStartColor, justifyContent: 'center', alignSelf: 'center' }]}>{userData.name.charAt(0).toUpperCase()}</Text>
                                        </View>
                                    )
                            }
                        </View>

                    </TouchableOpacity>
                </View>
                <Modal style={[style.modal, style.modal1]} position={"center"} ref={"modal1"} swipeArea={20}
                    backdropPressToClose={false} >
                    <View style={{ flex: 1, width: wp('85%'), justifyContent: 'center', alignContent: 'center', backgroundColor: '#fff', borderRadius: 4, flexDirection: 'column', paddingHorizontal: wp('1%') }} >
                        <Text style={[styles.boldFont, styles.fontSize(3), { justifyContent: 'center', alignSelf: 'center' }]}>Your session expired</Text>
                        <Text style={[styles.normalFont, styles.fontSize(2), { justifyContent: 'center', alignSelf: 'center' }]}>Login again to continue.</Text>
                        <View style={{ justifyContent: 'center', alignSelf: 'center', flexDirection: 'row', margin: wp('4%'), marginBottom: wp('10%'), marginTop: hp('5%') }}>
                            <LinearGradient
                                colors={[styleConstants.gradientStartColor, styleConstants.gradientEndColor]}
                                start={{ x: 0.0, y: 0.25 }} end={{ x: 1.2, y: 1.0 }}
                                style={[styles.rh(7), styles.center, , styles.br(0.3), {
                                    width: wp('25%'),
                                    height: wp('13%'),
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
                                <TouchableOpacity style={{ justifyContent: 'flex-start', alignSelf: 'center', padding: wp('4%'), borderRadius: 8, width: wp('25%'),
                                    height: wp('13%'), }}
                                    onPress={async() => { 
                                            if (await this.checkInternet()) {
                                                this.navigateToLogin(this.props.data) 
                                            }
                                            else {
                                                this.showToast("No Internet Connectivity!")
                                            }
                                        }}>
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
                                                    <Text style={[styles.boldFont, { color: '#ffffff', justifyContent: 'center', alignSelf: 'center', marginHorizontal: wp('2%') }]}>OK</Text>
                                                )}
                                    </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    </View>
                </Modal>
            </View>

        )
    }
}
const mapStateToProps = state => ({
    data: state.user.data
});

const style = StyleSheet.create({
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
        position: "absolute",
        backgroundColor: 'rgba(0, 0, 0, 0)',
    },
    modal1: {
        maxHeight: 315,
        minHeight: 80
    }

})

export default connect(
    mapStateToProps,
    null
)(withNavigation(TabManager));