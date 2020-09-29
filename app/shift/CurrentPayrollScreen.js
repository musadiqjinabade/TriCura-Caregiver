import React from "react";
import { StyleSheet, View, Text, SafeAreaView, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import commonStyles from '../styles/Common';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ScrollView } from "react-native-gesture-handler";
import Header from '../core/components/Header';
import { withNavigation, StackActions, NavigationActions } from 'react-navigation';
import Globals from '../Globals';
import AsyncStorage from '@react-native-community/async-storage';
import LoadingIndicator from '../core/components/LoadingIndicator';
import { connect } from "react-redux";
import StyleConstants from '../styles/StyleConstants'
import NetInfo from "@react-native-community/netinfo";


class CurrentPayrollScreen extends React.Component {

    state = {
        expanded: true,
        loading: true,
        data: '',
        Currpay: false
    }

    async componentWillMount() {
        if (await this.checkInternet()) {

        var data = {}
        data.agency_logo = await AsyncStorage.getItem('agency_logo');
        data.agency_name = await AsyncStorage.getItem('agency_name');

        this.setState({ agency_details: data })
        if (this.props.navigation.state.params.item) {
            this.setState({ loading: true, data: this.props.navigation.state.params.item, Currpay: false }, () => {
                console.log('prop:', this.state.data)
                this.setState({ loading: false })
            })
        } else if (this.props.navigation.state.params.item1) {
            this.setState({ loading: true, Currpay: true }, () => {
                console.log('prop Currpay:', this.state.data)
                this.getPayroll()
                // this.setState({loading:false})
            })
        }
    }
    else{
        this.showToast("No Internet Connectivity!")
        this.setState({loading:false})

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


    async getPayroll() {
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        console.log("this.props.data.user", this.props.data.user)
        var url = Globals.httpMode + agency_code + Globals.domain + '/api/v1/users/' + Object.keys(this.props.data.user)[0] + "/payrolls";
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
                    this.setState({
                        data: response.data, loading: false
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

    total_hours(regular, overtime) {
        var data = regular + overtime;
        return data
    }

    render() {
        const { navigate } = this.props.navigation;
        var userData = null;
        var session = null;
        if (this.state.loading) {
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor,]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={this.state.Currpay ? "Current Payroll" : "Payroll"} expanded={true} onBack={() => {
                        this.props.navigation.goBack()
                    }} />
                    <View style={[styles.full, styles.center]}>
                        <ActivityIndicator
                            size='large'
                            color={StyleConstants.gradientStartColor}
                        />
                    </View>
                </SafeAreaView>
            )
        }
        else {

            userData = this.state.data[Object.keys(this.state.data)[0]]
            session = Object.keys(userData.sessions).map(key => ({ [key]: userData.sessions[key] }));


            console.log("userData:", userData.sessions)

            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={this.state.Currpay ? "Current Payroll" : "Payroll"} expanded={this.state.expanded} Agency_logo={this.state.agency_details} onBack={() => { this.props.navigation.goBack() }} />
                    <ScrollView showsVerticalScrollIndicator={false}>

                        <View style={[commonStyles.margin, commonStyles.column, commonStyles.full]}>
                            <Text style={[commonStyles.headerTextBoldFont]}>{this.state.Currpay ? 'Current Payroll Session' : moment(userData.start_date).format('DD MMM, YYYY') + ' - ' + moment(userData.end_date).format('DD MMM, YYYY')}</Text>

                            <View style={[styles.itemRectangleShape, commonStyles.column]}>
                                <View style={[{ flexDirection: 'row' }]} >
                                    <View style={{ paddingLeft: wp('3%'), paddingTop: wp('3%'), paddingRight: wp('3%'), flex: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
                                        <Text style={[styles.itemHeader]}>Shifts</Text>
                                    </View>
                                    <View style={[commonStyles.center, { justifyContent: 'center', alignItems: 'flex-end', marginRight: wp('3%') }]}>
                                        <Text style={[styles.itemValue]}>{userData ? userData.shifts_count : '--'}</Text>
                                    </View>
                                </View>
                                <View style={[{ flexDirection: 'row' }]} >
                                    <View style={{ paddingLeft: wp('3%'), paddingTop: wp('1%'), paddingRight: wp('3%'), flex: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
                                        <Text style={[styles.itemHeader]}>Hours</Text>
                                    </View>
                                    <View style={[commonStyles.center, { justifyContent: 'center', alignItems: 'flex-end', marginRight: wp('3%') }]}>
                                        <Text style={[styles.itemValue]}>{userData.hours == null ? '--' : userData.hours}</Text>
                                    </View>
                                </View>
                                <View style={[{ flexDirection: 'row' }]} >
                                    <View style={{ paddingLeft: wp('3%'), paddingTop: wp('1%'), paddingRight: wp('3%'), flex: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
                                        <Text style={[styles.itemHeader]}>Earned to Date</Text>
                                    </View>
                                    <View style={[commonStyles.center, { justifyContent: 'center', alignItems: 'flex-end', marginRight: wp('3%') }]}>
                                        <Text style={[styles.itemValue]}>${userData ? userData.amount : '---'}</Text>
                                    </View>
                                </View>
                                <View style={[{ flexDirection: 'row' }]} >
                                    <View style={{ paddingLeft: wp('3%'), paddingTop: wp('1%'), paddingRight: wp('3%'), paddingBottom: wp('3%'), flex: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
                                        <Text style={[styles.itemHeader]}>Scheduled Payroll Session</Text>
                                    </View>
                                    <View style={[commonStyles.center, { justifyContent: 'center', alignItems: 'flex-end', marginRight: wp('3%') }]}>
                                        <Text style={[styles.itemValue]}>{userData ? moment(userData.end_date).format('DD MMM, YYYY') : '---'}</Text>
                                    </View>
                                </View>
                            </View>

                            <Text style={[commonStyles.headerTextBoldFont]}>Session Details</Text>
                            {/* <View style={[styles.itemRectangleShape, commonStyles.column, { padding: wp('3%') }]}>
                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', }}>No Data</Text>
                            </View> */}
                            {/* <View style={[styles.itemRectangleShape, commonStyles.column, { padding: wp('3%') }]}> */}
                            <ScrollView>
                                {session.length > 0 ?
                                    <FlatList
                                        extraData={session ? session : null}
                                        data={session ? session : null}
                                        renderItem={({ item }) => {
                                            console.log("end_date item_data:", item[Object.keys(item)[0]].client_avatar_url)
                                            var shift = item[Object.keys(item)[0]].shift
                                            var start_time = shift[Object.keys(shift)[0]].start_time
                                            var end_time = shift[Object.keys(shift)[0]].end_time

                                            // var shifts_count = item[Object.keys(item)[0]].shifts_count
                                            // var Hours = item[Object.keys(item)[0]].hours
                                            // var sessions = item[Object.keys(item)[0]].sessions
                                            return (
                                                <TouchableOpacity onPress={() => navigate('PayrollSession', { item: item })} style={[styles.itemRectangleShape, commonStyles.column, { padding: wp('3%'), flexDirection: 'row',flex:1,justifyContent:'flex-start' }]}>
                                                    <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start', width: wp('11.5%') }}>
                                                        {
                                                            item[Object.keys(item)[0]].client_avatar_url ? <View>
                                                                <Image style={[styles.clientImage]}
                                                                    resizeMode={"cover"}
                                                                    resizeMethod={"resize"} // <-------  this helped a lot as OP said
                                                                    // progressiveRenderingEnabled={true}
                                                                    source={{ uri: item[Object.keys(item)[0]].client_avatar_url }} />
                                                            </View> :
                                                                <View style={[commonStyles.center, { width: wp('8%'), height: hp('4%'), backgroundColor: '#fff', borderColor: 'black', borderWidth: wp('0.1%'), borderRadius: 18 }]}>
                                                                    <Image style={[styles.clientImage]}
                                                                        resizeMode={"cover"}
                                                                        resizeMethod={"resize"} // <-------  this helped a lot as OP said
                                                                        // progressiveRenderingEnabled={true}
                                                                        source={require('../../assets/images/avatar.png')} />
                                                                </View>
                                                        }
                                                    </View>
                                                    <View style={{ margin: wp('1%') }}>
                                                        <Text style={{ marginTop: -2,flex:1, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', justifyContent: 'center' }}>{item[Object.keys(item)[0]].client_name}</Text>
                                                    </View>

                                                    <View style={{ margin: wp('1%'), justifyContent: 'flex-end', alignItems: 'flex-end',flex:1 }}>
                                                        <Text style={{ marginTop: -2,flex:1, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', justifyContent: 'center' }}>{this.total_hours(item[Object.keys(item)[0]].regular_hours,item[Object.keys(item)[0]].overtime_hours) + ' hours'}</Text>
                                                    </View>

                                                    <View style={{ margin: wp('1%'), justifyContent: 'flex-end', alignItems: 'flex-end',flex:1 }}>
                                                        <Text style={{ marginTop: -2,flex:1, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', justifyContent: 'flex-end' }}>{shift[Object.keys(shift)[0]].start_time ? moment(shift[Object.keys(shift)[0]].start_time).format('DD MMM, YYYY') : '---'}</Text>
                                                    </View>
                                                    {/* <View style={{margin:wp('1%')}}>
                                                <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', justifyContent: 'center' }}>{shift[Object.keys(shift)[0]].end_time?moment(shift[Object.keys(shift)[0]].end_time).format('DD MMM, YYYY'):'---' }</Text>
                                                </View> */}

                                                </TouchableOpacity>
                                            )
                                        }
                                        } /> :
                                    <View><View style={[styles.itemRectangleShape, commonStyles.column, { padding: wp('3%') }]}>
                                        <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', justifyContent: 'center' }}>{'No Session Details' || '---'}</Text>
                                    </View></View>}
                            </ScrollView>
                            {/* </View> */}
                        </View>
                    </ScrollView>
                </SafeAreaView>
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
    itemHeader: {
        fontFamily: 'Catamaran-Medium',
        color: '#293D68',
        fontSize: hp('2.2%')
    },
    itemValue: {
        fontFamily: 'Catamaran-Bold',
        color: '#828EA6',
        fontSize: hp('2.2%')
    },
    clientImage: {
        width: wp('8%'), height: hp('4%'),
        aspectRatio: 1,
        borderColor: '#fff',
        backgroundColor: '#CFCFCF',
        borderBottomLeftRadius: 14,
        borderBottomRightRadius: 14,
        borderTopRightRadius: 14,
        borderTopLeftRadius: 14,
    },

});
const mapStateToProps = state => ({
    data: state.user.data
});

export default connect(
    mapStateToProps,
    null
)(withNavigation(CurrentPayrollScreen));