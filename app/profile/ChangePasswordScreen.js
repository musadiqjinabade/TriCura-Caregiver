import React from "react";
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import commonStyles from '../styles/Common';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ScrollView } from "react-native-gesture-handler";
import Header from '../core/components/Header';
import { withNavigation, StackActions, NavigationActions } from 'react-navigation';
import StyleConstants from '../styles/StyleConstants';
import LinearGradient from 'react-native-linear-gradient';
import Globals from '../Globals';
import { Toast } from 'native-base';
import LoadingIndicator from '../core/components/LoadingIndicator';
import AsyncStorage from '@react-native-community/async-storage';
import { connect } from "react-redux";
import NetInfo from "@react-native-community/netinfo";


class ChangePasswordScreen extends React.Component {

    state = {
        data: '',
        password: null,
        repPassword: null,
        expanded: true,
        loading: false
    }

    async componentDidMount() {
        var data = {}
        data.agency_logo = await AsyncStorage.getItem('agency_logo');
        data.agency_name = await AsyncStorage.getItem('agency_name');

        this.setState({ agency_details: data })
    }

    showMessage(message) {
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

    navigateToLogin() {
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

    async changePassword() {
        this.setState({ loading: true });
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = Globals.httpMode + agency_code + Globals.domain + '/api/v1/users/update_password';

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
                    'user[password]': this.state.password,
                    'user[password_confirmation]': this.state.repPassword
                }), {
                    headers: headers
                })
                if (response.status === 200) {
                    console.log("data : ", response.data)
                    this.setState({
                        data: response.data, loading: false
                    }, async () => {
                        if (this.state.data.message === 'Update successfully') {
                            this.showMessage("Updated successfully");
                            await AsyncStorage.removeItem('agency_code', null);
                            await AsyncStorage.removeItem('USER_DATA', null);
                            await AsyncStorage.removeItem('agency_email', null);
                            this.navigateToLogin();
                        }
                        else {
                            this.showMessage(this.state.data.message);
                        }
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
            console.log("e : ", e);
            var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
            this.setState({
                loading: false,
            })
            this.showMessage(error);
        }

    }


    render() {

        if (this.state.loading) {
            return <LoadingIndicator />
        }
        else {

            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={"Change Password"} Agency_logo={this.state.agency_details} expanded={this.state.expanded} onBack={() => {
                        this.props.navigation.goBack()
                    }} />
                    <ScrollView
                        keyboardShouldPersistTaps={true}>
                        <View style={{ margin: wp('3%') }}>
                            <View style={[commonStyles.mb(2), commonStyles.mt(4), commonStyles.normalBorderBottom]}>
                                <Text style={[commonStyles.normalFont, commonStyles.fontSize(2)]}>NEW PASSWORD</Text>
                                <TextInput
                                    autoCapitalize='none'
                                    secureTextEntry={true}
                                    style={[commonStyles.pv(1), commonStyles.ph(0), commonStyles.boldFont, commonStyles.fontSize(2.5), { color: '#828ea5' }]}
                                    placeholder={'New Password'}
                                    placeholderTextColor="#828ea5"
                                    onChangeText={(text) => {
                                        this.setState({
                                            password: text
                                        })
                                    }}
                                />
                            </View>

                            <View style={[commonStyles.mb(2), commonStyles.normalBorderBottom]}>
                                <Text style={[commonStyles.normalFont, commonStyles.fontSize(2)]}>REPEAT NEW PASSWORD</Text>
                                <TextInput
                                    autoCapitalize='none'
                                    secureTextEntry={true}
                                    style={[commonStyles.pv(1), commonStyles.ph(0), commonStyles.boldFont, commonStyles.fontSize(2.5), { color: '#828ea5' }]}
                                    placeholder={'Confirm Password'}
                                    placeholderTextColor="#828ea5"
                                    onChangeText={(text) => {
                                        this.setState({
                                            repPassword: text
                                        })
                                    }}
                                />
                            </View>

                            <View style={[commonStyles.full, commonStyles.column, commonStyles.mt(3), { borderRadius: 5 }]}>
                                <TouchableOpacity style={[commonStyles.mb(2), commonStyles.mt(2), commonStyles.full]}
                                   
                                    onPress={async () => {
                                        if (await this.checkInternet()) {
                                        var error = null;
                                        var renum = /[0-9]/;
                                        var rechar = /[a-z]/;
                                        if (this.state.password) {
                                            if (this.state.repPassword) {
                                                if (this.state.password === null || this.state.password === '' || this.state.password.length.toString() < 8) {
                                                    error = 'Password must contain atleast 8 characters!';
                                                }
                                                else if (this.state.repPassword === null || this.state.repPassword === '' || this.state.repPassword.length.toString() < 8) {
                                                    error = 'Password must contain atleast 8 characters!';
                                                }
                                                else if (!renum.test(this.state.password)) {
                                                    error = 'Must include one or more special character/number.';
                                                }
                                                else if (!rechar.test(this.state.password)) {
                                                    error = 'Password must contain atleast 1 lower letter!';
                                                }
                                                else if (this.state.password !== this.state.repPassword) {
                                                    error = 'Password not matching';
                                                }
                                                if (error) {
                                                    this.showMessage(error);
                                                    return;
                                                }
                                                else {
                                                    this.changePassword();
                                                }
                                            }
                                            else {
                                                this.showMessage('Please enter confirm password');

                                            }
                                        }
                                        else {
                                            this.showMessage('Please enter new password');
                                        }

                                    }
                                else{
                                    this.showMessage("No Internet Connectivity!")

                                }}}>
                                    <LinearGradient
                                        colors={[StyleConstants.gradientStartColor, StyleConstants.gradientEndColor]} style={commonStyles.linearGradient}
                                        start={{ x: 0.0, y: 0.25 }} end={{ x: 1.2, y: 1.0 }}
                                        style={[commonStyles.rh(7), commonStyles.center, , commonStyles.br(0.3), {
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
                                        <Text style={[commonStyles.boldFont, commonStyles.fontSize(2.5), { color: 'white', textAlign: 'center' }]}>Change Password</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
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
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        borderTopRightRadius: 8,
        borderTopLeftRadius: 8,
    },
    itemHeader: {
        fontFamily: 'Catamaran-Bold',
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
)(withNavigation(ChangePasswordScreen));