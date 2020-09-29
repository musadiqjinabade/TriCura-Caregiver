import React from "react";
import { StyleSheet, SafeAreaView, Image, Text, View, ScrollView, TouchableOpacity, FlatList, RefreshControl, Platform, StatusBar } from 'react-native';
import commonStyles from '../styles/Common';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, widthPercentageToDP } from 'react-native-responsive-screen';
import { withNavigation, StackActions, NavigationActions } from 'react-navigation';
import LoadingIndicator from '../core/components/LoadingIndicator';
import AsyncStorage from '@react-native-community/async-storage';
import { connect } from "react-redux";
import Globals from '../Globals';
import { Toast } from 'native-base';
import Modal from 'react-native-modalbox';
import LinearGradient from 'react-native-linear-gradient';
import styleConstants from '../styles/StyleConstants'
import Header from '../core/components/Header';
import OfflineNotice from '../core/components/OfflineNotice'
import NetInfo from "@react-native-community/netinfo";
import moment from "moment";

class DashboardScreen extends React.Component {
    state = {
        data: '',
        expanded: true,
        loading: false,
        dateArray: [],
        totalCount: 0
    }

    showMessage(message) {
        Toast.show({
            text: message,
            duration: 2000,
            unData: ''
        })
    }

    async navigateToLogin() {
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


    componentDidMount() {
        // this.checkInternet()
        // console.log("data:", this.props.data.access_token_expires_at)
        const accessTokenDate = moment().unix(this.props.data.access_token_expires_at);
        var CurrentDate = moment().unix();
        // console.log(CurrentDate > accessTokenDate,"current : ", CurrentDate + " acces : ", accessTokenDate, this.props.data.access_token_expires_at)
        if (CurrentDate > accessTokenDate) {
            // this.refs.modal1.open()
        }
    }


    componentWillMount() {
        var access_token = this.props.data;
        console.log('access:', access_token)
        this.setState({ loading: true }, () => {
            this.getInfo()
            this.getDashboardData();
        })
    }

    async getInfo() {
        if (await this.checkInternet()) {
            const axios = require('axios');
            var agency_code = await AsyncStorage.getItem('agency_code');
            var url = Globals.httpMode + agency_code  + Globals.domain + '/api/v1/calendar/agency_detail';
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
                if (response.status === 200) {
                    console.log("agency_data : ", response)
                    this.setState({
                        agency_details: response.data.agency, loading: false
                    }, () => {
                        this.state.agency_details.logo != null ? AsyncStorage.setItem('agency_logo', this.state.agency_details.logo) : AsyncStorage.setItem('agency_logo', '')
                        AsyncStorage.setItem('agency_name', this.state.agency_details.name);
                        AsyncStorage.setItem('agency_email', this.state.agency_details.email);
                    })
                    var data = {}
                    data.agency_logo = await AsyncStorage.getItem('agency_logo');
                    data.agency_name = await AsyncStorage.getItem('agency_name');
                    this.setState({ agency_details: data })
                    console.log("agency_logo : ", agency_logo)
                    console.log("agency_name : ", agency_name)
                }
                else {
                    var data1 = response.data.error;


                    this.showMessage(data1);
                    this.setState({
                        curloading: false
                    })
                }
            }
            catch (e) {
                var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
                if (e = 'Error: Network Error') {
                    console.log("e : ", e)
                    await this.checkInternet()

                }
                console.log("e : ", e)

                // this.showMessage(error);
                this.setState({
                    curloading: false
                })
            }
        }
        else {
            this.showMessage("No Internet Connectivity!")
            this.setState({
                curloading: false
            })
        }
    }

