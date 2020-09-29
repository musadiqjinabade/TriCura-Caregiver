import React from "react";
import { StyleSheet, View, Image, SafeAreaView, Text, TouchableOpacity, ActivityIndicator, TextInput, Dimensions, PermissionsAndroid, RefreshControl, Alert, Platform } from 'react-native';
import commonStyles from '../styles/Common';
import style, { IMAGE_HEIGHT, IMAGE_HEIGHT_NEW, IMAGE_HEIGHT_SMALL } from '../styles/Common';
import styleConstants from '../styles/StyleConstants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { ScrollView } from "react-native-gesture-handler";
import Header from '../core/components/Header';
import LinearGradient from 'react-native-linear-gradient';
import { withNavigation, StackActions, NavigationActions } from 'react-navigation';
import Globals from '../Globals';
import AsyncStorage from '@react-native-community/async-storage';
import LoadingIndicator from '../core/components/LoadingIndicator';
import { connect } from "react-redux";
import Geocoder from 'react-native-geocoding';
import { Toast, CheckBox } from 'native-base';
import { FloatingAction } from "react-native-floating-action";
import Modal from 'react-native-modalbox';
import Geolocation from '@react-native-community/geolocation';
import APIService from '../core/components/APIServices'
import Task from "./Task/Task";
import ImagePicker from 'react-native-image-crop-picker';
import NetInfo from "@react-native-community/netinfo";


const actions = [
    {
        text: "Add Task",
        name: "task_added",
        icon: require("../../assets/images/Addtask.png"),
        position: 1,
        color: '#2685C5'
    },
    {
        text: "Add Note",
        name: "add_note",
        icon: require("../../assets/images/Addnote.png"),
        position: 2,
        color: '#2685C5'
    },
    {
        text: "Take Photo",
        name: "photo",
        icon: require("../../assets/images/Takephoto.png"),
        position: 3,
        color: '#2685C5'

    }
];


class ShowShiftDetails extends React.Component {

    constructor(props) {
        super(props);
        this.task_data = []
        this.state = {
            expanded: true,
            curloading: true,
            noteloading: false,
            data: '',
            shift_date: '',
            address: '',
            markers: [],
            checked: false,
            isVisible: true,
            title: null,
            details: null,
            note: null,
            currlatitude: null,
            currlongitude: null,
            location: null,
            cost: null,
            details: null,
            latenote: null,
            early_note: null

        }
    }

