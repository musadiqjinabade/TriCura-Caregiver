import React from "react";
import { StyleSheet, View, Image, SafeAreaView, Text, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import commonStyles from '../styles/Common';
import styleConstants from '../styles/StyleConstants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Tab from '../core/components/Tab';
import { ScrollView } from "react-native-gesture-handler";
import Header from '../core/components/Header';
import AllJobsScreen from './JobsTab/AllJobsScreen';
import UrgentsScreen from './JobsTab/UrgentsScreen';
import NonUrgentsScreen from './JobsTab/NonUrgentsScreen';
import { withNavigation, StackActions, NavigationActions } from 'react-navigation';
import Globals from '../Globals';
import AsyncStorage from '@react-native-community/async-storage';
import LoadingIndicator from '../core/components/LoadingIndicator';
import { connect } from "react-redux";
import StyleConstants from "../styles/StyleConstants";
import NetInfo from "@react-native-community/netinfo";
import { Toast, CheckBox } from 'native-base';



class JobsScreen extends React.Component {

    state = {
        topbarOption: 0,
        selected: true,
        expanded: true,
        loading: true,
        data: [],
        per_page: 1,
        page_no: 0,
        alCount: 0,
        urgentCount: 0,
        nonUrgentCount: 0
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

    // componentWillUpdate() {
    //     console.log("didFocus is working didmount")
    //     const { navigation } = this.props;
    //     this.focusListener = navigation.addListener('didFocus', () => {
    //         console.log("didFocus is  didmount")
    //         this.setState({ loading: true, page_no: 0 }, () => {
    //             this.componentWillMount();
    //         });
    //     });
    //     // this.setState({ loading: true, page_no: 0 }, () => {
    //     //     console.log("didFocus is working didmount")
    //     //     this.componentWillMount();
    //     // });
        
    // }


    // componentWillUnmount() {
    //     // Remove the event listener before removing the screen from the stack
    //     this.focusListener.remove();
    // }
    

    async componentWillMount() {
        var data = {}
        data.agency_logo = await AsyncStorage.getItem('agency_logo');
        data.agency_name = await AsyncStorage.getItem('agency_name');

        this.setState({ agency_details: data })
        this.setState({ loading: true }, async () => {
            if (await this.checkInternet()) {
                console.log("working urgent")

                this.getCurrentData();
            }
            else {
                this.showToast("No Internet Connectivity!")
                this.setState({ loading: false })

            }
        })

        this.props.navigation.addListener('didFocus', () => {
            console.log("didFocus is working")
            this.setState({ loading: true, page_no: 0 }, () => {
                this.componentWillMount();
            });
        });
    }
    showMessage(message) {
        Toast.show({
            text: message,
            duration: 2000
        })
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



    async getCurrentData() {
        this.state.page_no = this.state.page_no + 1;
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = Globals.httpMode + agency_code + Globals.domain + '/api/v1/jobs?page=' + this.state.page_no + '&per_page=' + this.state.per_page + '&job_type=all';
        console.log("url job: ", url);

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
                if (response.status === 200) {

                    console.log("data : ", response.data)
                    this.setState({ alCount: response.data.open_shifts_count, urgentCount: response.data.pending_shifts_count, nonUrgentCount: response.data.assign_shifts_count, loading: false })
                    // this.state.alCount = response.data.all_count;
                    // this.state.urgentCount = response.data.open_shifts;
                    // this.state.nonUrgentCount = response.data.assign_shifts;
                    // this.setState({
                    //     loading: false,
                    // })
                }
                else {
                    this.showToast("Invalid Credentials");
                }
            }
            catch (error) {
                console.log("error : ", error);
            }
        }
        catch (e) {
            var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
            this.setState({
                loading: false,
            })
            this.showMessage(error);
        }
    }

    renderBody() {
        if (this.state.topbarOption === 0) {
            return (
                <View>
                    <AllJobsScreen 
                    onAssignToMe={() => {
                        this.setState({ loading: true, page_no: 0 }, () => {
                            this.componentWillMount();
                        });
                    }}/>
                </View>
            )
        }
        else if (this.state.topbarOption === 1) {
            return (
                <View>
                    <UrgentsScreen 
                    onAssignToMeOpen={() => {
                        this.setState({ loading: true, page_no: 0 }, () => {
                            console.log("working urgent")
                            this.componentWillMount();
                        });
                    }}/>
                </View>
            )
        }
        else if (this.state.topbarOption === 2) {
            return (
                <View>
                    <NonUrgentsScreen 
                    onAssignToMeAssign={() => {
                        this.setState({ loading: true, page_no: 0 }, () => {
                            this.componentWillMount();
                        });
                    }}/>
                </View>
            )
        }
    }

    _onRefresh = () => {
        this.setState({ loading: true, page_no: 0 }, () => {
            this.componentWillMount();
        });
    }

    render() {
        if (this.state.loading) {
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={"Jobs"} expanded={this.state.expanded} Agency_logo={this.state.agency_details} onBack={() => {
                        this.props.navigation.goBack()
                    }} /><View style={[styles.full, styles.center]}>
                        <ActivityIndicator
                            size='large'
                            color={StyleConstants.gradientStartColor}
                        />
                    </View>
                </SafeAreaView>
            )
        }
        else {
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={"Jobs"} expanded={this.state.expanded} Agency_logo={this.state.agency_details} onBack={() => {
                        this.props.navigation.goBack()
                    }} />
                    <ScrollView
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.loading}
                                onRefresh={this._onRefresh}
                                colors={["#4254C5"]}
                            />}>
                        <View style={[commonStyles.margin, commonStyles.full]}>
                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Tab
                                    index={0}
                                    label={"Open Shift"}
                                    count={this.state.alCount}
                                    onPress={async (topbarOption) => {
                                        if (await this.checkInternet()) {
                                            this.setState({
                                                topbarOption: topbarOption
                                            })
                                        } else {
                                            this.showToast("No Internet Connectivity!")

                                        }
                                    }}
                                    selected={this.state.topbarOption === 0} />

                                <Tab
                                    index={1}
                                    label={"Pending"}
                                    count={this.state.urgentCount}
                                    onPress={async (topbarOption) => {
                                        if (await this.checkInternet()) {
                                            this.setState({
                                                topbarOption: topbarOption
                                            })
                                        }
                                        else {
                                            this.showToast("No Internet Connectivity!")

                                        }
                                    }}
                                    selected={this.state.topbarOption === 1} />

                                <Tab
                                    index={2}
                                    label={"Assigned"}
                                    count={this.state.nonUrgentCount}
                                    onPress={async (topbarOption) => {
                                        if (await this.checkInternet()) {
                                            this.setState({
                                                topbarOption: topbarOption
                                            })
                                        } else {
                                            this.showToast("No Internet Connectivity!")

                                        }
                                    }}
                                    selected={this.state.topbarOption === 2} />
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

});
const mapStateToProps = state => ({
    data: state.user.data
});

export default connect(
    mapStateToProps,
    null
)(withNavigation(JobsScreen));