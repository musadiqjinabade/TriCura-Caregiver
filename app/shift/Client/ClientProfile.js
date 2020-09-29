import React from "react";
import { Dimensions, StyleSheet, View, ScrollView, Text, SafeAreaView, Image, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Platform, Linking, Alert } from 'react-native';
import commonStyles from '../../styles/Common';

import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { withNavigation,  StackActions, NavigationActions } from 'react-navigation';
import Tab from '../../core/components/Tab';
import { connect } from "react-redux";
import AboutScreen from '../../profile/ProfileTabs/AboutScreen';
import CareMatchingScreen from '../../profile/ProfileTabs/CareMatchingScreen';
import InterestMatchingScreen from '../../profile/ProfileTabs/InterestMatchingScreen';
import StyleConstants from "../../styles/StyleConstants";
import Globals from '../../Globals';
import AsyncStorage from '@react-native-community/async-storage';
import LoadingIndicator from '../../core/components/LoadingIndicator';
import Modal from 'react-native-modalbox';
import APIService from '../../core/components/APIServices'
import { CheckBox, } from 'native-base';
import { Toast } from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../../core/components/Header';
import NetInfo from "@react-native-community/netinfo";
import Geocoder from 'react-native-geocoding';



const selected_data = {}

class ClientProfile extends React.Component {

    state = {
        loading: true,
        topbarOption: 0,
        selected: true,
        expanded: true,
        data: '',
        checked: false,
        check_data: {},
        about: '',
        clientdata:'',
        previous_caregivers:'',
        previous_caregiver_name:''

    }

    async componentDidMount() {
        if (await this.checkInternet()) {
            var data = {}
            data.agency_logo = await AsyncStorage.getItem('agency_logo');
            data.agency_name = await AsyncStorage.getItem('agency_name');

            this.setState({ agency_details: data })
            this.setState({ loading: true,clientdata:this.props.navigation.state.params.item,previous_caregivers:this.props.navigation.state.params.previous_caregivers , previous_caregiver_name:this.props.navigation.state.params.previous_caregiver_name}, () => {
                this.getProfile();
                console.log("previous_caregivers:",this.state.previous_caregivers,this.state.previous_caregiver_name)
            })
            this.props.navigation.addListener('didFocus', () => {
                // console.log("didFocus is working")
                this.setState({ loading: true }, () => {
                    this.getProfile();

                })
            });
        }
        else {
            this.showMessage("No Internet Connectivity!")
            this.setState({ loading: false })

        }

    }


    componentWillMount() {
        this.setState({ loading: true }, () => {
            this.getProfile();
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

    savecontact(address, phone, city, state, zip_code) {
        this.setState({ saveloading: true })
        var onylAlpha = '0123456789`~!@#$%^&*()-_=+{}[]|\/><,.:;?';
        var numbers = '`~!@#$%^&*()-_=+{}[]|\/><,.:;?';
        var cityInvalid = '';
        var stateInvalid = '';
        var zipInvalid = '';
        for (var i = 0; i < this.state.city.length; i++) {
            if (onylAlpha.indexOf(this.state.city[i]) > -1) {
                cityInvalid = 'Invalid city';
                this.setState({ saveloading: false })

            }
        }

        for (var i = 0; i < this.state.state.length; i++) {
            if (onylAlpha.indexOf(this.state.state[i]) > -1) {
                stateInvalid = 'Invalid state';
                this.setState({ saveloading: false })

            }
        }

        for (var i = 0; i < this.state.zip_code.length; i++) {
            if (numbers.indexOf(this.state.zip_code[i]) > -1) {
                zipInvalid = 'Invalid zipcode';
                this.setState({ saveloading: false })

            }
        }

        if (this.state.address === '') {
            this.showMessage('Please enter address')
            this.setState({ saveloading: false })
        }
        else if (this.state.city === '') {
            this.showMessage('Please enter city')
            this.setState({ saveloading: false })
        }
        else if (this.state.state === '') {
            this.showMessage('Please enter state')
            this.setState({ saveloading: false })
        }
        else if (cityInvalid === 'Invalid city') {
            this.showMessage(cityInvalid)
            this.setState({ saveloading: false })
        }
        else if (stateInvalid === 'Invalid state') {
            this.showMessage(stateInvalid)
            this.setState({ saveloading: false })

        }
        else if (zipInvalid === 'Invalid zipcode') {
            this.showMessage(zipInvalid)
            this.setState({ saveloading: false })

        }
        else if (this.state.phone.length !== 10) {
            this.showMessage('Please enter 10 digit phone number')
            this.setState({ saveloading: false })

        }
        else {
            this.UpdateProfile(this.state.address, this.state.phone, this.state.city, this.state.state, this.state.zip_code)
        }
    }

    async getProfile() {
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = Globals.httpMode + agency_code  + Globals.domain + '/api/v1/users/' + Object.keys(this.state.clientdata)[0];
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
                        data: response.data, loading: false
                    })
                }
                else {
                    this.showMessage("Invalid Credentials");
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
            this.showMessage(error);
        }
    }

