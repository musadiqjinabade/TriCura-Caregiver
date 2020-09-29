import React from "react";
import { StyleSheet, View, Image, SafeAreaView, Text, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import commonStyles from '../styles/Common';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Tab from '../core/components/Tab';
import { ScrollView } from "react-native-gesture-handler";
import Header from '../core/components/Header';
import Upcoming from './Upcoming';
import ShiftHistoryScreen from './ShiftHistoryScreen';
import RefusedScreen from './ShiftHistiryTabs/RefusedScreen';
import CanceledScreen from './ShiftHistiryTabs/CanceledScreen';
import { withNavigation, StackActions, NavigationActions } from 'react-navigation';
import Globals from '../Globals';
import AsyncStorage from '@react-native-community/async-storage';
import LoadingIndicator from '../core/components/LoadingIndicator';
import { connect } from "react-redux";
import StyleConstants from '../styles/StyleConstants'
import { Toast } from 'native-base';

class Shift extends React.Component {

    state = {
        topbarOption: 0,
        selected: true,
        expanded: true,
        loading: true,
        data: [],
        per_page: 10,
        page_no: 0,
        completed: 0,
        refused: 0,
        canceled: 0,
        dateArray: []

    }

    async componentWillMount() {
        var data = {}
        data.agency_logo = await AsyncStorage.getItem('agency_logo');
        data.agency_name = await AsyncStorage.getItem('agency_name');

        this.setState({ agency_details: data })
        this.setState({ loading: true }, () => {
            this.getCurrentData();
        })
    }
    showToast(message) {
        Toast.show({
            text: message,
            duration: 2000
        })
    }

    async getCurrentData() {
        this.state.page_no = this.state.page_no + 1;
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var start = new Date();
        console.log('start:', start);

        var nextsevenDay = new Date(start);
        nextsevenDay.setDate(start.getDate() + 6);
        console.log(nextsevenDay); // May 01 2000    
        while (start <= nextsevenDay) {
            this.state.dateArray.push(moment(start).format())
            start = moment(start).add(1, 'days');
        }
        console.log("dateArray:", this.state.dateArray);

        var millisecondsMonday = moment(start).format('X');
        var millisecondsSunday = moment(nextsevenDay).format('X');

        console.log("start millisecondsMonday:", this.state.per_page, "nextsevenDay:", millisecondsSunday);
        var url = Globals.httpMode + agency_code + Globals.domain + '/api/v1/shifts?page=' + this.state.page_no + '&per_page=' + this.state.per_page;
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
            try {
                var response = await axios.get(url, {
                    headers: headers
                })
                console.log("data response : ", response)
                this.setState({ completed: response.data.upcoming_count, refused: response.data.history, canceled: response.data.canceled, loading: false })
            }
            catch (error) {
                console.log("error : ", error);
                this.showToast(error);

                this.setState({
                    loading: false,
                })
            }
        }
        catch (e) {
            var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
            console.log("error : ", e);

            this.setState({
                loading: false,
            })
            this.showToast(error);
        }
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

    renderBody() {
        if (this.state.topbarOption === 0) {
            return (
                <View>
                    <Upcoming />

                </View>
            )
        }
        else if (this.state.topbarOption === 1) {
            return (
                <View>
                    <ShiftHistoryScreen />
                </View>
            )
        }
    }

    _onRefresh = () => {
        this.setState({ loading: true, page_no:0 }, () => {
            this.componentWillMount();
        });
    }

    render() {
        if (this.state.loading) {
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor,]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={"Shifts"} expanded={true} onBack={() => {
                        this.props.navigation.goBack()
                    }} />
                    <View style={[styles.full, styles.center]}>
                        <ActivityIndicator
                            size='large'
                            color={StyleConstants.gradientStartColor}
                        />
                    </View>
                </SafeAreaView>)
        }
        else {
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor]}>


                    <Header onLogo={() => { this.navigateToDashboard() }} label={"Shifts"} expanded={this.state.expanded} Agency_logo={this.state.agency_details} onBack={() => {
                        this.props.navigation.goBack()
                    }} />
                    <ScrollView 
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.loading}
                            onRefresh={this._onRefresh}
                            colors={["#4254C5"]}
                        />}>

                        <View style={[commonStyles.margin, commonStyles.full,{marginTop:hp('-2%')}]}>
                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between',alignSelf:'flex-start' }}>

                                <Tab
                                    index={0}
                                    label={"Upcoming"}
                                    count={this.state.completed}
                                    onPress={(topbarOption) => {
                                        this.setState({
                                            topbarOption: topbarOption
                                        })
                                    }}
                                    selected={this.state.topbarOption === 0} />

                                <Tab
                                    index={1}
                                    label={"History"}
                                    count={this.state.refused}
                                    onPress={(topbarOption) => {
                                        this.setState({
                                            topbarOption: topbarOption
                                        })
                                    }}
                                    selected={this.state.topbarOption === 1} />
                            </View>
                        </View>
                        {this.renderBody()}
                    </ScrollView>
                </SafeAreaView>
            );
        }

    }
}

const styles = StyleSheet.create({
    itemRectangleShape: {
        borderWidth: 0.01,
        borderTopRightRadius: 5,
        borderTopLeftRadius: 5,
        borderBottomRightRadius: 5,
        borderBottomLeftRadius: 5,
        backgroundColor: '#fff',
        borderColor: '#fff'
    },
    downUpArrow: {
        marginLeft: wp('3%'),
        justifyContent: 'center',
        alignSelf: 'center',
        width: wp('4%'),
        height: hp('4%'),
        aspectRatio: 1
    },
});
const mapStateToProps = state => ({
    data: state.user.data
});

export default connect(
    mapStateToProps,
    null
)(withNavigation(Shift));