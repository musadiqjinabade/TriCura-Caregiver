import React from "react";
import { StyleSheet, View, Image, SafeAreaView, Text, TouchableOpacity, FlatList, Linking, ActivityIndicator,Platform, TextInput } from 'react-native';
import commonStyles from '../../styles/Common';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ScrollView } from "react-native-gesture-handler";
import { withNavigation, StackActions, NavigationActions } from 'react-navigation';
import Globals from '../../Globals';
import AsyncStorage from '@react-native-community/async-storage';
import LoadingIndicator from '../../core/components/LoadingIndicator';
import { connect } from "react-redux";
import StyleConstants from '../../styles/StyleConstants'
import { Toast } from 'native-base'
import NetInfo from "@react-native-community/netinfo";


class CompletedScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: [],
            per_page: 10,
            page_no: 0,
            mode: "Collapsed",
            dateArray: [],
            search_data: [],
            search_page: 0
        }
        this.arrayholder = []
    }

    showMessage(message) {
        Toast.show({
            text: message,
            duration: 2000
        })
    }

    componentWillMount() {
        this.setState({ loading: true }, async() => {
            if (await this.checkInternet()) {
            this.getCurrentData();
        }
        else{
            this.showToast("No Internet Connectivity!")

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



    searchText(text) {
        this.setState({
            dataSource: '',
            searchInput: text,
        });
    }

    async getCurrentData() {
        this.setState({ page_no: this.state.page_no + 1 })
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');

        var start = new Date();

        var nextsevenDay = new Date(start);
        nextsevenDay.setDate(start.getDate() + 6);
        // console.log(nextsevenDay); // May 01 2000    
        while (start <= nextsevenDay) {
            this.state.dateArray.push(moment(start).format())
            start = moment(start).add(1, 'days');
        }

        var millisecondsMonday = moment(start).format('X');
        var millisecondsSunday = moment(nextsevenDay).format('X');
        var url = Globals.httpMode + agency_code  + Globals.domain + '/api/v1/shifts?page=' + this.state.page_no + '&per_page=' + this.state.per_page + '&include_status[]=finished';
        console.log("url : ", url);

        try {

            //var response = await this.props.data.formRequest.get(url);
            var access_token = this.props.data.access_token;
            console.log("access_token : ", access_token);
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
                    // console.log("data : ", response.data.completed)
                    if (response.data !== null) {
                        // console.log("data : ", response.data)
                        var responseData = _.map(_.get(response, 'data.completed', []), (item) => {
                            return {
                                ...item,
                                mode: 'Collapsed'
                            }
                        })
                        this.setState({
                            data: responseData, loading: false
                        }, () => {
                            console.log('data', this.state.data)
                        })
                    }
                    else {
                        // this.state.page_no = this.state.page_no - 1;
                        this.setState({ page_no: this.state.page_no - 1 })
                    }
                }
                else {
                    this.showToast("Invalid Credentials");
                }
            }
            catch (error) {
                // console.log("error : ", error);
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

    async loadMore() {
        this.setState({ endloading: true })
        this.state.page_no = this.state.page_no + 1;
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var start = new Date();
        // console.log('start:',start);

        var nextsevenDay = new Date(start);
        nextsevenDay.setDate(start.getDate() + 6);
        // console.log(nextsevenDay); // May 01 2000    
        while (start <= nextsevenDay) {
            this.state.dateArray.push(moment(start).format())
            start = moment(start).add(1, 'days');
        }

        var millisecondsMonday = moment(start).format('X');
        var millisecondsSunday = moment(nextsevenDay).format('X');
        // console.log("dateArray:",millisecondsMonday,"mill:",millisecondsSunday); 

        var url = Globals.httpMode + agency_code  + Globals.domain + '/api/v1/shifts?page=' + this.state.page_no + '&per_page=' + this.state.per_page + '&include_status[]=finished';
        console.log("url loadmore : ", url);

        try {

            //var response = await this.props.data.formRequest.get(url);
            var access_token = this.props.data.access_token;
            // console.log("acc : ", access_token);
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
                        console.log("error : ");
                        var responseData = _.map(_.get(response, 'data.completed', []), (item) => {
                            return {
                                ...item,
                                mode: 'Collapsed'
                            }
                        })
                        this.setState({
                            data: this.state.data.concat(responseData), loading: false
                        })
                    }
                    else {
                        this.setState({ loading: false, page_no: this.state.page_no - 1 })

                    }
                }
                else {
                    this.showToast("Invalid Credentials");
                    this.setState({ loading: false })
                }
            }
            catch (error) {
                // console.log("error : ", error);
            }
        }
        catch (e) {
            var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
            this.setState({
                loading: false,
            })
            this.showMessage(error);
        }
        this.setState({ endloading: false })

    }

    pstToLocal(start_time) {
        var time = null;
        this.state.shift_date = moment(start_time).format("DD-MM-YYYY");
        time = moment(start_time).format('hh:mm a');
        return time;
    }

    async SearchFilterFunction(text) {
        this.setState({ search_page: 1, searchInput: text })
        console.log('length:', text.length);
        if (text.length > 2) {
            this.setState({ data: [] })

            const axios = require('axios');
            var agency_code = await AsyncStorage.getItem('agency_code');

            var start = new Date();
            // console.log('start:',start);

            var nextsevenDay = new Date(start);
            nextsevenDay.setDate(start.getDate() + 6);
            // console.log(nextsevenDay); // May 01 2000    
            while (start <= nextsevenDay) {
                this.state.dateArray.push(moment(start).format())
                start = moment(start).add(1, 'days');
            }

            var url = Globals.httpMode + agency_code  + Globals.domain + '/api/v1/shifts?page=' + this.state.search_page + '&per_page=' + this.state.per_page + '&name=' + text + '&include_status[]=finished';
            console.log("search url : ", url);

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
                    var response = await axios.get(url, {
                        headers: headers
                    })

                    if (response.status === 200) {
                        if (response.data !== null) {
                            var responseData = _.map(_.get(response, 'data.completed', []), (item) => {
                                return {
                                    ...item,
                                    mode: 'Collapsed'
                                }
                            })
                            console.log('search item:', responseData)
                            this.setState({
                                data: responseData, loading: false
                            }, () => {
                                console.log('search data', this.state.data)
                            })
                        }
                        else {
                            this.setState({ search_page: this.state.search_page - 1 })
                        }
                    }
                    else {
                        this.showToast("Invalid Credentials");
                    }
                }
                catch (error) {
                    // console.log("error : ", error);
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
        else {
            this.setState({ page_no: 0, data:[] }, () => {
                this.getCurrentData()

            })
        }

    }

    async search_load() {
        this.setState({ endloading: true })
        this.state.search_page = this.state.search_page + 1;
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var start = new Date();
        // console.log('start:',start);

        var nextsevenDay = new Date(start);
        nextsevenDay.setDate(start.getDate() + 6);
        // console.log(nextsevenDay); // May 01 2000    
        while (start <= nextsevenDay) {
            this.state.dateArray.push(moment(start).format())
            start = moment(start).add(1, 'days');
        }

        var millisecondsMonday = moment(start).format('X');
        var millisecondsSunday = moment(nextsevenDay).format('X');

        var url = Globals.httpMode + agency_code  + Globals.domain + '/api/v1/shifts?page=' + this.state.search_page + '&per_page=' + this.state.per_page + '&name=' + this.state.searchInput + '&include_status[]=finished';
        console.log("url loadmore : ", url);

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
                    if (response.data !== null) {
                        console.log("error : ");
                        var responseData = _.map(_.get(response, 'data.completed', []), (item) => {
                            return {
                                ...item,
                                mode: 'Collapsed'
                            }
                        })
                        this.setState({
                            data: this.state.data.concat(responseData), loading: false
                        })
                    }
                    else {
                        // this.state.search_page = this.state.search_page - 1;
                        this.setState({ loading: false, search_page: this.state.search_page - 1 })

                    }
                }
                else {
                    this.showToast("Invalid Credentials");
                    this.setState({ loading: false })
                }
            }
            catch (error) {
                // console.log("error : ", error);
            }
        }
        catch (e) {
            var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
            this.setState({
                loading: false,
            })
            this.showMessage(error);
        }
        this.setState({ endloading: false })

    }
    async selected_data(item) {
        console.log('open press:', item)
        this.setState({ searchInput: item.name, dataSource: '', })
        this.setState({ endloading: true })
        this.state.page_no = 0 + 1;
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var start = new Date();
        // console.log('start:',start);

        var nextsevenDay = new Date(start);
        nextsevenDay.setDate(start.getDate() + 6);
        // console.log(nextsevenDay); // May 01 2000    
        while (start <= nextsevenDay) {
            this.state.dateArray.push(moment(start).format())
            start = moment(start).add(1, 'days');
        }

        var url = Globals.httpMode + agency_code  + Globals.domain + '/api/v1/shifts?page=' + this.state.page_no + '&per_page=' + this.state.per_page + '&user_id=' + item.id + '&include_status[]=finished';
        console.log("url loadmore : ", url);

        try {

            //var response = await this.props.data.formRequest.get(url);
            var access_token = this.props.data.access_token;
            // console.log("acc : ", access_token);
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
                        console.log("error : ");
                        var responseData = _.map(_.get(response, 'data.completed', []), (item) => {
                            return {
                                ...item,
                                mode: 'Collapsed'
                            }
                        })
                        this.setState({
                            data: this.state.data.concat(responseData), loading: false
                        })
                    }
                    else {
                        // this.state.page_no = this.state.page_no - 1;
                        this.setState({ loading: false, page_no: this.state.page_no - 1 })

                    }
                }
                else {
                    this.showToast("Invalid Credentials");
                    this.setState({ loading: false })
                }
            }
            catch (error) {
                // console.log("error : ", error);
            }
        }
        catch (e) {
            var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
            this.setState({
                loading: false,
            })
            this.showMessage(error);
        }
        this.setState({ endloading: false })

    }

    render() {
        const { navigate } = this.props.navigation;
        if (this.state.loading) {
            return <LoadingIndicator />
        }
        else {
            var clientData = this.state.data
            return (
                <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: wp('-5%') }} >

                    <View style={[commonStyles.full]}>
                        <View style={[commonStyles.margin, styles.itemRectangleShape, commonStyles.row]} >
                            <Image style={[styles.search]}
                                source={require('../../../assets/images/search.png')} />

                            <TextInput style={{ height: hp('6%'), width: wp('80%'), marginLeft: wp('2%') }} placeholder="Search by Client Name"
                                value={this.state.searchInput}
                                onChangeText={(text) => this.SearchFilterFunction(text)}
                                onClear={text => this.setState({ page_no: 0, data: [] }, () => { this.getCurrentData() })} />
                        </View>

                        {
                            clientData.length > 0 ?
                                <FlatList
                                    data={this.state.search_data > 0 ? this.state.search_data : clientData}
                                    renderItem={({ item, key }) => {
                                        var care_matching = item.client[_.keys(item.client)[0]].care_matching
                                        care_matching = Object.keys(care_matching).map(key => ({ [key]: care_matching[key] }));
                                        var interest_matching = item.client[_.keys(item.client)[0]].interest_matching
                                        var previous_five_cgs = item.previous_five_cgs!=null?Object.keys(item.previous_five_cgs).map(key => ({ [key]: item.previous_five_cgs[key] })):null
                                        interest_matching = Object.keys(interest_matching).map(key => ({ [key]: interest_matching[key] }));
                                        // console.log('item_key:',item)
                                        var name = item.client[_.keys(item.client)[0]].name
                                        var words = name.split(' ');
                                        return (
                                            <View style={[commonStyles.margin, commonStyles.full]}>
                                                {
                                                    item.mode === "Collapsed" ?
                                                        <View style={commonStyles.coloumn}>

                                                            <View style={[styles.itemRectangleShape, commonStyles.coloumn, { padding: wp('3%') }]} >
                                                                <TouchableOpacity 
                                                                onPress={()=>{
                                                                    navigate('ClientProfile',{item:item.client,previous_caregivers:previous_five_cgs,previous_caregiver_name:item.previous_caregiver_name})
                                                                }}
                                                                style={[commonStyles.row, commonStyles.full, { justifyContent: 'flex-start', alignItems: 'center' }]}>
                                                                    {
                                                                        item.client[_.keys(item.client)[0]].avatar_url ? <View>
                                                                            <Image style={[styles.clientImage]}
                                                                                source={{ uri: item.client[_.keys(item.client)[0]].avatar_url }} />
                                                                        </View> : (
                                                                                <View style={[commonStyles.center, { width: wp('12.5%'), height: hp('6%'), backgroundColor: '#f1f2f4', borderColor: '#c7c7c7', borderWidth: wp('0.1%'), borderRadius: 5 }]}>
                                                                                    <Text style={[commonStyles.fs(3.5), { color: StyleConstants.gradientStartColor }]}>{item.client[_.keys(item.client)[0]].name.charAt(0).toUpperCase()}</Text>
                                                                                </View>
                                                                            )
                                                                    }
                                                                    <Text style={{ marginLeft: wp('2%'), justifyContent: 'center', alignItems: 'flex-start', fontSize: hp('2.3%'), color: '#293D68', fontFamily: 'Catamaran-Regular' }}>{words[0].charAt(0).toUpperCase() + words[0].slice(1)+' '+ words[1].slice(0,1).toUpperCase()|| '---'}</Text>
                                                                </TouchableOpacity>

                                                                <View style={styles.line} />

                                                                <View style={[commonStyles.full, commonStyles.row, commonStyles.mt(1.5)]}>
                                                                    <View style={[commonStyles.row, commonStyles.center, commonStyles.full, { justifyContent: 'flex-start' }]}>
                                                                        <Image style={[styles.smallImage]}
                                                                            source={require('../../../assets/images/clock.png')} />
                                                                        <Text style={[{ textAlignVertical: 'center', fontSize: hp('1.7%'), textAlign: 'center', color: '#293D68', fontFamily: 'Catamaran-Regular', }, commonStyles.ml(1)]}>{this.pstToLocal(item.start_time) + " - " + this.pstToLocal(item.end_time)}</Text>
                                                                    </View>

                                                                    <View style={[commonStyles.row, commonStyles.center, commonStyles.full, { justifyContent: 'flex-end' }]}>
                                                                        <Image style={[styles.smallImage]}
                                                                            source={require('../../../assets/images/calendar.png')} />
                                                                        <Text style={[{ textAlignVertical: 'center', fontSize: hp('1.7%'), textAlign: 'center', color: '#293D68', fontFamily: 'Catamaran-Regular', }, commonStyles.ml(1)]}>{moment(item.start_time).format("LL")}</Text>
                                                                    </View>
                                                                </View>

                                                                <View style={[commonStyles.full, commonStyles.row, commonStyles.mt(0.4)]}>

                                                                    <View style={[commonStyles.row, commonStyles.full, { justifyContent: 'flex-start' }]}>
                                                                        <Image style={[styles.smallImage, { marginTop: 6 }]}
                                                                            source={require('../../../assets/images/location.png')} />
                                                                        <TouchableOpacity onPress={() => {
                                                                            const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
                                                                            const latLng = `${item.latitude},${item.longitude}`;
                                                                            const label = 'Custom Label';
                                                                            const url = Platform.select({
                                                                                ios: `${scheme}${item.location}`,
                                                                                android: `${scheme}${item.location}`
                                                                            });
                                                                            Linking.openURL(url);
                                                                        }}>
                                                                            <Text numberOfLines={2} style={[{ textAlignVertical: 'center', fontSize: hp('1.7%'), textAlign: 'left', color: '#293D68', fontFamily: 'Catamaran-Regular', color: '#41A2EB', textDecorationLine: 'underline' }, commonStyles.ml(1)]}>{item.location!=null?item.location:'---'}</Text>
                                                                        </TouchableOpacity>

                                                                    </View>


                                                                    <View style={[commonStyles.row, commonStyles.full, { justifyContent: 'flex-end' }]}>
                                                                        <Image style={[styles.smallImage, { marginTop: 5 }]}
                                                                            source={require('../../../assets/images/distance.png')} />
                                                                        <Text style={[{ fontSize: hp('1.7%'), textAlign: 'center', color: '#293D68', fontFamily: 'Catamaran-Regular', }, commonStyles.ml(1)]}>Distance: {item.reimbursement_mileage ? item.reimbursement_mileage.miles : "0"} ml</Text>
                                                                    </View>
                                                                </View>

                                                                <View style={[commonStyles.full, commonStyles.row, commonStyles.mt(0.4)]}>
                                                                    <View style={[commonStyles.row, commonStyles.center, commonStyles.full, { justifyContent: 'flex-start' }]}>
                                                                        <Image style={[styles.smallImage]}
                                                                            source={require('../../../assets/images/pay-rate.png')} />
                                                                        <Text style={[{ textAlignVertical: 'center', fontSize: hp('1.7%'), textAlign: 'center', color: '#293D68', fontFamily: 'Catamaran-Regular', }, commonStyles.ml(1)]}>Pay Rate: ${item.rate}/hr</Text>
                                                                    </View>

                                                                    <View style={[commonStyles.row, commonStyles.center, commonStyles.full, { justifyContent: 'flex-end' }]}>

                                                                    </View>
                                                                </View>
                                                            </View>
                                                            <TouchableOpacity onPress={() => {
                                                                var dataClone = [...this.state.data];
                                                                for (var i = 0; i < dataClone.length; i++) {
                                                                    if (dataClone[i].id === item.id) {
                                                                        console.log("dataClone[i].id:", dataClone[i].id, "dataClone[i].mode:", dataClone[i].mode)

                                                                        dataClone[i].mode = item.mode === "Collapsed" ? "Expanded" : "Collapsed"
                                                                    }
                                                                }
                                                                this.setState({
                                                                    data: dataClone
                                                                }, () => {
                                                                    console.log('clone:', this.state.data)
                                                                })
                                                            }}>
                                                                <View style={[styles.itemRectangleShapeLast, commonStyles.coloumn, { padding: wp('1%'), justifyContent: 'center', alignItems: 'center' }]} >
                                                                    <Image style={[styles.downUpArrow]}
                                                                        source={require('../../../assets/images/down-arrow.png')} />
                                                                </View>
                                                            </TouchableOpacity>

                                                        </View>

                                                        : <View style={commonStyles.coloumn}>

                                                            <View style={[styles.itemRectangleShape, commonStyles.coloumn, { padding: wp('3%') }]} >
                                                                <TouchableOpacity 
                                                                onPress={()=>{
                                                                    navigate('ClientProfile',{item:item.client,previous_caregivers:previous_five_cgs,previous_caregiver_name:item.previous_caregiver_name})
                                                                }}style={[commonStyles.row, commonStyles.full, { justifyContent: 'flex-start', alignItems: 'center' }]}>
                                                                    {
                                                                        item.client[_.keys(item.client)[0]].avatar_url ? <View>
                                                                            <Image style={[styles.clientImage]}
                                                                                source={{ uri: item.client[_.keys(item.client)[0]].avatar_url }} />
                                                                        </View> : (
                                                                                <View style={[commonStyles.center, { width: wp('12.5%'), height: hp('6%'), backgroundColor: '#f1f2f4', borderColor: '#c7c7c7', borderWidth: wp('0.1%'), borderRadius: 5 }]}>
                                                                                    <Text style={[commonStyles.fs(3.5), { color: StyleConstants.gradientStartColor }]}>{item.client[_.keys(item.client)[0]].name.charAt(0).toUpperCase()}</Text>
                                                                                </View>
                                                                            )
                                                                    }
                                                                    <Text style={{ marginLeft: wp('2%'), justifyContent: 'center', alignItems: 'flex-start', fontSize: hp('2.3%'), color: '#293D68', fontFamily: 'Catamaran-Regular' }}>{words[0].charAt(0).toUpperCase() + words[0].slice(1)+' '+ words[1].slice(0,1).toUpperCase()|| '---'}</Text>
                                                                </TouchableOpacity>

                                                                <View style={styles.line} />

                                                                <View style={[commonStyles.full, commonStyles.row, commonStyles.mt(1.5)]}>
                                                                    <View style={[commonStyles.row, commonStyles.center, commonStyles.full, { justifyContent: 'flex-start' }]}>
                                                                        <Image style={[styles.smallImage]}
                                                                            source={require('../../../assets/images/clock.png')} />
                                                                        <Text style={[{ textAlignVertical: 'center', fontSize: hp('1.7%'), textAlign: 'center', color: '#293D68', fontFamily: 'Catamaran-Regular', }, commonStyles.ml(1)]}>{this.pstToLocal(item.start_time) + " - " + this.pstToLocal(item.end_time)}</Text>
                                                                    </View>

                                                                    <View style={[commonStyles.row, commonStyles.center, commonStyles.full, { justifyContent: 'flex-end' }]}>
                                                                        <Image style={[styles.smallImage]}
                                                                            source={require('../../../assets/images/calendar.png')} />
                                                                        <Text style={[{ textAlignVertical: 'center', fontSize: hp('1.7%'), textAlign: 'center', color: '#293D68', fontFamily: 'Catamaran-Regular', }, commonStyles.ml(1)]}>{moment(item.start_time).format("LL")}</Text>
                                                                    </View>
                                                                </View>

                                                                <View style={[commonStyles.full, commonStyles.row, commonStyles.mt(0.4)]}>
                                                                    <View style={[commonStyles.row, commonStyles.full, { justifyContent: 'flex-start' }]}>
                                                                        <Image style={[styles.smallImage, { marginTop: 6 }]}
                                                                            source={require('../../../assets/images/location.png')} />
                                                                        <TouchableOpacity onPress={() => {
                                                                            const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
                                                                            const latLng = `${item.latitude},${item.longitude}`;
                                                                            const label = 'Custom Label';
                                                                            const url = Platform.select({
                                                                                ios: `${scheme}${item.location}`,
                                                                                android: `${scheme}${item.location}`
                                                                            });


                                                                            Linking.openURL(url);
                                                                        }}>
                                                                            <Text numberOfLines={2} style={[{ textAlignVertical: 'center', fontSize: hp('1.7%'), textAlign: 'left', color: '#293D68', fontFamily: 'Catamaran-Regular', color: '#41A2EB', textDecorationLine: 'underline' }, commonStyles.ml(1)]}>{item.location}</Text>
                                                                        </TouchableOpacity>
                                                                    </View>

                                                                    <View style={[commonStyles.row, commonStyles.full, { justifyContent: 'flex-end' }]}>
                                                                        <Image style={[styles.smallImage, { marginTop: 5 }]}
                                                                            source={require('../../../assets/images/distance.png')} />
                                                                        <Text style={[{ fontSize: hp('1.7%'), textAlign: 'center', color: '#293D68', fontFamily: 'Catamaran-Regular', }, commonStyles.ml(1)]}>Distance: {
                                                                            item.reimbursement_mileage ? item.reimbursement_mileage.miles : "0"
                                                                        } ml</Text>
                                                                    </View>
                                                                </View>

                                                                <View style={[commonStyles.full, commonStyles.row, commonStyles.mt(0.4)]}>
                                                                    <View style={[commonStyles.row, commonStyles.center, commonStyles.full, { justifyContent: 'flex-start' }]}>
                                                                        <Image style={[styles.smallImage]}
                                                                            source={require('../../../assets/images/pay-rate.png')} />
                                                                        <Text style={[{ textAlignVertical: 'center', fontSize: hp('1.7%'), textAlign: 'center', color: '#293D68', fontFamily: 'Catamaran-Regular', }, commonStyles.ml(1)]}>Pay Rate: ${item.rate}/hr</Text>
                                                                    </View>

                                                                    <View style={[commonStyles.row, commonStyles.center, commonStyles.full, { justifyContent: 'flex-end' }]}>

                                                                    </View>
                                                                </View>

                                                                <View style={styles.line} />

                                                                <Text style={[styles.headerTextBoldFont]}>{"Care Matching (" + care_matching.length + " Items)"}</Text>
                                                                {/* Green check with text */}
                                                                <View style={[commonStyles.coloumn, commonStyles.full]}>
                                                                    {
                                                                        item.client[_.keys(item.client)[0]].care_matching ?
                                                                            Object.keys(item.client[_.keys(item.client)[0]].care_matching).map((key) => (
                                                                                <View style={[commonStyles.row, { alignItems: 'center' }]}>
                                                                                    <Image style={styles.greenCheckImage}
                                                                                        source={require('../../../assets/images/green-check.png')} />
                                                                                    <Text style={{ fontFamily: 'Catamaran-Regular', color: '#828EA5', fontSize: hp('1.8%'), marginLeft: wp('2%') }}>{item.client[_.keys(item.client)[0]].care_matching[key]}</Text>
                                                                                </View>
                                                                            )) : <Text style={{ fontFamily: 'Catamaran-Regular', color: '#828EA5', fontSize: hp('1.8%'), marginLeft: wp('2%') }}>None</Text>
                                                                    }
                                                                </View>

                                                                <View style={styles.line} />

                                                                <Text style={[styles.headerTextBoldFont]}>Interest Matching{' (' + interest_matching.length + ' items)'}</Text>
                                                                <View style={[commonStyles.coloumn, commonStyles.full]}>
                                                                    {
                                                                        interest_matching.length > 0 ?
                                                                            Object.keys(item.client[_.keys(item.client)[0]].interest_matching).map((key) => (
                                                                                <View style={[commonStyles.row, { alignItems: 'center' }]}>
                                                                                    <Image style={styles.greenCheckImage}
                                                                                        source={require('../../../assets/images/green-check.png')} />
                                                                                    <Text style={{ fontFamily: 'Catamaran-Regular', color: '#828EA5', fontSize: hp('1.8%'), marginLeft: wp('2%') }}>{item.client[_.keys(item.client)[0]].interest_matching[key]}</Text>
                                                                                </View>
                                                                            )) : null
                                                                    }

                                                                </View>

                                                                <View style={styles.line} />

                                                                <Text style={[styles.headerTextBoldFont]}>Shift Alert : {item.shift_alert ? item.shift_alert : "None"}</Text>

                                                                <View style={styles.line} />

                                                                <Text style={[styles.headerTextBoldFont]}>Task {' (' + Object.keys(item.care_log).length + ' items)'}</Text>
                                                                {/* Green check with text */}
                                                                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp('3%') }}>
                                                                    <View style={[commonStyles.full]}>
                                                                        <View style={[commonStyles.coloumn, commonStyles.full]}>
                                                                            {
                                                                                item.care_log ?
                                                                                    Object.keys(item.care_log).map((key) => (
                                                                                        <View style={[commonStyles.row, { alignItems: 'center' }]}>
                                                                                            <Image style={styles.greenCheckImage}
                                                                                                source={require('../../../assets/images/green-check.png')} />
                                                                                            <Text style={{ fontFamily: 'Catamaran-Regular', color: '#828EA5', fontSize: hp('1.8%'), marginLeft: wp('2%') }}>{item.care_log[key].title}</Text>
                                                                                        </View>
                                                                                    )) : null
                                                                            }

                                                                        </View>
                                                                    </View>
                                                                </View>

                                                            </View>
                                                            <TouchableOpacity onPress={() => {
                                                                var dataClone = [...this.state.data];
                                                                for (var i = 0; i < dataClone.length; i++) {
                                                                    if (dataClone[i].id === item.id) {
                                                                        dataClone[i].mode = item.mode === "Collapsed" ? "Expanded" : "Collapsed"
                                                                    }
                                                                }
                                                                this.setState({
                                                                    data: dataClone
                                                                })
                                                            }}>
                                                                <View style={[styles.itemRectangleShapeLast, commonStyles.coloumn, { padding: wp('1%'), justifyContent: 'center', alignItems: 'center' }]} >
                                                                    <Image style={[styles.downUpArrow]}
                                                                        source={require('../../../assets/images/up-arrow.png')} />
                                                                </View>
                                                            </TouchableOpacity>

                                                        </View>

                                                }
                                            </View>
                                        )
                                    }}
                                    keyExtractor={(item, index) => index.toString()}
                                    // ItemSeparatorComponent={this.renderSeparator}
                                    // ListFooterComponent={this.renderFooter.bind(this)}
                                    onEndReachedThreshold={0.4}
                                    onEndReached={() => {
                                        this.state.searchInput ? null :
                                            this.loadMore()
                                    }}
                                />
                                :
                                <View style={[commonStyles.margin, commonStyles.full, { justifyContent: 'center', alignItems: 'center' }]}>
                                    <Text style={{ marginTop: hp('5%'), justifyContent: 'center', alignItems: 'center', fontSize: hp('2.3%'), color: '#293D68', fontFamily: 'Catamaran-Regular' }}>No Data found</Text>
                                </View>
                        }
                        {this.state.endloading ?
                            <View style={[commonStyles.margin, commonStyles.full, { justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }]}>
                                <ActivityIndicator
                                    size='large'
                                    color={StyleConstants.gradientStartColor}
                                />
                                <Text style={{ justifyContent: 'center', alignItems: 'center', fontSize: hp('2.3%'), color: '#293D68', fontFamily: 'Catamaran-Regular' }}>Please Wait...</Text>
                            </View> : null
                        }
                    </View>


                </ScrollView>
            );
        }

    }
}

