import React from 'react';
import { StyleSheet, View, Image, SafeAreaView, Text, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, RefreshControl } from 'react-native';
import { CheckBox, Textarea, Toast } from 'native-base';
import { withNavigation, StackActions, NavigationActions } from 'react-navigation';
import commonStyles from '../styles/Common';
import styleConstants from '../styles/StyleConstants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { ScrollView } from "react-native-gesture-handler";
import Header from '../core/components/Header';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from "react-native-modal-datetime-picker";
import moment from 'moment';
import AsyncStorage from '@react-native-community/async-storage';
import { connect } from "react-redux";
import Globals from '../Globals';

class ShiftUnavailability extends React.Component {

    state = {
        currentDate: moment().format('ddd, D MMM YYYY'),
        isEndDatePicker: false,
        selectedEndDate: moment().format('ddd, D MMM YYYY'),
        isEndTimePicker: false,
        selectedEndTime: moment().format('hh:mm A'),
        isStartDatePicker: false,
        selectedStartDate: moment().format('ddd, D MMM YYYY'),
        isStartTimePicker: false,
        selectedStartTime: moment().format('hh:mm A'),
        expanded: true,
        markers: [{
            latitude: 18.543719,
            longitude: 73.935942,
        }]
    }

    showMessage(message) {
        Toast.show({
            text: message,
            duration: 2000
        })
    }

    async componentWillMount() {
        var data = {}
        data.agency_logo = await AsyncStorage.getItem('agency_logo');
        data.agency_name = await AsyncStorage.getItem('agency_name');

        this.setState({ agency_details: data })
    }

    // End Date Picker
    showEndDatePicker = () => {
        this.setState({ isEndDatePicker: true });
    };

    hideEndDatePicker = () => {
        this.setState({ isEndDatePicker: false, isStartDatePicker:false });
    };

    handleEndDatePicker = date => {
        var sDate = moment(date).format('ddd, D MMM YYYY')
        this.setState({ selectedEndDate: sDate ,isEndDatePicker: false,});
        this.hideEndDatePicker();
    };

    showEndTimePicker = () => {
        this.setState({ isEndTimePicker: true });
    };

    hideEndTimePicker = () => {
        this.setState({ isEndTimePicker: false });
    };

    handleEndTimePicked = time => {
        this.hideEndTimePicker();
        this.setState({ selectedEndTime: moment(time).format('hh:mm A') })
    };


    // Start Date Picker
    showStartDatePicker = () => {
        this.setState({ isStartDatePicker: true });
    };

    hideStartDatePicker = () => {
        this.setState({ isStartDatePicker: false });
    };

    handleStartDatePicker = date => {
        var sDate = moment(date).format('ddd, D MMM YYYY')
        this.setState({ selectedStartDate: sDate });
        this.hideStartDatePicker();
    };

    showStartTimePicker = () => {
        this.setState({ isStartTimePicker: true });
    };

    hideStartTimePicker = () => {
        this.setState({ isStartTimePicker: false });
    };

    handleStartTimePicked = time => {
        this.hideStartTimePicker();
        this.setState({ selectedStartTime: moment(time).format('hh:mm A') })
    };

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

