import React from "react";
import { StyleSheet, View, Image, SafeAreaView, Text, TouchableOpacity, ActivityIndicator, TextInput,Platform, Alert,  BackHandler, DeviceEventEmitter } from 'react-native';
import commonStyles from '../../styles/Common';
import style, { IMAGE_HEIGHT, IMAGE_HEIGHT_NEW, IMAGE_HEIGHT_SMALL } from '../../styles/Common';
import styleConstants from '../../styles/StyleConstants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { ScrollView, FlatList } from "react-native-gesture-handler";
import Header from '../../core/components/Header';
import LinearGradient from 'react-native-linear-gradient';
import { withNavigation, StackActions, NavigationActions } from 'react-navigation';
import Globals from '../../Globals';
import AsyncStorage from '@react-native-community/async-storage';
import LoadingIndicator from '../../core/components/LoadingIndicator';
import { connect } from "react-redux";
import Geocoder from 'react-native-geocoding';
import { Toast, CheckBox } from 'native-base';
import { FloatingAction } from "react-native-floating-action";
import Modal from 'react-native-modalbox';
import APIService from '../../core/components/APIServices'
import Geolocation from '@react-native-community/geolocation';
import NetInfo from "@react-native-community/netinfo";
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";




class Task extends React.Component {

    state = {
        expanded: true,
        curloading: false,
        data: '',
        shift_date: '',
        address: '',
        markers: [],
        checked: false,
        isVisible: true,
        data: '',
        currlatitude: '',
        currlongitude: ''
    }

