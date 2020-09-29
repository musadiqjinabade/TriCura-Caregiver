import React from "react";
import { Dimensions, StyleSheet, View, ScrollView, Text, SafeAreaView, Image,FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Platform, Linking, Alert } from 'react-native';
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
import moment from "moment";

class Assessment extends React.Component {
    state = {
        loading: false,
        data:'',
        client:false,
        Activity:false,
        Task:false,
        instruction_act:false,
        Task: false,
        count:0
    }

    async componentDidMount() {
        if (await this.checkInternet()) {
            var data = {}
            data.agency_logo = await AsyncStorage.getItem('agency_logo');
            data.agency_name = await AsyncStorage.getItem('agency_name');

            this.setState({ agency_details: data })
            this.setState({ loading: true,clientdata:this.props.navigation.state.params.item }, () => {
                this.getProfile();
                // console.log("props data:",this.state.clientdata)
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
    async getProfile() {
        console.log("this.state.clientdata",this.state.clientdata)
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = Globals.httpMode + agency_code  + Globals.domain + '/api/v1/users/' + Object.keys(this.state.clientdata)[0] + '/assessment';
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
                    this.setState({loading:false})
                    this.showMessage("Internal server error");
                    this.props.navigation.goBack()
                }
            }
            catch (error) {
                this.setState({loading:false})
                this.showMessage("Internal server error");
                this.props.navigation.goBack()
                console.log("error : ", error);
            }
        }
        catch (e) {
            var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Internal server error!') : 'Internal server error!');
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


    render() {
        var userdata = null
        var activities = null
        var instruction_act = null
        var medical = null
        var Task = null
        if (this.state.loading || !this.state.data) {
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={'Assessment'} expanded={this.state.expanded} onBack={() => {
                        this.props.navigation.goBack()
                    }} />
                    <LoadingIndicator />
                </SafeAreaView>)
        }
        else {
            userdata = this.state.data[Object.keys(this.state.data)]
            console.log('userdata',userdata!=null?userdata.activities_of_daily_livings:null)
            activities = Object.keys(userdata.activities_of_daily_livings).map(key => ({ [key]: userdata.activities_of_daily_livings[key] }));
            instruction_act = Object.keys(userdata.ins_activities_of_daily_livings).map(key => ({ [key]: userdata.ins_activities_of_daily_livings[key] }));
            medical = Object.keys(userdata.medications).map(key => ({ [key]: userdata.medications[key] }));
            Task = Object.keys(userdata.default_tasks).map(key => ({ [key]: userdata.default_tasks[key] }));

            console.log('userdata',instruction_act)
            
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={'Assessment'} expanded={this.state.expanded} Agency_logo={this.state.agency_details} onBack={() => {
                        this.props.navigation.goBack()
                    }} />
                    <ScrollView showsVerticalScrollIndicator={false} >
                        <View style={[commonStyles.margin, commonStyles.column, commonStyles.full]}>
                            {this.state.client?
                            <View>
                                <View style={[styles.itemRectangleShape, { flexDirection: 'column' }]} >
                                    <View style={{ padding: wp('2%'), flex: 1 }}>
                                            <View style={commonStyles.row,{justifyContent:'space-between', flexDirection:'row'}}>
                                                <View style={[commonStyles.center, { justifyContent: 'center', alignItems: 'flex-start', marginRight: wp('3%') }]}>
                                                    <Text style={[styles.itemHeader]}>Client Assessment</Text>
                                                </View>
                                                <TouchableOpacity style={[commonStyles.center, { justifyContent: 'center', alignItems: 'flex-end', marginRight: wp('1%') }]}
                                                    onPress={() => { this.setState({ client: !this.state.client }) }}>
                                                    <Image style={[{
                                                        marginTop: wp('2%'),
                                                        width: wp('3%'),
                                                        height: hp('3%'),
                                                        marginHorizontal:wp('3%'),
                                                        justifyContent: 'flex-end',
                                                        alignSelf: 'flex-end',
                                                        resizeMode: 'contain'
                                                    }]}
                                                        source={require('../../../assets/images/up-arrow.png')} />
                                                </TouchableOpacity>

                                            </View>
                                            <View style={styles.line} />
                                            <View style={{ flexDirection: 'row', marginTop: hp('2%') }}>
                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#293D68', fontFamily: 'Catamaran-Medium', }}>{'Time Zone: '}</Text>
                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Medium', }}>{userdata.client_assessment.default_time_zone}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'column', marginTop: hp('2%') }}>
                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#293D68', fontFamily: 'Catamaran-Medium', }}>{'Care Description: '}</Text>
                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Medium', }}>{userdata.client_assessment.care_description!=null?userdata.client_assessment.care_description:'---'}</Text>
                                            </View>
                                    </View>
                                    
                                </View>
                            </View>:
                            <View
                            >
                            <View style={[styles.itemRectangleShape, { flexDirection: 'row' }]} >
                                <View style={{ padding: wp('2%'), flex: 1 }}>
                                    <View style={commonStyles.column}>
                                        <Text style={[styles.itemHeader]}>Client Assessment</Text>
                                        {/* <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Medium', }}>{'Photos'}</Text> */}
                                    </View>
                                </View>
                                <TouchableOpacity style={[commonStyles.center, { justifyContent: 'center', alignItems: 'flex-end', marginRight: wp('3%') }]}
                                onPress={() => {this.setState({client:!this.state.client})}}>
                                    <Image style={[{
                                        marginTop: wp('2%'),
                                        width: wp('3%'),
                                        marginHorizontal:wp('3%'),
                                        height: hp('3%'),
                                        justifyContent: 'flex-end',
                                        alignSelf: 'flex-end',
                                        resizeMode: 'contain'
                                    }]}
                                        source={require('../../../assets/images/down-arrow.png')} />
                                </TouchableOpacity>
                            </View>
                        </View>}

                        {this.state.Activity?
                            <View>
                                <View style={[styles.itemRectangleShape, { flexDirection: 'column' }]} >
                                    <View style={{ padding: wp('2%'), flex: 1 }}>
                                            <View style={commonStyles.row,{justifyContent:'space-between', flexDirection:'row'}}>
                                                <View style={[commonStyles.center, { justifyContent: 'center', alignItems: 'flex-start', marginRight: wp('3%') }]}>
                                                    <Text style={[styles.itemHeader]}>Activity of Daily Living</Text>
                                                </View>
                                                <TouchableOpacity style={[commonStyles.center, { justifyContent: 'center', alignItems: 'flex-end', marginRight: wp('1%') }]}
                                                    onPress={() => { this.setState({ Activity: !this.state.Activity }) }}>
                                                    <Image style={[{
                                                        marginTop: wp('2%'),
                                                        width: wp('3%'),
                                                        height: hp('3%'),
                                                        marginHorizontal:wp('3%'),
                                                        justifyContent: 'flex-end',
                                                        alignSelf: 'flex-end',
                                                        resizeMode: 'contain'
                                                    }]}
                                                        source={require('../../../assets/images/up-arrow.png')} />
                                                </TouchableOpacity>
                                            </View>
                                            {/* <View style={styles.line} /> */}
                                            {
                                                activities.length > 0 ?
                                                    activities.map((key) =>
                                                    (
                                                        <View style={{ flexDirection: 'column' }}>
                                                            <View style={styles.line} />
                                                            <View style={{ flexDirection: 'row', marginTop: hp('2%') }}>
                                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#293D68', fontFamily: 'Catamaran-Medium', }}>{'Name: '}</Text>
                                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Medium', }}>{key[Object.keys(key)[0]].name}</Text>
                                                            </View>
                                                            <View style={{ flexDirection: 'row', marginTop: hp('2%') }}>
                                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#293D68', fontFamily: 'Catamaran-Medium', }}>{'Task: '}</Text>
                                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Medium', }}>{key[Object.keys(key)[0]].task}</Text>
                                                            </View>
                                                            <View style={{ flexDirection: 'row', marginTop: hp('2%') }}>
                                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#293D68', fontFamily: 'Catamaran-Medium', }}>{'Assistance: '}</Text>
                                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Medium', }}>{key[Object.keys(key)[0]].assistance}</Text>
                                                            </View>
                                                        </View>
                                                     )
                                                    ) 
                                                    : <Text style={{ fontFamily: 'Catamaran-Regular', color: '#828EA5', fontSize: hp('1.8%'), marginLeft: wp('2%') }}>None</Text>
                                            }
                                    </View>
                                    
                                </View>
                            </View>:
                            <View>
                            <View style={[styles.itemRectangleShape, { flexDirection: 'row' }]} >
                                <View style={{ padding: wp('2%'), flex: 1 }}>
                                    <View style={commonStyles.column}>
                                        <Text style={[styles.itemHeader]}>Activity of Daily Living</Text>
                                        {/* <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Medium', }}>{'Photos'}</Text> */}
                                    </View>
                                </View>
                                <TouchableOpacity style={[commonStyles.center, { justifyContent: 'center', alignItems: 'flex-end', marginRight: wp('3%') }]}
                                                    onPress={() => { this.setState({ Activity: !this.state.Activity }) }}>
                                                    <Image style={[{
                                                        marginTop: wp('2%'),
                                                        width: wp('3%'),
                                                        marginHorizontal:wp('3%'),
                                                        height: hp('3%'),
                                                        justifyContent: 'flex-end',
                                                        alignSelf: 'flex-end',
                                                        resizeMode: 'contain'
                                                    }]}
                                                        source={require('../../../assets/images/down-arrow.png')} />
                                </TouchableOpacity>
                            </View>
                        </View>}

                        {this.state.instruction_act?
                            <View
                                >
                                <View style={[styles.itemRectangleShape, { flexDirection: 'column' }]} >
                                    <View style={{ padding: wp('2%'), flex: 1 }}>
                                            <View style={commonStyles.row,{justifyContent:'space-between', flexDirection:'row'}}>
                                                <View style={{ padding: wp('2%'), flex: 1 }}>
                                                <View style={commonStyles.column}>
                                                    <Text style={[styles.itemHeader]}>Instrumental Activities of Daily Living</Text>
                                                    {/* <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Medium', }}>{'Photos'}</Text> */}
                                                </View>
                                                </View>
                                                <TouchableOpacity style={[commonStyles.center, {  alignItems: 'flex-start', marginRight: wp('1%') }]}
                                                onPress={() => {this.setState({instruction_act:!this.state.instruction_act})}}>
                                                    <Image style={[{
                                                        marginTop: wp('2%'),
                                                        width: wp('3%'),
                                                        height: hp('3%'),
                                                        marginHorizontal:wp('3%'),
                                                        justifyContent: 'flex-end',
                                                        alignSelf: 'flex-start',
                                                        resizeMode: 'contain'
                                                    }]}
                                                        source={require('../../../assets/images/up-arrow.png')} />
                                                </TouchableOpacity>
                                            </View>
                                            {
                                                instruction_act.length > 0 ?
                                                    instruction_act.map((key) =>
                                                    (
                                                        <View style={{ flexDirection: 'column' }}>
                                                            <View style={styles.line} />
                                                            <View style={{ flexDirection: 'row', marginTop: hp('2%') }}>
                                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#293D68', fontFamily: 'Catamaran-Medium', }}>{'Name: '}</Text>
                                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Medium', }}>{key[Object.keys(key)[0]].name}</Text>
                                                            </View>
                                                            <View style={{ flexDirection: 'row', marginTop: hp('2%') }}>
                                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#293D68', fontFamily: 'Catamaran-Medium', }}>{'Task: '}</Text>
                                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Medium', }}>{key[Object.keys(key)[0]].task}</Text>
                                                            </View>
                                                            <View style={{ flexDirection: 'row', marginTop: hp('2%') }}>
                                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#293D68', fontFamily: 'Catamaran-Medium', }}>{'Assistance: '}</Text>
                                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Medium', }}>{key[Object.keys(key)[0]].assistance}</Text>
                                                            </View>
                                                            <View style={{ flexDirection: 'row', marginTop: hp('2%') }}>
                                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#293D68', fontFamily: 'Catamaran-Medium', }}>{'Regularity: '}</Text>
                                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Medium', }}>{key[Object.keys(key)[0]].regularities[0]}</Text>
                                                            </View>
                                                        </View>
                                                     )
                                                    ) 
                                                    : <Text style={{ fontFamily: 'Catamaran-Regular', color: '#828EA5', fontSize: hp('1.8%'), marginLeft: wp('2%') }}>None</Text>
                                            }
                                    </View>
                                    
                                </View>
                            </View>:
                            <View>
                            <View style={[styles.itemRectangleShape, { flexDirection: 'row' }]} >
                                <View style={{ padding: wp('2%'), flex: 1 }}>
                                    <View style={commonStyles.column}>
                                        <Text style={[styles.itemHeader]}>Instrumental Activities of Daily Living</Text>
                                        {/* <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Medium', }}>{'Photos'}</Text> */}
                                    </View>
                                </View>
                                <TouchableOpacity style={[commonStyles.center, { justifyContent: 'center', alignItems: 'flex-end', marginRight: wp('3%') }]}
                                onPress={() => {this.setState({instruction_act:!this.state.instruction_act})}}>
                                    <Image style={[{
                                        marginTop: wp('2%'),
                                        width: wp('3%'),
                                        marginHorizontal:wp('3%'),
                                        height: hp('3%'),
                                        justifyContent: 'flex-end',
                                        alignSelf: 'flex-end',
                                        resizeMode: 'contain'
                                    }]}
                                        source={require('../../../assets/images/down-arrow.png')} />
                                </TouchableOpacity>
                            </View>
                        </View>}

                        {this.state.medical?
                            <View>
                                <View style={[styles.itemRectangleShape, { flexDirection: 'column' }]} >
                                    <View style={{ padding: wp('2%'), flex: 1 }}>
                                            <View style={commonStyles.row,{justifyContent:'space-between', flexDirection:'row'}}>
                                                <View style={commonStyles.column}>
                                                    <Text style={[styles.itemHeader]}>Medications and Supplements</Text>
                                                    {/* <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Medium', }}>{'Photos'}</Text> */}
                                                </View>
                                                <TouchableOpacity style={[commonStyles.center, {  alignItems: 'flex-start', marginRight: wp('1%') }]}
                                                onPress={() => {this.setState({medical:!this.state.medical})}}>
                                                    <Image style={[{
                                                        marginTop: wp('2%'),
                                                        width: wp('3%'),
                                                        height: hp('3%'),
                                                        marginHorizontal:wp('3%'),
                                                        justifyContent: 'flex-end',
                                                        alignSelf: 'flex-start',
                                                        resizeMode: 'contain'
                                                    }]}
                                                        source={require('../../../assets/images/up-arrow.png')} />
                                                </TouchableOpacity>
                                            </View>
                                            {
                                                medical.length > 0 ?
                                                    medical.map((key) =>
                                                    (
                                                        <View style={{ flexDirection: 'column' }}>
                                                            <View style={styles.line} />
                                                            <View style={{ flexDirection: 'row', marginTop: hp('2%') }}>
                                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#293D68', fontFamily: 'Catamaran-Medium', }}>{'Name: '}</Text>
                                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Medium', }}>{key[Object.keys(key)[0]].name}</Text>
                                                            </View>
                                                            <View style={{ flexDirection: 'row', marginTop: hp('2%') }}>
                                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#293D68', fontFamily: 'Catamaran-Medium', }}>{'Dosage: '}</Text>
                                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Medium', }}>{key[Object.keys(key)[0]].dosage!=''?key[Object.keys(key)[0]].dosage:'--'}</Text>
                                                            </View>
                                                            <View style={{ flexDirection: 'row', marginTop: hp('2%') }}>
                                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#293D68', fontFamily: 'Catamaran-Medium', }}>{'Reason: '}</Text>
                                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Medium', }}>{key[Object.keys(key)[0]].reason!=''?key[Object.keys(key)[0]].reason:'--'}</Text>
                                                            </View>
                                                            <View style={{ flexDirection: 'row', marginTop: hp('2%') }}>
                                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#293D68', fontFamily: 'Catamaran-Medium', }}>{'Time: '}</Text>
                                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Medium', }}>{key[Object.keys(key)[0]].usage_times.length>0?key[Object.keys(key)[0]].usage_times+",":'--'}</Text>
                                                            </View>
                                                            <View style={{ flexDirection: 'row', marginTop: hp('2%') }}>
                                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#293D68', fontFamily: 'Catamaran-Medium', }}>{'Modified: '}</Text>
                                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Medium', }}>{key[Object.keys(key)[0]].modified!==null || key[Object.keys(key)[0]].modified!==''?moment(key[Object.keys(key)[0]].modified).format('DD MMM YYYY'):'---'}</Text>
                                                            </View>
                                                        </View>
                                                     )
                                                    ) 
                                                    : <Text style={{ fontFamily: 'Catamaran-Regular', color: '#828EA5', fontSize: hp('1.8%'), marginLeft: wp('2%') }}>None</Text>
                                            }
                                    </View>
                                    
                                </View>
                            </View>:
                            <View>
                            <View style={[styles.itemRectangleShape, { flexDirection: 'row' }]} >
                                <View style={{ padding: wp('2%'), flex: 1 }}>
                                    <View style={commonStyles.column}>
                                        <Text style={[styles.itemHeader]}>Medications and Supplements</Text>
                                        {/* <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Medium', }}>{'Photos'}</Text> */}
                                    </View>
                                </View>
                                <TouchableOpacity style={[commonStyles.center, { justifyContent: 'center', alignItems: 'flex-end', marginRight: wp('3%') }]}
                            onPress={() => {this.setState({medical:!this.state.medical})}}>
                                    <Image style={[{
                                        marginTop: wp('2%'),
                                        width: wp('3%'),
                                        height: hp('3%'),
                                        marginHorizontal:wp('3%'),
                                        justifyContent: 'flex-end',
                                        alignSelf: 'flex-end',
                                        resizeMode: 'contain'
                                    }]}
                                        source={require('../../../assets/images/down-arrow.png')} />
                                </TouchableOpacity>
                            </View>
                        </View>}
                        {this.state.Task?
                            <View>
                                <View style={[styles.itemRectangleShape, { flexDirection: 'column' }]} >
                                    <View style={{ padding: wp('2%'), flex: 1 }}>
                                            <View style={commonStyles.row,{justifyContent:'space-between', flexDirection:'row'}}>
                                                <View style={[commonStyles.center, { justifyContent: 'center', alignItems: 'flex-start', marginRight: wp('3%') }]}>
                                                    <Text style={[styles.itemHeader]}>Tasks</Text>
                                                </View>
                                                <TouchableOpacity style={[commonStyles.center, {  alignItems: 'flex-start', marginRight: wp('1%') }]}
                                                onPress={() => {this.setState({Task:!this.state.Task})}}>
                                                    <Image style={[{
                                                        marginTop: wp('2%'),
                                                        width: wp('3%'),
                                                        height: hp('3%'),
                                                        marginHorizontal:wp('3%'),
                                                        justifyContent: 'flex-end',
                                                        alignSelf: 'flex-start',
                                                        resizeMode: 'contain'
                                                    }]}
                                                        source={require('../../../assets/images/up-arrow.png')} />
                                                </TouchableOpacity>
                                            </View>
                                            {
                                                
                                                Task.length > 0 ?
                                                
                                                    Task.map((key) =>
                                                    (
                                                        // {this.setState({count:this.state.count+1})}
                                                        <View style={{ flexDirection: 'column' }}>
                                                            <View style={styles.line} />
                                                            <View style={{ flexDirection: 'column', marginTop: hp('2%') }}>
                                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#293D68', fontFamily: 'Catamaran-Medium', }}>{key[Object.keys(key)[0]].title}</Text>
                                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Medium', }}>{key[Object.keys(key)[0]].details}</Text>
                                                            </View>
                                                        </View>
                                                     )
                                                    ) 
                                                    : <Text style={{ fontFamily: 'Catamaran-Regular', color: '#828EA5', fontSize: hp('1.8%'), marginLeft: wp('2%') }}>None</Text>
                                            }
                                    </View>
                                </View>
                            </View>:
                            <View >
                            <View style={[styles.itemRectangleShape, { flexDirection: 'row' }]} >
                                <View style={{ padding: wp('2%'), flex: 1 }}>
                                    <View style={commonStyles.column}>
                                        <Text style={[styles.itemHeader]}>Tasks</Text>
                                        {/* <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Medium', }}>{'Photos'}</Text> */}
                                    </View>
                                </View>
                                <TouchableOpacity 
                                onPress={() => {this.setState({Task:!this.state.Task})}}
                                style={[commonStyles.center, { justifyContent: 'center', alignItems: 'flex-end', marginRight: wp('3%') }]}>
                                    <Image style={[{
                                        marginTop: wp('2%'),
                                        width: wp('3%'),
                                        height: hp('3%'),
                                        marginHorizontal:wp('3%'),
                                        justifyContent: 'flex-end',
                                        alignSelf: 'flex-end',
                                        resizeMode: 'contain'
                                    }]}
                                        source={require('../../../assets/images/down-arrow.png')} />
                                </TouchableOpacity>
                            </View>
                        </View>}

                        </View>
                    </ScrollView>
                </SafeAreaView>
            )
        }
    }

}
const styles = StyleSheet.create({

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
    itemHeader: {
        fontFamily: 'Catamaran-Bold',
        color: '#293D68',
        fontSize: hp('2.2%')
    },
    line: {
        marginTop: wp('2%'),
        borderWidth: 0.55,
        borderColor: '#828EA5',
    },
})

const mapStateToProps = state => ({
    data: state.user.data
});

export default connect(
    mapStateToProps,
    null
)(withNavigation(Assessment));