    showMessage(message) {
        Toast.show({
            text: message,
            duration: 2000
        })
    }

    GetAddress(value) {
        this.setState({ address: value })
    }

    GetCity(value) {
        var data = /^([^0-9]*)$/
        // if(new RegExp(data){
        // }
        if (data.test(value)) {
            this.setState({ city: value })

        }
    }

    GetState(value) {
        var data = /^([^0-9]*)$/
        // if(new RegExp(data){
        // }
        if (data.test(value)) {
            this.setState({ state: value })

        }
    }

    GetZip_code(value) {
        this.setState({ zip_code: value })

    }

    GetPhone(value) {
        if (value.length <= 10) {
            this.setState({ phone: value })

        }
    }

    GetAbout(ValueHolder){
        this.setState({about:ValueHolder})
    }

    async saveAbout(about){

        this.setState({ loading: true });
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = Globals.httpMode + agency_code  + Globals.domain + '/api/v1/users/' + Object.keys(this.props.data.user)[0];

        try {
            var qs = require('qs');
            //var response = await this.props.data.formRequest.get(url);
            var access_token = this.props.data.access_token;
            console.log("token : ", access_token);
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'App-Token': '96ef950f-bfae-4ee5-89a0-f23ab9e50b96',
                'Authentication-Token': access_token
            }
            try {
                var response = await axios.put(url, qs.stringify({
                    'user[about]': about
                }), {
                    headers: headers
                })
                if (response.status === 200) {
                    console.log("data : ", response.data)
                    this.setState({
                        saveloading: false
                    })
                    this.showMessage("About Details Updated Successfully");
                    this.componentWillMount()
                }
                else {
                    this.showMessage("Invalid Credentials");
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

    renderBody() {
        if (this.state.topbarOption === 0) {
            return (
                <View>
                    <AboutScreen data={this.state.data} 
                    onAssignToMe={(value) => {
                        this.setState({about:value},()=>{
                            this.refs.modal2.open()
                        })
                    }}/>
                </View>
            )
        }
        else if (this.state.topbarOption === 1) {
            return (
                <View>
                    <CareMatchingScreen data={this.state.data} />
                </View>
            )
        }
        else if (this.state.topbarOption === 2) {
            return (
                <View>
                    <InterestMatchingScreen data={this.state.data}
                        onAssignToMe={() => {
                            this.componentDidMount()
                            this.componentWillMount()
                        }}
                    />

                </View>
            )
        }
    }
    rendercheck(data) {
        console.log('data:', data, "selected:", this.selected_data)
        var value = false
        // if(data.)
        var i = 0;
        while (i < this.selected_data.length) {
            if (Object.keys(this.selected_data[i]) == data.id) {
                console.log('data true:', data)
                value = true
                break;

            }

            i++;
        }

        return value


    }

    changecheck(item) {
        var i = 0;
        while (i < Object.keys(this.state.check_data).length) {
            console.log('loop:', Object.keys(this.state.check_data)[i], 'item:', item)
            if (Object.keys(this.state.check_data)[i] == item.id) {
                console.log('delete:', Object.keys(this.state.check_data)[i], ";")
                delete Object.keys(this.state.check_data)[i]
                console.log('data after delete:', this.state.check_data)
                break;

            } else {
                this.setState({
                    check_data: { ...this.state.check_data, [item.id]: [item.title] }
                }, async () => {
                    console.log(this.state.check_data)
                })

            }

            i++;
        }
        this.setState({
            check_data: { ...this.state.check_data, [item.id]: [item.title] }
        }, async () => {
            console.log(this.state.check_data)
        })
    }

    edit_contact(item) {
        console.log('edit:', item)
        this.setState({ address: item.address, phone: item.phone, city: item.city, zip_code: item.zip_code, state: item.state }, () => {
            this.refs.modal1.open()
        })
    }

    async UpdateProfile(address, phone, city, state, zip_code) {
        this.setState({ loading: true });
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = Globals.httpMode + agency_code  + Globals.domain + '/api/v1/users/' + Object.keys(this.props.data.user)[0];

        try {
            var qs = require('qs');
            //var response = await this.props.data.formRequest.get(url);
            var access_token = this.props.data.access_token;
            console.log("token : ", access_token);
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'App-Token': '96ef950f-bfae-4ee5-89a0-f23ab9e50b96',
                'Authentication-Token': access_token
            }
            try {
                var response = await axios.put(url, qs.stringify({
                    'user[address]': address,
                    'user[city]': city,
                    'user[state]': state,
                    'user[zip_code]': zip_code,
                    'user[primary_phone_number_attributes][number]': phone,
                    'user[primary_phone_number_attributes][phone_type]': "cell"
                }), {
                    headers: headers
                })
                if (response.status === 200) {
                    console.log("data : ", response.data)
                    this.setState({
                        saveloading: false
                    })
                    this.showMessage("Contact Details Updated Successfully");
                    this.componentWillMount()
                }
                else {
                    this.showMessage("Invalid Credentials");
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

    _onRefresh = () => {
        this.setState({ loading: true }, () => {
            this.componentWillMount();
        });
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

    

    openMaps(address,city,state,zip_code) {
        Geocoder.init("AIzaSyCSROs4ZXZIPGIGo9SMdrD9gmfLzsLYMt4", { language: "en" }); // set the language
        var location;
        Geocoder.from(address)
            .then(json => {
                location = json.results[0].geometry.location;
                console.log("location1 : ", location);
                const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
                const latLng = `${location.lat},${location.lng}`;
                const label = 'Address';
                const url = Platform.select({
                    ios: `${scheme}${address}${city}${state}${zip_code}`,
                    android: `${scheme}${address}${city}${state}${zip_code}`
                });
                Linking.openURL(url);
            })
            .catch(error => console.warn(error));


    }

    async logout(data){

        Alert.alert(
            'Log out',
            'You will be returned to the login screen.',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                { text: 'Log out', onPress: async() => { 
                    
                    console.log("data:",data)

        // await AsyncStorage.removeItem('agency_code', null);
        // await AsyncStorage.removeItem('USER_DATA', null);
        var agency_code = await AsyncStorage.getItem('agency_code');
        var fcm_token = await AsyncStorage.getItem('fcm_token');
        console.log("fcm_token:",fcm_token)


        this.setState({ signloading: true, loading: true });
        var url = Globals.httpMode + agency_code  + Globals.domain + '/api/v1/sessions/'+Object.keys(data.user)[0] ;
        var requestBody = qs.stringify({
            'device_token': fcm_token
        });
        console.log('url',url,"requestBody",requestBody)

        try {
            var response = await this.props.data.formRequest.delete(url, requestBody);
            console.log('response',response)
                this.setState({
                    signloading: false,loading: true
                }, async () => {
                    if(response.status){
                        await AsyncStorage.removeItem('agency_code', null);
                        await AsyncStorage.removeItem('USER_DATA', null);
                        await AsyncStorage.removeItem('agency_email', null);

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
                signloading: false,loading: true
            })
            this.showToast(error);
        }

                 } },
            ],
            { cancelable: false },
        );
        
    }


    render() {
        const { navigate } = this.props.navigation;
        var userData = null;
        if (this.state.loading || !this.state.data) {
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={'Profile'} expanded={this.state.expanded} onBack={() => {
                        this.props.navigation.goBack()
                    }} />
                    <LoadingIndicator />
                </SafeAreaView>)
        }
        else {
            userData = this.state.data.user[Object.keys(this.state.data.user)[0]];
            this.selected_data = userData.matching_interests
            console.log("userData:", userData)
            var care_matching = Object.keys(userData.care_matching).map(key => ({ [key]: userData.care_matching[key] }));
            
            console.log("care_matching:", userData.matching_interests)
            var name = userData.name
            var words = name.split(' ');

            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={'Profile'} expanded={this.state.expanded} Agency_logo={this.state.agency_details} onBack={() => {
                        this.props.navigation.goBack()
                    }} />
                    <ScrollView showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.loading}
                                onRefresh={this._onRefresh}
                                colors={["#4254C5"]}
                            />} >
                        <View style={[commonStyles.margin, commonStyles.column, commonStyles.full]}>

                            

                            <View style={[commonStyles.center]}>
                                {
                                    userData.avatar_url ? <View>
                                        <Image style={[styles.clientImage]}
                                            resizeMode={"cover"}
                                            resizeMethod={"resize"} // <-------  this helped a lot as OP said
                                            // progressiveRenderingEnabled={true}
                                            source={{ uri: userData.avatar_url }} />
                                    </View> : (
                                            <View style={[styles.clientImage, commonStyles.center, commonStyles.mt(2), { backgroundColor: '#fff' }]}>
                                                <Text style={[commonStyles.boldFont, commonStyles.fs(10), { color: StyleConstants.gradientStartColor }]}>{userData.name.charAt(0).toUpperCase()}</Text>
                                            </View>
                                        )
                                }
                                <Text style={[commonStyles.headerTextBoldFont]}>{words[0].charAt(0).toUpperCase() + words[0].slice(1)+' '+ words[1].slice(0,1).toUpperCase() || '---'}</Text>
                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', }}>Client</Text>
                            </View>
                            <View style={[{ flexDirection: 'row', marginTop: wp('4%') , justifyContent:'space-between'}]}>
                                <View>
                                <LinearGradient
                                    colors={[StyleConstants.gradientStartColor, StyleConstants.gradientEndColor]}
                                    // style={styles.linearGradient}
                                    start={{ x: 0.0, y: 0.25 }} end={{ x: 1.2, y: 1.0 }}
                                    style={[commonStyles.rh(7), commonStyles.center, , commonStyles.br(0.3), {
                                        width: wp('43%'),
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
                                    <TouchableOpacity style={{ justifyContent: 'flex-start', alignSelf: 'center', padding: hp('1%'), borderRadius: 8 }}
                                        onPress={() => { navigate('Assessment', { item: this.state.clientdata }) }}
                                    >
                                        <Text style={[commonStyles.boldFont, { color: '#ffffff', justifyContent: 'center', alignSelf: 'center', marginHorizontal: wp('2%') }]}>Assessment</Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                                </View>
                                <View>
                                <LinearGradient
                                        colors={[StyleConstants.gradientStartColor, StyleConstants.gradientEndColor]}
                                        // style={styles.linearGradient}
                                        start={{ x: 0.0, y: 0.25 }} end={{ x: 1.2, y: 1.0 }}
                                        style={[commonStyles.rh(7), commonStyles.center, , commonStyles.br(0.3), {
                                            width: wp('43%'),
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
                                            <TouchableOpacity style={{ justifyContent: 'flex-start', alignSelf: 'center', padding: hp('1%'), borderRadius: 8 }}
                                            onPress={() => { this.state.previous_caregivers!=null?navigate('CaregiverNotes', { item: this.state.previous_caregivers,item1:this.state.previous_caregiver_name }):this.showMessage("No previous caregiver avaliable");  }}
                                            >
                                    <Text style={[commonStyles.boldFont, { color: '#ffffff', justifyContent: 'center', alignSelf: 'center', marginHorizontal: wp('2%') }]}>Notes</Text>
                                            </TouchableOpacity>
                                    </LinearGradient>
                                </View>
                            </View>

                            <View style={[{ flexDirection: 'row', marginTop: wp('4%') }]} >
                                <View style={{ paddingRight: wp('3%'), flex: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
                                    <Text style={[styles.itemHeader]}>Contact Details</Text>
                                </View>
                            </View>

                            <View style={[commonStyles.row, { marginTop: wp('1%') }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start', alignSelf: 'center' }}>
                                    <Image style={styles.otherImages}
                                        source={require('../../../assets/images/location.png')} />
                                </View>
                                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginLeft: wp('3%') }}
                                    onPress={() => {
                                        this.openMaps(userData.full_address,userData.city,userData.state, userData.zip_code);
                                    }}
>
                                    <Text style={{ fontFamily: 'Catamaran-Regular', color: '#41A2EB', textDecorationLine: 'underline', fontSize: hp('2%') }}>{userData.address ? userData.address + ' ,' : '--'}{userData.city ? userData.city + ' ,' : '--'}{userData.state ? userData.state + ' ,' : '--'}{userData.zip_code ? userData.zip_code + '.' : '--'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={[commonStyles.row]}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                                    <Image style={styles.otherImages}
                                        source={require('../../../assets/images/email.png')} />
                                </View>

                                <TouchableOpacity onPress={() => Linking.openURL('mailto:' + this.props.data.user[Object.keys(this.props.data.user)[0]].email)} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: wp('3%') }}>
                                    <Text style={{ fontFamily: 'Catamaran-Regular', color: '#41A2EB', textDecorationLine: 'underline', fontSize: hp('2%') }}>{userData.email}</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={[commonStyles.row]}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                                    <Image style={styles.otherImages}
                                        source={require('../../../assets/images/phone.png')} />
                                </View>
                                {/* <TouchableOpacity onPress={() => Linking.openURL(`tel:${this.state.data.phone}`)}> */}
                                <TouchableOpacity onPress={() => Linking.openURL(`tel:${userData.phone}`)} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: wp('3%') }}>
                                    <Text style={{ fontFamily: 'Catamaran-Regular', color: _.get(userData, 'primary_phone_number.number') ? '#41A2EB' : '#828EA5', textDecorationLine: userData.phone ? 'underline' : null, fontSize: hp('2%') }}>{_.get(userData, 'primary_phone_number.number') ? _.get(userData, 'primary_phone_number.number') : "---"}</Text>
                                </TouchableOpacity>
                            </View>


                            
                            <View style={styles.line} />

                            <Text style={[styles.itemHeader]}>{"Care Matching (" + care_matching.length + " Items)"}</Text>
                            {/* Green check with text */}
                            <View style={[commonStyles.coloumn, commonStyles.full]}>
                                {
                                    care_matching.length > 0?
                                        care_matching.map((key) => (
                                            <View style={[commonStyles.row, { alignItems: 'center' }]}>
                                                <Image style={styles.greenCheckImage}
                                                    source={require('../../../assets/images/dot.png')} />
                                                <Text style={{ fontFamily: 'Catamaran-Regular', color: '#828EA5', fontSize: hp('1.8%'), marginLeft: wp('2%') }}>{key[Object.keys(key)[0]].title}</Text>
                                            </View>
                                        )) : <Text style={{ fontFamily: 'Catamaran-Regular', color: '#828EA5', fontSize: hp('1.8%'), marginLeft: wp('2%') }}>None</Text>
                                }
                            </View>

                            <View style={styles.line} />

                            <Text style={[styles.itemHeader]}>Interest Matching{' (' + userData.matching_interests.length + ' items)'}</Text>
                            <View style={[commonStyles.coloumn, commonStyles.full]}>
                                {
                                    userData.matching_interests.length > 0?
                                    userData.matching_interests.map((key) => (
                                            <View style={[commonStyles.row, { alignItems: 'center' }]}>
                                                <Image style={styles.greenCheckImage}
                                                    source={require('../../../assets/images/dot.png')} />
                                                <Text style={{ fontFamily: 'Catamaran-Regular', color: '#828EA5', fontSize: hp('1.8%'), marginLeft: wp('2%') }}>{key.title}</Text>
                                            </View>
                                        )) : <Text style={{ fontFamily: 'Catamaran-Regular', color: '#828EA5', fontSize: hp('1.8%'), marginLeft: wp('2%') }}>None</Text>
                                }
                            </View>
                        </View>
                        
                    </ScrollView>
                    <Modal style={[styles.modal, styles.modal2]} position={"center"} ref={"modal1"} swipeArea={20}
                        backdropPressToClose={true}  >
                        <ScrollView keyboardShouldPersistTaps={true} style={{ flex: 1 }}>
                            <View style={{ flex: 1, width: wp('85%'), justifyContent: 'center', alignContent: 'center', backgroundColor: '#fff', borderRadius: 4, flexDirection: 'column', paddingHorizontal: wp('1%'), paddingVertical: wp('1%') }} >
                                <TouchableOpacity style={[commonStyles.mb(0.1), { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-end', marginRight: wp('3%') }]}
                                    onPress={() => { this.refs.modal1.close() }}>
                                    <View style={{ marginLeft: wp('6%') }}></View>
                                    <Text style={[commonStyles.boldFont, commonStyles.fontSize(3), { justifyContent: 'center', alignSelf: 'center', color: '#3B5793', marginLeft: wp('2%') }]}>Edit Contact Details</Text>
                                    <Image style={[{ height: hp('5%'), width: wp('5%'), resizeMode: 'contain', alignSelf: 'flex-end' }]}
                                        source={require('../../../assets/images/error.png')} />
                                </TouchableOpacity>
                                <View style={[commonStyles.mb(0.1), { margin: wp('4%'), marginTop: wp('3.1%'), }]}>
                                    <Text style={[commonStyles.boldFont, commonStyles.fs(1.9), { color: '#3B5793', fontFamily: 'Catamaran-Medium', marginLeft: wp('1%') }]}>Address</Text>
                                    <TextInput
                                        style={[commonStyles.boldFont, commonStyles.fs(2.3), { color: '#828ea5', fontFamily: 'Catamaran-Medium',borderBottomColor:'#000', borderBottomWidth:Platform.OS === "ios" ? 1:null  }]}
                                        underlineColorAndroid={'#828ea5'}
                                        onFocus={this.handleFocustitle}
                                        // autoFocus={true}
                                        onBlur={this.handleBlurtitle}
                                        multiline
                                        keyboardType={'email-address'}
                                        numberOfLines={1}
                                        autoCapitalize="characters"
                                        placeholder={'Enter Address'}
                                        placeholderTextColor="#828ea5"
                                        onChangeText={ValueHolder => this.GetAddress(ValueHolder)}
                                        value={this.state.address} />
                                </View>
                                <View style={[commonStyles.mb(0.1), { margin: wp('4%'), marginTop: wp('0.1%'), }]}>
                                    <Text style={[commonStyles.boldFont, commonStyles.fs(1.9), { color: '#3B5793', fontFamily: 'Catamaran-Medium', marginLeft: wp('1%') }]}>City</Text>
                                    <TextInput
                                        style={[commonStyles.boldFont, commonStyles.fs(2.3), { color: '#828ea5', fontFamily: 'Catamaran-Medium',borderBottomColor:'#000', borderBottomWidth:Platform.OS === "ios" ? 1:null  }]}
                                        underlineColorAndroid={'#828ea5'}
                                        onFocus={this.handleFocustitle}
                                        onBlur={this.handleBlurtitle}
                                        multiline
                                        numberOfLines={1}
                                        placeholder={'Enter City'}
                                        placeholderTextColor="#828ea5"
                                        onChangeText={ValueHolder => this.GetCity(ValueHolder)}
                                        value={this.state.city} />
                                </View>
                                <View style={[commonStyles.mb(0.1), { margin: wp('4%'), marginTop: wp('0.1%'), }]}>
                                    <Text style={[commonStyles.boldFont, commonStyles.fs(1.9), { color: '#3B5793', fontFamily: 'Catamaran-Medium', marginLeft: wp('1%') }]}>State</Text>
                                    <TextInput
                                        style={[commonStyles.boldFont, commonStyles.fs(2.3), { color: '#828ea5', fontFamily: 'Catamaran-Medium',borderBottomColor:'#000', borderBottomWidth:Platform.OS === "ios" ? 1:null  }]}
                                        underlineColorAndroid={'#828ea5'}
                                        onFocus={this.handleFocustitle}
                                        onBlur={this.handleBlurtitle}
                                        multiline
                                        numberOfLines={1}
                                        placeholder={'Enter State'}
                                        placeholderTextColor="#828ea5"
                                        onChangeText={ValueHolder => this.GetState(ValueHolder)}
                                        value={this.state.state} />
                                </View>
                                <View style={[commonStyles.mb(0.1), { margin: wp('4%'), marginTop: wp('0.1%'), }]}>
                                    <Text style={[commonStyles.boldFont, commonStyles.fs(1.9), { color: '#3B5793', fontFamily: 'Catamaran-Medium', marginLeft: wp('1%') }]}>Zip Code</Text>
                                    <TextInput
                                        style={[commonStyles.boldFont, commonStyles.fs(2.3), { color: '#828ea5', fontFamily: 'Catamaran-Medium',borderBottomColor:'#000', borderBottomWidth:Platform.OS === "ios" ? 1:null }]}
                                        underlineColorAndroid={'#828ea5'}
                                        onFocus={this.handleFocustitle}
                                        onBlur={this.handleBlurtitle}
                                        multiline
                                        keyboardType={'phone-pad'}
                                        numberOfLines={1}
                                        placeholder={'Enter Zip code'}
                                        placeholderTextColor="#828ea5"
                                        onChangeText={ValueHolder => this.GetZip_code(ValueHolder)}
                                        value={this.state.zip_code} />
                                </View>
                                <View style={[commonStyles.mb(0.1), { margin: wp('4%'), marginTop: wp('0.1%'), }]}>
                                    <Text style={[commonStyles.boldFont, commonStyles.fs(1.9), { color: '#3B5793', fontFamily: 'Catamaran-Medium', marginLeft: wp('1%') }]}>Phone</Text>
                                    <TextInput
                                        style={[commonStyles.boldFont, commonStyles.fs(2.3), { color: '#828ea5', fontFamily: 'Catamaran-Medium',    borderBottomColor:'#000', borderBottomWidth:Platform.OS === "ios" ? 1:null
                                    }]}
                                        underlineColorAndroid={'#828ea5'}
                                        onFocus={this.handleFocustitle}
                                        onBlur={this.handleBlurtitle}
                                        multiline
                                        keyboardType={'phone-pad'}
                                        numberOfLines={1}
                                        placeholder={'Enter Phone'}
                                        placeholderTextColor="#828ea5"
                                        onChangeText={ValueHolder => this.GetPhone(ValueHolder)}
                                        value={this.state.phone} />
                                </View>
                                <View style={{ flex: 1, justifyContent: 'center', alignSelf: 'center', flexDirection: 'row',margin:hp('2%') }}>
                                    <LinearGradient
                                        colors={[StyleConstants.gradientStartColor, StyleConstants.gradientEndColor]}
                                        // style={styles.linearGradient}
                                        start={{ x: 0.0, y: 0.25 }} end={{ x: 1.2, y: 1.0 }}
                                        style={[commonStyles.rh(7), commonStyles.center, commonStyles.br(0.3), {
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
                                        <TouchableOpacity style={{ justifyContent: 'center', alignSelf: 'center', borderRadius: 8 }}
                                            onPress={async () => {
                                                if (await this.checkInternet()) {
                                                    // this.savecontact(this.state.address, this.state.phone, this.state.city, this.state.state, this.state.zip_code)
                                                }
                                                else {
                                                    this.showMessage("No Internet Connectivity!")

                                                }
                                            }}
                                        >
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
                                                        <Text style={[commonStyles.boldFont, { color: '#ffffff', justifyContent: 'center', alignSelf: 'center', marginHorizontal: wp('2%') }]}>Update</Text>
                                                    )
                                            }
                                        </TouchableOpacity>
                                    </LinearGradient>
                                </View>
                            </View>
                        </ScrollView>
                    </Modal>
                    <Modal style={[styles.modal3, styles.modal4]} position={"center"} ref={"modal2"} swipeArea={20}
                        backdropPressToClose={true}  >
                        <ScrollView keyboardShouldPersistTaps={true} style={{ flex: 1 }}>
                            <View style={{ flex: 1, width: wp('85%'), justifyContent: 'center', alignContent: 'center', backgroundColor: '#fff', borderRadius: 4, flexDirection: 'column', paddingHorizontal: wp('1%'), paddingVertical: wp('1%') }} >
                                <TouchableOpacity style={[commonStyles.mb(0.1), { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-end', marginRight: wp('3%') }]}
                                    onPress={() => { this.refs.modal2.close() }}>
                                    <View style={{ marginLeft: wp('6%') }}></View>
                                    <Text style={[commonStyles.boldFont, commonStyles.fontSize(3), { justifyContent: 'center', alignSelf: 'center', color: '#3B5793', marginLeft: wp('2%') }]}>Edit About Details</Text>
                                    <Image style={[{ height: hp('5%'), width: wp('5%'), resizeMode: 'contain', alignSelf: 'flex-end' }]}
                                        source={require('../../../assets/images/error.png')} />
                                </TouchableOpacity>
                                <View style={[commonStyles.mb(0.1), { margin: wp('4%'), marginTop: wp('3.1%'), }]}>
                                    <Text style={[commonStyles.boldFont, commonStyles.fs(1.9), { color: '#3B5793', fontFamily: 'Catamaran-Medium', marginLeft: wp('1%') }]}>About</Text>
                                    <TextInput
                                        style={[commonStyles.boldFont, commonStyles.fs(2.3), { color: '#828ea5', fontFamily: 'Catamaran-Medium',borderBottomColor:'#000', borderBottomWidth:Platform.OS === "ios" ? 1:null  }]}
                                        underlineColorAndroid={'#828ea5'}
                                        onFocus={this.handleFocustitle}
                                        // autoFocus={true}
                                        onBlur={this.handleBlurtitle}
                                        multiline
                                        placeholder={'Enter About'}
                                        placeholderTextColor="#828ea5"
                                        onChangeText={ValueHolder => this.GetAbout(ValueHolder)}
                                        value={this.state.about} />
                                </View>
                                <View style={{ flex: 1, justifyContent: 'center', alignSelf: 'center', flexDirection: 'row',margin:hp('2%') }}>
                                    <LinearGradient
                                        colors={[StyleConstants.gradientStartColor, StyleConstants.gradientEndColor]}
                                        // style={styles.linearGradient}
                                        start={{ x: 0.0, y: 0.25 }} end={{ x: 1.2, y: 1.0 }}
                                        style={[commonStyles.rh(7), commonStyles.center, commonStyles.br(0.3), {
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
                                        <TouchableOpacity style={{ justifyContent: 'center', alignSelf: 'center', borderRadius: 8 }}
                                            onPress={async () => {
                                                if (await this.checkInternet()) {
                                                    this.saveAbout(this.state.about)
                                                }
                                                else {
                                                    this.showMessage("No Internet Connectivity!")

                                                }
                                            }}
                                        >
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
                                                        <Text style={[commonStyles.boldFont, { color: '#ffffff', justifyContent: 'center', alignSelf: 'center', marginHorizontal: wp('2%') }]}>{userData.about==""?"Add":"Update"}</Text>
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
    logoutImage: {
        width: wp('7%'),
        height: hp('3%'),
        justifyContent:'center',
        alignSelf:'center'
    },

    greenCheckImage: {
        width: wp('2.3%'),
        height: hp('2.3%'),
        tintColor:'gray',
        resizeMode: 'contain'
    },
    editImage: {
        width: wp('4%'),
        height: hp('4%'),
        resizeMode: 'contain'
    },
    otherImages: {
        width: wp('3.5%'),
        height: hp('3.5%'),
        resizeMode: 'contain'
    },
    clientImage: {
        width: wp('15%'), height: hp('15%'),
        aspectRatio: 1,
        borderColor: '#fff',
        backgroundColor: '#CFCFCF',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        borderTopRightRadius: 8,
        borderTopLeftRadius: 8,
    },
    itemHeader: {
        fontFamily: 'Catamaran-Bold',
        color: '#293D68',
        fontSize: hp('2.2%')
    },
    smallImage: {
        justifyContent: 'flex-end',
        alignContent: 'flex-end',
        margin: hp('1%'),
        width: wp('8%'),
        height: hp('8%'),
        aspectRatio: 1
    },
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
        // position: "absolute",
        backgroundColor: 'rgba(0, 0, 0, 0)',
    },
    modal2: {
        // maxHeight: 500,
        // minHeight: 100
        // height: wp('108%')
        flex:1
    },
    modal3: {
        justifyContent: 'center',
        alignItems: 'center',
        // position: "absolute",
        backgroundColor: 'rgba(0, 0, 0, 0)',
    },
    modal4: {
        maxHeight: 500,
        minHeight: 100,
        height: wp('108%'),
        flex:1
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
)(withNavigation(ClientProfile));
