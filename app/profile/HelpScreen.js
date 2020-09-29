import React from "react";
import { StyleSheet, View, Text, SafeAreaView, Image, FlatList, Linking,Dimensions, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import commonStyles from '../styles/Common';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, widthPercentageToDP, heightPercentageToDP } from 'react-native-responsive-screen';
import { Collapse, CollapseHeader, CollapseBody, AccordionList } from 'accordion-collapse-react-native';
import { ScrollView } from "react-native-gesture-handler";
import Header from '../core/components/Header';
import { withNavigation, StackActions, NavigationActions } from 'react-navigation';
import Globals from '../Globals';
import AsyncStorage from '@react-native-community/async-storage';
import LoadingIndicator from '../core/components/LoadingIndicator';
import { connect } from "react-redux";
import StyleConstants from '../styles/StyleConstants'
import NetInfo from "@react-native-community/netinfo";
import {Toast} from "native-base";
import VersionInfo from 'react-native-version-info';


const window = Dimensions.get('window');

class HelpScreen extends React.Component {

    state = {
        expanded: true,
        helploading: true,
        data: [],
        count: [0],
    }

   async componentWillMount() {
        var data={}
                data.agency_logo = await AsyncStorage.getItem('agency_logo');
                data.agency_name = await AsyncStorage.getItem('agency_name');
                data.email = await AsyncStorage.getItem('agency_email');

                
                this.setState({agency_details:data},()=>{
                    console.log('agency data:',data)
                })
        this.setState({ helploading: true }, async() => {
            if (await this.checkInternet()) {
            this.getCurrentData();
            }
            else{
                this.showMessage("No Internet Connectivity!")

            }
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

        var url = Globals.httpMode + agency_code + Globals.domain + '/api/v1/question_and_answers';
        console.log("url : ", url);

        try {
            var access_token = this.props.data.access_token;
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
                    response.data.question_and_answers.sort(
                        function(a, b) {          
                           if (a.order === b.order) {
                              // Price is only important when cities are the same
                              return b.order - a.order;
                           }
                           return a.order > b.order ? 1 : -1;
                        });

                    var responseData = _.map(_.get(response, 'data.question_and_answers', []), (item) => {
                        return {
                            ...item,
                            mode: 'Collapsed'
                        }
                    })
                    
                    this.setState({

                        data: this.state.data.concat(responseData), helploading: false
                    })
                    
                }
                else {
                    this.showMessage("Invalid Credentials");
                }
            }
            catch (error) {
                console.log("error : ", error);
            }
        }
        catch (e) {
            var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
            this.setState({
                helploading: false,
            })
            this.showMessage(error);
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

    render() {
        if (this.state.helploading) {
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor,]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={"Help & FAQ"} expanded={true} onBack={() => {
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
            console.log("email:",this.state.agency_details)
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor]}>
                    <Header onLogo={() => { this.navigateToDashboard() }} label={"Help & FAQ"} expanded={this.state.expanded} Agency_logo={this.state.agency_details} onBack={() => {
                        this.props.navigation.goBack()
                    }} />
                    <ScrollView  >
                        <View style={[commonStyles.margin, commonStyles.column, commonStyles.full, {justifyContent:'space-between',alignContent:'space-between'}]}>
                            <View style={{flex:1,justifyContent:'flex-start', marginBottom: hp('3%')}}>
                            <Text style={[commonStyles.headerTextBoldFont]}>Help</Text>

                            <View style={styles.rectangleShape} >
                                <Text style={{ fontSize: hp('1.8%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', }}>How do you wish to contact us?</Text>

                                <View style={[commonStyles.row, { marginTop: wp('3%') }]}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginTop: -10, }}>
                                        <Image style={styles.calendarImage}
                                            source={require('../../assets/images/email.png')} />
                                    </View>
                                    <TouchableOpacity onPress={() => Linking.openURL('mailto:' + this.props.data.user[Object.keys(this.props.data.user)[0]].email)}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: wp('3%') }}>
                                            <Text style={[commonStyles.headerTextRegularFont, { color: '#41A2EB', textDecorationLine: 'underline' }]}>{this.state.agency_details.email || '---'}</Text>
                                        </View>
                                    </TouchableOpacity>

