import React from "react";
import { StyleSheet, View, Image, SafeAreaView, ImageBackground, ActivityIndicator, Dimensions, Platform, TouchableOpacity, Alert } from 'react-native';
import commonStyles from '../styles/Common';
import styleConstants from '../styles/StyleConstants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../core/components/Header';
import { withNavigation, StackActions, NavigationActions } from 'react-navigation';
import ImagePicker from 'react-native-image-crop-picker';
import { FloatingAction } from "react-native-floating-action";
import { ScrollView, FlatList } from "react-native-gesture-handler";
import AsyncStorage from '@react-native-community/async-storage';
import Globals from '../Globals';
import { Toast } from 'native-base';
import { connect } from "react-redux";
var RNFS = require('react-native-fs');



class ShiftPhotoScreen extends React.Component {
    state = {
        expanded: true,
        data: '',
        images:[]
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

    renderModalContent = () => {
        if (this.state.arriveloading) {
            return (
                <View style={styles.overlay}>
                    <ActivityIndicator
                        size='large'
                        color={styleConstants.gradientStartColor}
                    />
                </View>
            );
        }
        else {
            return null;
        }
    }

    async deleteimgrender(data_item) {
        var item = data_item[Object.keys(data_item)[0]];
        console.log('item:', item)

        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = Globals.httpMode + agency_code + Globals.domain + '/api/v1/shifts/' + this.state.id;
        var data = new URLSearchParams();
        data.append('shift[images_attributes][id]', item.id)
        data.append('shift[images_attributes][_destroy]', true)
        try {
            var access_token = this.props.data.access_token;
            console.log("acc : ", access_token);
            const headers = {
                'Accept': 'application/json',
                'Content-Disposition': 'application/form-data',
                'App-Token': '96ef950f-bfae-4ee5-89a0-f23ab9e50b96',
                'Authentication-Token': access_token,
                'Content-Type': 'application/x-www-form-urlencoded'
            }

            var response = await axios.put(url, data, {
                headers: headers
            })
            if (response.status === 200) {
                console.log("data update : ", response)
                this.setState({ images: '' })
                this.showToast("Photo delete Successfully");
            }
            this.getCurrentData()


        }
        catch (e) {
            var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
            console.log("data update : ", response)
            this.showToast(error);


        }

    }


    async getCurrentData() {
        console.log("acc : ", this.props.data.access_token);

        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = Globals.httpMode + agency_code + Globals.domain + '/api/v1/shifts/current';
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
            var response = await axios.get(url, {
                headers: headers
            })
            if (response.status === 200) {
                console.log("data : ", response.data)
                var mainData = [];
                mainData = response.data[Object.keys(response.data)[0]];
                this.setState({
                    data: response.data, curloading: false, id: mainData.id
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

    async componentWillMount() {
        var data = {}
        data.agency_logo = await AsyncStorage.getItem('agency_logo');
        data.agency_name = await AsyncStorage.getItem('agency_name');

        this.setState({ agency_details: data })
        this.setState({ curloading: true }, () => {
            this.getCurrentData();
        })
    }

    selectImage() {
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
                        }).then(async responsepath => {
                            console.log('state images ', responsepath);
                        this.setState({ arriveloading: true })
                        var mainData = [];
                        mainData = this.state.data[Object.keys(this.state.data)[0]];
                        var agency_code = await AsyncStorage.getItem('agency_code');
                        var url = Globals.httpMode + agency_code + Globals.domain + '/api/v1/shifts/' + mainData.id;
                        var image = responsepath.path.replace('file:///storage/emulated/0/Pictures/', '')
                        const data = new FormData();
                        data.append('shift[images_attributes][0][content]', {
                            uri: responsepath.path,
                            type: 'image/jpg',
                            name: image
                        })

                        console.log("url : ", url, "requestBody:", data);
                        try {
                            const axios = require('axios');
                            var access_token = this.props.data.access_token;
                            console.log("acc : ", access_token);
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
                            this.setState({ arriveloading: false })
                            this.showToast("Photo uploaded Successfully");
                            this.getCurrentData()
                        }
                        catch (e) {
                            var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
                            console.log('e:e', e)
                            this.showToast(error);
                            ImagePicker.clean().then(() => {
                                console.log('removed all tmp images from tmp directory');
                            }).catch(e => {
                                console.log("e:", e)
                            });
                            this.setState({ arriveloading: false })

                        }
                        });
                    },
                },
                {
                    text: 'Take Photo',
                    onPress: () => {ImagePicker.openCamera({
                        width: 300,
                        height: 400,
                        cropping: false,
                        mediaType: 'photo',
                        compressImageQuality: 0.7
                    }).then(async responsepath => {
                        console.log('state images ', responsepath);
                        this.setState({ arriveloading: true })
                        var mainData = [];
                        mainData = this.state.data[Object.keys(this.state.data)[0]];
                        var agency_code = await AsyncStorage.getItem('agency_code');
                        var url = Globals.httpMode + agency_code + Globals.domain + '/api/v1/shifts/' + mainData.id;
                        var image = responsepath.path.replace('file:///storage/emulated/0/Pictures/', '')
                        const data = new FormData();
                        data.append('shift[images_attributes][0][content]', {
                            uri: responsepath.path,
                            type: 'image/jpg',
                            name: image
                        })

                        console.log("url : ", url, "requestBody:", data);
                        try {
                            const axios = require('axios');
                            var access_token = this.props.data.access_token;
                            console.log("acc : ", access_token);
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
                            this.setState({ arriveloading: false })
                            this.showToast("Photo uploaded Successfully");
                            this.getCurrentData()

                            RNFS.exists(responsepath.path)
                                .then((result) => {
                                    if (result) {
                                        return RNFS.unlink(RNFS.PicturesDirectoryPath)
                                            .then(() => {
                                                console.log('working', RNFS);
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
                                                    });
                                            })
                                            .catch((err) => {
                                                console.log("error photo " + err.message);
                                            });
                                    }
                                })
                                .catch((err) => {
                                    console.log(err.message);
                                });


                        }
                        catch (e) {
                            var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
                            console.log('e:e', e)
                            this.showToast(error);
                            ImagePicker.clean().then(() => {
                                console.log('removed all tmp images from tmp directory');
                            }).catch(e => {
                                console.log("e:", e)
                            });
                            this.setState({ arriveloading: false })

                        }

                    });
                    }
                },
            ],
            { cancelable: true },
        );
    }

    render() {

        if (this.state.curloading) {
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor,]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={"Shift Photos"} expanded={true} onBack={() => {
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
                var mainData = [];
                mainData = this.state.data[Object.keys(this.state.data)[0]];
                var images = Object.keys(mainData.images).map(key => ({ [key]: mainData.images[key] }));
                // console.log('main_data:',images)
            }
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={"Shift Photos"} Agency_logo={this.state.agency_details} expanded={this.state.expanded} onBack={() => {
                        this.props.navigation.goBack()
                    }} />
                    <ScrollView >

                        <View style={[commonStyles.margin, { marginTop: hp('3%'), marginBottom: hp('3%') }]}>
                            <FlatList
                                extraData={images}
                                data={images}
                                renderItem={({ item }) => {
                                    console.log("item:", item[Object.keys(item)[0]])

                                    return (
                                        <View>
                                            <ImageBackground
                                                fadeDuration={0}
                                                style={[styles.clientImage, { marginBottom: wp('2%') }]}
                                                imageStyle={{ borderRadius: 5 }}
                                                source={{ uri: item[Object.keys(item)[0]].url }}>
                                                <TouchableOpacity style={[commonStyles.row, { justifyContent: 'flex-end', alignSelf: 'flex-end' }]}
                                                    onPress={() => this.deleteimgrender(item)}>
                                                    <Image style={styles.smallImage}
                                                        source={require('../../assets/images/cross-delete.png')} />
                                                </TouchableOpacity>

                                            </ImageBackground>
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
                        style={[commonStyles.rh(7), commonStyles.center, , commonStyles.br(0.3), {
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
                        onPressMain={position => {
                            this.selectImage()
                            
                        }}
                    />
                    {this.renderModalContent()}

                </SafeAreaView>
            );
        }
    }
}

const styles = StyleSheet.create({
    clientImage: {
        width: wp('90%'),
        height: hp('25%'),
    },
    smallImage: {
        justifyContent: 'flex-end',
        alignContent: 'flex-end',
        margin: hp('1%'),
        width: wp('5.5%'),
        height: hp('5.5%'),
        aspectRatio: 1,
        tintColor: 'red'
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
)(withNavigation(ShiftPhotoScreen));