const styles = StyleSheet.create({
    itemRectangleShape: {
        marginTop: wp('3%'),
        borderWidth: 0.01,
        borderRadius: 5,
        backgroundColor: '#fff',
        borderColor: '#fff'
    },
    itemRectangleShapeLast: {
        borderWidth: 0.18,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        backgroundColor: '#f8f8f8',
        borderColor: '#979797'
    },
    clientImage: {
        width: wp('5%'), height: hp('6%'),
        aspectRatio: 1,
        borderColor: '#fff',
        backgroundColor: '#CFCFCF',
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        borderTopRightRadius: 5,
        borderTopLeftRadius: 5,
    },
    smallRectangleShapeGreen: {
        width: wp('3%'),
        height: wp('3%'),
        borderRadius: 3,
        backgroundColor: '#90C6A6',
    },
    smallImage: {
        width: wp('3%'),
        height: hp('3%'),
        aspectRatio: 1,
        resizeMode: 'contain'

    },
    downUpArrow: {
        width: wp('3%'),
        height: hp('1.5%'),
        resizeMode: 'contain'
    },
    line: {
        marginTop: wp('2%'),
        borderWidth: 0.25,
        borderColor: '#828EA5',
    },
    headerTextBoldFont: {
        marginTop: wp('1%'),
        fontFamily: 'Catamaran-Bold',
        color: '#293D68',
        fontSize: hp('1.9%')
    },
    greenCheckImage: {
        width: wp('2.7%'),
        height: hp('2.7%'),
        resizeMode: 'contain'
    },
    search: {
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
)(withNavigation(CompletedScreen));