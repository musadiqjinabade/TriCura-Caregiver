import React from "react";
import { StyleSheet, View, Image, SafeAreaView, Text, TouchableOpacity, ActivityIndicator, TextInput, RefreshControl, Platform, Alert } from 'react-native';
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
import ImagePicker from 'react-native-image-crop-picker';
import NetInfo from "@react-native-community/netinfo";
var RNFS = require('react-native-fs');

class ExtraExpenses extends React.Component {

    state = {
        expanded: true,
        curloading: false,
        data: '',
        shift_date: '',
        address: '',
        markers: [],
        checked: false,
        isVisible: true,
        cost: '',
        details: '',
        item: '',
        images: '',
        shift_id: null
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
        this.getCurrentData()
        this.setState({ item: this.props.navigation.state.params.item1 }, () => {
            // console.log("mapping id:", this.state.data, "item:", this.state.item)
        })
    }

    _onRefresh = () => {
        this.setState({ curloading: true, loading: true }, () => {
            this.componentDidMount();
            this.setState({ curloading: true })
        });
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

    GetTaskCost(value) {
        this.setState({ cost: value })
    }

    GetTaskDescription(value) {
        this.setState({ details: value })
    }

    async editselectphoto(item, url, images_id) {
        if (await this.checkInternet()) {
            this.setState({ update: false, cost: item.cost.toString(), details: item.description, shift_id: item.shift_id, id: item.id, images: url, img_id: images_id }, () => {
                this.refs.modal5.open()
            })
        }
        else {
            this.showToast("No Internet Connectivity!")

        }
    }

    async updatedelete() {
        if (await this.checkInternet()) {

        // console.log('url:url')

        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = Globals.httpMode + agency_code  + Globals.domain + '/api/v1/shift_expenses/' + this.state.id;
        const data = new FormData();
        data.append('shift_expense[shift_id]', this.state.shift_id)
        data.append('shift_expense[cost]', this.state.cost)
        data.append('shift_expense[description]', this.state.details)
        data.append('shift_expense[images_attributes][0][content]', null)
        data.append('shift_expense[images_attributes][id]', this.state.img_id)
        data.append('shift_expense[images_attributes][_destroy]', true)

        try {

            //var response = await this.props.data.formRequest.get(url);
            var access_token = this.props.data.access_token;
            // console.log("acc : ", access_token);
            const headers = {
                'Accept': 'application/json',
                'Content-Disposition': 'application/form-data',
                'App-Token': '96ef950f-bfae-4ee5-89a0-f23ab9e50b96',
                'Authentication-Token': access_token
            }

            var response = await axios.put(url, data, {
                headers: headers
            })
            // console.log("data update : ", response)
            this.setState({ images: '' })


        }
        catch (e) {
            var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
        }

    }else{
        this.showToast("No Internet Connectivity!")
    }

    }


    async UpdateExtraExpenses() {
        if (await this.checkInternet()) {
        this.setState({ okloading: true })
        var mainData = [];
        if (this.state.data && this.state.cost) {
            if(this.state.cost){
                if(this.state.details){
            mainData = this.state.data[Object.keys(this.state.data)[0]];
            // console.log('mainData: ', mainData)
            const axios = require('axios');
            var agency_code = await AsyncStorage.getItem('agency_code');
            var url = Globals.httpMode + agency_code  + Globals.domain + '/api/v1/shift_expenses/' + this.state.id;
            const data = new FormData();
            var image = this.state.update ? this.state.images.replace('file:///storage/emulated/0/Pictures/', '') : null
            data.append('shift_expense[shift_id]', this.state.shift_id)
            data.append('shift_expense[cost]', this.state.cost)
            data.append('shift_expense[description]', this.state.details)
            console.log('images',image)

            this.state.update ?
                data.append('shift_expense[images_attributes][0][content]', {
                    uri: this.state.images,
                    type: 'image/jpg',
                    name: image
                }) : null
                console.log('bodydata',data)


            try {

                //var response = await this.props.data.formRequest.get(url);
                var access_token = this.props.data.access_token;
                // console.log("acc : ", access_token);
                const headers = {
                    'Accept': 'application/json',
                    'Content-Disposition': 'application/form-data',
                    'App-Token': '96ef950f-bfae-4ee5-89a0-f23ab9e50b96',
                    'Authentication-Token': access_token
                }

                var response = await axios.put(url, data, {
                    headers: headers
                })
                // console.log("data update : ", response)

                if (response.status === 200) {
                    // console.log("update : ", response.data)
                    this.showToast("Extra Expense Updated Successfully")
                    this.refs.modal5.close()
                    this.getCurrentData()

                    this.setState({
                        cost: '', details: '', okloading: false
                    }, () => {RNFS.exists(this.state.images)
                        .then((result) => {
                            if (result) {
                                return RNFS.unlink(RNFS.PicturesDirectoryPath)
                                    .then(() => {
                                        console.log('working',RNFS);
                                        return RNFS.unlink(RNFS.ExternalCachesDirectoryPath)
                                        .then(() => {
                                            console.log('error');
                                            return RNFS.unlink(RNFS.PicturesDirectoryPath)
                                        .then(() => {
                                            console.log('error');
                                        })
                                        .catch((err) => {
                                            console.log("error " + err.message);
                                        });  
                                        })
                                        .catch((err) => {
                                            console.log("error " + err.message);
                                        });                                        })
                                    .catch((err) => {
                                        console.log("error photo " + err.message);
                                    });
                            }
                        })
                        .catch((err) => {
                            console.log(err.message);
                        });
                    })
                }
                else {
                    var data1 = response.data.error;
                    this.showToast(data1);
                    this.refs.modal5.close()
                    this.setState({
                        okloading: false, cost: '', details: '', images: ''
                    })
                    this.getCurrentData()


                }
            }
            catch (e) {
                var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
                this.showToast(error);
                this.refs.modal5.close()
                this.getCurrentData()
                this.setState({
                    okloading: false, cost: '', details: '', images: ''
                })
            }
        }
        else{
            this.showToast("Enter Description")
            this.setState({ okloading: false })
        }
        }
        else{
            this.showToast("Enter Cost")
            this.setState({ okloading: false })
        }
        } else {
            this.showToast("Enter Cost")
            this.setState({ okloading: false })

        }

    }
    else{
        this.showToast("No Internet Connectivity!")
    }

    }

    async addExtraExpenses() {
        if (await this.checkInternet()) {
        this.setState({ okloading: true })
        var mainData = [];
        if (this.state.data && this.state.cost) {
            if(this.state.details){
            mainData = this.state.data[Object.keys(this.state.data)[0]];
            // console.log('mainData: ', mainData)

            const axios = require('axios');
            var agency_code = await AsyncStorage.getItem('agency_code');
            var url = Globals.httpMode + agency_code  + Globals.domain + '/api/v1/shift_expenses';
            console.log("url : ", url);
            const data = new FormData();
            var image = this.state.images.replace('file:///storage/emulated/0/Pictures/', '')
            data.append('shift_expense[shift_id]', mainData.id)
            data.append('shift_expense[cost]', this.state.cost)
            data.append('shift_expense[description]', this.state.details)
            this.state.update ? data.append('shift_expense[images_attributes][0][content]', {
                uri: this.state.images,
                type: 'image/jpg',
                name: image
            }) : null

            try {

                //var response = await this.props.data.formRequest.get(url);
                var access_token = this.props.data.access_token;
                // console.log("acc : ", access_token);
                const headers = {
                    'Accept': 'application/json',
                    'Content-Disposition': 'application/form-data',
                    'App-Token': '96ef950f-bfae-4ee5-89a0-f23ab9e50b96',
                    'Authentication-Token': access_token
                }

                var response = await axios.post(url, data, {
                    headers: headers
                })
                // console.log("data response : ", response)

                if (response.status === 200) {
                    // console.log("responsedata : ", response.data)
                    
                    this.showToast("Extra Expense Added Successfully")
                    this.refs.modal6.close()
                    console.log('rnfs', RNFS);
                    
                    this.getCurrentData()
                    this.setState({
                        cost: '', details: '', okloading: false
                    }, () => {
                        RNFS.exists(this.state.images)
                            .then((result) => {
                                if (result) {
                                    return RNFS.unlink(RNFS.PicturesDirectoryPath)
                                        .then(() => {
                                            console.log('working',RNFS);
                                            return RNFS.unlink(RNFS.ExternalCachesDirectoryPath)
                                            .then(() => {
                                                console.log('error');
                                                return RNFS.unlink(RNFS.PicturesDirectoryPath)
                                            .then(() => {
                                                console.log('error');
                                            })
                                            .catch((err) => {
                                                console.log("error " + err.message);
                                            });  
                                            })
                                            .catch((err) => {
                                                console.log("error " + err.message);
                                            });                                        })
                                        .catch((err) => {
                                            console.log("error photo " + err.message);
                                        });
                                }
                            })
                            .catch((err) => {
                                console.log(err.message);
                            });
                    })
                }
                else {
                    var data1 = response.data.error;
                    this.showToast(data1);
                    this.refs.modal6.close()
                    this.setState({
                        okloading: false, cost: '', details: '', images: ''
                    })
                    this.getCurrentData()

                }
            }
            catch (e) {
                var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
                this.showToast(error);
                this.refs.modal6.close()
                this.getCurrentData()
                this.setState({
                    okloading: false, cost: '', details: '', images: ''
                })
            }
        }
        else{
            this.showToast("Enter Description")
            this.setState({ okloading: false })
        }
        } else {
            this.showToast("Enter Cost")
            this.setState({ okloading: false })

        }
        }
        else{
            this.showToast("No Internet Connectivity!")
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



    async getCurrentData() {
        if (await this.checkInternet()) {
        
        this.setState({ curloading: true })
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = Globals.httpMode + agency_code  + Globals.domain + '/api/v1/shifts/current';
        console.log("url : ", url);

        try {

            var access_token = this.props.data.access_token;
            console.log("acc : ", access_token);
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
                // console.log("data : ", response.data)
                this.setState({
                    data: response.data, curloading: false
                })
            }

            else {
                var data1 = response.data.error;
                this.showToast(data1);
                this.setState({
                    curloading: false
                })

            }

        }
        catch (e) {
            var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
            this.showToast(error);
            this.navigateToDashboard();
            this.setState({
                curloading: false
            })
        }

    }
    else {
        this.showToast("No Internet Connectivity!")

    }
    }

    selectphoto() {
        this.setState({ images: '' })
        Alert.alert(
            'Add Photo',
            'Select Upload Mode',
            [
                {
                    text: 'Photo Library',
                    onPress: () => {
                        {Platform.OS === "ios" ?ImagePicker.openPicker({
                            width: 300,
                            height: 400,
                            cropping: false,
                            mediaType: 'photo',
                            compressImageQuality: 0.7
                        }).then(async(response) => {
                            console.log('state images ', response.path);
                            this.setState({ images: response.path, update: true })
                        })
                        :
                        ImagePicker.openPicker({
                            width: 300,
                            height: 400,
                            cropping: false,
                            mediaType: 'photo',
                            compressImageQuality: 0.7
                        }).then(async(response) => {
                            console.log('state images ', response);
                            this.setState({ images: response.path, update: true },()=>{
                                console.log('rnfs:',RNFS)
                
                        
                            })
                        });
                        }
                    },
                },
                {
                    text: 'Take Photo',
                    onPress: () => {
                        {Platform.OS === "ios" ?ImagePicker.openCamera({
                            width: 300,
                            height: 400,
                            cropping: false,
                            mediaType: 'photo',
                            compressImageQuality: 0.7
                        }).then(async(response) => {
                            console.log('state images ', response.path);
                            this.setState({ images: response.path, update: true })
                        })
                        :
                        ImagePicker.openCamera({
                            width: 300,
                            height: 400,
                            cropping: false,
                            mediaType: 'photo',
                            compressImageQuality: 0.7
                        }).then(async(response) => {
                            console.log('state images ', response);
                            this.setState({ images: response.path, update: true },()=>{
                                console.log('rnfs:',RNFS)
                
                        
                            })
                        });
                        }
                    }
                },
            ],
            { cancelable: true },
        );
    }

    async updateselectphoto() {
        Alert.alert(
            'Add Photo',
            'Select Upload Mode',
            [
                {
                    text: 'Photo Library',
                    onPress: () => {
                        ImagePicker.openPicker({
                            width: 300,
                            height: 400,
                            cropping: false,
                            mediaType: 'photo',
                            compressImageQuality: 0.7
                        }).then(async(response) => {
                            {Platform.OS === "ios" ?this.setState({ images: response.path, update: true }):
                            // console.log('state images ', response.path);
                            this.setState({ images: response.path, update: true })
                            await ImagePicker.clean().then(() => {
                                console.log('removed all tmp images from tmp directory');
                              }).catch(e => {
                                alert(e);
                              });
                              await ImagePicker.clean().then(() => {
                                console.log('removed all tmp images from tmp directory');
                              }).catch(e => {
                                alert(e);
                              });}
                        });
                    },
                },
                {
                    text: 'Take Photo',
                    onPress: () => {
                        ImagePicker.openCamera({
                        width: 300,
                        height: 400,
                        cropping: false,
                        mediaType: 'photo',
                        compressImageQuality: 0.7
                    }).then(async(response) => {
                        {Platform.OS === "ios" ?this.setState({ images: response.path, update: true }):
                        // console.log('state images ', response.path);
                        this.setState({ images: response.path, update: true })
                        await ImagePicker.clean().then(() => {
                            console.log('removed all tmp images from tmp directory');
                          }).catch(e => {
                            alert(e);
                          });
                          await ImagePicker.clean().then(() => {
                            console.log('removed all tmp images from tmp directory');
                          }).catch(e => {
                            alert(e);
                          });}
                    });

                    }
                },
            ],
            { cancelable: true },
        );
    }


    render() {
        const { navigate } = this.props.navigation;
        var shift_data = [];
        var mainData = [];
        Geocoder.init("AIzaSyAbjtnF9LXxwmSf3ATD4aHnOuX0hF9AqO0");
        if (this.state.curloading) {
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor,]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={"Extra Expenses"} Agency_logo={this.state.agency_details} expanded={this.state.expanded} onBack={() => {
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
                console.log("data expenses:", this.state.data)
                mainData = this.state.data[Object.keys(this.state.data)[0]];
                const x = mainData.shift_expenses;
                var expense_data = Object.keys(x).map(key => ({ [key]: x[key] }));

            }

            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={"Extra Expenses"} Agency_logo={this.state.agency_details} expanded={this.state.expanded} onBack={() => {
                        this.props.navigation.goBack()
                    }} />
                    <ScrollView showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.curloading}
                            onRefresh={this._onRefresh}
                            colors={["#4254C5"]}
                        />}>
                        <View style={[commonStyles.full, commonStyles.margin, { marginBottom: wp('2%') }]}>
                            <TouchableOpacity style={[styles.itemRectangleShape, { flexDirection: 'row' }]}>
                                <View style={commonStyles.row, { padding: wp('2%'), flex: 1 }}>
                                    <View style={commonStyles.column, { justifyContent: 'flex-start', alignContent: 'center' }}>
                                        <Text style={[styles.itemHeader]}>Total Expenses: $ {mainData.total_extra_expenses || '0'}</Text>
                                    </View>

                                </View>
                            </TouchableOpacity>
                            {/* <FlatList */}
                            <FlatList
                                extraData={expense_data}
                                data={expense_data}
                                renderItem={({ item }) => {
                                    var images_url = ''
                                    var images_id = ''
                                    if (item[Object.keys(item)[0]].images) {
                                        const images = item[Object.keys(item)[0]].images
                                        console.log("images all:", images)
                                        console.log("images first:", Object.keys(images).length-1)


                                        if (Object.keys(images).length>0) {
                                            images_url = images[Object.keys(images)[Object.keys(images).length-1]].url
                                            images_id = images[Object.keys(images)[Object.keys(images).length-1]].id
                                            console.log("images2:", images_url)
                                        }
                                        console.log("images2:", images_url)

                                    }
                                    return (
                                        <View>
                                            <View style={[styles.itemRectangleShape, { flexDirection: 'row' }]}>
                                                <View style={{ padding: wp('2%'), flex: 1, justifyContent: 'flex-start', alignContent: 'center', flexDirection: 'row' }}>
                                                    <View >
                                                        <Image style={[styles.clientImage]}
                                                            source={{ uri: images_url }} />
                                                    </View>
                                                    <View style={{ flexDirection: 'column', marginLeft: wp('3%') }}>
                                                        <View style={{ justifyContent: 'flex-start', alignContent: 'center' }}>
                                                            <Text style={[styles.itemHeader, { alignSelf: 'flex-start' }]}>{item[Object.keys(item)[0]].description || '--'}</Text>
                                                        </View>
                                                        <View style={[commonStyles.column, { width: wp('20%'), justifyContent: 'flex-start' }]}>
                                                            <Text style={[styles.itemHeader, { alignSelf: 'flex-start' }]}>$ {item[Object.keys(item)[0]].cost}</Text>
                                                        </View>
                                                    </View>
                                                    <TouchableOpacity style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'flex-end', margin: wp('2%') }}
                                                        onPress={() => { this.editselectphoto(item[Object.keys(item)[0]], images_url, images_id) }}>
                                                        <Image style={[{ height: hp('4%'), width: wp('4%'), resizeMode: 'contain', alignSelf: 'flex-end' }]}
                                                            source={require('../../../assets/images/pencileditbutton.png')} />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    )
                                }}
                            />
                        </View>
                    </ScrollView>
                    <FloatingAction
                        color={'#2685C5'}
                        start={{ x: 0.0, y: 0.25 }} end={{ x: 1.2, y: 1.0 }}
                        shadow={{
                            shadowColor: "#000",
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                        }}
                        style={[style.rh(7), style.center, , style.br(0.3), {
                            width: wp('25%'),
                            height: wp('13%'),
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
                        }]}
                        animated={false}
                        showBackground={false}
                        onPressMain={position => { this.setState({ cost: '', details: '', images: '' }, () => { this.refs.modal6.open() }) }}/>
                    <Modal style={[styles.modal, styles.modal1]} position={"center"} ref={"modal6"} swipeArea={20}
                        backdropPressToClose={true}  >
                        <ScrollView keyboardShouldPersistTaps={true}>
                            <View style={{ flex: 1, width: wp('85%'), justifyContent: 'center', alignContent: 'center', backgroundColor: '#fff', borderRadius: 4, flexDirection: 'column', paddingHorizontal: wp('1%') }} >
                                <TouchableOpacity style={[style.mb(0.1), { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-end', marginRight: wp('3%') }]}
                                    onPress={() => { this.refs.modal6.close() }}>
                                    <View style={{ marginLeft: wp('6%') }}></View>
                                    <Text style={[style.boldFont, style.fontSize(3), { justifyContent: 'center', alignSelf: 'center', color: '#3B5793', marginLeft: wp('2%') }]}>Add Expense</Text>
                                    <Image style={[{ height: hp('5%'), width: wp('5%'), resizeMode: 'contain', alignSelf: 'flex-end' }]}
                                        source={require('../../../assets/images/error.png')} />
                                </TouchableOpacity>
                                <View style={[style.mb(0.1), { margin: wp('4%'), marginTop: wp('0.1%'), }]}>
                                    <Text style={[styles.boldFont, commonStyles.fs(1.9), { color: '#3B5793', fontFamily: 'Catamaran-Bold', marginLeft: wp('1%') }]}>Add Cost</Text>
                                    <TextInput
                                        style={[styles.boldFont, commonStyles.fs(2.3), { color: '#828ea5', fontFamily: 'Catamaran-Medium',borderBottomColor:'#000', borderBottomWidth:Platform.OS === "ios" ? 1:null  }]}
                                        underlineColorAndroid={'#828ea5'}
                                        onFocus={this.handleFocustitle}
                                        onBlur={this.handleBlurtitle}
                                        multiline
                                        numberOfLines={1}
                                        keyboardType={'number-pad'}
                                        placeholder={'Enter Cost'}
                                        placeholderTextColor="#828ea5"
                                        onChangeText={ValueHolder => this.GetTaskCost(ValueHolder)}
                                        value={this.state.cost} />
                                </View>
                                <View style={[style.mb(1), { margin: wp('4%'), marginTop: wp('1%') }]}>
                                    <Text style={[styles.boldFont, commonStyles.fs(1.9), { color: '#3B5793', fontFamily: 'Catamaran-Bold', marginLeft: wp('1%') }]}>Add Description</Text>
                                    <TextInput
                                        style={[styles.boldFont, commonStyles.fs(2.3), { color: '#828ea5', fontFamily: 'Catamaran-Medium',borderBottomColor:'#000', borderBottomWidth:Platform.OS === "ios" ? 1:null  }]}
                                        underlineColorAndroid={'#828ea5'}
                                        onFocus={this.handleFocusdetails}
                                        onBlur={this.handleBlurdetails}
                                        multiline
                                        numberOfLines={1}
                                        placeholder={'Enter Description'}
                                        placeholderTextColor="#828ea5"
                                        onChangeText={ValueHolder => this.GetTaskDescription(ValueHolder)}
                                        value={this.state.details} />
                                </View>
                                <TouchableOpacity style={[style.mb(1), { margin: wp('4%'), marginTop: wp('1%'), flexDirection: 'row', justifyContent: 'flex-start' }]}
                                    onPress={() => { this.selectphoto() }}>
                                    <Image style={[{ height: hp('4%'), width: wp('5%'), resizeMode: 'contain', tintColor: '#3B5793', justifyContent: 'flex-start', alignSelf: 'center' }]}
                                        source={require('../../../assets/images/Takephoto.png')} />
                                    <Text style={[styles.boldFont, commonStyles.fs(2), { color: '#3B5793', fontFamily: 'Catamaran-Bold', marginLeft: wp('1%') }]}>Add Photo</Text>
                                </TouchableOpacity>
                                {this.state.images ?
                                    <TouchableOpacity style={{ marginLeft: wp('4%'), flexDirection: 'row', justifyContent: 'flex-start' }}>
                                        <Image style={{
                                            width: wp('19%'),
                                            height: hp('19%'),
                                            aspectRatio: 1,
                                            borderColor: '#fff',
                                            backgroundColor: '#CFCFCF',
                                            borderBottomLeftRadius: 5,
                                            borderBottomRightRadius: 5,
                                            borderTopRightRadius: 5,
                                            borderTopLeftRadius: 5,
                                        }} source={{ uri: this.state.images }} />
                                    </TouchableOpacity> : null}
                                <View style={{ justifyContent: 'center', alignSelf: 'center', flexDirection: 'row', margin: wp('4%') }}>
                                    <LinearGradient
                                        colors={[styleConstants.gradientStartColor, styleConstants.gradientEndColor]}
                                        // style={styles.linearGradient}
                                        start={{ x: 0.0, y: 0.25 }} end={{ x: 1.2, y: 1.0 }}
                                        style={[style.rh(7), style.center, , style.br(0.3), {
                                            width: wp('25%'),
                                            height: wp('13%'),
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
                                        <TouchableOpacity style={{ justifyContent: 'flex-start', alignSelf: 'center', padding: wp('1%'), borderRadius: 8, flexDirection: 'row' }}
                                            onPress={() => { this.addExtraExpenses() }}>
                                            {this.state.okloading === true ? (
                                                <View style={{flex:1, paddingHorizontal:wp('2%'), flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                <View style={{ paddingRight: 10, backgroundColor: 'transparent' }}>
                                                    <ActivityIndicator size={'small'} color='#FFFFFF' />
                                                </View>
                                                <View style={{ backgroundColor: 'transparent' }}>
                                                    <Text style={{ color: '#FFFFFF', fontFamily: 'Catamaran-Bold', }}>Please Wait...</Text>
                                                </View>
                                            </View>
                                            ) : (
                                                    <Text style={[commonStyles.boldFont, { color: '#ffffff', justifyContent: 'center', alignSelf: 'center', marginHorizontal: wp('2%') }]}>Save</Text>
                                                )
                                            }
                                            {/* <Text style={[commonStyles.boldFont, { color: '#ffffff', justifyContent: 'center', alignSelf: 'center', marginHorizontal: wp('2%') }]}>OK</Text> */}
                                        </TouchableOpacity>
                                    </LinearGradient>
                                </View>
                            </View>
                        </ScrollView>
                    </Modal>
                    <Modal style={[styles.modal, styles.modal1]} position={"center"} ref={"modal5"} swipeArea={20}
                        backdropPressToClose={true}  >
                        <ScrollView keyboardShouldPersistTaps={true}>
                            <View style={{ flex: 1, width: wp('85%'), justifyContent: 'center', alignContent: 'center', backgroundColor: '#fff', borderRadius: 4, flexDirection: 'column', paddingHorizontal: wp('1%') }} >
                                <TouchableOpacity style={[style.mb(0.1), { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'flex-end', marginRight: wp('3%') }]}
                                    onPress={() => { this.refs.modal5.close() }}>
                                    <View style={{ marginLeft: wp('6%') }}></View>
                                    <Text style={[style.boldFont, style.fontSize(3), { justifyContent: 'center', alignSelf: 'center', color: '#3B5793', marginLeft: wp('2%') }]}>Add Expense</Text>
                                    <Image style={[{ height: hp('5%'), width: wp('5%'), resizeMode: 'contain', alignSelf: 'flex-end' }]}
                                        source={require('../../../assets/images/error.png')} />
                                </TouchableOpacity>
                                <View style={[style.mb(0.1), { margin: wp('4%'), marginTop: wp('0.1%'), }]}>
                                    <Text style={[styles.boldFont, commonStyles.fs(1.9), { color: '#3B5793', fontFamily: 'Catamaran-Bold', marginLeft: wp('1%') }]}>Add Cost</Text>
                                    <TextInput
                                        style={[styles.boldFont, commonStyles.fs(2.3), { color: '#828ea5', fontFamily: 'Catamaran-Medium',borderBottomColor:'#000', borderBottomWidth:Platform.OS === "ios" ? 1:null  }]}
                                        underlineColorAndroid={'#828ea5'}
                                        onFocus={this.handleFocustitle}
                                        onBlur={this.handleBlurtitle}
                                        multiline
                                        numberOfLines={1}
                                        keyboardType={'number-pad'}
                                        placeholder={'Enter Cost'}
                                        placeholderTextColor="#828ea5"
                                        onChangeText={ValueHolder => this.GetTaskCost(ValueHolder)}
                                        value={this.state.cost} />
                                </View>
                                <View style={[style.mb(1), { margin: wp('4%'), marginTop: wp('1%') }]}>
                                    <Text style={[styles.boldFont, commonStyles.fs(1.9), { color: '#3B5793', fontFamily: 'Catamaran-Bold', marginLeft: wp('1%') }]}>Add Description</Text>
                                    <TextInput
                                        style={[styles.boldFont, commonStyles.fs(2.3), { color: '#828ea5', fontFamily: 'Catamaran-Medium',borderBottomColor:'#000', borderBottomWidth:Platform.OS === "ios" ? 1:null  }]}
                                        underlineColorAndroid={'#828ea5'}
                                        onFocus={this.handleFocusdetails}
                                        onBlur={this.handleBlurdetails}
                                        multiline
                                        numberOfLines={1}
                                        placeholder={'Enter Description'}
                                        placeholderTextColor="#828ea5"
                                        onChangeText={ValueHolder => this.GetTaskDescription(ValueHolder)}
                                        value={this.state.details} />
                                </View>
                                <TouchableOpacity style={[style.mb(1), { margin: wp('4%'), marginTop: wp('1%'), flexDirection: 'row', justifyContent: 'flex-start' }]}
                                    onPress={() => { this.selectphoto() }}>
                                    <Image style={[{ height: hp('4%'), width: wp('5%'), resizeMode: 'contain', tintColor: '#3B5793', justifyContent: 'flex-start', alignSelf: 'center' }]}
                                        source={require('../../../assets/images/Takephoto.png')} />
                                    <Text style={[styles.boldFont, commonStyles.fs(2), { color: '#3B5793', fontFamily: 'Catamaran-Bold', marginLeft: wp('1%') }]}>Add Photo</Text>
                                </TouchableOpacity>


                                {this.state.images ?            
                                    <TouchableOpacity style={{ marginLeft: wp('4%'), flexDirection: 'row', justifyContent: 'flex-start' }}
                                        onPress={() => { this.updatedelete() }}>
                                        <Image style={{
                                            width: wp('19%'),
                                            height: hp('19%'),
                                            aspectRatio: 1,
                                            borderColor: '#fff',
                                            backgroundColor: '#CFCFCF',
                                            borderBottomLeftRadius: 5,
                                            borderBottomRightRadius: 5,
                                            borderTopRightRadius: 5,
                                            borderTopLeftRadius: 5,
                                        }} source={{ uri: this.state.images }} />
                                    </TouchableOpacity> : null}
                                <View style={{ justifyContent: 'center', alignSelf: 'center', flexDirection: 'row', margin: wp('4%') }}>
                                    <LinearGradient
                                        colors={[styleConstants.gradientStartColor, styleConstants.gradientEndColor]}
                                        // style={styles.linearGradient}
                                        start={{ x: 0.0, y: 0.25 }} end={{ x: 1.2, y: 1.0 }}
                                        style={[style.rh(7), style.center, , style.br(0.3), {
                                            width: wp('25%'),
                                            height: wp('13%'),
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
                                        <TouchableOpacity style={{ justifyContent: 'flex-start', alignSelf: 'center', padding: wp('1%'), borderRadius: 8, flexDirection: 'row'  }}
                                            onPress={() => { this.UpdateExtraExpenses() }}>
                                            {/* {
                                                this.state.okloading === true ? (
                                                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                        <View style={{ paddingRight: 10, backgroundColor: 'transparent' }}>
                                                            <ActivityIndicator size={'small'} color='#FFFFFF' />
                                                        </View>
                                                        <View style={{ backgroundColor: 'transparent' }}>
                                                            <Text style={{ color: '#FFFFFF', fontFamily: 'Catamaran-Bold', }}>Please Wait...</Text>
                                                        </View>
                                                    </View>
                                                ) : (
                                                        <Text style={[commonStyles.boldFont, { color: '#ffffff', justifyContent: 'center', alignSelf: 'center', marginHorizontal: wp('2%') }]}>Save</Text>
                                                    )
                                            } */}
                                            {this.state.okloading === true ? (
                                                <View style={{flex:1, paddingHorizontal:wp('2%'), flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                <View style={{ paddingRight: 10, backgroundColor: 'transparent' }}>
                                                    <ActivityIndicator size={'small'} color='#FFFFFF' />
                                                </View>
                                                <View style={{ backgroundColor: 'transparent' }}>
                                                    <Text style={{ color: '#FFFFFF', fontFamily: 'Catamaran-Bold', }}>Please Wait...</Text>
                                                </View>
                                            </View>
                                            ) : (
                                                    <Text style={[commonStyles.boldFont, { color: '#ffffff', justifyContent: 'center', alignSelf: 'center', marginHorizontal: wp('2%') }]}>Save</Text>
                                                )
                                            }
                                        </TouchableOpacity>
                                    </LinearGradient>
                                </View>
                            </View>
                        </ScrollView>
                    </Modal>
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
        width: wp('8%'),
        height: hp('9%'),
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
        fontFamily: 'Catamaran-Medium',
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
        maxHeight: 250,
        minHeight: 80
    },
    modal1: {
        maxHeight: hp("72%"),
        marginTop: wp('5%'),
        // borderWidth:1,
        minHeight: 80
    }
});
const mapStateToProps = state => ({
    data: state.user.data
});

export default connect(
    mapStateToProps,
    null
)(withNavigation(ExtraExpenses));