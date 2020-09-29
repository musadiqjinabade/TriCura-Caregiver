import React from "react";
import { StyleSheet, View, Image, StatusBar } from 'react-native';
import commonStyles from '../styles/Common';
import firebase from 'react-native-firebase';
import LinearGradient from 'react-native-linear-gradient';
import { widthPercentageToDP, heightPercentageToDP } from "react-native-responsive-screen";
import styleConstants from '../styles/StyleConstants';





export default class SplashScreen extends React.Component {

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
            this.setState({ token: fcmToken },()=>{
                console.log("token fcm:",this.state.token)
            })
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
        // this.notificationListener = firebase.notifications().onNotification((notification) => {
        //     const { title, body } = notification;
        //     // this.showAlert(title, body);
        //     console.log('onNotification1:');

        //     const localNotification = new firebase.notifications.Notification({
        //         sound: 'sampleaudio',
        //         show_in_foreground: true,
        //     })
        //         .setSound('sampleaudio.wav')
        //         .setNotificationId(notification.notificationId)
        //         .setTitle(notification.title)
        //         .setBody(notification.body)
        //         .android.setChannelId('fcm_FirebaseNotifiction_default_channel') // e.g. the id you chose 
        //         .android.setLargeIcon('ic_launcher')
        //         .android.setPriority(firebase.notifications.Android.Priority.High);
        //     firebase.notifications()
        //         .displayNotification(localNotification)
        //         .catch(err => console.error(err));

        // });
        this.notificationListener = firebase.notifications().onNotification((notification) => {
            console.log('Notification received');
            
            const notif = new firebase.notifications.Notification()
            .setNotificationId(Date.now().toString())
            .setTitle(notification.title)
            .setBody(notification.body)
            
            notif.android.setChannelId('default');
            notif.android.setSmallIcon('ic_launcher');
            notif.android.setBigText(notification.data.body, notification.data.title, null);
            firebase.notifications().displayNotification(notif);
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
            console.log("pushNotification:",JSON.stringify(message));
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


    componentDidMount() {
        const channel = new firebase.notifications.Android.Channel(
            'channelId',
            'Channel Name',
            firebase.notifications.Android.Importance.Max
            ).setDescription('A natural description of the channel');
            firebase.notifications().android.createChannel(channel);
            
            // the listener returns a function you can use to unsubscribe
            this.unsubscribeFromNotificationListener = firebase.notifications().onNotification((notification) => {
            if (Platform.OS === 'android') {
            
            // const localNotification = new firebase.notifications.Notification({
            // sound: 'default',
            // show_in_foreground: true,
            // })
            // .setNotificationId(notification.notificationId)
            // .setTitle(notification.title)
            // .setSubtitle(notification.subtitle)
            // .setBody(notification.body)
            // .setData(notification.data)
            // .android.setChannelId('channelId') // e.g. the id you chose above
            // .android.setSmallIcon('ic_launcher') // create this icon in Android Studio
            // .android.setColor('#000000') // you can set a color here
            // .android.setPriority(firebase.notifications.Android.Priority.High);
            
            // firebase.notifications()
            // .displayNotification(localNotification)
            // .catch(err => console.error(err));
            
            } else if (Platform.OS === 'ios') {
            
            const localNotification = new firebase.notifications.Notification()
            .setNotificationId(notification.notificationId)
            .setTitle(notification.title)
            .setSubtitle(notification.subtitle)
            .setBody(notification.body)
            .setData(notification.data)
            .ios.setBadge(notification.ios.badge);
            
            firebase.notifications()
            .displayNotification(localNotification)
            .catch(err => console.log(err));
            
            }
            });
        console.disableYellowBox = true;
        // Start counting when the page is loaded
        this.timeoutHandle = setTimeout(() => {
            // Add your logic for the transition
            this.props.navigation.replace('InitialScreen')
        }, 3000);

    }

    componentWillMount() {
        const channel = new firebase.notifications.Android.Channel(
            'channelId',
            'Channel Name',
            firebase.notifications.Android.Importance.Max
            ).setDescription('A natural description of the channel');
            firebase.notifications().android.createChannel(channel);
            
            // the listener returns a function you can use to unsubscribe
            this.unsubscribeFromNotificationListener = firebase.notifications().onNotification((notification) => {
            if (Platform.OS === 'android') {
            
                const localNotification = new firebase.notifications.Notification({
                    sound: 'default',
                    show_in_foreground: true,
                    })
                    .setNotificationId(notification.notificationId)
                    .setTitle(notification.title)
                    .setSubtitle(notification.subtitle)
                    .setBody(notification.body)
                    .setData(notification.data)
                    .android.setChannelId('channelId') // e.g. the id you chose above
                    .android.setSmallIcon('ic_launcher') // create this icon in Android Studio
                    .android.setColor('#000000') // you can set a color here
                    .android.setPriority(firebase.notifications.Android.Priority.High);
                    
                    firebase.notifications()
                    .displayNotification(localNotification)
                    .catch(err => console.log(err));
            
            } else if (Platform.OS === 'ios') {
            
            const localNotification = new firebase.notifications.Notification()
            .setNotificationId(notification.notificationId)
            .setTitle(notification.title)
            .setSubtitle(notification.subtitle)
            .setBody(notification.body)
            .setData(notification.data)
            .ios.setBadge(notification.ios.badge);
            
            firebase.notifications()
            .displayNotification(localNotification)
            .catch(err => console.log(err));
            
            }
            });
    }

    componentWillUnmount() {
        // this.checkPermission();
        // this.notificationListener;
        // this.notificationOpenedListener;
        clearTimeout(this.timeoutHandle); // This is just necessary in the case that the screen is closed before the timeout fires, otherwise it would cause a memory leak that would trigger the transition regardless, breaking the user experience.
    }
    render() {
        return (
            <View style={[commonStyles.container, commonStyles.margin]}>
                <StatusBar barStyle="light-content" hidden={false} backgroundColor="transparent" translucent={true} />

                <LinearGradient
                    colors={[styleConstants.gradientStartColor, styleConstants.gradientEndColor]}
                    start={{ x: 0.0, y: 0.25 }} end={{ x: 1.2, y: 1.0 }}
                    style={[commonStyles.rh(7), commonStyles.center, {
                        width: widthPercentageToDP('100%'),
                        height: heightPercentageToDP('112%'),
                    }]}>
                    <Image style={styles.logo_container}
                        source={require('../../assets/images/logo_new_white.png')} />

                    <View style={{ position: 'absolute', bottom: 0 }}>
                        <Image style={styles.image}
                            source={require('../../assets/images/Caregivertext.png')} />
                    </View>

                </LinearGradient>


            </View>


        );
    }
}

const styles = StyleSheet.create({

        logo_container: {
            width: widthPercentageToDP('75%'),
            height: heightPercentageToDP('40%'),
            resizeMode: 'contain'

        },
        image: {
            width: widthPercentageToDP('25%'),
            // height: widthPercentageToDP('15%'),
            resizeMode: 'contain'
        }
    
});