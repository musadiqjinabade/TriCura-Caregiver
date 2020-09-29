import React from "react";
import { StyleSheet, View, Image, SafeAreaView, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, KeyboardAvoidingView, Platform } from 'react-native';
import commonStyles from '../styles/Common';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, widthPercentageToDP } from 'react-native-responsive-screen';
import Header from '../core/components/Header';
import { ScrollView } from "react-native-gesture-handler";
import { withNavigation, StackActions, NavigationActions } from 'react-navigation';
import Globals from '../Globals';
import AsyncStorage from '@react-native-community/async-storage';
import LoadingIndicator from '../core/components/LoadingIndicator';
import { connect } from "react-redux";
import StyleConstants from '../styles/StyleConstants'
import { Toast } from 'native-base';
import NetInfo from "@react-native-community/netinfo";

class CommunicationScreen extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            expanded: true,
            loading: true,
            data: [],
            per_page: 70,
            page_no: 0,
            messageContent: '',
            isFocused: false,
            agency_details: '',
            a_name: ''
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

    timestamp(date) {
        var a = moment.unix(date)
        var b = moment()

        if (a.from(b, true) == 'a few seconds') {
            return 'Just now'
        } else {
            var diff = b.diff(a, 'minutes');
            if (diff < 60) {
                return diff + " min";
            }
            else {
                return a.from(b, true);
            }
        }
    }



    handleFocus = event => {
        this.setState({ isFocused: true, animated:true });
        if (this.props.onFocus) {
            this.props.onFocus(event);
        }

    };

    handleBlur = event => {
        this.setState({ isFocused: false });
        if (this.props.onBlur) {
            this.props.onBlur(event);
        }
    };
    async componentWillMount() {
        var data = {}
        data.agency_logo = await AsyncStorage.getItem('agency_logo');
        data.agency_name = await AsyncStorage.getItem('agency_name');

        this.setState({ agency_details: data })
        if (await this.checkInternet()) {
            this.setState({ loading: true }, () => {
                this.getCurrentData();
            })
        }
        else {
            this.showToast("No Internet Connectivity!")
            this.props.navigation.goBack();
        }
    }

    showToast(message) {
        Toast.show({
            text: message,
            duration: 2000
        })
    }

    async sendMessage() {
        if (this.state.messageContent === null || this.state.messageContent === '') {
            this.showToast("Enter message content")
        }
        else {
            // this.setState({ loading: true })
            this.state.page_no = this.state.page_no + 1;
            const axios = require('axios');
            var agency_code = await AsyncStorage.getItem('agency_code');

            var url = Globals.httpMode + agency_code  + Globals.domain + '/api/v1/messages';
            console.log("url : ", url);
            var requestBody = qs.stringify({
                'message[receiver_id]': "",
                'message[content]': this.state.messageContent,
            });
            try {

                //var response = await this.props.data.formRequest.get(url);
                var access_token = this.props.data.access_token;

                const headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'App-Token': '96ef950f-bfae-4ee5-89a0-f23ab9e50b96',
                    'Authentication-Token': access_token
                }
                try {
                    var response = await axios.post(url, requestBody, {
                        headers: headers
                    })
                    if (response.status === 200) {
                        console.log("data : ", response.data)
                        if (response.data !== null) {
                            this.setState({
                                loading: false,
                                page_no: 0,
                                messageContent: ''
                            }, () => {
                                // this.showToast(response.data.message);
                                this.setState({ loading: false }, () => {
                                    this.getCurrentData();
                                })
                            })
                        }
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
                this.showToast(error);
            }
        }

    }

    async getCurrentData() {
        this.state.page_no = 0;
        this.state.page_no = this.state.page_no + 1;
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');

        var url = Globals.httpMode + agency_code  + Globals.domain + '/api/v1/messages?per_page=' + this.state.per_page + '&page=' + this.state.page_no;
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
                if (response.status === 200) {
                    console.log("data : ", response.data)
                    if (response.data !== null) {
                        this.setState({

                            data: response.data.messages, loading: false
                        })
                    }
                    else {
                        this.state.page_no = this.state.page_no - 1;
                    }
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
            this.showToast(error);
        }
    }

    async loadMore() {
        this.state.page_no = this.state.page_no + 1;
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = Globals.httpMode + agency_code  + Globals.domain + '/api/v1/messages?per_page=' + this.state.per_page + '&page=' + this.state.page_no;
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
                if (response.status === 200) {
                    if (response.data !== null) {
                        this.setState({

                            data: this.state.data.concat(response.data.messages), loading: false
                        })
                    }
                    else {
                        this.state.page_no = this.state.page_no - 1;
                    }
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
            if (error === "Network error!") {
                this.showToast(error);
                this.state.page_no = this.state.page_no - 1;
                this.setState({
                    curloading: false
                })
            }
            else {
                this.setState({
                    loading: false,
                })
                this.showToast(error);
            }
        }
    }

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



    render() {
        if (this.state.loading) {
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor,]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={"Communication"} expanded={true} onBack={() => {
                        this.props.navigation.goBack()
                    }} />
                    <View style={[styles.full, styles.center]}>
                        <ActivityIndicator
                            size='large'
                            color={StyleConstants.gradientStartColor}
                        />
                    </View>
                </SafeAreaView>
            )
        }
        else {
            var clientData = this.state.data;
            console.log("listData : ", clientData)
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor,{flex:1}]}>
                    <Header   Agency_logo={this.state.agency_details} onLogo={() => { this.navigateToDashboard() }} label={"Communication"} expanded={this.state.expanded} onBack={() => {
                        this.props.navigation.goBack()
                    }} />
                    <ScrollView
                        keyboardShouldPersistTaps={true}
                        ref={ref => this.scrollView = ref}
                        onContentSizeChange={(contentWidth, contentHeight) => {
                            this.scrollView.scrollToEnd({ animated: true });
                        }}

                        refreshControl={
                            <RefreshControl refreshing={false} onRefresh={() => this.setState({ loading: true }, () => {
                                this.getCurrentData();
                            })} />
                        }

                    >
                        <View style={[commonStyles.margin, commonStyles.column, commonStyles.full, commonStyles.mb(2), {
                            marginLeft: widthPercentageToDP('2.0%'),
                            marginRight: widthPercentageToDP('2.0%')
                        }]}>

                            <FlatList
                                data={clientData}
                                inverted={true}
                                renderItem={({ item }) => {

                                    return (
                                        <View style={[commonStyles.full, {
                                            marginLeft: widthPercentageToDP('2.0%'),
                                            marginRight: widthPercentageToDP('2.0%')
                                        }]}>
                                            {
                                                item.is_mine ?
                                                    <View style={[commonStyles.row, commonStyles.full, commonStyles.mt(2), commonStyles.width, { justifyContent: 'flex-end', alignItems: 'flex-end' }]}>
                                                        <View style={{ marginRight: wp('2%'), justifyContent: 'flex-end', alignItems: 'center', width: wp('15%') }}>
                                                            <Text style={styles.dateStyle}>{this.timestamp(item.created_at)}</Text>
                                                        </View>
                                                        <View style={{ backgroundColor: '#1E99BB', padding: wp('3%'), borderRadius: 8, width: wp('63%') }}>
                                                            <Text style={styles.chatStyleWhite}>{item.content}</Text>
                                                        </View>
                                                        <View style={{ justifyContent: 'flex-end', alignItems: 'flex-end', width: wp('11.5%'), }}>
                                                            {
                                                                item.sender.avatar ? <View>
                                                                    <Image style={[styles.clientImage]}
                                                                        resizeMode={"cover"}
                                                                        resizeMethod={"resize"} // <-------  this helped a lot as OP said
                                                                        // progressiveRenderingEnabled={true}
                                                                        source={{ uri: item.sender.avatar }} />
                                                                </View> :
                                                                    // <View style={[commonStyles.center, { width: wp('8%'), height: hp('4%'), backgroundColor: '#fff', borderColor: 'black', borderWidth: wp('0.1%'), borderRadius: 14 }]}>
                                                                    //     <Text style={[commonStyles.fs(3), { color: StyleConstants.gradientStartColor }]}>{item.sender.name.charAt(0).toUpperCase()}</Text>
                                                                    // </View>
                                                                    <View style={[commonStyles.center, { width: wp('8%'), height: hp('4%') }]}>
                                                                        <Image style={[styles.clientImage]}
                                                                            resizeMode={"cover"}
                                                                            resizeMethod={"resize"} // <-------  this helped a lot as OP said
                                                                            // progressiveRenderingEnabled={true}
                                                                            source={require('../../assets/images/avatar.png')} />
                                                                    </View>
                                                            }
                                                        </View>
                                                    </View>
                                                    :
                                                    <View style={[commonStyles.row, commonStyles.full, commonStyles.mt(2), { justifyContent: 'flex-start', alignItems: 'flex-end' }]}>
                                                        <View style={{ justifyContent: 'flex-end', alignItems: 'flex-start', width: wp('11.5%'), }}>
                                                            {
                                                                item.sender.avatar ? <View>
                                                                    <Image style={[styles.clientImage]}
                                                                        resizeMode={"cover"}
                                                                        resizeMethod={"resize"} // <-------  this helped a lot as OP said
                                                                        // progressiveRenderingEnabled={true}
                                                                        source={{ uri: item.sender.avatar }} />
                                                                </View> :
                                                                    // <View style={[commonStyles.center, { width: wp('8%'), height: hp('4%'), backgroundColor: '#fff', borderColor: 'black', borderWidth: wp('0.1%'), borderRadius: 14 }]}>
                                                                    //     <Text style={[commonStyles.fs(3), { color: StyleConstants.gradientStartColor }]}>{item.sender.name.charAt(0).toUpperCase()}</Text>
                                                                    // </View>
                                                                    <View style={[commonStyles.center, { width: wp('8%'), height: hp('4%'), backgroundColor: '#fff', borderColor: 'black', borderRadius: 14 }]}>
                                                                        <Image style={[styles.clientImage]}
                                                                            resizeMode={"cover"}
                                                                            resizeMethod={"resize"} // <-------  this helped a lot as OP said
                                                                            // progressiveRenderingEnabled={true}
                                                                            source={require('../../assets/images/avatar.png')} />
                                                                    </View>
                                                            }
                                                        </View>
                                                        <View style={{ backgroundColor: '#FFFFFF', padding: wp('3%'), borderRadius: 8, width: wp('63%') }}>
                                                            <Text style={styles.chatStyleDark}>{item.content}.</Text>
                                                        </View>
                                                        <View style={{ marginLeft: wp('3%'), justifyContent: 'flex-end', alignItems: 'center', width: wp('15%') }}>
                                                            <Text style={styles.dateStyle}>{this.timestamp(item.created_at)}</Text>
                                                        </View>
                                                    </View>
                                            }
                                        </View>
                                    )
                                }}
                                keyExtractor={(item, index) => index.toString()}
                                // ItemSeparatorComponent={this.renderSeparator}
                                // ListFooterComponent={this.renderFooter.bind(this)}
                                // onEndReachedThreshold={0.4}
                                onEndReached={() => {
                                    this.loadMore()
                                }}
                            />
                        </View>
                    </ScrollView>
                   {Platform.OS=='ios'? <KeyboardAvoidingView behavior="padding" enabled>
                    <View style={[commonStyles.row, commonStyles.center, commonStyles.mb(2)]}>
                        <View style={[commonStyles.row, { backgroundColor: '#ffffff', padding: wp('1%'), borderRadius: 8, width: wp('90%'), }]}>
                            <View style={{ width: wp('70%') }}>
                                <TextInput
                                    onFocus={this.handleFocus}
                                    onChangeText={(text) => {
                                        this.setState({
                                            messageContent: text
                                        })
                                    }}
                                    value={this.state.messageContent}
                                    style={[commonStyles.pv(1), commonStyles.fontSize(2.2), commonStyles.ml(1.5), { fontFamily: 'Catamaran-Regular'  }]}
                                    placeholder={'Type Message here'}
                                />
                            </View>
                            <TouchableOpacity style={[commonStyles.mb(1), commonStyles.mt(1), commonStyles.full]}
                                onPress={async () => {
                                    if (await this.checkInternet()) {
                                        this.sendMessage();
                                    }
                                    else {
                                        this.showToast("No Internet Connectivity!")
                                    }
                                }}>
                                <View style={{ justifyContent: 'center', alignItems: 'flex-end', width: wp('15%'), }}>
                                    <Image style={styles.sendImage}
                                        source={require('../../assets/images/send.png')} />
                                </View>
                            </TouchableOpacity>

                        </View>
                    </View>
                    </KeyboardAvoidingView>:<View style={[commonStyles.row, commonStyles.center, commonStyles.mb(2)]}>
                        <View style={[commonStyles.row, { backgroundColor: '#ffffff', padding: wp('1%'), borderRadius: 8, width: wp('90%'), }]}>
                            <View style={{ width: wp('70%') }}>
                                <TextInput
                                    onFocus={this.handleFocus}
                                    onChangeText={(text) => {
                                        this.setState({
                                            messageContent: text
                                        })
                                    }}
                                    value={this.state.messageContent}
                                    style={[commonStyles.pv(1), commonStyles.fontSize(2.2), commonStyles.ml(1.5), { fontFamily: 'Catamaran-Regular'  }]}
                                    placeholder={'Type Message here'}
                                />
                            </View>
                            <TouchableOpacity style={[commonStyles.mb(1), commonStyles.mt(1), commonStyles.full]}
                                onPress={async () => {
                                    if (await this.checkInternet()) {
                                        this.sendMessage();
                                    }
                                    else {
                                        this.showToast("No Internet Connectivity!")
                                    }
                                }}>
                                <View style={{ justifyContent: 'center', alignItems: 'flex-end', width: wp('15%'), }}>
                                    <Image style={styles.sendImage}
                                        source={require('../../assets/images/send.png')} />
                                </View>
                            </TouchableOpacity>

                        </View>
                    </View>}
                </SafeAreaView >
            );
        }

    }
}

const styles = StyleSheet.create({
    chatStyleDark: {
        fontFamily: 'Catamaran-Regular',
        color: '#293D68',
        fontSize: hp('2.2%')
    },
    chatStyleWhite: {
        fontFamily: 'Catamaran-Regular',
        color: '#ffffff',
        fontSize: hp('2.2%')
    },
    dateStyle: {
        fontFamily: 'Catamaran-Regular',
        color: '#828EA5',
        fontSize: hp('1.7%')
    },
    clientImage: {
        width: wp('8%'), height: hp('4%'),
        aspectRatio: 1,
        borderBottomLeftRadius: 14,
        borderBottomRightRadius: 14,
        borderTopRightRadius: 14,
        borderTopLeftRadius: 14,
    },
    otherImages: {
        borderColor: '#fff',
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        borderTopRightRadius: 5,
        borderTopLeftRadius: 5,
        width: wp('4.5%'),
        height: hp('4.5%'),
        aspectRatio: 1
    },
    sendImage: {
        width: wp('4s%'),
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
)(withNavigation(CommunicationScreen));