                                </View>
                                <View style={[commonStyles.row, { marginTop: wp('1%') }]}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginTop: -10, }}>
                                        <Image style={styles.calendarImage}
                                            source={require('../../assets/images/phone.png')} />
                                    </View>
                                    <TouchableOpacity onPress={() => Linking.openURL(`tel:${this.props.data.agency.phone ? this.props.data.agency.phone : null}`)}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: wp('3%') }}>
                                            <Text style={[commonStyles.headerTextRegularFont, { color: '#41A2EB', textDecorationLine: 'underline' }]}>{this.props.data.agency.phone ? this.props.data.agency.phone : 'Not Avaliable'}</Text>
                                        </View>
                                    </TouchableOpacity>

                                </View>
                            </View>

                            <Text style={[commonStyles.headerTextBoldFont, { marginTop: wp('5%') }]}>FAQs</Text>

                            <FlatList
                                extraData={this.state.data}
                                data={this.state.data}
                                renderItem={({ item }) => {
                                    // this.setState({count: this.state.count+1})
                                    // console.log("clientData:", item)

                                    return (
                                        <View style={{ marginTop: '5%', borderRadius: 5, backgroundColor: '#ffffff', padding: 10 }}>
                                            <Collapse
                                                onToggle={() => {
                                                    var dataClone = [...this.state.data];
                                                    for (var i = 0; i < dataClone.length; i++) {
                                                        if (dataClone[i].id === item.id) {
                                                            // console.log("dataClone[i].id:",dataClone[i].id,"dataClone[i].mode:",dataClone[i].mode)

                                                            dataClone[i].mode = item.mode === "Collapsed" ? "Expanded" : "Collapsed"
                                                        }
                                                    }
                                                    this.setState({
                                                        data: dataClone
                                                    })
                                                }}
                                            >
                                                <CollapseHeader>
                                                    <View style={{ flexDirection: 'row', paddingRight: wp('6%'), justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Text style={{ marginLeft: wp('0.5%'), fontFamily: 'Catamaran-Bold', color: '#293D68', fontSize: hp('2.1%'), width: wp('80%') }}>{item.question}</Text>
                                                        {item.mode == "Collapsed" ?
                                                            <Image style={styles.down_arrow}
                                                                source={require('../../assets/images/down-arrow.png')} /> : <Image style={styles.down_arrow}
                                                                    source={require('../../assets/images/up-arrow.png')} />}
                                                    </View>
                                                </CollapseHeader>
                                                <CollapseBody>
                                                    <View style={commonStyles.line} />
                                                    <Text style={{ fontSize: hp('1.8%'), color: '#828EA5', fontFamily: 'Catamaran-Regular', }}>{item.answer}</Text>
                                                </CollapseBody>
                                            </Collapse>
                                        </View>
                                    )
                                }}
                                keyExtractor={(item, index) => index.toString()}
                            // ItemSeparatorComponent={this.renderSeparator}
                            // ListFooterComponent={this.renderFooter.bind(this)}
                            // onEndReachedThreshold={0.4}
                            // onEndReached={() => {
                            //     this.loadMore()
                            // }}
                            />
                            
                            </View>
                            
                        </View>
                        

                        
                        
                        
                    </ScrollView>
                    <View style={{
                                // width:widthPercentageToDP('90%'),
                                // height:Platform.OS=='ios'?window.height-heightPercentageToDP('70%'):window.height-heightPercentageToDP('68%'),
                                justifyContent: 'flex-end',
                                alignItems: 'flex-end',
                                // marginBottom:hp('1%')
                                // position: 'absolute', //Here is the trick
                                // bottom: 0,
                            }}>
                                <Text style={{
                                    justifyContent: 'flex-end',marginBottom:wp('1%'), alignSelf: 'center', fontSize: hp('2%'), color: '#828EA5', fontFamily: 'Catamaran-Medium'
                                }}>App Version: {VersionInfo.appVersion}</Text>
                            </View>
                </SafeAreaView>
            );
        }

    }
}

const styles = StyleSheet.create({
    rectangleShape: {
        padding: wp('3%'),
        marginTop: wp('3%'),
        borderRadius: 5,
        width: wp('90%'),
        backgroundColor: '#fff',
    },
    calendarImage: {
        width: wp('3%'),
        height: hp('3%'),
        resizeMode: 'contain'
    },
    down_arrow: {
        marginTop: wp('2%'),
        width: wp('3%'),
        height: hp('3%'),
        justifyContent: 'flex-end',
        alignSelf: 'flex-end',
        resizeMode: 'contain'

    }
});
const mapStateToProps = state => ({
    data: state.user.data
});

export default connect(
    mapStateToProps,
    null
)(withNavigation(HelpScreen));
