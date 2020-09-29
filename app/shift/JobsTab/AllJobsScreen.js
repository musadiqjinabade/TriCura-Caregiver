import React from "react";
import { StyleSheet, View, Image, SafeAreaView, Text, TouchableOpacity, FlatList, Platform, Linking, TouchableOpacityBase, RefreshControl } from 'react-native';
import commonStyles from '../../styles/Common';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, widthPercentageToDP } from 'react-native-responsive-screen';
import { ScrollView } from "react-native-gesture-handler";
import { withNavigation, StackActions, NavigationActions } from 'react-navigation';
import Globals from '../../Globals';
import AsyncStorage from '@react-native-community/async-storage';
import LoadingIndicator from '../../core/components/LoadingIndicator';
import { connect } from "react-redux";
import StyleConstants from "../../styles/StyleConstants";
import NetInfo from "@react-native-community/netinfo";
import { Toast, CheckBox } from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import ToggleSwitch from "toggle-switch-react-native";

class AllJobsScreen extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            data: [],
            per_page: 10,
            page_no: 0,
            isPetToggleSwitch: false,
            curloading: false,
            toggleloading: false
        }
    }

    componentWillMount() {
        this.setState({ loading: true }, async () => {
            if (await this.checkInternet()) {
                this.getCurrentData();
            }
            else {
                this.showMessage("No Internet Connectivity!")
                this.setState({ loading: false })

            }
        })
        this.props.navigation.addListener('didFocus', () => {
            // console.log("didFocus is working")
            this.setState({ curloading: true, page_no: 0 })
            this.getCurrentData();
            this.props.onAssignToMe()
        });
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
    _onRefresh = () => {
        this.setState({ curloading: true, loading: true, page_no: 0 }, () => {
            this.getCurrentData();
            this.setState({ curloading: false })
        });
    }


    async getCurrentData() {
        if (await this.checkInternet()) {
            this.state.page_no = this.state.page_no + 1;
            const axios = require('axios');
            var agency_code = await AsyncStorage.getItem('agency_code');
            var url = null
            this.state.isPetToggleSwitch ?
            url = Globals.httpMode + agency_code  + Globals.domain + '/api/v1/jobs?page=' + this.state.page_no + '&per_page=' + this.state.per_page + '&job_type=open&is_urgent=true':
            url = Globals.httpMode + agency_code  + Globals.domain + '/api/v1/jobs?page=' + this.state.page_no + '&per_page=' + this.state.per_page + '&job_type=open'
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
                try {
                    var response = await axios.get(url, {
                        headers: headers
                    })
                    if (response.status === 200) {
                        console.log("data : ", response.data)
                        if (response.data !== null) {
                            this.setState({

                                data: response.data.open_shifts, loading: false, curloading: false, toggleloading: false
                            })
                        }
                        else {
                            this.state.page_no = this.state.page_no - 1;
                        }
                    }
                    else {
                        this.showMessage("Invalid Credentials");
                    }
                }
                catch (error) {
                    console.log("error : ", error);
                    this.setState({loading: false, curloading: false, toggleloading: false})

                }
            }
            catch (e) {
                var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
                this.setState({
                    loading: false, curloading: false, toggleloading: false
                })
                this.showMessage(error);
            }

        } else {
            this.showMessage("No Internet Connectivity!")

        }

    }

    showMessage(message) {
        Toast.show({
            text: message,
            duration: 2000
        })
    }

    showToast(message) {
        Toast.show({
            text: message,
            duration: 2000
        })
    }

    async loadMore() {
        this.state.page_no = this.state.page_no + 1;
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = null

        this.state.isPetToggleSwitch ?
        url = Globals.httpMode + agency_code  + Globals.domain + '/api/v1/jobs?page=' + this.state.page_no + '&per_page=' + this.state.per_page + '&job_type=open&is_urgent=true':
        url = Globals.httpMode + agency_code  + Globals.domain + '/api/v1/jobs?page=' + this.state.page_no + '&per_page=' + this.state.per_page + '&job_type=open'
        console.log("url : ", url);

        try {

            var access_token = this.props.data.access_token;
            console.log("acc : ", access_token);
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
                console.log('response:', response)
                if (response.status === 200) {
                    if (response.data !== null) {
                        this.setState({

                            data: this.state.data.concat(response.data.open_shifts), loading: false, toggleloading: false
                        })
                    }
                    else {
                        this.state.page_no = this.state.page_no - 1;
                    }
                }
                else {
                    this.showMessage("Invalid Credentials");
                }
            }
            catch (error) {
                console.log("error : ", error);
                this.setState({loading: false, curloading: false, toggleloading: false})

            }
        }
        catch (e) {
            var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
            this.setState({
                loading: false, curloading: false, toggleloading: false
            })
            this.showMessage(error);
        }
    }

    pstToLocal(start_time) {
        var time = null;

        this.state.shift_date = moment(start_time).format("DD-MM-YYYY");
        time = moment(start_time).format('hh:mm a');

        return time;
    }

    async accept_shift(id,notice_id){
        console.log('item:',id)
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');

        var url = Globals.httpMode + agency_code  + Globals.domain + '/api/v1/shifts/' + id + '/act';
        console.log("url : ", url);

        try {

            var access_token = this.props.data.access_token;
            console.log("acc : ", access_token);
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'App-Token': '96ef950f-bfae-4ee5-89a0-f23ab9e50b96',
                'Authentication-Token': access_token
            }
            var requestBody = qs.stringify({
                'shift_action': 'caregiver apply'
            });
            console.log("token : ", access_token);
            try {
                var response = await axios.put(url, requestBody, {
                    headers: headers
                })
                if (response) {
                    console.log("data : ", response)
                    this.updatedata(notice_id)
                    
                    // this.props.navigation.goBack()

                }
            }
            catch (error) {
                this.showMessage(error);

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


    async updatedata(id){
        const { navigate } = this.props.navigation;
        var request = require('superagent');
        var access_token = this.props.data.access_token;
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = Globals.httpMode + agency_code  + Globals.domain + '/api/v1/notices/'+id;
        return new Promise((resolve, reject) => {
            request
                .put(url)
                .set('Content-Type', 'application/json')
                .set('App-Token','96ef950f-bfae-4ee5-89a0-f23ab9e50b96')
                .set('Authentication-Token',access_token)
                .end((err, res) => {
                    if(err){
                        return reject(err);
                    }
                    console.log('resolve:',res)
                    this.setState({page_no:0},()=>{
                        this.showMessage(response.data.message);
                        this.getCurrentData()
                        // navigate('JobsScreen')
                        this.props.onAssignToMe()
                        
                    })
                })
        });
    }

    async is_acknowlege(id,notice_id){
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = Globals.httpMode + agency_code  + Globals.domain + '/api/v1/shifts/'+ id+'/act';
        console.log("url : ", url);

        try {

            var access_token = this.props.data.access_token;
            console.log("acc : ", access_token);
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'App-Token': '96ef950f-bfae-4ee5-89a0-f23ab9e50b96',
                'Authentication-Token': access_token
            }
            var requestBody = qs.stringify({
                'shift_action': 'caregiver acknowledge'
            });
            console.log("token : ", access_token);
            try {
                var response = await axios.put(url, requestBody, {
                    headers: headers
                })
                if(response){
                    console.log("data : ", response.data)
                    this.showMessage(response.data.message);

                    // if(response.data.message=='Update successfully'){
                        this.updatedata(notice_id)
                    // }

                    // this.setState({page_no:0},()=>{
                    //     // this.showMessage(response.data.message);
                    //     this.getCurrentData()
                    //     // this.props.navigation.navigate('JobsScreen')
                    // })
                    // this.props.navigation.goBack()
                }
            }
            catch (error) {
                this.showMessage(error);
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

    render() {
        const { navigate } = this.props.navigation;

        if (this.state.loading) {
            return <LoadingIndicator />
        }
        else {
            var clientData = this.state.data;
            // var allCountData = this.state.data.open_shifts_count;
            // console.log("count : ", clientData[0].location)
            return (
                <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: widthPercentageToDP('3%') }}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.curloading}
                            onRefresh={this._onRefresh}
                            colors={["#4254C5"]}
                        />}>
                    <View style={{ flex: 1, marginLeft: wp('5%'), justifyContent: 'flex-start', alignItems: 'flex-start', alignContent: 'flex-start', alignSelf: 'flex-start', flexDirection: 'row' }}>
                        <ToggleSwitch
                            isOn={this.state.isPetToggleSwitch}
                            onToggle={isPetToggleSwitch => {
                                this.setState({ isPetToggleSwitch, data: '', toggleloading: true, page_no: 0 }, () => {
                                    console.log("toggle:", this.state.isPetToggleSwitch)
                                    this.getCurrentData();
                                });
                                // this.setState({toggleloading:false})
                            }}
                            onColor='#4f60c9'
                            offColor='#969089'
                            size='medium'
                        />
                        <Text style={{ marginLeft: wp('2%'), marginTop: Platform.OS === 'android' ? hp('-0.2%') : hp('0.4%'), fontSize: hp('2%'), color: this.state.isPetToggleSwitch ? '#4f60c9' : '#828EA5', fontFamily: 'Catamaran-Regular', }}>{'Show Urgent Only'}</Text>
                    </View>
                    {this.state.toggleloading ? <LoadingIndicator /> : null}

                    {clientData.length > 0 ?
                        <FlatList
                            data={clientData}
                            renderItem={({ item }) => {
                                var userData = item.client[_.keys(item.client)[0]];
                                var name = userData.name
                                        var words = name.split(' ');
                                        console.log("item address",item, 'data', userData.small_address!= ""?userData.small_address:'---')
                                return (
                                    <TouchableOpacity style={[commonStyles.margin, commonStyles.full]} onPress={() => { 
                                        navigate('Applyshift',{item:item})
                                        }}>
                                        <View style={[commonStyles.coloumn, {
                                            padding: wp('3%'), marginTop: wp('3%'),
                                            borderWidth: 0.01,
                                            borderBottomLeftRadius: item.is_acknowlege ? null : 5,
                                            borderBottomRightRadius: item.is_acknowlege ? null : 5,
                                            borderTopRightRadius: 5,
                                            borderTopLeftRadius: 5,
                                            backgroundColor: '#fff',
                                            borderColor: '#fff'
                                        }]}>
                                            <View style={[commonStyles.row, commonStyles.full, { justifyContent: 'flex-start', alignItems: 'center' }]}>
                                                {
                                                    item.client[_.keys(item.client)[0]].avatar_url ? <View>
                                                        <Image style={[styles.clientImage]}
                                                            source={{ uri: item.client[_.keys(item.client)[0]].avatar_url }} />
                                                    </View> : (
                                                            <View style={[commonStyles.center, { width: wp('12.5%'), height: hp('6%'), backgroundColor: '#f1f2f4', borderColor: '#c7c7c7', borderWidth: wp('0.1%'), borderRadius: 5 }]}>
                                                                <Text style={[commonStyles.fs(3.2), { color: StyleConstants.gradientStartColor }]}>{item.client[_.keys(item.client)[0]].name.charAt(0).toUpperCase()}</Text>
                                                            </View>
                                                        )
                                                }
                                                <View style={[commonStyles.coloumn, commonStyles.full, { marginLeft: wp('2.5%') }]}>
                                                    <View style={[commonStyles.row]}>
                                                        <Text style={{ flex: 4, justifyContent: 'center', alignItems: 'flex-start', fontSize: hp('2.2%'), color: '#293D68', fontFamily: 'Catamaran-Regular' }}>{ words[0].charAt(0).toUpperCase() + words[0].slice(1)+' '+ words[1].slice(0,1).toUpperCase() || '---'}</Text>
                                                        <View style={[{ justifyContent: 'flex-end', alignItems: 'flex-end', alignSelf: 'flex-end', flexDirection: 'row', flex: item.is_open?null:1 }]}>
                                                            {
                                                                item.is_open ? <View style={{
                                                                    width: wp('20%'),paddingHorizontal:5,
                                                                    height: hp('4%'), backgroundColor: '#F86D6D', justifyContent: 'center',alignSelf:'center',borderRadius: 12
                                                                }}><Text style={{ justifyContent: 'center', alignSelf: 'center',fontFamily: 'Catamaran-bold',paddingHorizontal: wp('2%'),color:'#fff'  }}>Open</Text></View> : <View style={{ flex: 1 }}></View>}
                                                            {
                                                                item.is_acknowlege ?
                                                                    item.urgent ? <View style={{width: wp('3%'),
                                                                        height: wp('3%'),
                                                                        borderRadius: 3,
                                                                        backgroundColor: '#EA5C5B', marginBottom: hp('2%'), marginLeft: hp('2%')
                                                                    }} /> : <View style={{
                                                                        width: wp('3%'),
                                                                        height: wp('3%'),
                                                                        borderRadius: 3,
                                                                        backgroundColor: '#90C6A6', marginBottom: hp('2%'), marginLeft: wp('2%')
                                                                    }} />
                                                                    : item.urgent ? <View style={{
                                                                        width: wp('3%'),
                                                                        height: wp('3%'),
                                                                        borderRadius: 3,
                                                                        backgroundColor: '#EA5C5B', marginBottom: hp('2%'), marginLeft: hp('2%')
                                                                    }} /> : <View style={{
                                                                        width: wp('3%'),
                                                                        height: wp('3%'),
                                                                        borderRadius: 3,
                                                                        backgroundColor: '#90C6A6', marginBottom: hp('2%'), marginLeft: wp('2%')
                                                                    }} />
                                                            }
                                                        </View>
                                                    </View>

                                                    <Text style={{ marginTop: -7, fontSize: hp('1.8%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', }}>Client</Text>
                                                </View>
                                            </View>

                                            <View style={{ marginTop: wp('2%') }}>

                                                <View style={styles.line} />

                                                <View style={[commonStyles.full, commonStyles.row, commonStyles.mt(1.5)]}>
                                                    <View style={[commonStyles.row, commonStyles.center, commonStyles.full, { justifyContent: 'flex-start' }]}>
                                                        <Image style={[styles.smallImage]}
                                                            source={require('../../../assets/images/clock.png')} />
                                                        <Text style={[{ textAlignVertical: 'center', fontSize: hp('1.7%'), textAlign: 'center', color: '#828EA5', fontFamily: 'Catamaran-Regular', }, commonStyles.ml(1)]}>{this.pstToLocal(item.start_time) + " - " + this.pstToLocal(item.end_time)}</Text>
                                                    </View>

                                                    <View style={[commonStyles.row, commonStyles.center, commonStyles.full, { justifyContent: 'flex-end' }]}>
                                                        <Image style={[styles.smallImage]}
                                                            source={require('../../../assets/images/calendar.png')} />
                                                        <Text style={[{ textAlignVertical: 'center', fontSize: hp('1.7%'), textAlign: 'center', color: '#828EA5', fontFamily: 'Catamaran-Regular', }, commonStyles.ml(1)]}>{moment(item.start_time).format("LL")}</Text>
                                                    </View>
                                                </View>

                                                <View style={[commonStyles.full, commonStyles.row, commonStyles.mt(0.4), { flex: 1 }]}>
                                                    <View style={[commonStyles.row, commonStyles.full, { justifyContent: 'flex-start' }]}>

                                                        <Image style={[styles.smallImage, { marginTop: 6 }]}
                                                            source={require('../../../assets/images/location.png')} />
                                                        <TouchableOpacity onPress={() => {
                                                            const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
                                                            const latLng = `${item.latitude},${item.longitude}`;
                                                            const label = 'Custom Label';
                                                            const url = Platform.select({
                                                                ios: `${scheme}${item.is_previous_cg?item.location != null || item.location != ""? item.location : '---':userData.small_address!= null?userData.small_address:'---'}`,
                                                                android: `${scheme}${item.is_previous_cg?item.location != null ? item.location : '---':userData.small_address!= null || userData.small_address!= "" ?userData.small_address:'---'}`
                                                            });
                                                            Linking.openURL(url);
                                                        }}>
                                                            <Text numberOfLines={2} style={[{ textAlignVertical: 'center', fontSize: hp('1.9%'), textAlign: 'left', color: '#828EA5', fontFamily: 'Catamaran-Regular', color: '#41A2EB', textDecorationLine: item.is_previous_cg?(item.location != null || item.location != "" ? 'underline' : null):userData.small_address!= "" ?'underline':null }, commonStyles.ml(1)]}>{item.is_previous_cg?(item.location != null || item.location != "" ? item.location : '---'):userData.small_address!= "" ?userData.small_address:'---'}</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                    <View style={{flex:1}}></View>
                                                </View>

                                            </View>
                                        </View>
                                        {item.is_acknowlege ?
                                            <View style={{ flex: 1, height: hp('7%'), justifyContent: 'center', alignSelf: 'center', flexDirection: 'row', backgroundColor: '#ececec',borderBottomLeftRadius:5,
                                            borderBottomRightRadius:5,borderWidth:0.3,
                                            borderColor:'#cccccc',}}>

                                                <TouchableOpacity style={{ flex: 1, padding: 5, paddingHorizontal: wp('5%'), borderBottomLeftRadius:5,
                                            borderBottomRightRadius:5, justifyContent: 'center', alignSelf: 'center' }} onPress={() => { this.is_acknowlege(item.id,item.notice_id) }}>
                                                    <Text style={{ fontSize: hp('2.4%'), color: '#48A970', fontFamily: 'Catamaran-bold', alignment: 'center', justifyContent: 'center', alignSelf: 'center' }}>Acknowledge</Text>
                                                </TouchableOpacity></View> : null}
                                        {/* {item.is_open ?
                                    <View style={{ flex: 1, height: hp('7%'), justifyContent: 'space-between', alignSelf: 'center', flexDirection: 'row', backgroundColor: '#ececec',borderBottomLeftRadius:5,
                                    borderBottomRightRadius:5,borderWidth:0.3,
                                    borderColor:'#cccccc',}}>

                                        <TouchableOpacity style={{ flex: 1, paddingHorizontal: wp('5%'), borderBottomLeftRadius:5,borderRightWidth:0.3,
                                    borderColor:'#cccccc',
                                    borderBottomRightRadius:5, justifyContent: 'center', alignSelf: 'center' }} >
                                            <Text style={{ fontSize: hp('2.4%'), color: '#1F99BB', fontFamily: 'Catamaran-bold', alignment: 'center', justifyContent: 'center', alignSelf: 'center' }}>Accept</Text>
                                        </TouchableOpacity><TouchableOpacity style={{ flex: 1, paddingHorizontal: wp('5%'), borderBottomLeftRadius:5,
                                    borderColor:'#cccccc',
                                    borderBottomRightRadius:5, justifyContent: 'center', alignSelf: 'center' }} >
                                            <Text style={{ fontSize: hp('2.4%'), color: '#F86D6D', fontFamily: 'Catamaran-bold', alignment: 'center', justifyContent: 'center', alignSelf: 'center' }}>No Thanks!</Text>
                                        </TouchableOpacity></View> : null} */}
                                    </TouchableOpacity>
                                )
                            }}
                            keyExtractor={(item, index) => index.toString()}
                            // ItemSeparatorComponent={this.renderSeparator}
                            // ListFooterComponent={this.renderFooter.bind(this)}
                            // onEndReachedThreshold={0.4}
                            onEndReached={() => {
                                this.loadMore()
                            }}
                        /> :
                        <View style={[commonStyles.margin, commonStyles.full, { justifyContent: 'center', alignItems: 'center' }]}>
                            <Text style={{ marginTop: hp('5%'), justifyContent: 'center', alignItems: 'center', fontSize: hp('2.3%'), color: '#293D68', fontFamily: 'Catamaran-Regular' }}>No Data found</Text>
                        </View>
                    }
                </ScrollView>
            );
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
    clientImage: {
        width: wp('5%'), height: hp('6%'),
        aspectRatio: 1,
        borderColor: '#fff',
        backgroundColor: '#CFCFCF',
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        borderTopRightRadius: 5,
        borderTopLeftRadius: 5,
    },
    smallRectangleShapeRed: {
        width: wp('3%'),
        height: wp('3%'),
        borderRadius: 3,
        backgroundColor: '#EA5C5B',
    },
    smallRectangleShapeGreen: {
        width: wp('3%'),
        height: wp('3%'),
        borderRadius: 3,
        backgroundColor: '#90C6A6',
    },
    smallImage: {
        width: wp('3%'),
        height: hp('3%'),
        aspectRatio: 1,
    },
    line: {
        borderWidth: 0.25,
        borderColor: '#828EA5',
    },
    smallRectangleShapeGreen: {
        width: wp('3%'),
        height: wp('3%'),
        borderRadius: 3,
        backgroundColor: '#90C6A6',
    },
});
const mapStateToProps = state => ({
    data: state.user.data
});

export default connect(
    mapStateToProps,
    null
)(withNavigation(AllJobsScreen));