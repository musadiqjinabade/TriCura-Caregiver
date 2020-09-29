import React from "react";
import { StyleSheet, View, ScrollView, Text, SafeAreaView, Image, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import commonStyles from '../styles/Common';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, widthPercentageToDP } from 'react-native-responsive-screen';
import { withNavigation, StackActions, NavigationActions } from 'react-navigation';
import Globals from '../Globals';
import AsyncStorage from '@react-native-community/async-storage';
import LoadingIndicator from '../core/components/LoadingIndicator';
import { connect } from "react-redux";
import StyleConstants from '../styles/StyleConstants'
import { Toast } from 'native-base';
import Header from '../core/components/Header';
import request from "superagent";
import NetInfo from "@react-native-community/netinfo";



class NotificationScreen extends React.Component {

    state = {
        loading: true,
        data: [],
        per_page: 10,
        page_no: 0,
        expanded:true
    }

    _onRefresh = () => {
        this.setState({ loading: true, page_no:0 }, async() => {
            if (await this.checkInternet()) {

            this.getCurrentData();
            }
            else{
                this.setState({loading:false})
                this.showMessage("No Internet Connectivity!")

            }
        })
    }


   async componentWillMount() {
    if (await this.checkInternet()) {

        var data={}
        data.agency_logo = await AsyncStorage.getItem('agency_logo');
        data.agency_name = await AsyncStorage.getItem('agency_name');
        
        this.setState({agency_details:data})

        this.setState({ loading: true }, () => {
            this.getCurrentData();
        })
        this.props.navigation.addListener('didFocus', () => {
            // console.log("didFocus is working")
            this.setState({ loading: true, page_no: 0 }, () => {
                this.getCurrentData();
            })
        });
    }
    else{
        this.setState({loading:false})
        this.showMessage("No Internet Connectivity!")

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

    showMessage(message) {
        Toast.show({
            text: message,
            duration: 2000
        })
    }

    async getCurrentData() {
        this.state.page_no = this.state.page_no + 1;
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = Globals.httpMode + agency_code + Globals.domain + '/api/v1/notices?page=' + this.state.page_no + '&per_page=' + this.state.per_page;
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
            console.log("token : ", access_token);
            try {
                var response = await axios.get(url, {
                    headers: headers
                })
                if (response.status === 200) {
                    console.log("data : ", response.data)
                    if (response.data !== null) {
                        this.setState({

                            data: response.data, loading: false
                        })
                    } else { this.setState({page_no: this.state.page_no - 1}) }
                }
                else {
                    this.showMessage("Invalid Credentials");
                }
            }
            catch (error) {
                console.log("error1 : ", error);
                if(error = 'Error: Request failed with status code 401'){
                    this.navigateToLogin()
                }
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

    async loadMore() {
        this.setState({page_no: this.state.page_no + 1})
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = Globals.httpMode + agency_code + Globals.domain + '/api/v1/notices?page=' + this.state.page_no + '&per_page=' + this.state.per_page;
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
                    if (response.data !== null) {
                        this.setState({

                            data: this.state.data.concat(response.data), loading: false
                        })
                    }
                    else {
                        // this.state.page_no = this.state.page_no - 1;
                        this.setState({page_no: this.state.page_no - 1})
                    }
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

    async check_data(item){
        var request = require('superagent');
        var access_token = this.props.data.access_token;
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = Globals.httpMode + agency_code + Globals.domain + '/api/v1/notices/'+item.id;
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
                    this.showMessage(res.body.message);
                    this.setState({ loading: true, page_no: 0 }, () => {
                        this.getCurrentData()
                    })
                })
        });
    }

    render() {
        const { navigate } = this.props.navigation;

        if (this.state.loading) {
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor]}>
                <Header onLogo={() => this.navigateToDashboard()} label={'Notification'} expanded={this.state.expanded}/>
                <LoadingIndicator />
                </SafeAreaView>)
        }
        else {
            console.log('inside render ');
            var temp = this.state.data;
            console.log('temp = ', temp);
            var clientData = [];
            for (var k of Object.keys(temp)) {
                if (k !== 'meta') {
                    clientData.push({
                        ...temp[k],
                        id: k
                    })
                }
            }

            console.log("notification data : ", clientData)
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor]}>
                <Header onLogo={() => this.navigateToDashboard()} label={'Notification'} expanded={this.state.expanded} Agency_logo={this.state.agency_details}/>

                    <ScrollView showsVerticalScrollIndicator={false}
                     refreshControl={
                        <RefreshControl
                            refreshing={this.state.loading}
                            onRefresh={this._onRefresh}
                            colors={["#4254C5"]}
                        />}>
                        <View style={[commonStyles.margin, commonStyles.column, commonStyles.full]}>
                            {clientData.length > 0?
                            <FlatList
                            inverted={true}
                                data={clientData}
                                renderItem={({ item }) => {
                                    var userData_id = item.assigned_shift?item.assigned_shift[_.keys(item.assigned_shift)[0]]:null;
                                    var userData = userData_id?userData_id.client[_.keys(userData_id.client)[0]]:null;
                                    var name = userData?userData.name:item.name;
                                    var words = name!=null?name.split(' '):null;
                                    console.log('indi item ', userData_id);
                                    console.log("item.start_time:", words);
                                    return (
                                        <View style={[commonStyles.full]}>
                                            {
                                                <TouchableOpacity 
                                                onPress={async () => {
                                                    //console.log("internet : ", await this.checkInternet());
                                                    if (await this.checkInternet()) {
                                                        item.notice_type=='Immediate Shift'?navigate('Immediateshift',{item:item}):item.notice_type=='Shift Changed'?navigate('ShiftChanged',{item:item}):item.notice_type=='You Received A New Shift'?navigate('ShiftChanged',{item:item}):null
                                                    }else{
                                                        this.showMessage("No Internet Connectivity!")
        
                                                    }}}
                                                style={[{ flexDirection: 'column', paddingTop: wp('1.8%'),paddingRight: wp('3%'),paddingLeft: wp('3%'),paddingBottom: wp('3%') }, styles.itemRectangleShape]}>
                                                    <View style={[{ flexDirection: 'row',justifyContent:'space-between' }]} >
                                                        <View style={[commonStyles.row, { padding: wp('2%'), justifyContent: 'flex-start', alignItems: 'center' }]}>
                                                            {
                                                                userData && userData.avatar_url ? (<View style={[styles.clientImage, commonStyles.center ]}>
                                                                    <Image style={{
                                                                    width: wp('5%'), height: hp('6%'),
                                                                    aspectRatio: 1,
                                                                    borderColor: '#fff',
                                                                    backgroundColor:'#CFCFCF',
                                                                    resizeMode: 'contain',
                                                                    borderBottomLeftRadius: 5,
                                                                    borderBottomRightRadius: 5,
                                                                    borderTopRightRadius: 5,
                                                                    borderTopLeftRadius: 5,
                                                                    }}
                                                                        resizeMode={"cover"}
                                                                        resizeMethod={"resize"} // <-------  this helped a lot as OP said
                                                                        // progressiveRenderingEnabled={true}
                                                                        source={{ uri: userData.avatar_url }} />
                                                                </View>) : (
                                                                        <View style={[styles.clientImage, commonStyles.center, { backgroundColor: '#f9f9f9', borderColor: '#222', borderWidth: wp('0.1%') }]}>
                                                                            <Text style={[commonStyles.fs(3), { color: StyleConstants.gradientStartColor }]}>{userData?userData.name.charAt(0).toUpperCase():item.name.charAt(0).toUpperCase()}</Text>
                                                                        </View>
                                                                    )
                                                            }
                                                            <View style={{flexDirection:'column', marginLeft: widthPercentageToDP('4%')}}>
                                                            <Text style={{ marginLeft: wp('2.5%'), fontSize: hp('2.2%'), color: '#293D68', fontFamily: 'Catamaran-Regular', }}>{words[0].charAt(0).toUpperCase() + words[0].slice(1)+' '+ words[1].slice(0,1).toUpperCase()|| '---'}</Text>
                                                            <View style={[commonStyles.full, commonStyles.column, { marginRight: wp('1%'),marginLeft: wp('2.5%'), }]}>
                                                            <View style={[commonStyles.row, commonStyles.center, commonStyles.full, { justifyContent: 'flex-end' }]}>
                                                                <Image style={[styles.smallImage]}
                                                                    resizeMode={"cover"}
                                                                    resizeMethod={"resize"} // <-------  this helped a lot as OP said
                                                                    // progressiveRenderingEnabled={true}
                                                                    source={require('../../assets/images/calendar.png')} />
                                                                <Text style={[{ textAlignVertical: 'center', fontSize: hp('1.6%'), textAlign: 'center', color: '#828EA5', fontFamily: 'Catamaran-Regular', marginLeft:widthPercentageToDP('2%')}]}>{moment(item.date).format("MMM DD, YYYY, hh:mm a")}</Text>
                                                            </View>
                                                        </View>

                                                            </View>
                                                        </View>
                                                        <View style={[commonStyles.row, { padding: wp('2%'), justifyContent: 'flex-end', alignItems: 'center' }]}>
                                                        {item.notice_type=='Shift Canceled' || item.notice_type=='You Did Not Receive The Shift With' || item.notice_type=='Alert'?
                                                            <TouchableOpacity style={{justifyContent: 'flex-end',alignContent:'flex-end'}}
                                                            onPress={async () => {
                                                                //console.log("internet : ", await this.checkInternet());
                                                                if (await this.checkInternet()) {
                                                                    this.check_data(item)
                                                                }else{
                                                                    this.showMessage("No Internet Connectivity!")
                    
                                                                }}} >
                                                                <Image style={{ justifyContent: 'flex-end',alignSelf:'flex-end', width: wp('2.5%'), height: hp('2.5%'), aspectRatio: 1, }}
                                            source={require('../../assets/images/gray-check.png')} />
                                                            </TouchableOpacity>:null}
                                                            </View>
                                                    </View>

                                                    <View style={styles.line} />
                                                    <View style={[commonStyles.full, commonStyles.column]}>
                                                        <View style={[commonStyles.row, commonStyles.full,{justifyContent:'space-between'}]}>
                                                            <Text style={[{ fontSize: hp('1.9%'),  color: '#293D68', fontFamily: 'Catamaran-Bold', }, commonStyles.ml(1)]}>Title : </Text>
                                                            <Text style={[{ fontSize: hp('1.9%'),width:wp('58%'),  color: '#293D68', fontFamily: 'Catamaran-Regular', }, commonStyles.ml(0.2)]}>{item.title}</Text>
                                                        </View>
                                                    </View>
                                                    <View style={[commonStyles.full, commonStyles.column]}>
                                                        <View style={[commonStyles.row, commonStyles.full, {justifyContent:'space-between'}]}>
                                                            <Text style={[{fontSize: hp('1.9%'), color: '#293D68', fontFamily: 'Catamaran-Bold', }, commonStyles.ml(1)]}>Description : </Text>
                                                            <Text style={[{fontSize: hp('1.9%'),width:wp('58%'), color: '#293D68', fontFamily: 'Catamaran-Regular', }, commonStyles.ml(0.2)]}>{item.title=='Shift Changed'?moment(item.description).format("MMM DD, YYYY"):item.description}</Text>
                                                        </View>
                                                    </View>
                                                    <View style={[commonStyles.full, commonStyles.column ]}>
                                                        <View style={[commonStyles.row, commonStyles.full , { justifyContent:'space-between'}]}>
                                                            <Text style={[{ fontSize: hp('1.9%'),  color: '#293D68', fontFamily: 'Catamaran-Bold', }, commonStyles.ml(1)]}>Notice Type : </Text>
                                                            <Text style={[{ fontSize: hp('1.9%'),width:wp('58%'), color: '#293D68', fontFamily: 'Catamaran-Regular', }, commonStyles.ml(0.2)]}>{item.notice_type}</Text>
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>

                                            }
                                        </View>
                                    )
                                }}
                                keyExtractor={(item, index) => index.toString()}
                                // ItemSeparatorComponent={this.renderSeparator}
                                // ListFooterComponent={this.renderFooter.bind(this)}
                                // onEndReachedThreshold={0.4}
                                onEndReached={() => {
                                    this.loadMore()
                                }}
                            />:<View style={[commonStyles.margin, commonStyles.full, { justifyContent: 'center', alignItems: 'center' }]}>
                            <Text style={{ marginTop: hp('5%'), justifyContent: 'center', alignItems: 'center', fontSize: hp('2.3%'), color: '#293D68', fontFamily: 'Catamaran-Regular' }}>No Data found</Text>
                        </View>}
                        </View>
                    </ScrollView>
                </SafeAreaView>
            );
        }

    }
}

const styles = StyleSheet.create({
    line: {
        borderWidth: 0.25,
        borderColor: '#828EA5',
        marginLeft: wp('1%'),
        marginRight: wp('1%'),
        marginBottom: wp('1.5%'),
        marginTop:wp('2%')
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
    clientImage: {
        width: wp('9%'), height: hp('9%'),
        aspectRatio: 1,
        borderColor: '#fff',
        resizeMode:'contain',
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
});

const mapStateToProps = state => ({
    data: state.user.data
});

export default connect(
    mapStateToProps,
    null
)(withNavigation(NotificationScreen));