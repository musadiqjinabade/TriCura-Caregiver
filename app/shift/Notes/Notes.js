import React from "react";
import { StyleSheet, View, Image, SafeAreaView, Text, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
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
import { Toast, CheckBox } from 'native-base';
import { FloatingAction } from "react-native-floating-action";
import Modal from 'react-native-modalbox';
import NetInfo from "@react-native-community/netinfo";




class Notes extends React.Component {

    state = {
        expanded: true,
        curloading: false,
        data: '',
        shift_date: '',
        address: '',
        markers: [],
        checked: false,
        isVisible: true,
        data: ''
    }

    showToast(message) {
        Toast.show({
            text: message,
            duration: 2000
        })
    }

    async componentDidMount() {
        var data = {}
        data.agency_logo = await AsyncStorage.getItem('agency_logo');
        data.agency_name = await AsyncStorage.getItem('agency_name');

        this.setState({ agency_details: data })
        this.setState({ data: this.props.navigation.state.params.item, loading: true }, () => {
            console.log("mapping id:", this.state.data)
        })
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
        const { navigate } = this.props.navigation;
        var clientData = null;
        var mainData = [];
        var care_log = [];
        const schLocation = [];
        Geocoder.init("AIzaSyAbjtnF9LXxwmSf3ATD4aHnOuX0hF9AqO0");
        if (this.state.curloading) {
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor,]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={"Notes"} expanded={true} onBack={() => {
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
                    <Header onLogo={() => { this.navigateToDashboard() }} label={"Notes"} expanded={this.state.expanded} Agency_logo={this.state.agency_details} onBack={() => {
                        this.props.navigation.goBack()
                    }} />
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={[commonStyles.full, commonStyles.margin]}>
                            {/* <FlatList */}
                            <FlatList
                                extraData={this.state.data}
                                data={this.state.data}
                                renderItem={({ item }) => {
                                    console.log("clientData:", item)
                                    var data = item[Object.keys(item)[0]]
                                    var content = data.content
                                    var is_urgent = data.is_urgent


                                    return (
                                        <View style={[commonStyles.full]}>
                                            {
                                                <View style={[styles.itemRectangleShape, commonStyles.coloumn, { padding: wp('3%') }]} >
                                                    <View style={[commonStyles.row, commonStyles.full, { justifyContent: 'flex-start', alignItems: 'center' }]}>
                                                        {
                                                            
                                                            item[_.keys(item)[0]].author ?
                                                                <View style={[commonStyles.center, { width: wp('12.5%'), height: hp('6%'), backgroundColor: '#f1f2f4', borderColor: '#c7c7c7', borderWidth: wp('0.1%'), borderRadius: 5 }]}>
                                                                    <Text style={[commonStyles.fs(3.5), { color: styleConstants.gradientStartColor }]}>{item[_.keys(item)[0]].author.charAt(0).toUpperCase()}</Text>
                                                                </View> : null
                                                            // )
                                                        }

                                                        <View style={[commonStyles.coloumn, commonStyles.full, { marginLeft: wp('2.5%') }]}>
                                                            <View style={[commonStyles.row]}>
                                                                <Text style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start', fontSize: hp('2.3%'), color: '#293D68', fontFamily: 'Catamaran-Regular' }}>{item[_.keys(item)[0]].author}</Text>
                                                                <View style={[{ justifyContent: 'center', alignItems: 'flex-end', }]}>
                                                                    <View style={{
                                                                        width: wp('3%'),
                                                                        height: wp('3%'),
                                                                        borderRadius: 3,
                                                                        backgroundColor: item[_.keys(item)[0]].is_urgent ? '#EA5C5B' : '#90C6A6'
                                                                    }} />
                                                                </View>
                                                            </View>

                                                            <Text style={{ marginTop: -7, fontSize: hp('1.8%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', }}>Caregiver</Text>
                                                        </View>
                                                    </View>

                                                    <View style={{ marginTop: wp('2%'), padding: wp('1%') }}>

                                                        <View style={styles.line} />

                                                        <View style={[commonStyles.full, commonStyles.row, commonStyles.mt(1.5)]}>
                                                            <View style={[commonStyles.row, commonStyles.center, commonStyles.full, { justifyContent: 'flex-start' }]}>
                                                                <Text style={[{ textAlignVertical: 'center', fontSize: hp('1.8%'), textAlign: 'center', color: '#828EA5', fontFamily: 'Catamaran-Medium', }]}>{'Description:'}</Text>
                                                                <Text style={[{ textAlignVertical: 'center', fontSize: hp('1.8%'), textAlign: 'center', color: '#828EA5', fontFamily: 'Catamaran-Medium', }, commonStyles.ml(1)]}>{item[_.keys(item)[0]].content || '---'}</Text>
                                                            </View>
                                                        </View>

                                                    </View>
                                                </View>
                                            }
                                        </View>
                                    )
                                }}

                            />
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
        width: wp('5%'),
        height: hp('6%'),
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
    },
    urgentRectangleShapeRed: {
        width: wp('3%'),
        height: wp('3%'),
        borderRadius: 3,
        backgroundColor: '#EA5C5B',
    },
    nonurgentRectangleShapeGreen: {
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
});
const mapStateToProps = state => ({
    data: state.user.data
});

export default connect(
    mapStateToProps,
    null
)(withNavigation(Notes));