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

class CaregiverNotes extends React.Component {
    state = {
        loading: false,
        data:'',
        clientdata:'',
        Activity:false,
        Task:false,
        instruction_act:false,
        Task: false,
        previous_caregiversName:''
    }

    async componentDidMount() {
        if (await this.checkInternet()) {
            var data = {}
            data.agency_logo = await AsyncStorage.getItem('agency_logo');
            data.agency_name = await AsyncStorage.getItem('agency_name');

            this.setState({ agency_details: data })
            this.setState({ loading: true,clientdata:this.props.navigation.state.params.item, previous_caregiversName:this.props.navigation.state.params.item1 }, () => {
                // this.getProfile();
                console.log("props data:",this.state.clientdata.length, this.state.previous_caregivers)
                this.setState({loading:false})
            })
            this.props.navigation.addListener('didFocus', () => {
                // console.log("didFocus is working")
                this.setState({ loading: false }, () => {
                    // this.getProfile();

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

    render() {
        var userdata = null
        var activities = null
        var instruction_act = null
        var medical = null
        var Task = null
        if (this.state.loading || this.state.clientdata.length=='0' ) {
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={'Notes'} expanded={this.state.expanded} onBack={() => {
                        this.props.navigation.goBack()
                    }} />
                    <LoadingIndicator />
                </SafeAreaView>)
        }
        else {
            var name = this.state.previous_caregiversName
            // var words = name!=''||name!=null?name.split(' '):null;
            console.log("task",this.state.clientdata)
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={'Notes'} expanded={this.state.expanded} onBack={() => {
                        this.props.navigation.goBack()
                    }} />
                    <View style={[commonStyles.margin, commonStyles.column, commonStyles.full]}>
                    <View style={commonStyles.coloumn,{flex:1,flexDirection:'column'}}>
                    <FlatList
                                    data={this.state.clientdata}
                                    renderItem={({ item }) => {
                                        console.log("item:",item)
                                        var name = item[Object.keys(item)[0]]
                                        var words = name.previous_caregiver_name!=null?name.previous_caregiver_name.split(' '):null;
                                        console.log("words:",words)
                                        if(name.previous_caregiver_name!=null){
                                        return(

                        <View style={[styles.itemRectangleShape, commonStyles.column, { padding: wp('3%')}]} >
                        <View style={[commonStyles.row]} >
                            <View style={[commonStyles.row, commonStyles.full, { justifyContent: 'flex-start', alignItems: 'center' }]}>
                                            <View style={[commonStyles.center, { width: wp('12.5%'), height: hp('6%'), backgroundColor: '#f1f2f4', borderColor: '#c7c7c7', borderWidth: wp('0.1%'), borderRadius: 5  }]}>
                                                <Text style={[commonStyles.fs(3.5), { color: StyleConstants.gradientStartColor }]}>{name.previous_caregiver_name.charAt(0).toUpperCase()}</Text>
                                            </View>
                                            <Text style={{ justifyContent: 'flex-start',marginLeft: wp('2%'), paddingVertical:hp('3%'),fontSize: hp('2.3%'), color: '#293D68', fontFamily: 'Catamaran-Regular' }}>{item.previous_caregiver_name!=null || item.previous_caregiver_name!='' || item.previous_caregiver_name!=undefined?words[0].charAt(0).toUpperCase() + words[0].slice(1)+' '+ words[1].slice(0,1).toUpperCase():'--'}</Text>
                            </View>
                            </View>

                            <Text style={[styles.itemHeader,{marginBottom:hp('1%')}]}>Notes</Text>
                            {
                            name.previous_notes.length > 0?
                            name.previous_notes.map((key) =>
                            (
                            <View style={[, commonStyles.row,{marginTop:hp('-2%')}]}>
                                <View style={{ padding: wp('2%'), flex: 1 }}>
                                    <View style={commonStyles.row}>
                                    <Image style={styles.greenCheckImage}
                                                    source={require('../../../assets/images/dot.png')} />
                                    <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Medium', }}>{key.content}</Text>
                                    </View>
                                </View>
                            </View>)):<View style={[, commonStyles.row, commonStyles.mt(1.5)]}>
                                <View style={{ padding: wp('2%'), flex: 1 }}>
                                    <View style={commonStyles.column}>
                                        <Text style={{ marginTop: -5, fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Medium', }}>No Note</Text>
                                    </View>
                                </View>
                            </View>}
                            
                        </View>
                        )
                        }
                        else{
                            null
                        }
                    }}/>
                    </View>
                    </View>
                </SafeAreaView>
            )
        }
    }
}


const styles = StyleSheet.create({
    itemRectangleShape: {
        marginTop: wp('3%'),
        borderWidth: 0.01,
        borderRadius: 5,
        backgroundColor: '#fff',
        borderColor: '#fff'
    },

    itemHeader: {
        fontFamily: 'Catamaran-Bold',
        color: '#293D68',
        fontSize: hp('2.0%')
    },
    greenCheckImage: {
        width: wp('2.3%'),
        height: hp('2.3%'),
        marginRight: wp('2%'),
        tintColor:'gray',
        resizeMode: 'contain'
    },
})


const mapStateToProps = state => ({
    data: state.user.data
});

export default connect(
    mapStateToProps,
    null
)(withNavigation(CaregiverNotes));