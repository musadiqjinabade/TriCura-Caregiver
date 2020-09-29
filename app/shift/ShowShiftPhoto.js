import React from "react";
import { StyleSheet, View, Image, SafeAreaView, ImageBackground, ActivityIndicator, Dimensions, Platform, TouchableOpacity } from 'react-native';
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


class ShowShiftPhoto extends React.Component {
    state = {
        expanded: true,
        data: ''
    }

    componentDidMount(){
        this.setState({ data:this.props.navigation.state.params.item},()=>{
            console.log("data:",this.state.data)
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
        var url = Globals.httpMode + agency_code  + Globals.domain + '/api/v1/shifts/' + this.state.id;
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


    async componentWillMount() {
        var data = {}
        data.agency_logo = await AsyncStorage.getItem('agency_logo');
        data.agency_name = await AsyncStorage.getItem('agency_name');

        this.setState({ agency_details: data })
        
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
        width: wp('5%'),
        height: hp('5%'),
        aspectRatio: 1,
        color: '#ffff'
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
)(withNavigation(ShowShiftPhoto));