    showToast(message) {
        console.log(
            message
        )
        Toast.show({
            text: message,
            duration: 2000
        })
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


    async componentDidMount() {
        if (await this.checkInternet()) {

        var data = {}
        data.agency_logo = await AsyncStorage.getItem('agency_logo');
        data.agency_name = await AsyncStorage.getItem('agency_name');

        this.setState({ agency_details: data })
        this.getCurrentData()
        }
        else{
            this.showToast("No Internet Connectivity!")

        }
    }


    GetTaskCost(value) {
        this.setState({ title: value })
    }

    GetTaskDescription(value) {
        this.setState({ details: value })
    }

    checkTask(check) {

        Geolocation.getCurrentPosition(
            position => {
                this.setState({ currlatitude: position.coords.latitude, currlongitude: position.coords.longitude }, () => {
                    var mainData = [];
                    var arrive = [];
                    mainData = this.state.data[Object.keys(this.state.data)[0]];
                    var arrive = mainData.arrive_task[Object.keys(mainData.arrive_task)]
                    var currlat = Number.parseFloat(this.state.currlatitude).toFixed(2)
                    var currlong = Number.parseFloat(this.state.currlongitude).toFixed(2)
                    var lat = Number.parseFloat(mainData.latitude).toFixed(2)
                    var long = Number.parseFloat(mainData.longitude).toFixed(2)

                    if (currlat == lat && currlong == long) {
                        if (arrive.is_completed == true) {
                            var body = {}
                            body.arrive_is_completed = !check.is_completed
                            body.notes = check.notes
                            body.reason_title = check.title
                            body.reason_note = null
                            body.is_clock_not_at_location = false
                            body.lat = this.state.currlatitude
                            body.long = this.state.currlongitude
                            console.log("check:", body)
                            this.renderarrive(body, check)
                        } else {
                            Alert.alert(
                                'Notice',
                                'You are not allowed to check a task before arriving!',
                                [
                                    {
                                        text: 'OK', onPress: () => { console.log("not allowed ok press") }
                                    },
                                ],
                                { cancelable: false },
                            );

                        }

                    } else {
                        // Alert.alert(
                        //     'Warning',
                        //     'GPS is showing that you are not at your designated shift location.',
                        //     [
                        //         {
                        //             text: 'OK', onPress: () => {
                                        if (arrive.is_completed == true) {
                                            // var mainData = [];
                                            // mainData = this.state.data[Object.keys(this.state.data)[0]];
                                            var body = {}
                                            body.arrive_is_completed = !check.is_completed
                                            body.notes = check.notes
                                            body.reason_title = check.title
                                            body.reason_note = null
                                            body.is_clock_not_at_location = false
                                            body.lat = this.state.currlatitude
                                            body.long = this.state.currlongitude
                                            console.log("check:", body)
                                            this.renderarrive(body, check)
                                        } else {
                                            Alert.alert(
                                                'Notice',
                                                'You are not allowed to check a task before arriving!',
                                                [
                                                    {
                                                        text: 'OK', onPress: () => { console.log("not allowed ok press") }
                                                    },
                                                ],
                                                { cancelable: false },
                                            );

                                        }
                        //             }
                        //         },
                        //     ],
                        //     { cancelable: false },
                        // );
                    }
                });
            },
            error => {   
                    // Alert.alert(error.message),
                    console.log("error:", error)
                    LocationServicesDialogBox.checkLocationServicesIsEnabled({
                        message: "<h2 style='color: #0af13e'>Warning Permission </h2> Allow Tricura to acces your location. <br/>",
                        ok: "YES",
                        cancel: "NO",
                        enableHighAccuracy: true, // true => GPS AND NETWORK PROVIDER, false => GPS OR NETWORK PROVIDER
                        showDialog: true, // false => Opens the Location access page directly
                        openLocationServices: true, // false => Directly catch method is called if location services are turned off
                        preventOutSideTouch: false, // true => To prevent the location services window from closing when it is clicked outside
                        preventBackClick: false, // true => To prevent the location services popup from closing when it is clicked back button
                        providerListener: false // true ==> Trigger locationProviderStatusChange listener when the location state changes
                    }).then(function(success) {
                        console.log(success); // success => {alreadyEnabled: false, enabled: true, status: "enabled"}
                        // if (success.enabled == true) {
                        //     console.log(success); // success => {alreadyEnabled: false, enabled: true, status: "enabled"}
                        //     this.Geolocation()
                        // }
                    }).catch((error) => {
                        console.log("error:",error.message); // error.message => "disabled"
                    });
                    // BackHandler.addEventListener('hardwareBackPress', () => { //(optional) you can use it if you need it
                    //     //do not use this method if you are using navigation."preventBackClick: false" is already doing the same thing.
                    //     LocationServicesDialogBox.forceCloseDialog();
                    //  });
                     
                     DeviceEventEmitter.addListener('locationProviderStatusChange', function(status) { // only trigger when "providerListener" is enabled
                         console.log("status:",status); //  status => {enabled: false, status: "disabled"} or {enabled: true, status: "enabled"}
                        // this.Geolocation()
            
                     });
            }
        );
    }

    navigateToDashboard() {
        const resetAction = StackActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({
                    routeName: "TabManager"
                })
            ]
        });
        this.props.navigation.dispatch(resetAction);
    }

    async getCurrentData() {
        this.setState({ curloading: true })
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = Globals.httpMode + agency_code  + Globals.domain + '/api/v1/shifts/current';
        console.log("url : ", url);
        try {
            //var response = await this.props.data.formRequest.get(url);
            var access_token = this.props.data.access_token;
            console.log("acc : ", access_token);
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'App-Token': '96ef950f-bfae-4ee5-89a0-f23ab9e50b96',
                'Authentication-Token': access_token
            }

            var response = await axios.get(url, {
                headers: headers
            })
            if (response.status === 200) {
                console.log("data : ", response.data)
                this.setState({
                    data: response.data, curloading: false
                })
            }
            else {
                var data1 = response.data.error;
                console.log("data1 : ", data1)
                this.showToast(data1);
                this.setState({
                    curloading: false
                })

            }

        }
        catch (e) {
            var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
            console.log("error : ", error)
            this.showToast(error);
            this.setState({
                curloading: false
            })
        }
    }

    async renderarrive(body, check) {
        this.setState({ arriveloading: true, noteloading: false })
        var access_token = this.props.data.access_token;
        var agency_code = await AsyncStorage.getItem('agency_code');
        var requestBody = qs.stringify({
            'task[is_completed]': body.arrive_is_completed,
            'task[notes]': body.notes,
            'task[reason_title]': body.reason_title,
            'task[reason_note]': body.reason_note,
            'task[is_clock_not_at_location]': body.is_clock_not_at_location,
            'task[coordinates][lat]': body.lat,
            'task[coordinates][lon]': body.long
        });

        var is_completed = await APIService.execute('PUT', Globals.httpMode + agency_code  + Globals.domain + '/api/tasks/' + check.id, requestBody, access_token)
        console.log("is_completed: lon", is_completed)
        this.showToast(is_completed.data.message)
        this.getCurrentData();
    }

    notes(item) {

        this.setState({ notes_data: item, tasknote: item.notes }, () => {
            console.log('press', item)
            this.refs.modal5.open()

        })
    }

    async rendernewnote() {
        if(this.state.tasknote){
        this.setState({ taskloading: true })
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = Globals.httpMode + agency_code  + Globals.domain + '/api/tasks/' + this.state.notes_data.id;


        var requestBody = qs.stringify({
            'task[notes]': this.state.tasknote
        });

        console.log("url : ", url, "requestBody:", requestBody);


        try {

            //var response = await this.props.data.formRequest.get(url);
            var access_token = this.props.data.access_token;
            console.log("acc : ", access_token);
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'App-Token': '96ef950f-bfae-4ee5-89a0-f23ab9e50b96',
                'Authentication-Token': access_token
            }
            console.log("header:", headers)

            var response = await axios.put(url, requestBody, {
                headers: headers
            })
            console.log("data response : ", response)

            if (response.status === 200) {
                console.log("responsedata : ", response.data)
                this.showToast("Task Note Added")
                this.refs.modal5.close()

                this.setState({
                    title: '', details: '', taskloading: false
                })
                this.getCurrentData()

            }
            else {
                console.log("er: ", response)

                var data1 = response.data.error;
                this.showToast(data1);
                this.refs.modal5.close()
                this.setState({
                    curloading: false, title: '', details: '', taskloading: false
                })
                this.getCurrentData()

            }

        }
        catch (e) {
            var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
            console.log("error: ", error)

            this.showToast(error);
            this.refs.modal5.close()
            this.setState({
                curloading: false, title: '', details: '', taskloading: false
            })
            this.getCurrentData()

        }

        }
        else{
            this.showToast("Enter Note Task")

        }

    }

    GetTaskNote(value) {
        this.setState({ tasknote: value })
    }


    render() {
        const { navigate } = this.props.navigation;
        var clientData = null;
        var mainData = [];
        var care_log = [];
        const schLocation = [];
        Geocoder.init("AIzaSyAbjtnF9LXxwmSf3ATD4aHnOuX0hF9AqO0");
        if (this.state.curloading) {
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor,]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={"Created Task"} expanded={true} onBack={() => {
                        this.props.navigation.goBack()
                    }} />
                    <View style={[styles.full, styles.center]}>
                        <ActivityIndicator
                            size='large'
                            color={styleConstants.gradientStartColor}
                        />
                    </View>
                </SafeAreaView>
            )
        }
        else {
            if (this.state.data) {
                mainData = this.state.data[Object.keys(this.state.data)[0]];
                console.log("mainData", mainData.arrive_task[Object.keys(mainData.arrive_task)])

                care_log = mainData.care_log;
                const x = care_log;
                const result = Object.keys(x).map(key => ({ [key]: x[key] }));
                var care_log_data = []
                for (let i = 0; i < result.length; i++) {
                    care_log_data.push(result[Object.keys(result)[i]])
                }
                console.log("care_log  :", care_log_data.length)
            }

            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={"Created Task"} expanded={this.state.expanded} Agency_logo={this.state.agency_details} onBack={() => {
                        this.props.navigation.goBack()
                    }} />
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={[commonStyles.full, commonStyles.margin]}>
                            {/* <FlatList */}
                            <FlatList
                                extraData={care_log_data}
                                data={care_log_data}
                                renderItem={({ item }) => {
                                    // this.setState({count: this.state.count+1})
                                    console.log("clientData:", mainData.arrive_task[Object.keys(mainData.arrive_task)].is_completed)
                                    var data = item[Object.keys(item)[0]]
                                    var title = data.title
                                    var details = data.details
                                    var check = data.is_completed


                                    return (
                                        <TouchableOpacity onPress={() => mainData.arrive_task[Object.keys(mainData.arrive_task)].is_completed?this.notes(data):null}>
                                            <View style={[styles.itemRectangleShape, { flexDirection: 'row', marginBottom: wp('1%'), }]}
                                            >
                                                <View style={{ padding: wp('2%'), flex: 1, flexDirection: 'row' }}>
                                                    <View style={commonStyles.column}>
                                                        <Text style={[styles.itemHeader]}>{title || '--'}</Text>
                                                        <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', }}>{details || '--'}</Text>
                                                        {data.notes && data.notes != ' ' ?
                                                            <Text style={{ marginTop: -5, fontSize: hp('2.2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', }}>Note: {data.notes || '--'}</Text>
                                                            : null}
                                                    </View>

                                                </View>
                                                {data.notes && data.notes != ' ' ?
                                                    <TouchableOpacity style={[commonStyles.center, { justifyContent: 'center', alignItems: 'flex-end', marginRight: wp('3%') }]}
                                                    // onPress={() => this.checkTask(data)}
                                                    >
                                                        <Image style={{ width: wp('2.5%'), height: hp('2.5%'), resizeMode: 'contain', aspectRatio: 1, }}
                                                            source={require('../../../assets/images/notes.png')} />
                                                    </TouchableOpacity> : null}
                                                {check ? <TouchableOpacity style={[commonStyles.center, { justifyContent: 'center', alignItems: 'flex-end', marginRight: wp('3%'),padding:wp('2%'),paddingHorizontal:wp('4%') }]}
                                                    onPress={() => this.checkTask(data)}
                                                >
                                                    <Image style={{ width: wp('2.5%'), height: hp('2.5%'), aspectRatio: 1, }}
                                                        source={require('../../../assets/images/green-check.png')} />
                                                </TouchableOpacity> :
                                                    <TouchableOpacity style={[commonStyles.center, { justifyContent: 'center', alignItems: 'flex-end', marginRight: wp('3%'),padding:wp('2%'),paddingHorizontal:wp('4%') }]}
                                                        onPress={() => this.checkTask(data)}
                                                    >
                                                        <Image style={{ width: wp('2.5%'), height: hp('2.5%'), aspectRatio: 1, }}
                                                            source={require('../../../assets/images/gray-check.png')} />
                                                    </TouchableOpacity>}
                                            </View>
                                        </TouchableOpacity>
                                    )
                                }}

                            />
                        </View>

                    </ScrollView>
                    <Modal style={[styles.modal, styles.modal1]} position={"center"} ref={"modal5"} swipeArea={20}
                        backdropPressToClose={true}  >
                        <ScrollView keyboardShouldPersistTaps={"always"}>
                            <View style={{ flex: 1, width: wp('85%'), justifyContent: 'center', alignContent: 'center', backgroundColor: '#fff', borderRadius: 4, flexDirection: 'column', paddingHorizontal: wp('1%') }} >
                                <TouchableOpacity style={[style.mb(0.1), { justifyContent: 'flex-end', alignItems: 'flex-end', marginRight: wp('1%'), flexDirection: 'row' }]}
                                    onPress={() => { this.refs.modal5.close() }}>
                                    <Image style={[{ height: hp('5%'), width: wp('5%'), resizeMode: 'contain', alignSelf: 'flex-end' }]}
                                        source={require('../../../assets/images/error.png')} />
                                </TouchableOpacity>
                                <Text style={[style.boldFont, style.fontSize(3), { justifyContent: 'center', alignSelf: 'center', color: '#3B5793', marginBottom: wp('2%'), marginLeft: wp('2%'), marginTop: wp('-4%') }]}>Add Note</Text>
                                <View style={[style.mb(0.1), { margin: wp('4%'), marginTop: wp('0.1%'), }]}>
                                    <Text style={[styles.boldFont, commonStyles.fs(1.9), { color: '#3B5793', fontFamily: 'Catamaran-Bold', marginLeft: wp('1%') }]}>Task Note</Text>
                                    <TextInput
                                        style={[styles.boldFont, commonStyles.fs(2.3), { color: '#828ea5', fontFamily: 'Catamaran-Medium', marginTop: wp('-2%'),borderBottomColor:'#000', borderBottomWidth:Platform.OS === "ios" ? 1:null  }]}
                                        underlineColorAndroid={'#828ea5'}
                                        onFocus={this.handleFocustitle}
                                        onBlur={this.handleBlurtitle}
                                        multiline
                                        numberOfLines={1}
                                        placeholder={'Please enter task note'}
                                        placeholderTextColor="#828ea5"
                                        onChangeText={ValueHolder => this.GetTaskNote(ValueHolder)}
                                        value={this.state.tasknote} />
                                </View>
                                <View style={{ justifyContent: 'center', alignSelf: 'center', flexDirection: 'row', margin: wp('4%'), marginBottom: wp('10%') }}>
                                    <LinearGradient
                                        colors={[styleConstants.gradientStartColor, styleConstants.gradientEndColor]}
                                        // style={styles.linearGradient}
                                        start={{ x: 0.0, y: 0.25 }} end={{ x: 1.2, y: 1.0 }}
                                        style={[style.rh(7), style.center, , style.br(0.3), {
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
                                        <TouchableOpacity style={{ justifyContent: 'flex-start', alignSelf: 'center', padding: wp('1%'), borderRadius: 8 }}
                                            onPress={() => { this.rendernewnote() }}>
                                            {this.state.taskloading === true ? (
                                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                    <View style={{ paddingRight: 10, backgroundColor: 'transparent' }}>
                                                        <ActivityIndicator size={'small'} color='#FFFFFF' />
                                                    </View>
                                                    <View style={{ backgroundColor: 'transparent' }}>
                                                        <Text style={{ color: '#FFFFFF', fontFamily: 'Catamaran-Bold', }}>Please Wait...</Text>
                                                    </View>
                                                </View>
                                            ) : (
                                                    <Text style={[commonStyles.boldFont, { color: '#ffffff', justifyContent: 'center', alignSelf: 'center', marginHorizontal: wp('2%') }]}>Save</Text>
                                                )
                                            }
                                        </TouchableOpacity>
                                    </LinearGradient>
                                </View>
                            </View>
                        </ScrollView>
                    </Modal>
                </SafeAreaView>
            );


        }
    }
}

const styles = StyleSheet.create({
    rectangleShape: {
        padding: wp('3%'),
        marginTop: wp('3%'),
        borderWidth: 0.01,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        borderTopRightRadius: 5,
        borderTopLeftRadius: 5,
        backgroundColor: '#fff',
        borderColor: '#fff'
    },
    clientImage: {
        width: wp('5%'),
        height: hp('6%'),
        aspectRatio: 1,
        borderColor: '#fff',
        backgroundColor: '#CFCFCF',
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        borderTopRightRadius: 5,
        borderTopLeftRadius: 5,
    },

    smallImage: {
        width: wp('3%'),
        height: hp('3%'),
        aspectRatio: 1,
    },
    itemHeader: {
        fontFamily: 'Catamaran-Bold',
        color: '#293D68',
        fontSize: hp('2.5%')
    },
    itemRectangleShape: {
        marginTop: wp('3%'),
        borderWidth: 0.01,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        borderTopRightRadius: 5,
        borderTopLeftRadius: 5,
        backgroundColor: '#fff',
        borderColor: '#fff'
    },
    mapStyle: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
        position: "absolute",
        backgroundColor: 'rgba(0, 0, 0, 0)',
    },
    modal4: {
        maxHeight: 200,
        minHeight: 80
    },
    modal1: {
        maxHeight: wp('80%'),
        minHeight: 80
    }
});
const mapStateToProps = state => ({
    data: state.user.data
});

export default connect(
    mapStateToProps,
    null
)(withNavigation(Task));