    showToast(message) {
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


    async componentWillMount() {

        if (await this.checkInternet()) {

        var data = {}
        data.agency_logo = await AsyncStorage.getItem('agency_logo');
        data.agency_name = await AsyncStorage.getItem('agency_name');

        this.setState({ agency_details: data })
        // this.props.navigation.addListener('didFocus', () => {
        //     // console.log("didFocus is working")
        //     this.setState({ curloading: true, task_id: this.props.navigation.state.params.item })
        //     this.getCurrentData(this.props.navigation.state.params.item);
        // });
        this.setState({ curloading: true, task_id: this.props.navigation.state.params.item }, () => {
            this.getCurrentData(this.props.navigation.state.params.item);
            console.log("item:", this.props.navigation.state.params.item)
        })
    }
    else{
        this.showToast("No Internet Connectivity!")
        this.setState({curloading:false, loading:false})
    }
    }

    _onRefresh = () => {
        this.setState({ curloading: true, loading: true }, () => {
            this.componentWillMount();
            this.setState({ curloading: true })
        });
    }

    async floatingaction(position) {
        if (position == "task_added") {
            this.refs.modal6.open()
            // alert("task_added")
        }
        else if (position == "add_note") {
            // alert("add_note")
            this.refs.modal5.open()

        }
        else if (position == "photo") {
            console.log('state images response');

            ImagePicker.openCamera({
                width: 300,
                height: 400,
                cropping: false,
                mediaType: 'photo',
                compressImageQuality: 0.7
            }).then(async response => {
                this.setState({ arriveloading: true })
                var mainData = [];
                mainData = this.state.data[Object.keys(this.state.data)[0]];
                var agency_code = await AsyncStorage.getItem('agency_code');
                var url = Globals.httpMode + agency_code + Globals.domain + '/api/v1/shifts/' + mainData.id;
                var image = response.path.replace('file:///storage/emulated/0/Pictures/', '')
                const data = new FormData();
                data.append('shift[images_attributes][0][content]', {
                    uri: response.path,
                    type: 'image/jpg',
                    name: image
                })

                console.log("url : ", url, "requestBody:", data);
                try {
                    const axios = require('axios');
                    var access_token = this.props.data.access_token;
                    console.log("acc : ", access_token);
                    const headers = {
                        'Accept': 'application/json',
                        'Content-Disposition': 'application/form-data',
                        'App-Token': '96ef950f-bfae-4ee5-89a0-f23ab9e50b96',
                        'Authentication-Token': access_token
                    }
                    var response = await axios.put(url, data, {
                        headers: headers
                    })
                    // console.log("data update : ", response)  
                    this.setState({ arriveloading: false })
                    this.showToast("Photo uploaded Successfully");
                    this.getCurrentData()


                }
                catch (e) {
                    var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
                    console.log('e:e', e)
                    this.showToast(error);
                    this.setState({ arriveloading: false })

                }

            });
        }
    }

    selectPhotoTapped() {

        ImagePicker.openCamera({
            width: 300,
            height: 400,
            cropping: false,
            mediaType: 'photo',
            compressImageQuality: 0.7
        }).then(response => {
            console.log('state images ', response);
        });

    }

    GetTaskTitle(value) {
        this.setState({ title: value })
    }

    GetTaskDetails(value) {
        this.setState({ details: value })
    }

    GetTaskNote(value) {
        this.setState({ note: value })
    }

    handleFocustitle = event => {
        this.setState({ isFocused: true });
        if (this.props.onFocus) {
            this.props.onFocus(event);
        }
    };

    handleBlurtitle = event => {
        this.setState({ isFocused: false });
        if (this.props.onBlur) {
            this.props.onBlur(event);
        }
    };

    handleFocusdetails = event => {
        this.setState({ isFocusedetails: true });
        if (this.props.onFocus) {
            this.props.onFocus(event);
        }
    };

    handleBlurdetails = event => {
        this.setState({ isFocusedetails: false });
        if (this.props.onBlur) {
            this.props.onBlur(event);
        }
    };



    async getCurrentData(id) {
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = Globals.httpMode + agency_code + Globals.domain + '/api/v1/shifts/' + id;
        console.log("url : ", url);
        var access_token = this.props.data.access_token;
        console.log("acc : ", access_token);
        try {

            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'App-Token': '96ef950f-bfae-4ee5-89a0-f23ab9e50b96',
                'Authentication-Token': access_token
            }
            var response = await axios.get(url, {
                headers: headers
            })
            console.log("response code : ", response.status)
            if (response.status === 200) {
                console.log("data : ", response.data)
                this.setState({
                    data: response.data, curloading: false
                })
            }
            else {
                var data1 = response.data.error;
                console.log("data1 : ", data1)
                this.setState({
                    curloading: false
                })
                this.showToast(data1);
                this.navigateToDashboard();

            }
        }
        catch (e) {
            var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'There is no current shift for this user') : 'Network error!');
            console.log("error : ", error)
            this.showToast(error);
            this.navigateToDashboard();
        }
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

    pstToLocal(start_time) {
        var time = null;

        this.state.shift_date = moment(start_time).format("MMM DD, YYYY");
        time = moment(start_time).format('hh:mm a');

        return time;
    }

    getLocation(lat, long) {
        var addressComponent = null;
        Geocoder.from(lat, long)
            .then(json => {
                addressComponent = json.results[0].formatted_address;
                console.log(addressComponent);
                this.state.address = addressComponent;
            })
            .catch(error => console.warn(error));
    }

    async rendernewtask() {
        if (this.state.title === null) {
            this.showToast("Enter title")
        }
        else if (this.state.details === null) {
            this.showToast("Enter details")
        }
        else {
            const axios = require('axios');
            var agency_code = await AsyncStorage.getItem('agency_code');
            var url = Globals.httpMode + agency_code + Globals.domain + '/api/v1/tasks';

            var mainData = [];
            mainData = this.state.data[Object.keys(this.state.data)[0]];

            var requestBody = qs.stringify({
                'task[shift_id]': mainData.id,
                'task[title]': this.state.title,
                'task[details]': this.state.details
            });

            console.log("url : ", url, "requestBody:", requestBody);


            try {

                var access_token = this.props.data.access_token;
                console.log("acc : ", access_token);
                const headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'App-Token': '96ef950f-bfae-4ee5-89a0-f23ab9e50b96',
                    'Authentication-Token': access_token
                }

                var response = await axios.post(url, requestBody, {
                    headers: headers
                })
                console.log("data response : ", response)

                if (response.status === 200) {
                    console.log("responsedata : ", response.data)
                    this.showToast("Task Created Successfully")
                    this.refs.modal6.close()

                    this.setState({
                        title: '', details: ''
                    })
                    this.getCurrentData()

                }
                else {
                    var data1 = response.data.error;
                    this.showToast(data1);
                    this.refs.modal6.close()
                    this.setState({
                        curloading: false, title: '', details: ''
                    })
                    this.getCurrentData()

                }

            }
            catch (e) {
                var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
                this.showToast(error);
                this.refs.modal6.close()
                this.setState({
                    curloading: false, title: '', details: ''
                })
                this.getCurrentData()

            }
        }
    }

    async rendernewnote() {
        if (this.state.note === null) {
            this.showToast("Enter note")
        }
        else {
            const axios = require('axios');
            var agency_code = await AsyncStorage.getItem('agency_code');
            var url = Globals.httpMode + agency_code + Globals.domain + '/api/v1/notes';

            var mainData = [];
            mainData = this.state.data[Object.keys(this.state.data)[0]];

            var requestBody = qs.stringify({
                'note[shift_id]': mainData.id,
                'note[content]': this.state.note,
                'note[is_urgent]': this.state.checked
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

                var response = await axios.post(url, requestBody, {
                    headers: headers
                })
                console.log("data response : ", response)

                if (response.status === 200) {
                    console.log("responsedata : ", response.data)
                    this.showToast("Note Added Successfully")
                    this.refs.modal5.close()
                    this.getCurrentData()

                    this.setState({
                        note: '', checked: ''
                    })
                }
                else {
                    var data1 = response.data.error;
                    this.showToast(data1);
                    this.refs.modal5.close()
                    this.setState({
                        curloading: false, note: '', checked: ''
                    })
                    this.getCurrentData()


                }

            }
            catch (e) {
                var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
                this.showToast(error);
                this.refs.modal5.close()
                this.getCurrentData()
                this.setState({
                    curloading: false, note: '', checked: ''
                })
            }
        }
    }

    async checkleave(leave_task_data) {
        var mainData = [];
        var leave_task = [];
        mainData = this.state.data[Object.keys(this.state.data)[0]];
        leave_task = mainData.leave_task[Object.keys(mainData.leave_task)]

        Geolocation.getCurrentPosition(
            position => {
                const location = JSON.stringify(position);
                console.log('pos', location);
                this.setState({ currlatitude: position.coords.latitude, currlongitude: position.coords.longitude }, () => {


                    var currlat = Number.parseFloat(this.state.currlatitude).toFixed(2)
                    var currlong = Number.parseFloat(this.state.currlongitude).toFixed(2)
                    var lat = Number.parseFloat(mainData.latitude).toFixed(2)
                    var long = Number.parseFloat(mainData.longitude).toFixed(2)



                    if (currlat == lat && currlong == long) {
                        this.checkclockleave(mainData)
                    }
                    else {
                        Alert.alert(
                            'Warning',
                            'Your geotification is saved but will only be activated once you grant Geotify permission to access the device location.',
                            [
                                {
                                    text: 'OK', onPress: () => {
                                        this.checkclockleave(mainData)

                                    }
                                },
                            ],
                            { cancelable: false },
                        );
                    }
                });
            },
            error => {
                Alert.alert(error.message),
                console.log("error:", error),
                { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
            }
        );
    }



    async checkarrive() {
        // fetch current location
        Geolocation.getCurrentPosition(
            position => {
                console.log('pos:', position.coords.latitude, position.coords.longitude);
                this.setState({ currlatitude: position.coords.latitude, currlongitude: position.coords.longitude }, () => {

                    var mainData = [];
                    mainData = this.state.data[Object.keys(this.state.data)[0]];

                    console.log("latlong:", this.state.currlatitude);
                    var currlat = Number.parseFloat(this.state.currlatitude).toFixed(2)
                    var currlong = Number.parseFloat(this.state.currlongitude).toFixed(2)
                    var lat = Number.parseFloat(mainData.latitude).toFixed(2)
                    var long = Number.parseFloat(mainData.longitude).toFixed(2)

                    if (currlat == lat && currlong == long) {
                        console.log("error:")
                        var arrive = mainData.arrive_task[Object.keys(mainData.arrive_task)]
                        console.log("arrive:", arrive)

                        var body = {}
                        body.arrive_is_completed = !arrive.is_completed
                        body.notes = null
                        body.reason_title = null
                        body.reason_note = null
                        body.is_clock_not_at_location = false
                        body.lat = this.state.currlatitude
                        body.long = this.state.currlongitude
                        console.log("body:", body)
                        this.renderarrive(body)

                    } else {
                        Alert.alert(
                            'Warning',
                            'Your geotification is saved but will only be activated once you grant Geotify permission to access the device location.',
                            [
                                {
                                    text: 'OK', onPress: () => {
                                        var arrive = mainData.arrive_task[Object.keys(mainData.arrive_task)]
                                        console.log("arrive:", arrive)

                                        var body = {}
                                        body.arrive_is_completed = !arrive.is_completed
                                        body.notes = null
                                        body.reason_title = null
                                        body.reason_note = null
                                        body.is_clock_not_at_location = false
                                        body.lat = this.state.currlatitude
                                        body.long = this.state.currlongitude
                                        console.log("body:", body)
                                        this.renderarrive(body)
                                    }
                                },
                            ],
                            { cancelable: false },
                        );
                    }

                });
            },
            error => {
                Alert.alert(error.message),
                console.log("error:", error),
                { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
            }
        );
    }

    checkclock(mainData) {
        var time = moment().format();
        console.log('time  :', time, "mainData.start_time:", mainData.start_time)

        var before = moment().format("HH:mm");
        var start = moment(mainData.start_time).subtract(10, 'minutes').format("HH:mm");
        var after = moment(mainData.start_time).add(10, 'minutes').format("HH:mm");

        if (start <= before) {
            if (after < before) {
                console.log('timetime working:')
                Alert.alert(
                    'Notice',
                    'You are clocking in late. Please give an explanation in order to Clock in.. GPS is showing that you are not at your designated shift location',
                    [
                        {
                            text: 'No',
                            onPress: () => console.log('Cancel Pressed'),
                            style: 'cancel',
                        },
                        { text: 'Yes', onPress: () => console.log('OK Pressed') },
                    ],
                    { cancelable: false },
                );
            }
            else {
                Geolocation.getCurrentPosition(
                    position => {
                        this.setState({ currlatitude: position.coords.latitude, currlongitude: position.coords.longitude }, () => {
                            var mainData = [];
                            mainData = this.state.data[Object.keys(this.state.data)[0]];

                            var currlat = Number.parseFloat(this.state.currlatitude).toFixed(2)
                            var currlong = Number.parseFloat(this.state.currlongitude).toFixed(2)
                            var lat = Number.parseFloat(mainData.latitude).toFixed(2)
                            var long = Number.parseFloat(mainData.longitude).toFixed(2)


                            if (currlat == lat && currlong == long) {
                                console.log("arrival_latitude :", mainData.arrival_latitude)

                                var mainData = [];
                                mainData = this.state.data[Object.keys(this.state.data)[0]];
                                var arrive = mainData.arrive_task[Object.keys(mainData.arrive_task)]
                                var body = {}
                                body.arrive.is_completed = !arrive.is_completed
                                body.notes = null
                                body.reason_title = null
                                body.reason_note = null
                                body.is_clock_not_at_location = false
                                body.lat = this.state.currlatitude
                                body.long = this.state.currlongitude
                                this.renderarrive(body)
                            }
                            else {
                                Alert.alert(
                                    'Warning',
                                    'GPS is showing that you are not at your designated shift location',
                                    [
                                        {
                                            text: 'No',
                                            onPress: () => console.log('Cancel Pressed'),
                                            style: 'cancel',
                                        },
                                        {
                                            text: 'Yes', onPress: () => {
                                                var mainData = [];
                                                mainData = this.state.data[Object.keys(this.state.data)[0]];
                                                var arrive = mainData.arrive_task[Object.keys(mainData.arrive_task)]
                                                console.log("arrive:", arrive)

                                                var body = {}
                                                body.arrive_is_completed = !arrive.is_completed
                                                body.notes = null
                                                body.reason_title = null
                                                body.reason_note = null
                                                body.is_clock_not_at_location = false
                                                body.lat = this.state.currlatitude
                                                body.long = this.state.currlongitude
                                                console.log("body:", body)
                                                this.renderarrive(body)
                                            }
                                        },
                                    ],
                                    { cancelable: false },
                                );
                            }
                        });

                    },
                    error => {
                        Alert.alert(error.message),
                        console.log("error:", error),
                        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
                    }
                );

            }


        } else {
            Alert.alert(
                'Notice',
                'You are clocking in early. Please give an explanation in order to Clock in.. GPS is showing that you are not at your designated shift location',
                [
                    {
                        text: 'No',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                    },
                    { text: 'Yes', onPress: () => console.log('OK Pressed') },
                ],
                { cancelable: false },
            );
        }
    }

    checkclockleave(mainData) {
        var time = moment().format();
        var arrive = mainData.arrive_task[Object.keys(mainData.arrive_task)]
        var leave_task = mainData.leave_task[Object.keys(mainData.leave_task)]

        var task_completed = false
        console.log('this.task_data', this.task_data)

        for (let i = 0; i < this.task_data.length; i++) {
            var task = this.task_data[i][Object.keys(this.task_data[i])]
            console.log('this.task_data[Object.keys(this.task_data)[i]].is_completed:', task)

            if (task.is_completed == true) {
                task_completed = true
            }
        }
        console.log("task_completed:", this.task_data == [] ? true : task_completed == true)


        if (arrive.is_completed == true) {
            if (this.task_data) {
                if (task_completed == true) {
                    var body = {}
                    body.arrive_is_completed = !leave_task.is_completed
                    body.notes = null
                    body.reason_title = null
                    body.reason_note = null
                    body.is_clock_not_at_location = false
                    body.lat = this.state.currlatitude
                    body.long = this.state.currlongitude
                    console.log("body: ", body)
                    this.renderleave(body)
                }
                else {
                    this.refs.modaltaskleave.open()

                }
            } else {
                var body = {}
                body.arrive_is_completed = !leave_task.is_completed
                body.notes = null
                body.reason_title = null
                body.reason_note = null
                body.is_clock_not_at_location = false
                body.lat = this.state.currlatitude
                body.long = this.state.currlongitude
                console.log("body:", body)
                this.renderleave(body)
            }

        } else {
            Alert.alert(
                'Notice',
                'You are not allowed to check-out. Please clock-in first',
                [
                    { text: 'Ok', onPress: () => console.log('OK Pressed') },
                ],
                { cancelable: false },
            );
        }

    }


    reimbursemet(miles) {
        console.log("miles:", miles)
        if (miles == null ? false : miles.miles) {
            this.setState({ cost: miles.miles.toString(), details: miles.description }, () => {
                console.log("miles: ", this.state.cost)
                this.refs.modal4.open()
            })
        } else {
            this.refs.modal4.open()

        }
    }

    async addreimbursement(miles) {
        console.log('miles:', miles)
        if (this.state.cost && this.state.details) {
            this.setState({ reimloading: true })
            try {
                var agency_code = await AsyncStorage.getItem('agency_code');

                var mainData = [];
                var access_token = this.props.data.access_token;

                mainData = this.state.data[Object.keys(this.state.data)[0]];



                var requestBody = qs.stringify({
                    'reimbursement_mileage[shift_id]': mainData.id,
                    'reimbursement_mileage[miles]': this.state.cost,
                    'reimbursement_mileage[description]': this.state.details
                });

                console.log("miles:, ", APIService.execute('PUT', Globals.httpMode + agency_code  + Globals.domain +
                    ('/api/v1/reimbursement_mileages/2'), requestBody, access_token))
                var reimbursement = await APIService.execute(miles ? 'PUT' : 'POST', Globals.httpMode + agency_code  + Globals.domain +
                    (miles ? '/api/v1/reimbursement_mileages/' + miles.id : '/api/v1/reimbursement_mileages'), requestBody, access_token)
                console.log("reimburesement:", reimbursement)
                if (miles) {
                    if (reimbursement.success == true) {
                        this.setState({ reimloading: false })
                        this.getCurrentData()
                        // var data = reimbursement.data[Object.keys(reimbursement.data)[0]];
                        this.showToast("Reimbursement Updated Successfully")
                        console.log("updatad:")
                        this.refs.modal4.close()
                    }

                } else {
                    if (reimbursement.success == true) {
                        this.setState({ reimloading: false })

                        // var data = reimbursement.data[Object.keys(reimbursement.data)[0]];
                        this.showToast("Reimbursement Added Successfully")
                        this.refs.modal4.close()
                    }
                }
            }
            catch (e) {
                this.setState({ reimloading: false })

                console.log("error:", e)
            }
        }
        else if (this.state.cost == null) {
            this.showToast("Enter Cost")
        } else if (this.state.details == null) {
            this.showToast("Enter Description")
        }
        // this.refs.modal4.close()
    }

    GetTaskCost(value) {
        this.setState({ cost: value })
    }

    GetTaskDescription(value) {
        this.setState({ details: value })
    }

    GetLateNote(value) {
        this.setState({ latenote: value })
    }

    GetGPSNote(value) {
        this.setState({ gps_note: value })
    }

    GetEarlyNote(value) {
        this.setState({ early_note: value })
    }

    GetTaskLeave(value) {
        this.setState({ task_leave: value })
    }

    async renderleave(body) {
        this.setState({ arriveloading: true, noteloading: false })
        var mainData = [];
        var access_token = this.props.data.access_token;
        var agency_code = await AsyncStorage.getItem('agency_code');
        mainData = this.state.data[Object.keys(this.state.data)[0]];
        var leave = mainData.leave_task[Object.keys(mainData.leave_task)]
        var requestBody = qs.stringify({
            'task[is_completed]': body.arrive_is_completed,
            'task[notes]': body.notes,
            'task[reason_title]': body.reason_title,
            'task[reason_note]': body.reason_note,
            'task[is_clock_not_at_location]': body.is_clock_not_at_location,
            'task[coordinates][lat]': body.lat,
            'task[coordinates][lon]': body.long
        });

        console.log("body_leave_data:, ", leave)
        var is_completed = await APIService.execute('PUT', Globals.httpMode + agency_code  + Globals.domain + '/api/tasks/' + leave.id, requestBody, access_token)
        console.log("is_completed: lon", is_completed)
        this.refs.modal2.close()
        this.refs.modal3.close()
        this.refs.modalearly.close()
        this.refs.modaltaskleave.close()


        if (is_completed.data.message) {
            this.setState({ arriveloading: false, noteloading: false })
            this.getCurrentData();
            this.showToast(is_completed.data.message)
        }

        if (is_completed.data.errors == 'GPS is showing that you are not at your designated shift location') {
            this.setState({ arriveloading: false, noteloading: false })

            Alert.alert(
                'Warning',
                is_completed.data.errors,
                [
                    {
                        text: 'No',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                    },
                    { text: 'Yes', onPress: () => { this.refs.modal2.open() } },
                ],
                { cancelable: false },
            );


        }
        else if (is_completed.data.errors == 'You are clocking in late. Please give an explanation in order to Clock In.. GPS is showing that you are not at your designated shift location' || is_completed.data.errors == 'You are clocking in late. Please give an explanation in order to Clock In.') {
            this.setState({ arriveloading: false, noteloading: false })

            Alert.alert(
                'Notice',
                is_completed.data.errors,
                [
                    {
                        text: 'No',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                    },
                    { text: 'Yes', onPress: () => { this.refs.modal3.open() } },
                ],
                { cancelable: false },
            );
        }
        else if (is_completed.data.errors == 'You are clocking in early. Please give an explanation in order to Clock In.. GPS is showing that you are not at your designated shift location') {

            this.setState({ arriveloading: false, noteloading: false })

            Alert.alert(
                'Notice',
                is_completed.data.errors,
                [
                    {
                        text: 'No',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                    },
                    { text: 'Yes', onPress: () => { this.refs.modalearly.open() } },
                ],
                { cancelable: false },
            );

        }

    }


    async renderarrive(body) {
        this.setState({ arriveloading: true, noteloading: false })
        var mainData = [];
        var access_token = this.props.data.access_token;
        var agency_code = await AsyncStorage.getItem('agency_code');
        mainData = this.state.data[Object.keys(this.state.data)[0]];
        var arrive = mainData.arrive_task[Object.keys(mainData.arrive_task)]
        var requestBody = qs.stringify({
            'task[is_completed]': body.arrive_is_completed,
            'task[notes]': body.notes,
            'task[reason_title]': body.reason_title,
            'task[reason_note]': body.reason_note,
            'task[is_clock_not_at_location]': body.is_clock_not_at_location,
            'task[coordinates][lat]': body.lat,
            'task[coordinates][lon]': body.long
        });

        console.log("body_leave_data:, ", requestBody)
        var is_completed = await APIService.execute('PUT', Globals.httpMode + agency_code  + Globals.domain + '/api/tasks/' + arrive.id, requestBody, access_token)
        console.log("is_completed: lon", is_completed)
        this.refs.modal2.close()
        this.refs.modal3.close()
        this.refs.modalearly.close()
        this.refs.modaltaskleave.close()


        if (is_completed.data.message) {
            this.setState({ arriveloading: false, noteloading: false })
            this.getCurrentData();
            this.showToast(is_completed.data.message)
        }

        if (is_completed.data.errors == 'GPS is showing that you are not at your designated shift location') {
            this.setState({ arriveloading: false, noteloading: false })

            Alert.alert(
                'Warning',
                is_completed.data.errors,
                [
                    {
                        text: 'No',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                    },
                    { text: 'Yes', onPress: () => { this.refs.modal2.open() } },
                ],
                { cancelable: false },
            );


        }
        else if (is_completed.data.errors == 'You are clocking in late. Please give an explanation in order to Clock In.. GPS is showing that you are not at your designated shift location' || is_completed.data.errors == 'You are clocking in late. Please give an explanation in order to Clock In.') {
            this.setState({ arriveloading: false, noteloading: false })

            Alert.alert(
                'Notice',
                is_completed.data.errors,
                [
                    {
                        text: 'No',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                    },
                    { text: 'Yes', onPress: () => { this.refs.modal3.open() } },
                ],
                { cancelable: false },
            );
        }
        else if (is_completed.data.errors == 'You are clocking in early. Please give an explanation in order to Clock In.. GPS is showing that you are not at your designated shift location') {

            this.setState({ arriveloading: false, noteloading: false })

            Alert.alert(
                'Notice',
                is_completed.data.errors,
                [
                    {
                        text: 'No',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                    },
                    { text: 'Yes', onPress: () => { this.refs.modalearly.open() } },
                ],
                { cancelable: false },
            );

        }

    }

    async rendertask_leave(mainData) {
        var leave_task = mainData.leave_task[Object.keys(mainData.leave_task)]

        if (this.state.task_leave) {

            var body = {}
            body.arrive_is_completed = !leave_task.is_completed
            body.notes = null
            body.reason_title = null
            body.reason_note = this.state.task_leave
            body.is_clock_not_at_location = false
            body.lat = this.state.currlatitude
            body.long = this.state.currlongitude
            console.log("body leave:", body)
            this.renderleave(body)


        }
        else {
            this.showToast("enter note")
        }

    }

    async renderarrive_gps() {
        this.setState({ noteloading: true })
        var mainData = [];
        mainData = this.state.data[Object.keys(this.state.data)[0]];
        var arrive = mainData.arrive_task[Object.keys(mainData.arrive_task)]
        console.log("arrive:", arrive)
        var body = {}
        body.arrive_is_completed = !arrive.is_completed
        body.notes = null
        body.reason_title = null
        body.reason_note = this.state.gps_note
        body.is_clock_not_at_location = false
        body.lat = this.state.currlatitude
        body.long = this.state.currlongitude
        console.log("body:", body)
        this.renderarrive(body)

    }

    async renderarrive_early() {
        this.setState({ noteloading: true })
        var mainData = [];
        mainData = this.state.data[Object.keys(this.state.data)[0]];
        var arrive = mainData.arrive_task[Object.keys(mainData.arrive_task)]
        console.log("arrive:", arrive)
        var body = {}
        body.arrive_is_completed = !arrive.is_completed
        body.notes = null
        body.reason_title = 'clock in early'
        body.reason_note = this.state.early_note
        body.is_clock_not_at_location = false
        body.lat = this.state.currlatitude
        body.long = this.state.currlongitude
        console.log("bodyearly:", body)
        this.renderarrive(body)

    }

    async renderarrive_late() {
        this.setState({ noteloading: true, arriveloading: true })
        var mainData = [];
        mainData = this.state.data[Object.keys(this.state.data)[0]];
        var arrive = mainData.arrive_task[Object.keys(mainData.arrive_task)]
        console.log("arrive:", arrive)
        var body = {}
        body.arrive_is_completed = !arrive.is_completed
        body.notes = null
        body.reason_title = null
        body.reason_note = this.state.latenote
        body.is_clock_not_at_location = false
        body.lat = this.state.currlatitude
        body.long = this.state.currlongitude
        console.log("body late:", body)
        this.renderarrive(body)

    }

    renderModalContent = () => {
        if (this.state.arriveloading) {
            return (
                <View style={styles.overlay}>
                    <ActivityIndicator
                        size='large'
                        color={styleConstants.gradientStartColor}
                    />
                </View>
            );
        }
        else {
            return null;
        }
    }




    render() {
        const { navigate } = this.props.navigation;
        var clientData = null;
        var mainData = [];
        var care_log = [];
        const schLocation = [];
        var previous_caregivers = [];
        var miles = [];
        var arrive_task = [];
        var leave_task = [];
        var previous_five_cgs = []
        Geocoder.init("AIzaSyAbjtnF9LXxwmSf3ATD4aHnOuX0hF9AqO0");
        if (this.state.curloading) {
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor,]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={"Shift Details"} expanded={true} onBack={() => {
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
            //clientData = Object.keys(this.props.data)[0].start_time;
            if (this.state.data) {
                mainData = this.state.data[Object.keys(this.state.data)[0]];
                previous_caregivers = mainData.previous_caregivers;
                previous_five_cgs = Object.keys(mainData.previous_five_cgs).map(key => ({ [key]: mainData.previous_five_cgs[key] }));
                const caregiver_result = Object.keys(previous_caregivers).map(key => ({ [key]: previous_caregivers[key] }));
                var caregiver_data = []
                for (let i = 0; i < caregiver_result.length; i++) {
                    caregiver_data.push(caregiver_result[Object.keys(caregiver_result)[i]])
                }
                console.log("maindata: ", mainData);
                arrive_task = mainData.arrive_task[Object.keys(mainData.arrive_task)]
                // this.setState({arrive: arrive_task.is_completed})
                leave_task = mainData.leave_task[Object.keys(mainData.leave_task)]
                console.log("leave : ", leave_task.is_completed)
                miles = mainData.reimbursement_mileage == null ? null : mainData.reimbursement_mileage
                clientData = mainData.client;
                care_log = mainData.care_log;
                const x = care_log;
                const result = Object.keys(x).map(key => ({ [key]: x[key] }));
                // console.log("result:", result);
                const notes = mainData.notes;
                const notesresult = Object.keys(notes).map(key => ({ [key]: notes[key] }));

                var note_data = []
                for (let i = 0; i < notesresult.length; i++) {
                    note_data.push(notesresult[Object.keys(notesresult)[i]])
                }
                // console.log("note_data:", note_data)

                var care_log_data = []
                for (let i = 0; i < result.length; i++) {
                    care_log_data.push(result[Object.keys(result)[i]])
                }
                // console.log("care_log  :", care_log_data.length)
                this.task_data = care_log_data;
                schLocation.push(mainData.latitude, mainData.longitude);
                var clientD = clientData ? clientData[Object.keys(clientData)[0]] : null;
                if (mainData) {
                    if (mainData.latitude !== null) {
                        // console.log("befoer user data mainData:", mainData.latitude);
                        var map = {};
                        map.latitude = mainData ? mainData.latitude : null;
                        map.longitude = mainData ? mainData.longitude : null;
                        this.state.markers.push(map)
                    }
                }
            }

            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={"Shift Details"} expanded={this.state.expanded} Agency_logo={this.state.agency_details} onBack={() => {
                        this.props.navigation.goBack()
                    }} />
                    <ScrollView showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.curloading}
                                onRefresh={this._onRefresh}
                                colors={["#4254C5"]}
                            />}>
                        <View style={[commonStyles.full, commonStyles.margin]}>
                            <View style={[styles.rectangleShape, commonStyles.column]} >
                            <TouchableOpacity style={[commonStyles.full, commonStyles.row]}
                                    onPress={()=>{
                                        // console.log("previous_five_cgs",previous_five_cgs.length)
                                        navigate('ClientProfile',{item:mainData.client,previous_caregivers:previous_five_cgs,previous_caregiver_name:mainData.previous_caregiver_name})
                                    }}>
                                    <View>
                                        {
                                            clientD && clientD.avatar_url == undefined || clientD.avatar_url == null ?
                                                <View style={[commonStyles.center, { width: wp('12.5%'), height: hp('6%'), backgroundColor: '#f1f2f4', borderColor: '#c7c7c7', borderWidth: wp('0.1%'), borderRadius: 5 }]}>
                                                    <Text style={[commonStyles.fs(3.5), { color: styleConstants.gradientStartColor }]}>{clientD.name.charAt(0).toUpperCase()}</Text>
                                                </View> : (
                                                    <View>
                                                        <Image style={[styles.clientImage]}
                                                            source={{ uri: clientD.avatar_url }} />
                                                    </View>
                                                )
                                        }
                                    </View>
                                    <View style={{ marginLeft: wp('3%') }}>
                                        <Text style={{ fontSize: hp('2.2%'), color: '#293D68', fontFamily: 'Catamaran-Medium', }}>{clientD.name}</Text>
                                        <Text style={{ marginTop: -5, fontSize: hp('1.8%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', }}>Client</Text>
                                    </View>
                                </TouchableOpacity>

                                <View style={commonStyles.line} />

                                <View style={[commonStyles.full, commonStyles.row, commonStyles.mt(1.5)]}>
                                    <View style={[commonStyles.row, commonStyles.center, commonStyles.full, { justifyContent: 'flex-start' }]}>
                                        <Image style={[styles.smallImage]}
                                            source={require('../../assets/images/clock.png')} />
                                        <Text style={[{ textAlignVertical: 'center', fontSize: hp('2%'), textAlign: 'center', color: '#828EA5', fontFamily: 'Catamaran-Regular', }, commonStyles.ml(1)]}>{this.pstToLocal(mainData.start_time, true, mainData.timezone)} - {this.pstToLocal(mainData.end_time, false)}</Text>
                                    </View>

                                    <View style={[commonStyles.row, commonStyles.center, commonStyles.full, { justifyContent: 'flex-end' }]}>
                                        <Image style={[styles.smallImage]}
                                            source={require('../../assets/images/calendar.png')} />
                                        <Text style={[{ textAlignVertical: 'center', fontSize: hp('2%'), textAlign: 'center', color: '#828EA5', fontFamily: 'Catamaran-Regular', }, commonStyles.ml(1)]}>{moment(mainData.start_time).format("MMM DD, YYYY")}</Text>
                                    </View>
                                </View>

                                <View style={[commonStyles.full, commonStyles.row]}>
                                    <View style={[commonStyles.row, commonStyles.full, { justifyContent: 'flex-start' }]}>
                                        <Image style={[styles.smallImage, { marginTop: 6 }]}
                                            source={require('../../assets/images/location.png')} />
                                        <Text numberOfLines={2} style={[{ textAlignVertical: 'center', fontSize: hp('1.9%'), textAlign: 'left', color: '#828EA5', fontFamily: 'Catamaran-Regular', color: '#41A2EB', textDecorationLine: 'underline' }, commonStyles.ml(1)]}>{mainData.location ? mainData.location : "---"}</Text>
                                    </View>

                                    <View style={[commonStyles.row, commonStyles.center, commonStyles.full, { justifyContent: 'flex-end' }]}>

                                    </View>
                                </View>

                            </View>

                            <View>
                                <MapView
                                    style={{ width: wp('90%'), height: hp('25%'), marginTop: wp('3%') }}
                                    showsUserLocation={true}
                                    zoomEnabled={true}
                                    zoomControlEnabled={true}
                                    scrollEnabled={true}
                                    initialRegion={{
                                        latitude: this.state.markers.length>0 &&this.state.markers[0].latitude != null ? this.state.markers[0].latitude : 0,
                                        longitude: this.state.markers.length>0 && this.state.markers[0].latitude != null ? this.state.markers[0].longitude : 0,
                                        latitudeDelta: 0.0922,
                                        longitudeDelta: 0.0421
                                    }}
                                >
                                    {this.state.markers.map(marker => (
                                        // console.log('markers:marker',marker),
                                        <Marker
                                            coordinate={marker}
                                            title={marker.title}
                                            description={marker.description}
                                        />
                                    ))}
                                </MapView>
                            </View>

                            <View style={[styles.itemRectangleShape, { flexDirection: 'row' }]} >
                                <View style={{ padding: wp('2%'), flex: 1 }}>
                                    <View style={commonStyles.column}>
                                        <Text style={[styles.itemHeader]}>Shift Alert</Text>
                                        <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', }}>{mainData.shift_alert ? mainData.shift_alert : '---'}</Text>
                                    </View>
                                </View>
                                <View style={{ justifyContent: 'flex-end', width: wp('1.7%'), backgroundColor: '#E94A5E', borderBottomRightRadius: 8, borderTopRightRadius: 8, }} />
                            </View>




                            <View style={[styles.itemRectangleShape, { flexDirection: 'row' }]} >
                                <View style={{ padding: wp('2%'), flex: 1 }}>
                                    <View style={commonStyles.column}>
                                        <Text style={[styles.itemHeader]}>Arrive</Text>
                                        <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', }}>{arrive_task ? arrive_task.details : '---'}</Text>
                                    </View>
                                </View>

                                {arrive_task.is_completed ?

                                    <TouchableOpacity style={[commonStyles.center, { justifyContent: 'center', alignItems: 'flex-end', marginRight: wp('3%') }]}
                                    // onPress={() => this.checkarrive()}
                                    >
                                        <Image style={{ width: wp('2.5%'), height: hp('2.5%'), aspectRatio: 1, }}
                                            source={require('../../assets/images/green-check.png')} />
                                    </TouchableOpacity> : <TouchableOpacity style={[commonStyles.center, { justifyContent: 'center', alignItems: 'flex-end', marginRight: wp('3%') }]}
                                    // onPress={() => this.checkarrive()}
                                    >
                                        <Image style={{ width: wp('2.5%'), height: hp('2.5%'), aspectRatio: 1, }}
                                            source={require('../../assets/images/gray-check.png')} />
                                    </TouchableOpacity>}

                            </View>

                            <TouchableOpacity style={[styles.itemRectangleShape, { flexDirection: 'row' }]}
                                onPress={() => care_log_data.length > 0 ? navigate('ShowTask', { item: this.state.task_id }) : null}
                            >
                                <View style={{ padding: wp('2%'), flex: 1 }}>
                                    <View style={commonStyles.column}>
                                        <Text style={[styles.itemHeader]}>Task</Text>
                                        <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', }}>{care_log_data.length || '0'} Task Created</Text>
                                    </View>
                                </View>
                                {care_log_data.length > 0 ?
                                    <View style={[commonStyles.center, { justifyContent: 'center', alignItems: 'flex-end', marginRight: wp('3%') }]}>
                                        <Image style={[{ height: hp('2%'), width: wp('2%') }]}
                                            source={require('../../assets/images/right-arrow.png')} />
                                    </View> : null}

                            </TouchableOpacity>

                            <View style={[styles.itemRectangleShape, { flexDirection: 'row' }]} >
                                <View style={{ padding: wp('2%'), flex: 1 }}>
                                    <View style={commonStyles.column}>
                                        <Text style={[styles.itemHeader]}>Leave</Text>
                                        <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', }}>{leave_task ? leave_task.details : '---'}</Text>
                                    </View>
                                </View>

                                {leave_task.is_completed ?

                                    <TouchableOpacity style={[commonStyles.center, { justifyContent: 'center', alignItems: 'flex-end', marginRight: wp('3%') }]}
                                    // onPress={() => this.checkleave(leave_task)}
                                    >
                                        <Image style={{ width: wp('2.5%'), height: hp('2.5%'), aspectRatio: 1, }}
                                            source={require('../../assets/images/green-check.png')} />
                                    </TouchableOpacity> :
                                    <TouchableOpacity style={[commonStyles.center, { justifyContent: 'center', alignItems: 'flex-end', marginRight: wp('3%') }]}
                                    // onPress={() => this.checkleave(leave_task)}
                                    >
                                        <Image style={{ width: wp('2.5%'), height: hp('2.5%'), aspectRatio: 1, }}
                                            source={require('../../assets/images/gray-check.png')} />
                                    </TouchableOpacity>}

                            </View>


                            <TouchableOpacity
                                onPress={() => mainData.images ? Object.keys(mainData.images).length >0? navigate('ShowShiftPhoto',{item:this.state.data}):null:null}
                            >
                                <View style={[styles.itemRectangleShape, { flexDirection: 'row' }]} >
                                    <View style={{ padding: wp('2%'), flex: 1 }}>
                                        <View style={commonStyles.column}>
                                            <Text style={[styles.itemHeader]}>Shift Photos</Text>
                                            <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', }}>{mainData.images ? Object.keys(mainData.images).length + ' Photos' : '0 Photos'}</Text>
                                        </View>
                                    </View>
                                    {mainData.images ? Object.keys(mainData.images).length >0? 
                                    <View style={[commonStyles.center, { justifyContent: 'center', alignItems: 'flex-end', marginRight: wp('3%') }]}>
                                        <Image style={[{ height: hp('2%'), width: wp('2%') }]}
                                            source={require('../../assets/images/right-arrow.png')} />
                                    </View>:null:null}

                                </View>
                            </TouchableOpacity>



                            <TouchableOpacity style={[styles.itemRectangleShape, { flexDirection: 'row' }]}
                                onPress={() => navigate('ShowExtraExpenses', { item1: mainData.total_extra_expenses, item2: this.state.data })}
                            >
                                <View style={{ padding: wp('2%'), flex: 1 }}>
                                    <View style={commonStyles.column}>
                                        <Text style={[styles.itemHeader]}>Extra Expenses</Text>
                                        <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', }}>{mainData.total_extra_expenses || '0'} USD</Text>
                                    </View>
                                </View>

                                <View style={[commonStyles.center, { justifyContent: 'center', alignItems: 'flex-end', marginRight: wp('3%') }]}>
                                    <Image style={[{ height: hp('2%'), width: wp('2%') }]}
                                        source={require('../../assets/images/right-arrow.png')} />
                                </View>

                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.itemRectangleShape, { flexDirection: 'row' }]}
                            // onPress={() => this.reimbursemet(miles)}
                            >
                                <View style={{ padding: wp('2%'), flex: 1 }}>
                                    <View style={commonStyles.column}>
                                        <Text style={[styles.itemHeader]}>Reimbursement Mileage</Text>
                                        <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', }}>{miles ? miles.miles : '0'} Miles</Text>
                                    </View>
                                </View>

                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.itemRectangleShape, { flexDirection: 'row' }]}
                                onPress={() => caregiver_data.length > 0 ? navigate('Caregivers', { item: caregiver_data }) : null}
                            >
                                <View style={{ padding: wp('2%'), flex: 1 }}>
                                    <View style={commonStyles.column}>
                                        <Text style={[styles.itemHeader]}>Previous Caregivers</Text>
                                        <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', }}>{caregiver_data.length || '0'} Caregiver</Text>
                                    </View>
                                </View>
                                {caregiver_data.length > 0 ?
                                    <View style={[commonStyles.center, { justifyContent: 'center', alignItems: 'flex-end', marginRight: wp('3%') }]}>
                                        <Image style={[{ height: hp('2%'), width: wp('2%') }]}
                                            source={require('../../assets/images/right-arrow.png')} />
                                    </View> : null}

                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.itemRectangleShape, { flexDirection: 'row', marginBottom: wp('3%'), }]}
                                onPress={() => note_data.length > 0 ? navigate('Notes', { item: note_data }) : null}
                            >
                                <View style={{ padding: wp('2%'), flex: 1 }}>
                                    <View style={commonStyles.column}>
                                        <Text style={[styles.itemHeader]}>Note</Text>
                                        <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', }}>{note_data.length || '0'} Added</Text>
                                    </View>
                                </View>
                                {note_data.length > 0 ?
                                    <View style={[commonStyles.center, { justifyContent: 'center', alignItems: 'flex-end', marginRight: wp('3%') }]}>
                                        <Image style={[{ height: hp('2%'), width: wp('2%') }]}
                                            source={require('../../assets/images/right-arrow.png')} />
                                    </View> : null}

                            </TouchableOpacity>
                        </View>

                    </ScrollView>
                    <Modal style={[styles.modal, styles.modal1]} position={"center"} ref={"modal6"} swipeArea={20}
                        backdropPressToClose={true}  >
                        <ScrollView keyboardShouldPersistTaps={true}>
                            <View style={{ flex: 1, width: wp('85%'), justifyContent: 'center', alignContent: 'center', backgroundColor: '#fff', borderRadius: 4, flexDirection: 'column', paddingHorizontal: wp('1%') }} >
                                <TouchableOpacity style={{ justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'flex-end', marginRight: wp('1%') }}
                                    onPress={() => { this.refs.modal6.close() }}>
                                    {/* <View style={{ marginLeft: wp('6%') }}></View> */}
                                    <Image style={[{ height: hp('5%'), width: wp('5%'), resizeMode: 'contain', alignSelf: 'flex-end' }]}
                                        source={require('../../assets/images/error.png')} />
                                </TouchableOpacity>
                                <Text style={[style.boldFont, style.fontSize(3), { justifyContent: 'center', alignSelf: 'center', color: '#3B5793', marginBottom: wp('2%'), marginLeft: wp('2%'), marginTop: wp('-4%') }]}>New Task</Text>
                                <View style={[style.mb(0.1), { margin: wp('4%'), marginTop: wp('0.1%'), }]}>
                                    <Text style={[styles.boldFont, commonStyles.fs(1.9), { color: '#3B5793', fontFamily: 'Catamaran-Bold', marginLeft: wp('1%') }]}>Task Title</Text>
                                    <TextInput
                                        style={[styles.boldFont, commonStyles.fs(2.3), { color: '#828ea5', fontFamily: 'Catamaran-Medium', marginTop: wp('-4%'),borderBottomColor:'#000', borderBottomWidth:Platform.OS === "ios" ? 1:null  }]}
                                        underlineColorAndroid={'#828ea5'}
                                        onFocus={this.handleFocustitle}
                                        onBlur={this.handleBlurtitle}
                                        multiline
                                        numberOfLines={1}
                                        placeholder={'Enter Task Title'}
                                        placeholderTextColor="#828ea5"
                                        onChangeText={ValueHolder => this.GetTaskTitle(ValueHolder)}
                                        value={this.state.title} />
                                </View>
                                <View style={[style.mb(1), { margin: wp('4%'), marginTop: wp('3%') }]}>
                                    <Text style={[styles.boldFont, commonStyles.fs(1.9), { color: '#3B5793', fontFamily: 'Catamaran-Bold', marginLeft: wp('1%') }]}>Task Details</Text>
                                    <TextInput
                                        style={[styles.boldFont, commonStyles.fs(2.3), { color: '#828ea5', fontFamily: 'Catamaran-Medium', marginTop: wp('-4%'),borderBottomColor:'#000', borderBottomWidth:Platform.OS === "ios" ? 1:null  }]}
                                        underlineColorAndroid={'#828ea5'}
                                        onFocus={this.handleFocusdetails}
                                        onBlur={this.handleBlurdetails}
                                        multiline
                                        numberOfLines={1}
                                        placeholder={'Enter Task Details'}
                                        placeholderTextColor="#828ea5"
                                        onChangeText={ValueHolder => this.GetTaskDetails(ValueHolder)}
                                        value={this.state.details} />
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
                                        <TouchableOpacity style={{ justifyContent: 'flex-start', alignSelf: 'center', padding: wp('6%'), borderRadius: 8 }}
                                            onPress={() => { this.rendernewtask() }}>
                                            <Text style={[commonStyles.boldFont, { color: '#ffffff', justifyContent: 'center', alignSelf: 'center', marginHorizontal: wp('2%') }]}>Save</Text>
                                        </TouchableOpacity>
                                    </LinearGradient>
                                </View>
                            </View>
                        </ScrollView>
                    </Modal>
                    <Modal style={[styles.modal, styles.modal1]} position={"center"} ref={"modal5"} swipeArea={20}
                        backdropPressToClose={true}  >
                        <ScrollView keyboardShouldPersistTaps={true}>
                            <View style={{ flex: 1, width: wp('85%'), justifyContent: 'center', alignContent: 'center', backgroundColor: '#fff', borderRadius: 4, flexDirection: 'column', paddingHorizontal: wp('1%') }} >
                                <TouchableOpacity style={[style.mb(0.1), { justifyContent: 'flex-end', alignItems: 'flex-end', marginRight: wp('1%'), flexDirection: 'row' }]}
                                    onPress={() => { this.refs.modal5.close() }}>
                                    <Image style={[{ height: hp('5%'), width: wp('5%'), resizeMode: 'contain', alignSelf: 'flex-end' }]}
                                        source={require('../../assets/images/error.png')} />
                                </TouchableOpacity>
                                <Text style={[style.boldFont, style.fontSize(3), { justifyContent: 'center', alignSelf: 'center', color: '#3B5793', marginBottom: wp('2%'), marginLeft: wp('2%'), marginTop: wp('-4%') }]}>Add Note</Text>
                                <View style={[style.mb(0.1), { margin: wp('4%'), marginTop: wp('0.1%'), }]}>
                                    <Text style={[styles.boldFont, commonStyles.fs(1.9), { color: '#3B5793', fontFamily: 'Catamaran-Bold', marginLeft: wp('1%') }]}>Note</Text>
                                    <TextInput
                                        style={[styles.boldFont, commonStyles.fs(2.3), { color: '#828ea5', fontFamily: 'Catamaran-Medium', marginTop: wp('-4%'),borderBottomColor:'#000', borderBottomWidth:Platform.OS === "ios" ? 1:null  }]}
                                        underlineColorAndroid={'#828ea5'}
                                        onFocus={this.handleFocustitle}
                                        onBlur={this.handleBlurtitle}
                                        multiline
                                        numberOfLines={1}
                                        placeholder={'Please enter note'}
                                        placeholderTextColor="#828ea5"
                                        onChangeText={ValueHolder => this.GetTaskNote(ValueHolder)}
                                        value={this.state.note} />
                                </View>
                                <View style={[style.mb(1), { margin: wp('1%'), marginTop: wp('1%'), justifyContent: 'flex-start', alignItems: 'flex-start', flexDirection: 'row', marginLeft: wp('3%') }]}
                                >
                                    <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => this.setState({ checked: !this.state.checked })}>
                                        <CheckBox checked={this.state.isVisible} style={{ backgroundColor: this.state.checked === true ? "#2B4781" : "white", borderColor: this.state.checked === true ? "#2B4781" : "#2B4781", width: 22, height: 21, justifyContent: 'center', alignSelf: 'center', alignItems: 'center', alignContent: 'center', paddingTop: 5 }}
                                            onPress={() => this.setState({ checked: !this.state.checked })} />
                                        <Text style={{ justifyContent: 'center', color: '#3B5793', alignSelf: 'center', marginLeft: wp('5%') }}>Urgent Note</Text>
                                    </TouchableOpacity>
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
                                        <TouchableOpacity style={{ justifyContent: 'flex-start', alignSelf: 'center', padding: wp('6%'), borderRadius: 8 }}
                                            onPress={() => { this.rendernewnote() }}>
                                            <Text style={[commonStyles.boldFont, { color: '#ffffff', justifyContent: 'center', alignSelf: 'center', marginHorizontal: wp('2%') }]}>Save</Text>
                                        </TouchableOpacity>
                                    </LinearGradient>
                                </View>
                            </View>
                        </ScrollView>
                    </Modal>
                    <Modal style={[styles.modal, styles.modal1]} position={"center"} ref={"modal4"} swipeArea={20}
                        backdropPressToClose={true}  >
                        <ScrollView keyboardShouldPersistTaps={true}>
                            <View style={{ flex: 1, width: wp('85%'), justifyContent: 'center', alignContent: 'center', backgroundColor: '#fff', borderRadius: 4, flexDirection: 'column', paddingHorizontal: wp('1%') }} >
                                <TouchableOpacity style={[style.mb(0.1), { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-end', marginRight: wp('3%') }]}
                                    onPress={() => { this.refs.modal4.close() }}>
                                    <View style={{ marginLeft: wp('6%') }}></View>
                                    <Text style={[style.boldFont, style.fontSize(3), { justifyContent: 'center', alignSelf: 'center', color: '#3B5793', marginLeft: wp('2%') }]}>Add Miles</Text>
                                    <Image style={[{ height: hp('5%'), width: wp('5%'), resizeMode: 'contain', alignSelf: 'flex-end' }]}
                                        source={require('../../assets/images/error.png')} />
                                </TouchableOpacity>
                                <View style={[style.mb(0.1), { margin: wp('4%'), marginTop: wp('0.1%'), }]}>
                                    <Text style={[styles.boldFont, commonStyles.fs(1.9), { color: '#3B5793', fontFamily: 'Catamaran-Bold', marginLeft: wp('1%') }]}>Add Cost</Text>
                                    <TextInput
                                        style={[styles.boldFont, commonStyles.fs(2.3), { color: '#828ea5', fontFamily: 'Catamaran-Medium',borderBottomColor:'#000', borderBottomWidth:Platform.OS === "ios" ? 1:null  }]}
                                        underlineColorAndroid={'#828ea5'}
                                        onFocus={this.handleFocustitle}
                                        onBlur={this.handleBlurtitle}
                                        multiline
                                        numberOfLines={1}
                                        keyboardType={'number-pad'}
                                        placeholder={'Enter Cost'}
                                        placeholderTextColor="#828ea5"
                                        onChangeText={ValueHolder => this.GetTaskCost(ValueHolder)}
                                        value={this.state.cost} />
                                </View>
                                <View style={[style.mb(1), { margin: wp('4%'), marginTop: wp('1%') }]}>
                                    <Text style={[styles.boldFont, commonStyles.fs(1.9), { color: '#3B5793', fontFamily: 'Catamaran-Bold', marginLeft: wp('1%') }]}>Add Description</Text>
                                    <TextInput
                                        style={[styles.boldFont, commonStyles.fs(2.3), { color: '#828ea5', fontFamily: 'Catamaran-Medium',borderBottomColor:'#000', borderBottomWidth:Platform.OS === "ios" ? 1:null  }]}
                                        underlineColorAndroid={'#828ea5'}
                                        onFocus={this.handleFocusdetails}
                                        onBlur={this.handleBlurdetails}
                                        multiline
                                        numberOfLines={1}
                                        placeholder={'Enter Description'}
                                        placeholderTextColor="#828ea5"
                                        onChangeText={ValueHolder => this.GetTaskDescription(ValueHolder)}
                                        value={this.state.details} />
                                </View>
                                <View style={{ justifyContent: 'center', alignSelf: 'center', flexDirection: 'row', margin: wp('4%') }}>
                                    <LinearGradient
                                        colors={[styleConstants.gradientStartColor, styleConstants.gradientEndColor]}
                                        // style={styles.linearGradient}
                                        start={{ x: 0.0, y: 0.25 }} end={{ x: 1.2, y: 1.0 }}
                                        style={[style.rh(7), style.center, , style.br(0.3), {
                                            width: this.state.reimloading ? wp('35%') : wp('25%'),
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
                                        <TouchableOpacity style={{ justifyContent: 'flex-start', alignSelf: 'center', padding: wp('6%'), borderRadius: 8 }}
                                            onPress={() => { this.addreimbursement(miles) }}>
                                            {
                                                this.state.reimloading === true ? (
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
                                            {/* <Text style={[commonStyles.boldFont, { color: '#ffffff', justifyContent: 'center', alignSelf: 'center', marginHorizontal: wp('2%') }]}>Save</Text> */}
                                        </TouchableOpacity>
                                    </LinearGradient>
                                </View>
                            </View>
                        </ScrollView>
                    </Modal>
                    <Modal style={[styles.modal, styles.modal1]} position={"center"} ref={"modal3"} swipeArea={20}
                        backdropPressToClose={true}  >
                        <ScrollView keyboardShouldPersistTaps={true}>
                            <View style={{ flex: 1, width: wp('85%'), justifyContent: 'center', alignContent: 'center', backgroundColor: '#fff', borderRadius: 4, flexDirection: 'column', paddingHorizontal: wp('1%'), paddingVertical: wp('1%') }} >
                                <TouchableOpacity style={[style.mb(0.1), { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-end', marginRight: wp('3%') }]}
                                    onPress={() => { this.refs.modal3.close() }}>
                                    <View style={{ marginLeft: wp('6%') }}></View>
                                    <Text style={[style.boldFont, style.fontSize(3), { justifyContent: 'center', alignSelf: 'center', color: '#3B5793', marginLeft: wp('2%') }]}>Note</Text>
                                    <Image style={[{ height: hp('5%'), width: wp('5%'), resizeMode: 'contain', alignSelf: 'flex-end' }]}
                                        source={require('../../assets/images/error.png')} />
                                </TouchableOpacity>
                                <View style={[style.mb(0.1), { margin: wp('4%'), marginTop: wp('0.1%'), }]}>
                                    <Text style={[styles.boldFont, commonStyles.fs(1.9), { color: '#3B5793', fontFamily: 'Catamaran-Medium', marginLeft: wp('1%') }]}>You are clocking in late. Please give an explanation in order to Clock in. GPS is showing that you are not at your designated shift location</Text>
                                    <TextInput
                                        style={[styles.boldFont, commonStyles.fs(2.3), { color: '#828ea5', fontFamily: 'Catamaran-Medium',borderBottomColor:'#000', borderBottomWidth:Platform.OS === "ios" ? 1:null  }]}
                                        underlineColorAndroid={'#828ea5'}
                                        onFocus={this.handleFocustitle}
                                        autoFocus={true}
                                        onBlur={this.handleBlurtitle}
                                        multiline
                                        numberOfLines={1}
                                        placeholder={'Enter note'}
                                        placeholderTextColor="#828ea5"
                                        onChangeText={ValueHolder => this.GetLateNote(ValueHolder)}
                                        value={this.state.latenote} />
                                </View>
                                <View style={{ justifyContent: 'center', alignSelf: 'center', flexDirection: 'row', margin: wp('4%') }}>
                                    <LinearGradient
                                        colors={[styleConstants.gradientStartColor, styleConstants.gradientEndColor]}
                                        // style={styles.linearGradient}
                                        start={{ x: 0.0, y: 0.25 }} end={{ x: 1.2, y: 1.0 }}
                                        style={[style.rh(7), style.center, , style.br(0.3), {
                                            width: this.state.noteloading ? wp('35%') : wp('25%'),
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
                                        <TouchableOpacity style={{ justifyContent: 'flex-start', alignSelf: 'center', padding: wp('6%'), borderRadius: 8 }}
                                            onPress={() => { this.renderarrive_late() }}
                                        >
                                            {
                                                this.state.noteloading === true ? (
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
                                            {/* <Text style={[commonStyles.boldFont, { color: '#ffffff', justifyContent: 'center', alignSelf: 'center', marginHorizontal: wp('2%') }]}>Save</Text> */}
                                        </TouchableOpacity>
                                    </LinearGradient>
                                </View>
                            </View>
                        </ScrollView>
                    </Modal>
                    <Modal style={[styles.modal, styles.modal2]} position={"center"} ref={"modal2"} swipeArea={20}
                        backdropPressToClose={true}  >
                        <ScrollView keyboardShouldPersistTaps={true}>
                            <View style={{ flex: 1, width: wp('85%'), justifyContent: 'center', alignContent: 'center', backgroundColor: '#fff', borderRadius: 4, flexDirection: 'column', paddingHorizontal: wp('1%'), paddingVertical: wp('1%') }} >
                                <TouchableOpacity style={[style.mb(0.1), { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-end', marginRight: wp('3%') }]}
                                    onPress={() => { this.refs.modal2.close() }}>
                                    <View style={{ marginLeft: wp('6%') }}></View>
                                    <Text style={[style.boldFont, style.fontSize(3), { justifyContent: 'center', alignSelf: 'center', color: '#3B5793', marginLeft: wp('2%') }]}>Note</Text>
                                    <Image style={[{ height: hp('5%'), width: wp('5%'), resizeMode: 'contain', alignSelf: 'flex-end' }]}
                                        source={require('../../assets/images/error.png')} />
                                </TouchableOpacity>
                                <View style={[style.mb(0.1), { margin: wp('4%'), marginTop: wp('0.1%'), }]}>
                                    <Text style={[styles.boldFont, commonStyles.fs(1.9), { color: '#3B5793', fontFamily: 'Catamaran-Medium', marginLeft: wp('1%') }]}>GPS is showing that you are not at your designated shift location</Text>
                                    <TextInput
                                        style={[styles.boldFont, commonStyles.fs(2.3), { color: '#828ea5', fontFamily: 'Catamaran-Medium',borderBottomColor:'#000', borderBottomWidth:Platform.OS === "ios" ? 1:null  }]}
                                        underlineColorAndroid={'#828ea5'}
                                        onFocus={this.handleFocustitle}
                                        autoFocus={true}
                                        onBlur={this.handleBlurtitle}
                                        multiline
                                        numberOfLines={1}
                                        placeholder={'Enter note'}
                                        placeholderTextColor="#828ea5"
                                        onChangeText={ValueHolder => this.GetGPSNote(ValueHolder)}
                                        value={this.state.gps_note} />
                                </View>
                                <View style={{ justifyContent: 'center', alignSelf: 'center', flexDirection: 'row', margin: wp('4%') }}>
                                    <LinearGradient
                                        colors={[styleConstants.gradientStartColor, styleConstants.gradientEndColor]}
                                        // style={styles.linearGradient}
                                        start={{ x: 0.0, y: 0.25 }} end={{ x: 1.2, y: 1.0 }}
                                        style={[style.rh(7), style.center, , style.br(0.3), {
                                            width: this.state.reimloading ? wp('35%') : wp('25%'),
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
                                        <TouchableOpacity style={{ justifyContent: 'flex-start', alignSelf: 'center', padding: wp('6%'), borderRadius: 8 }}
                                            onPress={() => { this.renderarrive_gps() }}
                                        >
                                            {
                                                this.state.noteloading === true ? (
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
                                            {/* <Text style={[commonStyles.boldFont, { color: '#ffffff', justifyContent: 'center', alignSelf: 'center', marginHorizontal: wp('2%') }]}>Save</Text> */}
                                        </TouchableOpacity>
                                    </LinearGradient>
                                </View>
                            </View>
                        </ScrollView>
                    </Modal>
                    <Modal style={[styles.modal, styles.modal2]} position={"center"} ref={"modalearly"} swipeArea={20}
                        backdropPressToClose={true}  >
                        <ScrollView keyboardShouldPersistTaps={true}>
                            <View style={{ flex: 1, width: wp('85%'), justifyContent: 'center', alignContent: 'center', backgroundColor: '#fff', borderRadius: 4, flexDirection: 'column', paddingHorizontal: wp('1%'), paddingVertical: wp('1%') }} >
                                <TouchableOpacity style={[style.mb(0.1), { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-end', marginRight: wp('3%') }]}
                                    onPress={() => { this.refs.modalearly.close() }}>
                                    <View style={{ marginLeft: wp('6%') }}></View>
                                    <Text style={[style.boldFont, style.fontSize(3), { justifyContent: 'center', alignSelf: 'center', color: '#3B5793', marginLeft: wp('2%') }]}>Note</Text>
                                    <Image style={[{ height: hp('5%'), width: wp('5%'), resizeMode: 'contain', alignSelf: 'flex-end' }]}
                                        source={require('../../assets/images/error.png')} />
                                </TouchableOpacity>
                                <View style={[style.mb(0.1), { margin: wp('4%'), marginTop: wp('0.1%'), }]}>
                                    <Text style={[styles.boldFont, commonStyles.fs(1.9), { color: '#3B5793', fontFamily: 'Catamaran-Medium', marginLeft: wp('1%') }]}>You are clocking in early. Please give an explanation in order to Clock In.. GPS is showing that you are not at your designated shift location</Text>
                                    <TextInput
                                        style={[styles.boldFont, commonStyles.fs(2.3), { color: '#828ea5', fontFamily: 'Catamaran-Medium',borderBottomColor:'#000', borderBottomWidth:Platform.OS === "ios" ? 1:null  }]}
                                        underlineColorAndroid={'#828ea5'}
                                        onFocus={this.handleFocustitle}
                                        autoFocus={true}
                                        onBlur={this.handleBlurtitle}
                                        multiline
                                        numberOfLines={1}
                                        placeholder={'Enter note'}
                                        placeholderTextColor="#828ea5"
                                        onChangeText={ValueHolder => this.GetEarlyNote(ValueHolder)}
                                        value={this.state.early_note} />
                                </View>
                                <View style={{ justifyContent: 'center', alignSelf: 'center', flexDirection: 'row', margin: wp('4%') }}>
                                    <LinearGradient
                                        colors={[styleConstants.gradientStartColor, styleConstants.gradientEndColor]}
                                        // style={styles.linearGradient}
                                        start={{ x: 0.0, y: 0.25 }} end={{ x: 1.2, y: 1.0 }}
                                        style={[style.rh(7), style.center, , style.br(0.3), {
                                            width: this.state.reimloading ? wp('35%') : wp('25%'),
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
                                        <TouchableOpacity style={{ justifyContent: 'flex-start', alignSelf: 'center', padding: wp('6%'), borderRadius: 8 }}
                                            onPress={() => { this.renderarrive_early() }}
                                        >
                                            {
                                                this.state.noteloading === true ? (
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
                                            {/* <Text style={[commonStyles.boldFont, { color: '#ffffff', justifyContent: 'center', alignSelf: 'center', marginHorizontal: wp('2%') }]}>Save</Text> */}
                                        </TouchableOpacity>
                                    </LinearGradient>
                                </View>
                            </View>
                        </ScrollView>
                    </Modal>
                    <Modal style={[styles.modal, styles.modal2]} position={"center"} ref={"modaltaskleave"} swipeArea={20}
                        backdropPressToClose={true}  >
                        <ScrollView keyboardShouldPersistTaps={true}>
                            <View style={{ flex: 1, width: wp('85%'), justifyContent: 'center', alignContent: 'center', backgroundColor: '#fff', borderRadius: 4, flexDirection: 'column', paddingHorizontal: wp('1%'), paddingVertical: wp('1%') }} >
                                <TouchableOpacity style={[style.mb(0.1), { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-end', marginRight: wp('3%') }]}
                                    onPress={() => { this.refs.modaltaskleave.close() }}>
                                    <View style={{ marginLeft: wp('6%') }}></View>
                                    <Text style={[style.boldFont, style.fontSize(3), { justifyContent: 'center', alignSelf: 'center', color: '#3B5793', marginLeft: wp('2%') }]}>Note</Text>
                                    <Image style={[{ height: hp('5%'), width: wp('5%'), resizeMode: 'contain', alignSelf: 'flex-end' }]}
                                        source={require('../../assets/images/error.png')} />
                                </TouchableOpacity>
                                <View style={[style.mb(0.1), { margin: wp('4%'), marginTop: wp('0.1%'), }]}>
                                    <Text style={[styles.boldFont, commonStyles.fs(1.9), { color: '#3B5793', fontFamily: 'Catamaran-Medium', marginLeft: wp('1%') }]}>Not all tasks checked off. Please cancel to return to shift or add a note to explain unchecked task...</Text>
                                    <TextInput
                                        style={[styles.boldFont, commonStyles.fs(2.3), { color: '#828ea5', fontFamily: 'Catamaran-Medium',borderBottomColor:'#000', borderBottomWidth:Platform.OS === "ios" ? 1:null  }]}
                                        underlineColorAndroid={'#828ea5'}
                                        onFocus={this.handleFocustitle}
                                        autoFocus={true}
                                        onBlur={this.handleBlurtitle}
                                        multiline
                                        numberOfLines={1}
                                        placeholder={'Enter note'}
                                        placeholderTextColor="#828ea5"
                                        onChangeText={ValueHolder => this.GetTaskLeave(ValueHolder)}
                                        value={this.state.task_leave} />
                                </View>
                                <View style={{ justifyContent: 'center', alignSelf: 'center', flexDirection: 'row', margin: wp('4%') }}>
                                    <LinearGradient
                                        colors={[styleConstants.gradientStartColor, styleConstants.gradientEndColor]}
                                        // style={styles.linearGradient}
                                        start={{ x: 0.0, y: 0.25 }} end={{ x: 1.2, y: 1.0 }}
                                        style={[style.rh(7), style.center, , style.br(0.3), {
                                            width: this.state.reimloading ? wp('35%') : wp('25%'),
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
                                        <TouchableOpacity style={{ justifyContent: 'flex-start', alignSelf: 'center', padding: wp('6%'), borderRadius: 8 }}
                                            onPress={() => { this.rendertask_leave(mainData) }}
                                        >
                                            {
                                                this.state.noteloading === true ? (
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
                    {this.renderModalContent()}

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
        maxHeight: 300,
        minHeight: 80
    },
    modal1: {
        maxHeight: 315,
        minHeight: 80
    },
    modal2: {
        maxHeight: 290,
        minHeight: 80
    },
    overlay: {
        height: Platform.OS === "ios" ? Dimensions.get("window").height : require("react-native-extra-dimensions-android").get("REAL_WINDOW_HEIGHT"),
        ...StyleSheet.absoluteFillObject,
        // marginBottom:wp('-2%'),
        zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center', alignSelf: 'center'
    }
});
const mapStateToProps = state => ({
    data: state.user.data
});

export default connect(
    mapStateToProps,
    null
)(withNavigation(ShowShiftDetails));