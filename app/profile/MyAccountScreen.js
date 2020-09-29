import React from "react";
import { StyleSheet, View, Text, SafeAreaView, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import commonStyles from '../styles/Common';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ScrollView } from "react-native-gesture-handler";
import Header from '../core/components/Header';
import { withNavigation, StackActions, NavigationActions } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import Globals from '../Globals';
import { connect } from "react-redux";
import styleConstants from '../styles/StyleConstants';
import {Toast} from "native-base";
import NetInfo from "@react-native-community/netinfo";




class MyAccountScreen extends React.Component {

    state = {
        expanded: true,
        data: '',
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

    async componentWillMount() {
        var data = {}
        data.agency_logo = await AsyncStorage.getItem('agency_logo');
        data.agency_name = await AsyncStorage.getItem('agency_name');
        this.setState({ agency_details: data })
        this.setState({ loading: true }, async() => {
            if (await this.checkInternet()) {
            this.getPayroll();
            }
            else{
                this.showMessage("No Internet Connectivity!")

            }
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

        showMessage(message) {
            Toast.show({
                text: message,
                duration: 2000
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
                    this.showMessage("Invalid Credentials");
                    this.setState({ loading: false })

                }
            }
            catch (error) {
                console.log("error : ", error);
                this.setState({ loading: false })
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
        var userData = null;
        var prop_data = null;
        if (!this.state.data || this.state.loading) {
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor,]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={"My Account"} expanded={this.state.expanded} Agency_logo={this.state.agency_details} onBack={() => {
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
                userData = Object.keys(this.state.data).map(key => ({ [key]: this.state.data[key] }));
                var current = userData[Object.keys(userData)[0]]
                console.log("userData: current", current)
                var current_pay = current[Object.keys(current)[0]]
                prop_data = this.props.data.user[Object.keys(this.props.data.user)[0]];
                console.log("prop_data:", prop_data)
            }
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={"My Account"} expanded={this.state.expanded} Agency_logo={this.state.agency_details} onBack={() => {
                        this.props.navigation.goBack()
                    }} />

                    <View style={[commonStyles.margin, commonStyles.column, commonStyles.full]}>
                        <View style={[commonStyles.center]}>
                            {
                                prop_data.avatar_url ? <View>
                                    <Image style={[styles.clientImage]}
                                        resizeMode={"cover"}
                                        resizeMethod={"resize"} // <-------  this helped a lot as OP said
                                        // progressiveRenderingEnabled={true}
                                        source={{ uri: prop_data.avatar_url }} />
                                </View> : (
                                        <View style={[styles.clientImage, commonStyles.center, commonStyles.mt(2), { backgroundColor: '#fff' }]}>
                                            <Text style={[commonStyles.boldFont, commonStyles.fs(10), { color: styleConstants.gradientStartColor }]}>{prop_data.name.charAt(0).toUpperCase()}</Text>
                                        </View>
                                    )
                            }
                            {/* <View>
                                <Image style={[styles.clientImage]}
                                    source={{uri: prop_data.avatar_url}} />
                            </View> */}

                            <Text style={[commonStyles.headerTextBoldFont]}>{prop_data.name}</Text>
                            <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', }}>Caregiver</Text>
                        </View>


                        <TouchableOpacity
                            onPress={() => navigate('CurrentPayrollScreen', { item1: current_pay })}
                        >
                            <View style={[styles.itemRectangleShape, { flexDirection: 'row', marginBottom: wp('0.4%') }]} >
                                <View style={{ padding: wp('3%'), flex: 1 }}>
                                    <Text style={[styles.itemHeader]}>Current Payroll Session</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                        <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: wp('1%') }}>

                            <FlatList
                                extraData={userData}
                                data={userData}
                                inverted                                
                                renderItem={({ item }) => {
                                    console.log("item : ", item)
                                    if (Object.keys(item)[0] != "0") {
                                        return (
                                            <View>
                                                <TouchableOpacity
                                                 onPress={async () => {
                                                    if (await this.checkInternet()) {
                                                        navigate('CurrentPayrollScreen', { item: item })
                                                    }
                                                    else {
                                                        this.showToast("No Internet Connectivity!")
                                                    }
                                                }}>
                                                    <View style={[styles.itemRectangleShape, { flexDirection: 'row' }]} >
                                                        <View style={{ padding: wp('4%'), flex: 1 }}>
                                                            <Text style={[styles.itemHeader]}>{item[Object.keys(item)[0]].start_date ? moment(item[Object.keys(item)[0]].start_date).format('MMM DD, YYYY') : '---'} - {item[Object.keys(item)[0]].end_date ? moment(item[Object.keys(item)[0]].end_date).format('MMM DD, YYYY') : '---'}</Text>
                                                        </View>

                                                        <View style={[commonStyles.center, { justifyContent: 'center', alignItems: 'flex-end', marginRight: wp('3%') }]}>
                                                            <Image style={[{ height: hp('2%'), width: wp('2%') }]}
                                                                source={require('../../assets/images/right-arrow.png')} />
                                                        </View>
                                                    </View>

                                                </TouchableOpacity>
                                            </View>
                                        )
                                    }

                                }
                                }/>
                        </ScrollView>

                    </View>
                </SafeAreaView>
            );
        }
    }
}

const styles = StyleSheet.create({
    clientImage: {
        width: wp('18%'), height: hp('18%'),
        aspectRatio: 1,
        borderColor: '#fff',
        backgroundColor: '#CFCFCF',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        borderTopRightRadius: 8,
        borderTopLeftRadius: 8,
    },
    itemHeader: {
        fontFamily: 'Catamaran-Medium',
        color: '#293D68',
        fontSize: hp('2.3%')
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
    itemRectangleShapeOther: {
        marginTop: wp('1%'),
        borderWidth: 0.01,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        borderTopRightRadius: 5,
        borderTopLeftRadius: 5,
        backgroundColor: '#fff',
        borderColor: '#fff'
    }
});
const mapStateToProps = state => ({
    data: state.user.data
});
export default connect(
    mapStateToProps,
    null
)(withNavigation(MyAccountScreen));