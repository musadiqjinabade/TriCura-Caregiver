import React from "react";
import { Dimensions, StyleSheet, View, ScrollView, Text, SafeAreaView, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import commonStyles from '../../styles/Common';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { withNavigation,  StackActions, NavigationActions } from 'react-navigation';
import Tab from '../../core/components/Tab';
import { connect } from "react-redux";
import Header from '../../core/components/Header';

import AboutScreen from '../../profile/ProfileTabs/AboutScreen';
import CareMatchingScreen from '../../profile/ProfileTabs/CareMatchingScreen';
import InterestMatchingScreen from '../../profile/ProfileTabs/InterestMatchingScreen';
import styleConstants from "../../styles/StyleConstants";
import Globals from '../../Globals';
import AsyncStorage from '@react-native-community/async-storage';
import LoadingIndicator from '../../core/components/LoadingIndicator';
import Modal from 'react-native-modalbox';
import APIService from '../../core/components/APIServices'
import { CheckBox, } from 'native-base';
import style, { IMAGE_HEIGHT, IMAGE_HEIGHT_NEW, IMAGE_HEIGHT_SMALL } from '../../styles/Common';
import LinearGradient from 'react-native-linear-gradient';
import { Toast } from 'native-base';



const selected_data = {}
class EditInterestMatching extends React.Component {

    state = {
        loading: true,
        topbarOption: 0,
        selected: true,
        expanded: true,
        data: '',
        checked: false,
        check_data: {},
        check_id: {}
    }

    async componentDidMount() {
        var data = {}
        data.agency_logo = await AsyncStorage.getItem('agency_logo');
        data.agency_name = await AsyncStorage.getItem('agency_name');

        this.setState({ agency_details: data })
        var interest_match = this.props.navigation.state.params.item
        for (var match of interest_match) {
            let obj = {
                ...obj, [match.id]: true
            }
            this.setState({
                check_id: obj
            }, () => {
                console.log('check_id', this.state.check_id)
            })

        }

        this.setState({ data: this.props.navigation.state.params.item }, () => {
            this.getData(this.state.data);
        })

    }

    async getData(item) {
        console.log('data:', this.props.data.access_token)

        var agency_code = await AsyncStorage.getItem('agency_code');
        var access_token = this.props.data.access_token;

        var Interest = await APIService.execute('GET', Globals.httpMode + agency_code + Globals.domain +
            '/api/v1/users/' + Object.keys(this.props.data.user)[0] + '/matching_interests', null, access_token)
        // console.log("intesrest:", Interest)
        this.setState({ Interest: Interest.data.matching_interests, check_data: item, loading: false }, () => {
            console.log("iterest:", this.state.check_data, "item:", item)
        })
    }

    showToast(message) {
        Toast.show({
            text: message,
            duration: 2000
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

    save(item) {
        this.setState({ saveloading: true })
        console.log('click_box:', item[Object.keys(item)[0]])
        var true_data = [];
        for (let i = 0; i < Object.keys(item).length; i++) {
            if (item[Object.keys(item)[i]] == true) {
                true_data.push(Object.keys(item)[i])
            }
        }
        var body = {
            user: {
            }
        }
        body.user.matching_interest_ids = true_data.length>0?true_data:[""];
        console.log("click:", body)
        this.UpdateProfile(body)

    }
    async UpdateProfile(body) {
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = Globals.httpMode + agency_code + Globals.domain + '/api/v1/users/' + Object.keys(this.props.data.user)[0];
        console.log('url:', url, this.props.data.access_token)

        try {

            var access_token = this.props.data.access_token;
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'App-Token': '96ef950f-bfae-4ee5-89a0-f23ab9e50b96',
                'Authentication-Token': access_token
            }
            try {
                var response = await axios.put(url, body, {
                    headers: headers
                })
                if (response.status === 200) {
                    console.log("data : ", response.data)
                    this.setState({
                        saveloading: false
                    }, () => {
                        this.showToast("Interest Matching Updated Successfully");
                        this.props.navigation.goBack()
                    })
                }
                else {
                    this.showToast("Something went wrong!");
                    this.setState({ saveloading: false })
                }
            }
            catch (error) {
                console.log("error : ", error);
                this.setState({ saveloading: false })

            }
        }
        catch (e) {
            var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
            console.log("error : ", e);

            this.setState({
                saveloading: false,
            })
            this.showToast(error);
        }
    }

    changecheck(item) {
        var i = 0;

        this.setState({
            check_id: { ...this.state.check_id, [item.id]: !this.state.check_id[item.id] }
        }, () => {
            console.log("data", this.state.check_id)
        })

    }

    render() {
        const { navigate } = this.props.navigation;
        var userData = null;
        if (this.state.loading) {
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor,]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={"Interest Matching"} expanded={true} onBack={() => {
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
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={"Interest Matching"} expanded={true} Agency_logo={this.state.agency_details} onBack={() => {
                        this.props.navigation.goBack()
                    }} />
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={[commonStyles.backgroundColor, commonStyles.margin, commonStyles.column, commonStyles.full]}>
                            <View style={{ flexDirection: 'column' }}>
                                <FlatList
                                    data={this.state.Interest}
                                    renderItem={({ item }) => {
                                        var checkedItem = _.find(this.state.check_data, function (o) {
                                            if (o.id == item.id) {
                                                return true
                                            } else {
                                                return false

                                            };
                                        });
                                        return (
                                            <TouchableOpacity style={{ flexDirection: 'row', margin: wp('2%') }}
                                                onPress={() => this.changecheck(item)}>
                                                <CheckBox checked={this.state.check_id[item.id]} style={{ borderRadius: 5, marginRight: 5, backgroundColor: this.state.check_id[item.id] ? "#4285F4" : '#ffffff', borderColor: this.state.check_id[item.id] ? "#4285F4" : "#4285F4", marginTop: hp('1%'), width: 20, height: 20, justifyContent: 'center', alignSelf: 'center', alignItems: 'center', alignContent: 'center', paddingTop: Platform.OS === "ios" ? null :hp('0.7%') }}
                                                    onPress={() => this.changecheck(item)}
                                                />
                                                <Text style={{ justifyContent: 'flex-start', alignItems: 'center', marginHorizontal: wp('3%'), marginTop: wp('3%'), marginLeft: wp('6%') }}>{item.title}</Text>
                                            </TouchableOpacity>
                                        )

                                    }} />

                            </View>
                            <View style={[style.full, style.column, { width: wp('90%'), borderRadius: 5, marginTop: wp('10%'), justifyContent: 'flex-end', paddingBottom: wp('2%'), alignSelf: 'flex-end' }]}>
                                <TouchableOpacity style={[style.mb(2), style.full]}
                                    onPress={() => {
                                        this.save(this.state.check_id);
                                    }}
                                >
                                    <LinearGradient
                                        colors={[styleConstants.gradientStartColor, styleConstants.gradientEndColor]} style={style.linearGradient}
                                        start={{ x: 0.0, y: 0.25 }} end={{ x: 1.2, y: 1.0 }}
                                        style={[style.rh(7), style.center, , style.br(0.3), {
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
                                                    <Text style={[style.boldFont, style.fontSize(2.5), { color: 'white', textAlign: 'center' }]}> SAVE</Text>
                                                )
                                        }
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
    logoutImage: {
        width: wp('5%'),
        height: hp('5%'),
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
        position: "absolute",
        backgroundColor: 'rgba(0, 0, 0, 0)',
    },
    modal2: {
        maxHeight: 490,
        minHeight: 80
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
)(withNavigation(EditInterestMatching));
