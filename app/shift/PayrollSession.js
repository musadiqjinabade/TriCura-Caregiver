import React from "react";
import { StyleSheet, View, Text, SafeAreaView, FlatList, ActivityIndicator, Image, Platform } from 'react-native';
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

class PayrollSession extends React.Component {

    state = {
        expanded: true,
        loading: true,
        data: '',
        Currpay: false
    }

    async componentWillMount() {
        var data = {}
        data.agency_logo = await AsyncStorage.getItem('agency_logo');
        data.agency_name = await AsyncStorage.getItem('agency_name');

        this.setState({ agency_details: data })
        var Payroll_data = ''
        Payroll_data = this.props.navigation.state.params.item
        this.setState({ loading: true, data: Payroll_data[Object.keys(Payroll_data)[0]] }, () => {
            console.log('prop:', this.state.data)
            this.setState({ loading: false })
        })
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

    render() {
        const { navigate } = this.props.navigation;
        var userData = null;
        var session = null;
        if (this.state.loading) {
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor,]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={"Session Details"} expanded={true} onBack={() => {
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
            userData = this.state.data;
            console.log("userdata:", userData.client_name)
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={"Session Details"} expanded={this.state.expanded} Agency_logo={this.state.agency_details} onBack={() => { this.props.navigation.goBack() }} />
                    <ScrollView showsVerticalScrollIndicator={false} >

                        <View style={[commonStyles.margin, commonStyles.column, commonStyles.full]}>

                            <View style={[styles.itemRectangleShape, commonStyles.column, { padding: wp('3%'), flexDirection: 'column', flex: 1 }]}>
                                <View style={{ flexDirection: 'row', marginVertical: wp('2%') }}>
                                    <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start', width: wp('11.5%') }}>
                                        {
                                            userData.client_avatar_url ? <View>
                                                <Image style={[styles.clientImage]}
                                                    resizeMode={"cover"}
                                                    resizeMethod={"resize"} // <-------  this helped a lot as OP said
                                                    // progressiveRenderingEnabled={true}
                                                    source={{ uri: userData.client_avatar_url }} />
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
                                        <Text style={{ marginTop: -2, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', justifyContent: 'center' }}>{userData.client_name}</Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', marginVertical: wp('2%') }}>
                                    <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start', width: wp('11.5%') }}>
                                        {
                                            userData.caregiver_avatar_url ? <View>
                                                <Image style={[styles.clientImage]}
                                                    resizeMode={"cover"}
                                                    resizeMethod={"resize"} // <-------  this helped a lot as OP said
                                                    // progressiveRenderingEnabled={true}
                                                    source={{ uri: userData.caregiver_avatar_url }} />
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
                                        <Text style={{ marginTop: -2, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', justifyContent: 'center' }}>{userData.caregiver_name}</Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ flex: Platform.OS=='ios'?0.8:0.3 }}>

                                    </View>
                                    <View style={{ flex: 4, margin: wp('1%'), justifyContent: 'flex-end', alignItems: 'flex-end'}}>
                                        <Text style={{ marginTop: -2, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', justifyContent: 'flex-end' }}>{userData.shift[Object.keys(userData.shift)[0]].start_time ? moment(userData.shift[Object.keys(userData.shift)[0]].start_time).format('DD MMM, YYYY') + ' - ' + moment(userData.shift[Object.keys(userData.shift)[0]].end_time).format('DD MMM, YYYY') : '---'}</Text>
                                    </View>
                                    <View style={{ flex: Platform.OS=='ios'?1.6:2.5 }}>

                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ flex: Platform.OS=='ios'?0.9:1.1 }}>

                                    </View>
                                    <View style={{ flex: 4, margin: wp('1%'), justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                                        <Text style={{ marginTop: -2, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', justifyContent: 'flex-end' }}>{userData.shift[Object.keys(userData.shift)[0]].start_time ? moment(userData.shift[Object.keys(userData.shift)[0]].start_time).format('hh:mm a') + ' - ' + moment(userData.shift[Object.keys(userData.shift)[0]].end_time).format('hh:mm a') : '---'}</Text>
                                    </View>
                                    <View style={{ flex: Platform.OS=='ios'?1.6:3 }}>

                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', marginTop: wp('4%') }}>
                                    <View style={{ flex: 3 }}>
                                        <Text style={{ marginTop: -2, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', justifyContent: 'center' }}>Regular:</Text>
                                    </View>
                                    <View style={{ flex: 0.7 }}>
                                        <Text style={{ marginTop: -2, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', justifyContent: 'center' }}>{userData.regular_hours}</Text>
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <Text style={{ marginTop: -2, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', justifyContent: 'center' }}>$ {userData.regular_rate.toFixed(2) || '---'}</Text>
                                    </View>

                                    <View style={{ flex: 1.5, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                                        <Text style={{ marginTop: -2, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', justifyContent: 'flex-end' }}>$ {userData.regular_amount.toFixed(2) || '---'}</Text>
                                    </View>

                                </View>
                                <View style={{ flexDirection: 'row', }}>
                                    <View style={{ flex: 3 }}>
                                        <Text style={{ marginTop: -2, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', justifyContent: 'center' }}>Overtime:</Text>
                                    </View>
                                    <View style={{ flex: 0.7 }}>
                                        <Text style={{ marginTop: -2, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', justifyContent: 'center' }}>{userData.overtime_hours}</Text>
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <Text style={{ marginTop: -2, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', justifyContent: 'center' }}>$ {userData.overtime_rate.toFixed(2) || '---'}</Text>
                                    </View>

                                    <View style={{ flex: 1.5, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                                        <Text style={{ marginTop: -2, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', justifyContent: 'flex-end' }}>$ {userData.overtime_amount.toFixed(2) || '---'}</Text>
                                    </View>

                                </View>
                                <View style={{ flexDirection: 'row', }}>
                                    <View style={{ flex: 3 }}>
                                        <Text style={{ marginTop: -2, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', justifyContent: 'center' }}>Extra Expenses:</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        {/* <Text style={{ marginTop: -2, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', justifyContent: 'center' }}>{userData.overtime_hours  }</Text> */}
                                    </View>

                                    <View style={{ flex: 0.5 }}>
                                        {/* <Text style={{ marginTop: -2, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', justifyContent: 'center' }}>$ {userData.overtime_rate.toFixed(2)}</Text> */}
                                    </View>

                                    <View style={{ flex: 1.5, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                                        <Text style={{ marginTop: -2, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', justifyContent: 'flex-end' }}>$ {userData.extra_expenses.toFixed(2) || '---'}</Text>
                                    </View>

                                </View>
                                <View style={{ flexDirection: 'row', }}>
                                    <View style={{ flex: 3 }}>
                                        <Text style={{ marginTop: -2, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', justifyContent: 'center' }}>Reimbursement Mileage:</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        {/* <Text style={{ marginTop: -2, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', justifyContent: 'center' }}>$ {userData.overtime_rate.toFixed(2)}</Text> */}
                                    </View>

                                    <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                                        <Text style={{ marginTop: -2, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', justifyContent: 'flex-end' }}>$ {userData.reimbursement_amount.toFixed(2) || '---'}</Text>
                                    </View>

                                </View>
                                <View style={styles.line} />

                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ flex: 3 }}>
                                        <Text style={{ marginTop: -2, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', justifyContent: 'center' }}>Total:</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ marginTop: -2, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', justifyContent: 'center' }}>{this.total_hours(userData.regular_hours, userData.overtime_hours)}</Text>
                                    </View>

                                    <View style={{ flex: 0.5 }}>
                                        {/* <Text style={{ marginTop: -2, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', justifyContent: 'center' }}>$ {userData.regular_rate.toFixed(2)  || '---'}</Text> */}
                                    </View>

                                    <View style={{ flex: 1.5, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                                        <Text style={{ marginTop: -2, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', justifyContent: 'flex-end' }}>$ {userData.total_amount.toFixed(2) || '---'}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            );
        }

    }
    total_hours(regular, overtime) {
        var data = regular + overtime;
        return data
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
    line: {
        marginTop: hp('2%'),
        borderWidth: Platform.OS=='ios'?0.37:0.25,
        borderColor: '#828EA5',
    },

});
const mapStateToProps = state => ({
    data: state.user.data
});

export default connect(
    mapStateToProps,
    null
)(withNavigation(PayrollSession));