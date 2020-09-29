import React from "react";
import { StyleSheet, View, Image, SafeAreaView, Text, TouchableOpacity, ActivityIndicator, TextInput  } from 'react-native';
import commonStyles from '../../styles/Common';
import style, { IMAGE_HEIGHT, IMAGE_HEIGHT_NEW, IMAGE_HEIGHT_SMALL } from '../../styles/Common';
import styleConstants from '../../styles/StyleConstants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { ScrollView, FlatList } from "react-native-gesture-handler";
import Header from '../../core/components/Header';
import LinearGradient from 'react-native-linear-gradient';
import { withNavigation, StackActions, NavigationActions } from 'react-navigation';
import Globals from '../../Globals';
import AsyncStorage from '@react-native-community/async-storage';
import LoadingIndicator from '../../core/components/LoadingIndicator';
import { connect } from "react-redux";
import Geocoder from 'react-native-geocoding';
import { Toast,CheckBox } from 'native-base';
import { FloatingAction } from "react-native-floating-action";
import Modal from 'react-native-modalbox';
import NetInfo from "@react-native-community/netinfo";


  
class Caregivers extends React.Component {
    state = {
        expanded: true,
        curloading: false,
        data: '',
        shift_date: '',
        address: '',
        markers: [],
        checked:false,
        isVisible:true,
        data:''
    }

    showToast(message) {
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


    async componentDidMount(){
        if (await this.checkInternet()) {

        var data={}
                data.agency_logo = await AsyncStorage.getItem('agency_logo');
                data.agency_name = await AsyncStorage.getItem('agency_name');
                
                this.setState({agency_details:data})
        this.setState({data:this.props.navigation.state.params.item,loading:true},()=>{
            console.log("mapping id:",this.state.data)
            var data_item = Object.keys(this.state.data).map(key => ({ [key]: this.state.data[key] }));
            var clientData = this.state.data[Object.keys(this.state.data)[data_item.length-1]]
            var clientDatafull = clientData[Object.keys(clientData)[0]]
            console.log("clientData id:",clientData,"clientDatafull:",clientDatafull.name)
            this.setState({name:clientDatafull.name})

        })
    }
        else{
            this.showToast("No Internet Connectivity!")

        }
    }

    GetTaskCost(value) {
        this.setState({ title: value })
    }

    GetTaskDescription(value) {
        this.setState({ details: value })
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
        var clientData = null;
        var mainData = [];
        var care_log = [];
        const schLocation = [];
        
        Geocoder.init("AIzaSyAbjtnF9LXxwmSf3ATD4aHnOuX0hF9AqO0");
        if (this.state.curloading) {
                return (
                    <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor,]}>
                        <Header onLogo={() => { this.navigateToDashboard() }} label={"Caregivers"} expanded={true} onBack={() => {
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
            var data_item = Object.keys(this.state.data).map(key => ({ [key]: this.state.data[key] }));
            console.log('data:',data_item.length, "data full:",data_item[data_item.length])
                return (
                    <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor]}>
                        <Header onLogo={() => { this.navigateToDashboard() }} label={"Caregivers"} expanded={this.state.expanded} Agency_logo={this.state.agency_details} onBack={() => {
                            this.props.navigation.goBack()
                        }} />
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={[commonStyles.full, commonStyles.margin]}>
                                {/* <FlatList */}
                                <FlatList
                                    extraData={this.state.data}
                                    data={this.state.data}
                                    numColumns={2}
                                    renderItem={({ item }) => {
                                        // this.setState({count: this.state.count+1})
                                        var data = item[Object.keys(item)[0]]
                                        var name = data.name
                                        var words = name.split(' ');

                                        console.log("name:", name)

                                        var avatar_url = data.avatar_url
                                        return (
                                            <View style={{ flex: 1, flexDirection: 'row' }}>
                                                <View style={{ flex: 1, flexDirection: 'row', marginBottom: wp('1%') }}>
                                                    <View style={[commonStyles.column, { padding: wp('2%'), flex: 1 }]}>
                                                        {
                                                            avatar_url ?
                                                            <Image style={[styles.clientImage]}
                                                                source={{ uri: avatar_url }} /> :
                                                            <View style={[styles.clientImage, {justifyContent: 'center', alignItems: 'center'}]}>
                                                                <Image style={[styles.clientNoImage]}
                                                                    source={require('../../../assets/images/user_caregiver.png')} />
                                                            </View>
                                                        }
                                                        <Text style={{ alignSelf: 'center' }}>{words[0].charAt(0).toUpperCase() + words[0].slice(1)+' '+ words[1].slice(0,1) || '---'}</Text>
                                                    </View>
                                                </View>
                                                {data_item.length % 2 != 0 && this.state.name == name ? <View style={{ flex: 1, flexDirection: 'row', marginBottom: wp('1%') }}>
                                                    <View style={[commonStyles.column, { padding: wp('2%'), flex: 1 }]}>
    
                                                    </View>
                                                </View> : null}
                                            </View>
                                        )
                                    }} />
                            </View>
                        </ScrollView>   
                    </SafeAreaView>
                );
        }
    }
}

const styles = StyleSheet.create({
    rectangleShape: {
        padding: wp('3%'),
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
        width: wp('19%'),
        height: hp('20%'),
        aspectRatio: 1,
        borderColor: '#fff',
        backgroundColor: '#CFCFCF',
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        borderTopRightRadius: 5,
        borderTopLeftRadius: 5,
        },
        clientNoImage: {
        width: wp('12%'),
        height: hp('13%'),
        aspectRatio: 1,
        borderColor: '#fff',
        backgroundColor: '#CFCFCF',
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
        itemHeader: {
        fontFamily: 'Catamaran-Bold',
        color: '#293D68',
        fontSize: hp('2.5%')
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
        mapStyle: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        },
        modal: {
        justifyContent: 'center',
        alignItems: 'center',
        position: "absolute",
        backgroundColor: 'rgba(0, 0, 0, 0)',
        },
        modal4: {
        maxHeight: 300,
        minHeight: 80
        },
        modal1: {
        maxHeight: 310,
        minHeight: 80
        }
});
const mapStateToProps = state => ({
    data: state.user.data
});

export default connect(
    mapStateToProps,
    null
)(withNavigation(Caregivers));