    async shift_data(id) {
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = Globals.httpMode + agency_code + Globals.domain + '/api/v1/shifts/current';
        console.log("url : ", url);
        try {
            var access_token = this.props.data.access_token;
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
                console.log("data : ", Object.keys(response.data)[0])
                if (Object.keys(response.data)[0] == id) {
                    this.props.navigation.navigate('CurrentShift', { item: id })
                }
                else {
                    this.props.onAssignToMe()
                }
            }
            else {
                var data1 = response.data.error;
                this.props.onAssignToMe()
                this.setState({
                    curloading: false
                })
            }
        }
        catch (e) {
            var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
            console.log("error : ", error)
            this.props.onAssignToMe()
            this.setState({
                curloading: false
            })
        }
    }

    async getDashboardData() {

        if (await this.checkInternet()) {

            var start = new Date();
            var currentStart = moment(start).format('MMM DD, YYYY');
            console.log('start:', currentStart);

            var nextsevenDay = new Date(start);
            console.log('start:', nextsevenDay);

            nextsevenDay.setDate(start.getDate() + 6);
            console.log(nextsevenDay);
            var sevenDate = nextsevenDay;
            this.state.dateArray = []
            while (start <= nextsevenDay) {
                this.state.dateArray.push(moment(start).format())
                start = moment(start).add(1, 'days');
            }
            console.log("currentStart:", currentStart);
            var millisecondsMonday = moment(currentStart).format('X');
            var millisecondsSunday = moment(sevenDate).format('X');
            console.log("start:", millisecondsMonday, "nextsevenDay:", millisecondsSunday);

            const axios = require('axios');
            var agency_code = await AsyncStorage.getItem('agency_code');
            var url = Globals.httpMode + agency_code + Globals.domain + '/api/v1/shifts/calendar?start_time=' + millisecondsMonday + '&end_time=' + millisecondsSunday;
            console.log("url : ", url);
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
                            data: response.data.shifts,
                            job: response.data,
                            unData: response.data.unavailabilities
                        }, () => {
                            console.log("job;", this.state.job)
                        })
                        this.Job_count()
                    }
                    else {
                        this.showMessage(response.error);
                    }
                }
                catch (error) {
                    console.log("error : ", error);
                    if(error = 'Error: Request failed with status code 401'){
                        this.navigateToLogin()
                    }
                }
            }
            catch (e) {
                console.log("error : ", e)
                var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
                this.setState({
                    loading: false,
                })
                this.showMessage(error);
            }
        } else {
            this.showMessage("No Internet Connectivity!")
            this.setState({
                loading: false
            })
        }
    }

    async Job_count() {
        var start = new Date();
        var currentStart = start;
        console.log('start:', start);
        var nextsevenDay = new Date(start);
        nextsevenDay.setDate(start.getDate() + 6);
        console.log(nextsevenDay);
        var sevenDate = nextsevenDay;
        var millisecondsMonday = moment(currentStart).format('X');
        var millisecondsSunday = moment(sevenDate).format('X');
        console.log("start:", millisecondsMonday, "nextsevenDay:", millisecondsSunday);
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = Globals.httpMode + agency_code + Globals.domain + '/api/v1/jobs?page=2&per_page=1'
        console.log("url : ", url);
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
                        count: response.data,
                        loading: false
                    }, () => {
                        console.log("job;", this.state.job)
                    })
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
            console.log("error : ", e)
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

    returnCounts(date) {
        var count = 0;
        for (let i = 0; i < this.state.data.length; i++) {
            console.log("calendar data count:",moment(this.state.data[i].start_time).format('MMM DD, YYYY'),"date",date)
            if (moment(this.state.data[i].start_time).format('MMM DD, YYYY') === date) {
                count++;
            }
        }
        return count;
    }

    jobCounts() {
        var count = 0;
        for (let i = 0; i < this.state.data.length; i++) {
            count++;
        }
        return count;
    }

    render() {
        const { navigate } = this.props.navigation;
        if (this.state.loading) {
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor]}>
                    <StatusBar barStyle="default" hidden={false} backgroundColor="#transparent" translucent={true} />
                    <Header onLogo={() => navigate('AgencyInfoScreen')} label={'Dashboard'} Agency_logo={this.state.agency_details} expanded={this.state.expanded} />
                    <LoadingIndicator />

                </SafeAreaView>)
        }
        else {
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor,]}>
                    <StatusBar barStyle="light-content" hidden={false} backgroundColor="#transparent" translucent={true} />
                    <Header onLogo={() => navigate('AgencyInfoScreen')} label={'Dashboard'} Agency_logo={this.state.agency_details} expanded={this.state.expanded} />
                    <ScrollView
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.loading}
                                onRefresh={this._onRefresh}
                                colors={["#4254C5"]}
                            />} >
                        <View style={[commonStyles.margin, commonStyles.column, commonStyles.full, { marginTop: hp('-2%') }]}>
                            <Text style={[commonStyles.headerTextBoldFont]}>Schedule</Text>
                            <View style={commonStyles.row}>
                                <View style={{ flexDirection: 'row', flex: 9, alignItems: 'center' }}>
                                    <Text style={commonStyles.headerTextRegularFont}>{moment(this.state.dateArray[0]).format('MMM DD') + ' - ' + moment(this.state.dateArray[this.state.dateArray.length - 1]).format('MMM DD') + ', ' + moment(this.state.dateArray[this.state.dateArray.length - 1]).format('YYYY')}</Text>
                                </View>
                                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginTop: -10, }}>
                                    <TouchableOpacity
                                        onPress={async () => {
                                            //console.log("internet : ", await this.checkInternet());
                                            if (await this.checkInternet()) {
                                                this.props.onAssignToMe()
                                            }
                                            else {
                                                this.showMessage("No Internet Connectivity!")
                                            }
                                        }}  >
                                        <Image style={styles.calendarImage}
                                            source={require('../../assets/images/calendar.png')} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', marginTop: 20 }}>
                                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                                    {this.state.dateArray.length > 0 ?
                                        <FlatList
                                            extraData={this.state.dateArray}
                                            data={this.state.dateArray}
                                            horizontal={true}
                                            renderItem={({ item }) => {
                                                console.log('item date:', item, new Date(item))
                                                return (
                                                    <TouchableOpacity
                                                        // onPress={() => { this.state.dateArray[0] == item ? navigate('CurrentShift') : this.props.onAssignToMe() }}
                                                        onPress={async () => {
                                                            if (await this.checkInternet()) {
                                                                this.state.dateArray[0] == item ? navigate('CurrentShift') : this.props.onAssignToMe(new Date(item))
                                                            }
                                                            else {
                                                                this.showMessage("No Internet Connectivity!")
                                                            }
                                                        }}
                                                        style={{ marginRight: wp('2%') }}>
                                                        <View style={styles.rectangleShapeFirst} >
                                                            <View style={{ flex: 1 }}>
                                                                {
                                                                    this.returnCounts(moment(item).format('MMM DD, YYYY')) ?
                                                                        <View style={styles.circle}>
                                                                            <Text style={{ fontSize: 13, color: '#ffffff' }}>{this.returnCounts(moment(item).format('MMM DD, YYYY'))}</Text>
                                                                        </View> :
                                                                        <View style={styles.blankCircle}></View>
                                                                }
                                                                <Text style={{ marginLeft: 5, fontSize: wp('3.5%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', }}>{moment(item).format('dddd')}</Text>
                                                                <Text style={{ marginTop: -2, marginLeft: 5, fontFamily: 'Catamaran-Bold', color: '#293D68', fontSize: wp('4.7%')}}>{moment(item).format('MMM DD, YYYY')}</Text>
                                                            </View>
                                                        </View>
                                                    </TouchableOpacity>
                                                )

                                            }
                                            } /> : <View>
                                            <Text style={{ marginLeft: 5, fontSize: wp('4.7%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', }}>No Data</Text>
                                        </View>}
                                </ScrollView>
                            </View>

                            <Text style={[commonStyles.headerTextBoldFont, { marginTop: 20 }]}>Dashboard Menu</Text>
                            <View style={{ marginTop: wp('5%') }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <TouchableOpacity
                                        onPress={async () => {
                                            if (await this.checkInternet()) {
                                                navigate('CurrentShift')
                                            }
                                            else {
                                                this.showMessage("No Internet Connectivity!")
                                            }
                                        }} >
                                        <View style={styles.rectangleShapeDashboardMenu} >
                                            <View style={{ marginLeft: wp('6%'), justifyContent: 'center' }}>
                                                <Image style={styles.MenuImage}
                                                    source={require('../../assets/images/current-shift.png')} />
                                                <Text style={{ fontFamily: 'Catamaran-Bold', color: '#293D68', fontSize: wp('4.7%') }}>Current Shift</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={async () => {
                                            if (await this.checkInternet()) {
                                                navigate('CommunicationScreen')
                                            }
                                            else {
                                                this.showMessage("No Internet Connectivity!")
                                            }
                                        }}>
                                        <View style={styles.rectangleShapeDashboardMenuSecond} >
                                            <View style={{ marginLeft: wp('6%'), justifyContent: 'center' }}>
                                                <Image style={styles.MenuImage}
                                                    source={require('../../assets/images/communication.png')} />
                                                <Text style={{ fontFamily: 'Catamaran-Bold', color: '#293D68', fontSize: wp('4.7%') }}>Communication</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={{ marginTop: wp('5%') }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <TouchableOpacity
                                        onPress={async () => {
                                            if (await this.checkInternet()) {
                                                navigate('JobsScreen')
                                            }
                                            else {
                                                this.showMessage("No Internet Connectivity!")
                                            }
                                        }}>
                                        <View style={styles.rectangleShapeDashboardMenu} >
                                            <View style={{ marginLeft: wp('6%') }}>
                                                <View style={styles.smallRectangleShapeRed} >
                                                    <Text style={{ fontSize: 13, color: '#ffffff' }}>{this.state.count ? this.state.count.all_count : '0'}</Text>
                                                </View>
                                                <Image style={[styles.MenuImage, { marginTop: wp('-6%') }]}
                                                    source={require('../../assets/images/jobs.png')} />
                                                <Text style={{ fontFamily: 'Catamaran-Bold', color: '#293D68', fontSize: wp('4.7%') }}>Jobs</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={async () => {
                                            if (await this.checkInternet()) {
                                                navigate('CurrentPayrollScreen', { item1: 'jobs' })
                                            }
                                            else {
                                                this.showMessage("No Internet Connectivity!")
                                            }
                                        }}>
                                        <View style={styles.rectangleShapeDashboardMenuSecond} >
                                            <View style={{ marginLeft: wp('6%') }}>
                                                <Image style={styles.MenuImage}
                                                    source={require('../../assets/images/current-payroll.png')} />
                                                <Text style={{ fontFamily: 'Catamaran-Bold', color: '#293D68', fontSize: wp('4.7%') }}>Current Payroll</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>

                                </View>
                            </View>

                            <View style={{ marginTop: wp('5%') }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <TouchableOpacity onPress={async () => {
                                        if (await this.checkInternet()) {
                                            navigate('Shift')
                                        }
                                        else {
                                            this.showMessage("No Internet Connectivity!")
                                        }
                                    }}>
                                        <View style={styles.rectangleShapeDashboardMenu} >
                                            <View style={{ marginLeft: wp('6%') }}>
                                                <Image style={styles.MenuImage}
                                                    source={require('../../assets/images/shift-history.png')} />
                                                <Text style={{ fontFamily: 'Catamaran-Bold', color: '#293D68', fontSize: wp('4.7%') }}>Shifts</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={async () => {
                                            if (await this.checkInternet()) {
                                                navigate('MyAccountScreen')
                                            }
                                            else {
                                                this.showMessage("No Internet Connectivity!")
                                            }
                                        }}>
                                        <View style={styles.rectangleShapeDashboardMenuSecond} >
                                            <View style={{ marginLeft: wp('6%') }}>
                                                <Image style={styles.MenuImage}
                                                    source={require('../../assets/images/my-account.png')} />
                                                <Text style={{ fontFamily: 'Catamaran-Bold', color: '#293D68', fontSize: wp('4.7%') }}>My Account</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>

                                </View>
                            </View>

                            <View style={{ marginTop: wp('5%'), marginBottom: hp('5%') }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <TouchableOpacity
                                        onPress={async () => {
                                            if (await this.checkInternet()) {
                                                navigate('HelpScreen')
                                            }
                                            else {
                                                this.showMessage("No Internet Connectivity!")
                                            }
                                        }}>
                                        <View style={styles.rectangleShapeDashboardMenu} >
                                            <View style={{ marginLeft: wp('6%') }}>
                                                <Image style={styles.MenuImage}
                                                    source={require('../../assets/images/help&faq.png')} />
                                                <Text style={{ fontFamily: 'Catamaran-Bold', color: '#293D68', fontSize: wp('4.7%') }}>Help & FAQ</Text>
                                            
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                    <View style={{ flex: 1, marginLeft: wp('5%'), borderRadius: 5, width: wp('42%'), height: hp('17%'), }}>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                    <Modal style={[styles.modal, styles.modal1]} position={"center"} ref={"modal1"} swipeArea={20}
                        backdropPressToClose={true} >
                        <ScrollView keyboardShouldPersistTaps={true}>
                            <View style={{ flex: 1, width: wp('85%'), justifyContent: 'center', alignContent: 'center', backgroundColor: '#fff', borderRadius: 4, flexDirection: 'column', paddingHorizontal: wp('1%') }} >
                                <Text style={[commonStyles.boldFont, commonStyles.fontSize(3), { justifyContent: 'center', alignSelf: 'center' }]}>Your session expired</Text>
                                <Text style={[commonStyles.normalFont, commonStyles.fontSize(2), { justifyContent: 'center', alignSelf: 'center' }]}>Login again to continue.</Text>
                                <View style={{ justifyContent: 'center', alignSelf: 'center', flexDirection: 'row', margin: wp('4%'), marginBottom: wp('10%'), marginTop: hp('5%') }}>
                                    <LinearGradient
                                        colors={[styleConstants.gradientStartColor, styleConstants.gradientEndColor]}
                                        start={{ x: 0.0, y: 0.25 }} end={{ x: 1.2, y: 1.0 }}
                                        style={[commonStyles.rh(7), commonStyles.center, , commonStyles.br(0.3), {
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
                                        <TouchableOpacity style={{ justifyContent: 'flex-start', alignSelf: 'center', padding: wp('5%'), borderRadius: 8 }}
                                            onPress={async () => {
                                                if (await this.checkInternet()) {
                                                    this.navigateToLogin()
                                                }
                                                else {
                                                    this.showMessage("No Internet Connectivity!")
                                                }
                                            }}>
                                            <Text style={[commonStyles.boldFont, { color: '#ffffff', justifyContent: 'center', alignSelf: 'center', marginHorizontal: wp('2%') }]}>OK</Text>
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
    calendarImage: {
        width: wp('5%'),
        height: hp('5%'),
        resizeMode: 'contain'
    },
    rectangleShapeFirst: {
        padding: 5,
        borderRadius: 5,
        marginBottom: 10,
        width: wp('35%'),
        height: hp('12%'),
        // borderWidth:1,
        // borderColor:'#e6e6e6',
        backgroundColor: '#FFFFFF',
    },
    rectangleShapeOthers: {
        padding: 5,
        borderRadius: 5,
        marginLeft: wp('5%'),
        width: wp('35%'),
        height: hp('12%'),
        backgroundColor: '#FFFFFF'
    },
    rectangleShapeLast: {
        padding: 5,
        borderRadius: 5,
        marginLeft: wp('5%'),
        width: wp('35%'),
        marginBottom: 10,
        height: hp('12%'),
        backgroundColor: '#FFFFFF'
    },
    circle: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center',
        alignSelf: 'flex-end',
        width: 17,
        height: 17,
        borderRadius: 50,
        backgroundColor: '#65CA8F'
    },
    rectangleShapeDashboardMenu: {
        flex: 1,
        borderRadius: 5,
        width: wp('42%'),
        height: hp('16%'),
        // borderWidth:1,
        // borderColor:'#e6e6e6',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center'
    },
    rectangleShapeDashboardMenuSecond: {
        flex: 1,
        marginLeft: wp('5%'),
        borderRadius: 5,
        paddingBottom: widthPercentageToDP('2%'),
        width: wp('42%'),
        height: hp('16%'),
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        // borderWidth:1,
        // borderColor:'#f2f2f2',
    },
    smallRectangleShapeWhite: {
        marginTop: 10,
        marginRight: 10,
        paddingTop: 2,
        paddingBottom: 2,
        paddingRight: 7,
        paddingLeft: 7,
        alignSelf: 'flex-end',
        borderRadius: 5,
        backgroundColor: '#ffffff',
    },
    smallRectangleShapeRed: {
        marginTop: wp('-2%'),
        marginRight: 10,
        paddingRight: 7,
        paddingLeft: 7,
        alignSelf: 'flex-end',
        borderRadius: 5,
        backgroundColor: '#EA5C5B',
    },
    RectangleShapeRed: {
        marginTop: hp('0.3%'),
        marginRight: 10,
        paddingRight: 7,
        paddingLeft: 7,
        alignSelf: 'flex-end',
        borderRadius: 5,
        backgroundColor: '#EA5C5B',
    },
    MenuImage: {
        width: wp('6%'),
        height: hp('6%'),
        resizeMode: 'contain'
    },
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
        position: "absolute",
        backgroundColor: 'rgba(0, 0, 0, 0)',
    },
    modal1: {
        maxHeight: 315,
        minHeight: 80
    },
    blankCircle: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center',
        alignSelf: 'flex-end',
        width: 17,
        height: 17,
        borderRadius: 50,
        backgroundColor: '#ffffff'
    },
});
const mapStateToProps = state => ({
    data: state.user.data
});

export default connect(
    mapStateToProps,
    null
)(withNavigation(DashboardScreen));