    async saveUnavailibility() {
        var a = this.state.selectedStartDate + " " + this.state.selectedStartTime;
        var startTimeStamp = moment(a).unix();

        var b = this.state.selectedEndDate + " " + this.state.selectedEndTime;
        var endTimeStamp = moment(b).unix();

        this.setState({ signloading: true });
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = Globals.httpMode + agency_code + Globals.domain + '/api/v1/unavailabilities';
        console.log("url : ", url);
        var access_token = this.props.data.access_token;
        console.log("acc : ", access_token);

        try {
            var qs = require('qs');
            //var response = await this.props.data.formRequest.get(url);
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'App-Token': '96ef950f-bfae-4ee5-89a0-f23ab9e50b96',
                'Authentication-Token': access_token
            }
            try {
                var response = await axios.post(url, qs.stringify({
                    'unavailability[start_time]': startTimeStamp,
                    'unavailability[end_time]': endTimeStamp
                }), {
                    headers: headers
                })
                if (response.status === 200) {
                    console.log("unav data : ", response)
                    this.setState({
                        data: response.data, signloading: false
                    }, () => {
                        if(response.data.message){
                            this.showMessage(response.data.message);
                        }
                        else{
                            this.showMessage("Unavailability added successfully");
                        }
                        this.props.navigation.goBack()
                    })
                }
                else {
                    this.showMessage(response.data.message);
                }
            }
            catch (error) {
                this.setState({ signloading: false })
                console.log("error : ", error);
            }
        }
        catch (e) {
            console.log("e : ", e);
            var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
            this.setState({
                signloading: false,
            })
            this.showMessage(error);
        }
    }
    _onRefresh = () => {
        this.setState({ loading: true }, () => {
            this.componentWillMount();
        });
    }

    render() {
        const { isEndDatePicker, selectedEndDate, isEndTimePicker, selectedEndTime, isStartDatePicker, selectedStartDate, isStartTimePicker, selectedStartTime } = this.state;
        const { navigate } = this.props.navigation;
        return (
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null} style={[commonStyles.full]}>
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={"Shift Unavailability"} Agency_logo={this.state.agency_details} expanded={this.state.expanded} onBack={() => {
                        this.props.navigation.goBack()
                    }} />
                    <ScrollView 
                    // refreshControl={
                    //     <RefreshControl
                    //         refreshing={this.state.loading}
                    //         onRefresh={this._onRefresh}
                    //         colors={["#4254C5"]}
                    //     />}
                        >
                        <View style={[commonStyles.full, commonStyles.margin]}>
                            <View style={[commonStyles.full, commonStyles.row, commonStyles.mt(2)]}>

                                {/* Start Date Picker */}
                                <View style={[commonStyles.full, commonStyles.column, commonStyles.mr(1)]} >
                                    <Text style={[styles.sectionHeader]}>Start</Text>
                                    <View style={[styles.dateRectangleShape, commonStyles.column, commonStyles.center, commonStyles.pd(1), { alignItems: 'flex-start' }]}>
                                        <TouchableOpacity style={[commonStyles.row, commonStyles.full]} onPress={this.showStartDatePicker}>
                                            <View style={[commonStyles.row, { flex: 3 }]}>
                                                <Image style={[styles.smallImage, commonStyles.mt(0.8), commonStyles.mr(1)]}
                                                    source={require('../../assets/images/calendar.png')} />
                                                <Text style={[{ color: '#828EA5', fontFamily: 'Catamaran-Regular', fontSize: hp('1.8%'), textAlignVertical: 'center' }]}>{selectedStartDate}</Text>
                                            </View>
                                            <TouchableOpacity onPress={this.showStartDatePicker}>
                                                <View style={[commonStyles.row, commonStyles.full, { justifyContent: 'flex-end' }]}>

                                                    <Image style={[styles.smallImageArrow, commonStyles.mt(0.5), commonStyles.mr(1), commonStyles.center, { alignSelf: 'flex-start', justifyContent: 'flex-end' }]}
                                                        source={require('../../assets/images/right-arrow.png')} />

                                                </View>
                                            </TouchableOpacity>


                                        </TouchableOpacity>
                                        <TouchableOpacity style={[commonStyles.row, commonStyles.full, { marginTop: hp('2%') }]} onPress={this.showStartTimePicker}>

                                            <View style={[commonStyles.row, { flex: 3 }]}>
                                                <Image style={[styles.smallImage, commonStyles.mt(0.8), commonStyles.mr(1)]}
                                                    source={require('../../assets/images/clock.png')} />
                                                <Text style={[{ color: '#828EA5', fontFamily: 'Catamaran-Regular', fontSize: hp('1.8%'), textAlignVertical: 'center' }]}>{selectedStartTime}</Text>
                                            </View>

                                            <TouchableOpacity onPress={this.showStartTimePicker}>
                                                <View style={[commonStyles.row, commonStyles.full, { justifyContent: 'flex-end' }]}>
                                                    <Image style={[styles.smallImageArrow, commonStyles.mt(0.5), commonStyles.mr(1), commonStyles.center, { alignSelf: 'flex-start', justifyContent: 'flex-end' }]}
                                                        source={require('../../assets/images/right-arrow.png')} />
                                                </View>
                                            </TouchableOpacity>

                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* End Date Picker */}
                                <View style={[commonStyles.full, commonStyles.column, commonStyles.ml(1)]} >
                                    <Text style={[styles.sectionHeader]}>End</Text>
                                    <View style={[styles.dateRectangleShape, commonStyles.column, commonStyles.center, commonStyles.pd(1), { alignItems: 'flex-start' }]}>
                                        <TouchableOpacity style={[commonStyles.row, commonStyles.full]} onPress={this.showEndDatePicker}>

                                            <View style={[commonStyles.row, { flex: 3 }]}>
                                                <Image style={[styles.smallImage, commonStyles.mt(0.5), commonStyles.mr(1)]}
                                                    source={require('../../assets/images/calendar.png')} />
                                                <Text style={[{ color: '#828EA5', fontFamily: 'Catamaran-Regular', fontSize: hp('1.8%'), textAlignVertical: 'center' }]}>{selectedEndDate}</Text>
                                            </View>

                                            <TouchableOpacity onPress={this.showEndDatePicker}>
                                                <View style={[commonStyles.row, commonStyles.full, { justifyContent: 'flex-end' }]}>
                                                    <Image style={[styles.smallImageArrow, commonStyles.mt(0.5), commonStyles.mr(1), commonStyles.center, { alignSelf: 'flex-start', justifyContent: 'flex-end' }]}
                                                        source={require('../../assets/images/right-arrow.png')} />
                                                </View>
                                            </TouchableOpacity>

                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={this.showEndTimePicker} style={[commonStyles.row, commonStyles.full, { marginTop: hp('2%') }]}>

                                            <View style={[commonStyles.row, { flex: 3 }]}>
                                                <Image style={[styles.smallImage, commonStyles.mt(0.8), commonStyles.mr(1)]}
                                                    source={require('../../assets/images/clock.png')} />
                                                <Text style={[{ color: '#828EA5', fontFamily: 'Catamaran-Regular', fontSize: hp('1.8%'), textAlignVertical: 'center' }]}>{selectedEndTime}</Text>
                                            </View>

                                            <TouchableOpacity onPress={this.showEndTimePicker}>
                                                <View style={[commonStyles.row, commonStyles.full, { justifyContent: 'flex-end' }]}>
                                                    <Image style={[styles.smallImageArrow, commonStyles.mt(0.5), commonStyles.mr(1), commonStyles.center, { alignSelf: 'flex-start', justifyContent: 'flex-end' }]}
                                                        source={require('../../assets/images/right-arrow.png')} />
                                                </View>
                                            </TouchableOpacity>

                                        </TouchableOpacity>

                                    </View>
                                </View>
                            </View>
                            <View style={commonStyles.pt(2)}>
                                <TouchableOpacity style={[commonStyles.mb(2), commonStyles.mt(2), commonStyles.full]}
                                    onPress={() => {
                                        var current = moment(moment().format('hh:mm A'), 'hh:mm A')
                                        var selected = moment(this.state.selectedStartTime,'hh:mm A')
                                        // var startTimeStamp = moment(a).unix();

                                        // console.log("1:",moment(this.state.currentDate).isAfter(moment(this.state.selectedStartDate)),moment(this.state.currentDate),moment(this.state.selectedStartDate))
                                        // console.log("2:",moment(this.state.selectedStartDate).isAfter(moment(this.state.selectedEndDate)), moment(this.state.selectedStartDate), moment(this.state.selectedEndDate))
                                        // console.log("3:",moment(this.state.selectedStartTime, 'h:mma').isAfter(moment(this.state.selectedEndTime, 'h:mma')), moment(this.state.selectedStartTime, 'h:mma'), moment(this.state.selectedEndTime, 'h:mma'))
                                        // console.log("4:",this.state.selectedStartTime === this.state.selectedEndTime && this.state.selectedStartDate === this.state.selectedEndDate)
                                        // console.log("5:",moment(this.state.selectedStartTime).isAfter(moment(this.state.selectedEndTime)))
                                        // console.log("6:",moment(this.state.currentDate).isSame(moment(this.state.selectedStartDate)) &&current>selected)


                                        // console.log("current:",current,'selected time:',selected,current>selected)
                                        if (moment(this.state.currentDate).isAfter(moment(this.state.selectedStartDate))) {
                                            this.showMessage('Please select todays date or greater.');
                                        }
                                        else if (moment(this.state.selectedStartDate).isAfter(moment(this.state.selectedEndDate))) {
                                            this.showMessage('Start date is greater than end date.');
                                        }
                                        else if( moment(this.state.currentDate).isSame(moment(this.state.selectedStartDate)) && moment(this.state.selectedStartDate).isSame(moment(this.state.selectedEndDate))){
                                            console.log("current date")
                                             if (moment(this.state.selectedStartTime, 'h:mma').isAfter(moment(this.state.selectedEndTime, 'h:mma'))) {
                                                this.showMessage('Start time is greater than end time.');
                                            }
                                            else if (this.state.selectedStartTime === this.state.selectedEndTime && this.state.selectedStartDate === this.state.selectedEndDate) {
                                                this.showMessage('Change default items.');
                                            }
                                            else if (moment(this.state.selectedStartTime).isAfter(moment(this.state.selectedEndTime))) {
                                                this.showMessage('Start time is smaller than end time.');
                                            }
                                            else if (moment(this.state.currentDate).isSame(moment(this.state.selectedStartDate)) &&current>selected) {
                                                    this.showMessage('Start time selected should be greater than current time.');
                                            }
                                            else{
                                                this.saveUnavailibility();
                                            }
                                        }
                                        else if(moment(this.state.selectedStartDate).isSame(moment(this.state.selectedEndDate)) ){
                                            console.log("not current date")
                                            if(moment(this.state.selectedStartTime, 'h:mma').isAfter(moment(this.state.selectedEndTime, 'h:mma'))){
                                                this.showMessage('Start time is greater than end time.');
                                            }
                                            else if (this.state.selectedStartTime === this.state.selectedEndTime ) {
                                                this.showMessage('Change default items.');
                                            }
                                            else{
                                            console.log("date success",moment(this.state.selectedStartTime), moment(this.state.selectedEndTime))
                                                this.saveUnavailibility()
                                            }
                                        }
                                        // else if(!moment(this.state.selectedStartTime, 'h:mma').isAfter(moment(this.state.currentDate,'h:mma'))){
                                        //     if (moment(date,'h:mma').isAfter(moment(this.state.selectedStartTime,'h:mma'))) {
                                        //         this.showMessage('Start time selected should be greater than current time.');
                                        //     }
                                        // }
                                        // else if (moment().isSameOrAfter(moment(this.state.selectedStartTime,'h:mma'))) {
                                        //     this.showMessage('Start time selected should be greater than current time.');
                                        // }
                                        // else if (this.state.selectedStartTime.toString() > .isSameOrAfter(moment(date,'h:mma'))) {
                                        //     this.showMessage('Start time selected should be greater than current time.');
                                        // }
                                        else {
                                            this.saveUnavailibility();
                                        }
                                    }}>
                                    <LinearGradient
                                        colors={[styleConstants.gradientStartColor, styleConstants.gradientEndColor]} style={commonStyles.linearGradient}
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
                                        {
                                            this.state.signloading === true ? (
                                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                    <View style={{ paddingRight: 10, backgroundColor: 'transparent' }}>
                                                        <ActivityIndicator size={'small'} color='#FFFFFF' />
                                                    </View>
                                                    <View style={{ backgroundColor: 'transparent' }}>
                                                        <Text style={{ color: '#FFFFFF', fontFamily: 'Catamaran-Bold', }}>Please Wait...</Text>
                                                    </View>
                                                </View>
                                            ) : (
                                                    <Text style={[styles.boldFont, commonStyles.fontSize(2.5), { color: 'white', textAlign: 'center' }]}> Save Details </Text>
                                                )
                                        }

                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <DateTimePicker
                            // isDarkModeEnabled={darkMode}
                            // mode={date}
                            style={{color:'#000'}}
                            isVisible={isEndDatePicker}
                            onConfirm={this.handleEndDatePicker}
                            onCancel={this.hideEndDatePicker}
                        />
                        <DateTimePicker
                            mode={'time'}
                            isVisible={isEndTimePicker}
                            onConfirm={this.handleEndTimePicked}
                            date={new Date()}
                            onCancel={this.hideEndTimePicker} />
                        <DateTimePicker
                            isVisible={isStartDatePicker}
                            onConfirm={this.handleStartDatePicker}
                            onCancel={this.hideEndDatePicker}
                        />
                        <DateTimePicker
                            mode={'time'}
                            isVisible={isStartTimePicker}
                            date={new Date()}
                            onConfirm={this.handleStartTimePicked}
                            onCancel={this.hideStartTimePicker} />
                    </ScrollView>
                </SafeAreaView>
            </KeyboardAvoidingView>
        );
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
    smallImage: {
        width: wp('3%'),
        height: hp('3%'),
        aspectRatio: 1,
    },
    smallImageArrow: {
        width: wp('2.4%'),
        height: hp('2.5%'),
        aspectRatio: 0.6,
    },
    itemHeader: {
        fontFamily: 'Catamaran-Bold',
        color: '#293D68',
        fontSize: hp('2.5%')
    },
    sectionHeader: {
        fontFamily: 'Catamaran-Bold',
        color: '#293D68',
        fontSize: hp('2%')
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
    dateRectangleShape: {
        marginTop: wp('1%'),
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
});

const mapStateToProps = state => ({
    data: state.user.data
});

export default connect(
    mapStateToProps,
    null
)(withNavigation(ShiftUnavailability));
