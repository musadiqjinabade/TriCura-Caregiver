import React from "react";
import { StyleSheet, View, Image, SafeAreaView, Text, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import commonStyles from '../styles/Common';
import StyleConstants from '../styles/StyleConstants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Header from '../core/components/Header';
import { withNavigation, StackActions, NavigationActions } from 'react-navigation';
import { ScrollView } from "react-native-gesture-handler";
import { connect } from "react-redux";
import AsyncStorage from '@react-native-community/async-storage';
import Globals from '../Globals';
import Geocoder from 'react-native-geocoding';
import {Toast} from "native-base";
import SvgUri from 'react-native-svg-uri';


class AgencyInfoScreen extends React.Component {

    state = {
        expanded: true,
        loading: true,
        data: ''
    }

    showToast(message) {
        Toast.show({
            text: message,
            duration: 2000
        })
    }

    openMaps(address) {
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
                    ios: `${scheme}${userData_id.location}`,
                    android: `${scheme}${userData_id.location}`
                });
                Linking.openURL(url);
            })
            .catch(error => console.warn(error));


    }

    navigateToDashboard() {
        const resetAction = StackActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({
                    routeName: "InitialScreen"
                })
            ]
        });
        this.props.navigation.dispatch(resetAction);
    }

    componentWillMount() {
        this.setState({ loading: true }, () => {
            this.getInfo();
        })
    }

    async getInfo() {
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = Globals.httpMode + agency_code + Globals.domain + '/api/v1/calendar/agency_detail';
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
                console.log("data : ", response.data)
                this.setState({
                    data: response.data.agency, loading: false
                })
            }
            else {
                var data1 = response.data.error;
                // console.log("data1 : ", data1)

                this.showToast(data1);
                this.navigateToDashboard();
                this.setState({
                    curloading: false
                })
            }
        }
        catch (e) {
            var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
            console.log("error : ", error)
            this.showToast(error);
            this.navigateToDashboard();
            this.setState({
                curloading: false
            })
        }
    }

    render() {
        const { navigate } = this.props.navigation;

        if (this.state.loading) {
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor,]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={"Agency Info"} expanded={true} onBack={() => {
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
            var isSVG = false;
        var InvalidSVG = true;

        console.log("url : ", this.state.data)
        if (this.state.data.logo) {
            const res = this.state.data.logo.split('?');
            var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
            if(regex .test(this.state.data.logo)) {
                if (res[0].includes(".svg")) {
                    isSVG = true;
                }
                else {
                    isSVG = false;
                }
            }
            else{
                InvalidSVG = false
            }
        }
        console.log(InvalidSVG)
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={"Agency Info"} expanded={true} onBack={() => {
                        this.props.navigation.goBack()
                    }} />
                    <ScrollView showsVerticalScrollIndicator={false}>


                        <View style={[commonStyles.margin, commonStyles.column, commonStyles.full]}>
                            <View style={[commonStyles.container, { marginTop: wp('15%') }]}>
                                {
                                    InvalidSVG ?
                                        this.state.data.logo ? (
                                            <View>
                                                {isSVG ?
                                                <SvgUri
                                                    width={wp('90%')}
                                                    height={wp('20%')}
                                                    source={{ uri: this.state.data.logo }}
                                                /> :
                                                <Image style={styles.logo_container}
                                                source={{ uri: this.state.data.logo }} />}
                                            </View>
                                        ) : (
                                            <Image style={styles.logo_container}
                                            source={require('../../assets/images/CareDaily.png')} />
                                            ) : <Image style={styles.logo_container}
                                            source={require('../../assets/images/CareDaily.png')} />
                                }


                            </View>
                            <Text style={[styles.itemHeader]}>{this.state.data.name}</Text>

                            <View style={[commonStyles.row, { marginTop: wp('1%') }]}>
                                <View style={[commonStyles.row, commonStyles.full, { justifyContent: 'flex-start' }]}>
                                    <Image style={[styles.otherImages, { marginTop: 6 }]}
                                        source={require('../../assets/images/location.png')} />

                                    <TouchableOpacity
                                        onPress={() => {
                                            this.openMaps(this.state.data.address_line_1 + " " + this.state.data.address_line_2);
                                        }}>
                                        <Text style={[{ textAlignVertical: 'center', fontSize: hp('1.7%'), textAlign: 'left', color: '#293D68', fontFamily: 'Catamaran-Regular', color: '#41A2EB', textDecorationLine: 'underline' }, commonStyles.ml(1)]}>{this.state.data.address_line_1 + " " + this.state.data.address_line_2}</Text>
                                    </TouchableOpacity>

                                </View>
                            </View>

                            <View style={[commonStyles.row, { marginTop: wp('1%') }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                                    <Image style={styles.otherImages}
                                        source={require('../../assets/images/email.png')} />
                                </View>
                                <TouchableOpacity onPress={() => Linking.openURL('mailto:' + this.state.data.email)}>
                                    <Text style={[{ textAlignVertical: 'center', fontSize: hp('1.7%'), textAlign: 'left', color: '#293D68', fontFamily: 'Catamaran-Regular', color: '#41A2EB', textDecorationLine: 'underline' }, commonStyles.ml(1)]}>{this.state.data.email}</Text>
                                </TouchableOpacity>

                            </View>

                            <View style={[commonStyles.row, { marginTop: wp('1%') }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                                    <Image style={styles.otherImages}
                                        source={require('../../assets/images/phone.png')} />
                                </View>
                                <TouchableOpacity onPress={() => Linking.openURL(`tel:${this.state.data.phone}`)}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: wp('3%') }}>
                                        <Text style={{ fontFamily: 'Catamaran-Regular', color: '#41A2EB', textDecorationLine: 'underline', fontSize: hp('2%') }}>{this.state.data.phone}</Text>
                                    </View>
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
    logo_container: {
        justifyContent: 'center',
        alignItems: 'center',
        width: wp('80%'),
        height: hp('10%'),
        resizeMode: 'contain'
    },
    itemHeader: {
        marginTop: wp('15%'),
        fontFamily: 'Catamaran-Bold',
        color: '#293D68',
        fontSize: hp('2.2%')
    },
    otherImages: {
        width: wp('3.5%'),
        height: hp('3.5%'),
        resizeMode: 'contain'
    },
});

const mapStateToProps = state => ({
    data: state.user.data
});

export default connect(
    mapStateToProps,
    null
)(withNavigation(AgencyInfoScreen));