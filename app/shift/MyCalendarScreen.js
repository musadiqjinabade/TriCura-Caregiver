import React from "react";
import { StyleSheet, View, ScrollView, Text, SafeAreaView, Image, Dimensions, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Icon, Fab, Toast } from 'native-base';
import LoadingIndicator from '../core/components/LoadingIndicator';
import commonStyles from '../styles/Common';
import Header from '../core/components/Header';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import StyleConstants from "../styles/StyleConstants";
import AsyncStorage from '@react-native-community/async-storage';
import Globals from '../Globals';
import { withNavigation, StackActions, NavigationActions } from 'react-navigation';
import { connect } from "react-redux";
const width = Dimensions.get('screen').width;
import { Calendar, CalendarList, calendarTheme, Agenda } from 'react-native-calendars';

class MyCalendarScreen extends React.Component {

    days = {
        0: 'S',
        1: 'M',
        2: 'T',
        3: 'W',
        4: 'T',
        5: 'F',
        6: 'S'
    }

    weeks = [];
    array = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    currentDate = new Date();

    constructor(props) {
        super(props);
        this.state = {
            expanded: true,
            weeks: [],
            items: {},
            calendarOpened: false,
            dateArray: [],
            day: '',
            loading: true
        }
        this.shift_calendar = []
    }

    populateWeeks(time) {
        var result = [];
        var start = new Date();
        var currentDate = moment(start, 'DD-MMM-YYYY');
        _.times(time, (i) => {
            result = result.concat(this.getWeek(currentDate));
            currentDate = moment(currentDate).add(7, 'd');
        })
        result[0].isSelected = true;
        result[0].hasTask = true;
        result[1].hasTask = true;
        result[2].hasTask = true;
        // console.log('result:', result)

        return result;
    }

    getWeek(startDate) {
        var result = [];
        var currentDate = moment(startDate).startOf('week');
        _.times(7, (i) => {
            result.push({
                id: currentDate.format('DDMMYY'),
                date: currentDate,
                day: this.days[currentDate.day()],
                hasTask: false,
                isSelected: false
            });
            currentDate = moment(currentDate).add(1, 'd');
        });

        return result;
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

        this.setState({ agency_details: data, items: {} })
        console.log("this.props.data.access_token,", this.props.oncurrentdate, "working1")
        if (this.props.oncurrentdate != undefined) {
            this.currentDate = this.props.oncurrentdate
        }
        else {
            this.currentDate = new Date()

        }
        this.shiftcalendar()
        // this.unavailablitly()
        var weeks = this.populateWeeks(4);
        this.setState({
            weeks
        })

        this.props.navigation.addListener('willFocus', () => {
            console.log("willFocus is working")
            var weeks = this.populateWeeks(4);
            this.setState({
                loading: true,
                weeks, items: {}
            })
            this.shiftcalendar()
        });
    }


    async shiftcalendar() {
        this.shift_calendar = []
        this.setState({ data: '', loading: true, dateArray: [] })
        var start = new Date();
        // console.log('start:',start);

        var nextsevenDay = new Date(start);
        nextsevenDay.setDate(start.getDate() + 40);
        start.setDate(start.getDate() - 40)
        while (start <= nextsevenDay) {
            this.state.dateArray.push(moment(start).format())
            start = moment(start).add(1, 'days');
        }
        console.log("dateArray:", this.state.dateArray);
        var millisecondsMonday = moment(this.state.dateArray[0]).unix();
        var millisecondsSunday = moment(this.state.dateArray[this.state.dateArray.length - 1]).unix();

        console.log("start:", millisecondsMonday, "nextsevenDay:", millisecondsSunday);

        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = Globals.httpMode + agency_code + Globals.domain + '/api/v1/shifts/calendar?start_time=' + millisecondsMonday + '&end_time=' + millisecondsSunday;
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
                console.log("response : ", response);
                if (response.status === 200) {
                    if (response.data.shifts.length > 0 || response.data.unavailabilities.length > 0) {
                        this.setState({
                            shift_data: response.data.shifts,
                            unavailabilities: response.data.unavailabilities
                        }, () => {

                            var data = []
                            // if(response.data.shifts.length>0){
                            for (let i = 0; i < this.state.shift_data.length; i++) {
                                var shift = {}
                                shift.id = this.state.shift_data[i].id
                                shift.start_time = this.state.shift_data[i].start_time,
                                    shift.end_time = this.state.shift_data[i].end_time,
                                    shift.time_zone = this.state.shift_data[i].time_zone,
                                    shift.name = this.state.shift_data[i].client[Object.keys(this.state.shift_data[i].client)[0]].name
                                shift.location = this.state.shift_data[i].shift_location

                                console.log("calendar data:",this.state.shift_data[i].start_time,this.state.shift_data[i].end_time)
                                var dateString = shift.start_time.slice(0, 19);
                                var dateEndString = shift.end_time.slice(0, 19);
                                var start_date = moment(dateString).format('ll')
                                var end_date = moment(dateEndString).format('ll')
                                shift.values = []
                                console.log("timezone before:",start_date,end_date, )
                                var a = moment(start_date);
                                var b = moment(end_date);
                                var diff = b.diff(a, 'days') // 1
                                console.log("timezone diff:",diff,shift.end_time, moment(shift.end_time).format('YYYY-MM-DD'))
                                for (let i = 0; i <=diff; i++) {
                                    var start_time = new Date(start_date)
                                    start_time.setDate(start_time.getDate() + i);
                                    shift.values.push(moment(start_time).format('YYYY-MM-DD'))
                                }
                                data.push(shift)
                            }
                            // }
                            // if(response.data.unavailabilities.length>0){
                            for (let i = 0; i < this.state.unavailabilities.length; i++) {
                                var shift = {}
                                shift.id = this.state.unavailabilities[i].id
                                shift.start_time = this.state.unavailabilities[i].start_time,
                                    shift.end_time = this.state.unavailabilities[i].end_time,
                                    shift.time_zone = this.state.unavailabilities[i].time_zone
                                var start_date = typeof shift.start_time == "string" ? moment(shift.start_time).format('YYYY-MM-DD') : moment.unix(shift.start_time).format('YYYY-MM-DDTHH:mm:ss');
                                var end_date = typeof shift.end_time == "string" ? moment(shift.end_time).format('YYYY-MM-DD') : moment.unix(shift.end_time).format('YYYY-MM-DDTHH:mm:ss');
                                shift.values = []
                                console.log('start_dateee:',start_date,end_date)
                                var a = moment(start_date);
                                var b = moment(end_date);
                                var diff = b.diff(a, 'days') // 1
                                for (let i = 0; i <= diff; i++) {
                                    var start_time = new Date(start_date)
                                    start_time.setDate(start_time.getDate() + i);
                                    shift.values.push(moment(start_time).format('YYYY-MM-DD'))
                                }
                                data.push(shift)
                            }
                            // }
                            this.shift_calendar = data
                        })
                    }
                    else {
                        this.setState({ loading: false })
                    }
                }
                else {
                    console.log('shift else:', response.data)

                    this.showToast("error 400");
                    this.setState({ loading: false })
                }
            }
            catch (error) {
                console.log("error : ", error);
                this.setState({ loading: false })

            }
        }
        catch (e) {
            var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
            this.setState({
                loading: false,
            })
            this.showToast(error);
        }
        this.setState({ loading: false })

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


    async unavailablitly() {
        this.setState({ data: '' })
        var start = new Date();
        console.log('start:', start);

        var nextsevenDay = new Date(start);
        nextsevenDay.setDate(start.getDate() + 6);
        console.log(nextsevenDay); // May 01 2000    

        // var startOfday = moment().startOf(start);
        // var endOfday = moment().endOf(nextsevenDay);

        // var dateArray = []
        while (start <= nextsevenDay) {
            this.state.dateArray.push(moment(start).format())
            start = moment(start).add(1, 'days');
        }
        console.log("dateArray:", this.state.dateArray);






        // while (startOfday <= endOfday) {
        //     days.push(startOfday.toDate());
        //     // day = startOfday.clone().add(1, 'd');
        // }

        // console.log('days:',days);
        // var days = []
        var millisecondsMonday = moment(start).format('X');
        var millisecondsSunday = moment(nextsevenDay).format('X');

        console.log("start:", millisecondsMonday, "nextsevenDay:", millisecondsSunday);

        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = Globals.httpMode + agency_code + Globals.domain + '/api/unavailabilities/calendar?start_time=' + millisecondsMonday + '&end_time=' + millisecondsSunday;
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
                    console.log("calendar unavaiblilty: ", response.data)
                    if (response.data !== null) {
                        this.setState({

                            data: response.data.shifts, loading: false
                        })
                    }
                    // else {
                    //     this.state.page_no = this.state.page_no - 1;
                    // }
                }
                else {
                    this.showToast("error 400");
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

    getcurrentdate(item) {
        console.log("item:", item)
    }


    render() {

        // console.log("shift_data:",this.state.shift_data?this.state.shift_data[0].start_time:null)
        if (this.state.loading) {
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor]}>
                    <Header onLogo={() => this.navigateToDashboard()} label={'My Calendar'} expanded={this.state.expanded} />
                    <LoadingIndicator />
                </SafeAreaView>)
        }
        else {
            console.log("shift_data:", this.shift_calendar)
            return (
                <SafeAreaView style={[commonStyles.full, commonStyles.backgroundColor]}>
                    <Header onLogo={() => this.navigateToDashboard()} label={'My Calendar'} expanded={this.state.expanded} Agency_logo={this.state.agency_details} />
                    <View style={[commonStyles.column, commonStyles.full, commonStyles.ph(2)]}>
                        <TouchableOpacity
                            onPress={() => {
                                this._Agenda.chooseDay(this._Agenda.state.selectedDay); console.log('onpress:', this._Agenda.state.selectedDay)
                            }}
                            style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            {/* <View style={{flexDirection:'row'}}> */}
                            <Text style={[commonStyles.headerTextBoldFont]}>Calendar</Text>
                            {/* </View> */}

                            {this.state.calendarOpened ?
                                <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => {
                                    this._Agenda.chooseDay(this._Agenda.state.selectedDay); console.log('onpress:', this._Agenda.state.selectedDay)
                                }} >
                                    {/* <Text style={[commonStyles.boldFont, { color: '#828EA5', fontSize: hp('2%'), marginTop: wp('4%') }]}>{moment(this.currentDate).format('MMMM, YYYY')}</Text> */}
                                    <Image style={styles.calendarImage}
                                        source={require('../../assets/images/uparrow.png')} /></TouchableOpacity> : <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => {
                                            this._Agenda.chooseDay(this._Agenda.state.selectedDay); console.log('onpress:', this._Agenda.state.selectedDay)
                                        }} >
                                    <Text style={[commonStyles.boldFont, { color: '#828EA5', fontSize: hp('2%'), marginTop: wp('4%') }]}>{moment(this.currentDate).format('MMMM, YYYY')}</Text>
                                    <Image style={{
                                        width: wp('5%'),
                                        height: hp('5%'),
                                        marginTop: wp('3%'),
                                        marginLeft: wp('2%'),
                                        resizeMode: 'contain'
                                    }}
                                        source={require('../../assets/images/downarrow.png')} /></TouchableOpacity>}


                        </TouchableOpacity>

                        {/* <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                    <View>
                    <Text style={[commonStyles.boldFont,{color: '#828EA5',fontSize: hp('2%')}]}>September 2019</Text>
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', marginTop: -10, }}>
                                    <TouchableOpacity
                                    // onPress={() => navigate('MyCalendarScreen')}
                                    >
                                        <Image style={styles.calendarImage}
                                            source={require('../../assets/images/calendar.png')} />
                                    </TouchableOpacity>
                                </View>
                                </View> */}
                        {/* <View style={[commonStyles.rh(20)]}>
                        <ScrollView
                            showsHorizontalScrollIndicator={false}
                            horizontal={true}>
                            {
                                // this.state.weeks.map((w, i) => {
                                //     // console.log("week_day:",i)
                                //     return (
                                //         <View style={[commonStyles.column, commonStyles.center]}>
                                //             <View style={[commonStyles.pd(1.5)]}>
                                //                 <Text style={[commonStyles.ph(2), commonStyles.boldFont,{color: '#6F7D9A',fontSize: hp('2%')}]}>{w.day}</Text>
                                //             </View>
                                //             <View
                                //                 style={{
                                //                     marginVertical: 5,
                                //                     alignSelf: 'stretch',
                                //                     borderBottomColor: StyleConstants.borderColor,
                                //                     borderBottomWidth: 0.5,
                                //                 }}
                                //             />
                                //             <TouchableOpacity  style={[commonStyles.pv(1), commonStyles.mv(0.8), commonStyles.center, commonStyles.br(1), { backgroundColor: w.isSelected ? StyleConstants.redIndicator : 'transparent', borderColor: 'transparent' }]}>
                                //                 <Text style={[commonStyles.ph(2), commonStyles.normalFont, { color: w.isSelected ? 'white' : '#828EA5', textAlign: 'center', textAlignVertical: 'center' }]}>{w.date.date()}</Text>
                                //             </TouchableOpacity>
                                //             <View
                                //                 style={{
                                //                     marginVertical: 5,
                                //                     alignSelf: 'stretch',
                                //                     borderBottomColor: StyleConstants.borderColor,
                                //                     borderBottomWidth: 0.5,
                                //                 }}
                                //             />
                                //         </View>
                                //     )
                                // })
                                <View style={{borderWidth:1,flex:1}}>
                                <Agenda
        items={this.state.items}
        loadItemsForMonth={this.loadItems.bind(this)}
        selected={'2017-05-16'}
        style={{width:wp('90%')}}
        renderItem={this.renderItem.bind(this)}
        renderEmptyDate={this.renderEmptyDate.bind(this)}
        rowHasChanged={this.rowHasChanged.bind(this)}
        // markingType={'period'}
        // markedDates={{
        //    '2017-05-08': {textColor: '#666'},
        //    '2017-05-09': {textColor: '#666'},
        //    '2017-05-14': {startingDay: true, endingDay: true, color: 'blue'},
        //    '2017-05-21': {startingDay: true, color: 'blue'},
        //    '2017-05-22': {endingDay: true, color: 'gray'},
        //    '2017-05-24': {startingDay: true, color: 'gray'},
        //    '2017-05-25': {color: 'gray'},
        //    '2017-05-26': {endingDay: true, color: 'gray'}}}
        // monthFormat={'yyyy'}
        // theme={{calendarBackground: 'red', agendaKnobColor: 'green'}}
        //renderDay={(day, item) => (<Text>{day ? day.day: 'item'}</Text>)}
      />
                                </View>
                            }
                        </ScrollView>
                    </View>
                    <ScrollView contentContainerStyle={[commonStyles.pb(2)]}>
                        <View style={[commonStyles.row]}>
                            <View style={[{ flex: 2 }, commonStyles.column]}>
                                <Text style={[commonStyles.boldFont]}>25 Aug, 2019</Text>
                            </View>
                            <View style={[commonStyles.column, { flex: 4 }]}>
                                <View style={[commonStyles.br(1), commonStyles.ph(2), commonStyles.pv(2), commonStyles.pt(1), { backgroundColor: StyleConstants.greenIndicator }]}>
                                    <Text style={[commonStyles.boldFont, { color: 'white' }]}>Stephan St.</Text>
                                    <View style={[commonStyles.row, commonStyles.pt(0.5), { alignItems: 'center' }]}>
                                        <Icon
                                            name='clock'
                                            type='MaterialCommunityIcons'
                                            style={[{ color: 'white', fontSize: hp('2%') }]}
                                        />
                                        <Text style={[{ fontSize: hp('2%'), color: 'white', fontFamily: 'Catamaran-Regular', fontSize: hp('1.5%'), textAlignVertical: 'center' }, commonStyles.ml(1)]}>12:30 PM - 02:30 PM</Text>
                                    </View>
                                    <View style={[commonStyles.row, commonStyles.pt(0.5), { alignItems: 'center' }]}>
                                        <Icon
                                            name='location-on'
                                            type='MaterialIcons'
                                            style={[{ color: 'white', fontSize: hp('2%') }]}
                                        />
                                        <Text style={[{ fontSize: hp('2%'), color: 'white', fontFamily: 'Catamaran-Regular', fontSize: hp('1.5%'), textAlignVertical: 'center' }, commonStyles.ml(1)]}>1235 Brewster Avenue, Red City, CA, 12345, US</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={[commonStyles.row, commonStyles.pt(2)]}>
                            <View style={[{ flex: 2 }, commonStyles.column]}>
                                <Text style={[commonStyles.boldFont]}>26 Aug, 2019</Text>
                            </View>
                            <View style={[commonStyles.column, { flex: 4 }]}>
                                <View style={[commonStyles.br(1), commonStyles.ph(2), commonStyles.pv(2), commonStyles.pt(1), { backgroundColor: StyleConstants.greenIndicator }]}>
                                    <Text style={[commonStyles.boldFont, { color: 'white' }]}>Stephan St.</Text>
                                    <View style={[commonStyles.row, commonStyles.pt(0.5), { alignItems: 'center' }]}>
                                        <Icon
                                            name='clock'
                                            type='MaterialCommunityIcons'
                                            style={[{ color: 'white', fontSize: hp('2%') }]}
                                        />
                                        <Text style={[{ fontSize: hp('2%'), color: 'white', fontFamily: 'Catamaran-Regular', fontSize: hp('1.5%'), textAlignVertical: 'center' }, commonStyles.ml(1)]}>12:30 PM - 02:30 PM</Text>
                                    </View>
                                    <View style={[commonStyles.row, commonStyles.pt(0.5), { alignItems: 'center' }]}>
                                        <Icon
                                            name='location-on'
                                            type='MaterialIcons'
                                            style={[{ color: 'white', fontSize: hp('2%') }]}
                                        />
                                        <Text style={[{ fontSize: hp('2%'), color: 'white', fontFamily: 'Catamaran-Regular', fontSize: hp('1.5%'), textAlignVertical: 'center' }, commonStyles.ml(1)]}>1235 Brewster Avenue, Red City, CA, 12345, US</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={[commonStyles.row, commonStyles.pt(2)]}>
                            <View style={[{ flex: 2 }, commonStyles.column]}>
                                <Text style={[commonStyles.boldFont]}>27 Aug, 2019</Text>
                            </View>
                            <View style={[commonStyles.column, { flex: 4 }]}>
                                <View style={[commonStyles.br(1), commonStyles.ph(2), commonStyles.pv(2), commonStyles.pt(1), { backgroundColor: StyleConstants.greenIndicator }]}>
                                    <Text style={[commonStyles.boldFont, { color: 'white' }]}>Stephan St.</Text>
                                    <View style={[commonStyles.row, commonStyles.pt(0.5), { alignItems: 'center' }]}>
                                        <Icon
                                            name='clock'
                                            type='MaterialCommunityIcons'
                                            style={[{ color: 'white', fontSize: hp('2%') }]}
                                        />
                                        <Text style={[{ fontSize: hp('2%'), color: 'white', fontFamily: 'Catamaran-Regular', fontSize: hp('1.5%'), textAlignVertical: 'center' }, commonStyles.ml(1)]}>12:30 PM - 02:30 PM</Text>
                                    </View>
                                    <View style={[commonStyles.row, commonStyles.pt(0.5), { alignItems: 'center' }]}>
                                        <Icon
                                            name='location-on'
                                            type='MaterialIcons'
                                            style={[{ color: 'white', fontSize: hp('2%') }]}
                                        />
                                        <Text style={[{ fontSize: hp('2%'), color: 'white', fontFamily: 'Catamaran-Regular', fontSize: hp('1.5%'), textAlignVertical: 'center' }, commonStyles.ml(1)]}>1235 Brewster Avenue, Red City, CA, 12345, US</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={[commonStyles.row, commonStyles.pt(2)]}>
                            <View style={[{ flex: 2 }, commonStyles.column]}>
                                <Text style={[commonStyles.boldFont]}>28 Aug, 2019</Text>
                            </View>
                            <View style={[commonStyles.column, { flex: 4 }]}>
                                <View style={[commonStyles.br(1), commonStyles.ph(2), commonStyles.pv(2), commonStyles.pt(1), { backgroundColor: 'white', elevation: 2, borderColor: 'transparent' }]}>
                                    <Text style={[commonStyles.normalFont]}>No event</Text>
                                </View>
                            </View>
                        </View>
                        <View style={[commonStyles.row, commonStyles.pt(2)]}>
                            <View style={[{ flex: 2 }, commonStyles.column]}>
                                <Text style={[commonStyles.boldFont]}>29 Aug, 2019</Text>
                            </View>
                            <View style={[commonStyles.column, { flex: 4 }]}>
                                <View style={[commonStyles.br(1), commonStyles.ph(2), commonStyles.pv(2), commonStyles.pt(1), { backgroundColor: 'white', elevation: 2, borderColor: 'transparent' }]}>
                                    <Text style={[commonStyles.normalFont]}>No event</Text>
                                </View>
                            </View>
                        </View>
                        <View style={[commonStyles.row, commonStyles.pt(2)]}>
                            <View style={[{ flex: 2 }, commonStyles.column]}>
                                <Text style={[commonStyles.boldFont]}>30 Aug, 2019</Text>
                            </View>
                            <View style={[commonStyles.column, { flex: 4 }]}>
                                <View style={[commonStyles.br(1), commonStyles.ph(2), commonStyles.pv(2), commonStyles.pt(1), { backgroundColor: 'white', elevation: 2, borderColor: 'transparent' }]}>
                                    <Text style={[commonStyles.normalFont]}>No event</Text>
                                </View>
                            </View>
                        </View>
                        <View style={[commonStyles.row, commonStyles.pt(2)]}>
                            <View style={[{ flex: 2 }, commonStyles.column]}>
                                <Text style={[commonStyles.boldFont]}>31 Aug, 2019</Text>
                            </View>
                            <View style={[commonStyles.column, { flex: 4 }]}>
                                <View style={[commonStyles.br(1), commonStyles.ph(2), commonStyles.pv(2), commonStyles.pt(1), { backgroundColor: 'white', elevation: 2, borderColor: 'transparent' }]}>
                                    <Text style={[commonStyles.normalFont]}>No event</Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView> */}

                        <Agenda
                            items={this.state.items}
                            firstDay={0}
                            hideKnob={false}
                            firstItemInDay={true}
                            loadItemsForMonth={(month) => { console.log('trigger items loading') }}
                            // onCalendarToggled={(calendarOpened) => {console.log(calendarOpened)}}
                            onDayPress={(day) => { console.log('day pressed'), this.currentDate = day.timestamp }}
                            onDayChange={(day) => { console.log('day changed', day), this.currentDate = day.timestamp }}
                            // style={{borderRadius:5,height:500}}
                            // renderDay={(day, item) => {return (<View style={{margin:2}} />);}}
                            ref={(ref) => { this._Agenda = ref }}
                            // ref={(c) => this.knob = c}
                            theme={{
                                // ...calendarTheme,
                                // agendaDayTextColor: 'black',
                                // agendaDayNumColor: 'black',
                                dotColor: StyleConstants.greenIndicator,
                                todayTextColor: StyleConstants.greenIndicator,
                                agendaTodayColor: StyleConstants.greenIndicator,
                                agendaKnobColor: StyleConstants.redIndicator,
                                selectedDayBackgroundColor: StyleConstants.redIndicator,
                                // arrowColor: StyleConstants.greenIndicator,
                                'stylesheet.calendar.header': {
                                    week: {
                                        marginTop: 5,
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        borderRadius: 5
                                        //   backgroundColor:'transparent'
                                    }
                                }
                                // margin:100
                            }}
                            // customStyle={{day: {justifyContent: 'flex-start',borderWidth:1}}} 
                            // dayHeadings={['S', 'M', 'T', 'W', 'T', 'F', 'S']}
                            loadItemsForMonth={this.loadItems.bind(this)}
                            startDate={this.currentDate}
                            hideArrows={false}
                            selected={this.currentDate}
                            // minDate={1}
                            pastScrollRange={2}
                            futureScrollRange={4}
                            onCalendarToggled={calendarOpened => {
                                console.log('onCalendarToggled', calendarOpened);
                                this.setState({ calendarOpened: calendarOpened })
                            }}

                            // maxDate={4}
                            renderItem={this.renderItem.bind(this)}
                            // style={{borderWidth:1}}
                            renderEmptyDate={this.renderEmptyDate.bind(this)}
                            rowHasChanged={this.rowHasChanged.bind(this)}
                        // markingType={'period'}
                        // markedDates={{
                        //    '2017-05-08': {textColor: '#666'},
                        //    '2017-05-09': {textColor: '#666'},
                        //    '2017-05-14': {startingDay: true, endingDay: true, color: 'blue'},
                        //    '2017-05-21': {startingDay: true, color: 'blue'},
                        //    '2017-05-22': {endingDay: true, color: 'gray'},
                        //    '2017-05-24': {startingDay: true, color: 'gray'},
                        //    '2017-05-25': {color: 'gray'},
                        //    '2017-05-26': {endingDay: true, color: 'gray'}}}
                        // monthFormat={'yyyy'}
                        // theme={{ agendaKnobColor: '#006FB9'}}
                        // renderDay={(day, item) => (<Text>{day ? day.day: 'item'}</Text>)}
                        />

                        <Fab
                            active={this.state.active}
                            direction="up"
                            containerStyle={{}}
                            style={{ backgroundColor: StyleConstants.redIndicator }}
                            position="bottomRight"
                            onPress={() => { this.props.navigation.navigate('ShiftUnavailability') }}>
                            <Icon
                                name="calendar-remove"
                                type="MaterialCommunityIcons"
                            />
                        </Fab>

                    </View>

                </SafeAreaView>
            );
        }
    }
    loadItems(day) {
        setTimeout(() => {
            for (let i = -15; i < 85; i++) {
                const time = day.timestamp + i * 24 * 60 * 60 * 1000;
                const strTime = this.timeToString(time);
                if (!this.state.items[strTime]) {
                    this.state.items[strTime] = [];
                    //     const numItems = Math.floor(Math.random() * 5);
                    // var moment = moment(this.shift_calendar[0].start_time).format("YYYY-MM-DD")
                    for (let j = 0; j < this.shift_calendar.length; j++) {
                        var data = '';
                        data = this.shift_calendar[j].start_time
                    // console.log("strTime data:",this.shift_calendar[j].start_time)

                        var moment_data = typeof data == "string" ? moment(data).format('YYYY-MM-DD') : moment.unix(data).format('YYYY-MM-DD');

                        if (this.shift_calendar[j].values != undefined) {
                            for (let i = 0; i < this.shift_calendar[j].values.length; i++) {
                                if (strTime == this.shift_calendar[j].values[i]) {
                                console.log("multi date:",this.shift_calendar[j].values[i],strTime,this.shift_calendar[j])

                                    this.state.items[strTime].push(this.shift_calendar[j]);
                                }
                            }
                        }
                        else {
                            if (strTime == moment_data) {
                                console.log("one date:",this.shift_calendar[j].values[i],strTime)

                                this.state.items[strTime].push(this.shift_calendar[j]);
                                // console.log("push;", this.shift_calendar[j])
                            }
                        }
                    }
                }
            }
            console.log('itesms_num:', this.state.items);
            const newItems = {};
            Object.keys(this.state.items).forEach(key => { newItems[key] = this.state.items[key]; });
            this.setState({
                items: newItems
            }, () => {
                console.log("items:", this.state.items)
            });
        }, 1000);
        // console.log(`Load Items for ${day.year}-${day.month}`);
    }

    async shift_data(id) {
        //     moment(item.start_time).unix() > current? 
        //     moment(item.end_time).unix() > current? 
        //     this.props.navigation.navigate('CurrentShift',{item:item.id})
        //     :this.props.navigation.navigate('ShowShiftDetails',{item:item.id})
        // :
        // moment(item.end_time).unix() > current? 
        // this.props.navigation.navigate('CurrentShift',{item:item.id})
        // :this.props.navigation.navigate('ShowShiftDetails',{item:item.id})
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = Globals.httpMode + agency_code + Globals.domain + '/api/v1/shifts/current';
        console.log("url : ", url);
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
            var response = await axios.get(url, {
                headers: headers
            })
            if (response.status === 200) {
                console.log("data_log : ", response.data[Object.keys(response.data)[0]].start_time)

                if (Object.keys(response.data)[0] == id) {
                    // console.log("data_log : ", response.data[Object.keys(response.data)[0]].start_time)

                    // var date = response.data[Object.keys(response.data)[0]].start_time
                    // var current = new Date().format('DD-MM-YYYY')
                    // console.log('date:date', current)
                    // if(date!=null){
                    //     if(moment(data).format('DD-MM-YYYY')==current){
                    this.props.navigation.navigate('CurrentShift', { item: id })

                    // }
                    // else{
                    //     this.props.navigation.navigate('ShowShiftDetails',{item:id})

                    // }
                    // }
                    // this.showToast('done');
                }
                else {
                    // this.showToast('not done');
                    this.props.navigation.navigate('ShowShiftDetails', { item: id })

                }

            }
            else {
                var data1 = response.data.error;
                // console.log("data1 : ", data1)

                // this.showToast(data1);
                this.props.navigation.navigate('ShowShiftDetails', { item: id })
                this.setState({
                    curloading: false
                })
            }
        }
        catch (e) {
            var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
            console.log("error : ", error)
            // this.showToast(error);
            this.props.navigation.navigate('ShowShiftDetails', { item: id })
            this.setState({
                curloading: false
            })
        }
    }

    async alert_unavailable(item) {
        console.log("dates:",item)

        Alert.alert(
            'Unavailable',
            (moment.unix(item.start_time).format('DD MMM, YYYY hh:mm a') + ' - ' + moment.unix(item.end_time).format('DD MMM, YYYY hh:mm a')),
            [
                {
                    text: 'Close',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                { text: 'Remove', onPress: () => this.remove(item) },
            ],
            { cancelable: false },
        );

    }

    async remove(item) {
        const axios = require('axios');
        var agency_code = await AsyncStorage.getItem('agency_code');
        var url = Globals.httpMode + agency_code + Globals.domain + '/api/unavailabilities/' + item.id
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
                var response = await axios.delete(url, {
                    headers: headers
                })
                if (response.status === 200) {
                    console.log("calendar unavaiblilty: ", response.data)
                    if (response.data !== null) {
                        this.shift_calendar = []
                        // const valuesToRemove = [item]
                        this.componentDidMount()
                        this.shiftcalendar()
                        this.showToast(response.data.message);
                    }
                    // else {
                    //     this.state.page_no = this.state.page_no - 1;
                    // }
                }
                else {
                    this.showToast("error 400");
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

    renderItem(item) {
        console.log('item.end_time:', item.end_time)
        var dateString = ''
        var newEnd = ''
        var dateString1 = ''
        var newStart = ''
        if(typeof item.start_time == "string" ){
            dateString = item.end_time.slice(0, 19)
            newEnd = moment(dateString).format('LT')
    
            dateString1 = item.start_time.slice(0, 19)
            newStart = moment(dateString1).format('LT')
        }else{
            newEnd = moment.unix(item.end_time).format('LT')
            newStart = moment.unix(item.start_time).format('LT')


        }
        
        console.log('name_D item:', item)
        return (
            <TouchableOpacity
                // style={{margin:wp('2%')}}
                onPress={() => {
                    item.name ?
                        this.shift_data(item.id)
                        : this.alert_unavailable(item)
                }}
                style={[commonStyles.column, { flex: 4, margin: wp('1%') }]}>
                <View style={[commonStyles.br(1), commonStyles.ph(2), commonStyles.pv(2), commonStyles.pt(1), { backgroundColor: item.name ? StyleConstants.greenIndicator : '#FF6260' }]}>
                    <Text style={[commonStyles.boldFont, { color: 'white' }]}>{item.name || 'Unavailable'}</Text>
                    <View style={[commonStyles.row, commonStyles.pt(0.5), { alignItems: 'center' }]}>
                        <Icon
                            name='clock'
                            type='MaterialCommunityIcons'
                            style={[{ color: 'white', fontSize: hp('2%') }]}
                        />
                        <Text style={[{ fontSize: hp('2%'), color: 'white', fontFamily: 'Catamaran-Regular', fontSize: hp('1.5%'), textAlignVertical: 'center' }, commonStyles.ml(1)]}>{newStart} - {newEnd}</Text>
                    </View>
                    {item.name ?
                        <View style={[commonStyles.row, commonStyles.pt(0.5), { alignItems: 'center' }]}>
                            <Icon
                                name='location-on'
                                type='MaterialIcons'
                                style={[{ color: 'white', fontSize: hp('2%') }]}
                            />
                            <Text style={[{ fontSize: hp('2%'), color: 'white', fontFamily: 'Catamaran-Regular', fontSize: hp('1.8%'), textAlignVertical: 'center' }, commonStyles.ml(1)]}>{item.location}</Text>
                        </View> : null}
                </View>
            </TouchableOpacity>
        );
    }

    renderEmptyDate(item) {
        return (
            <View style={[styles.item, { height: item.height }]}><Text>No Events!</Text></View>
        );
    }

    rowHasChanged(r1, r2) {
        return r1.name !== r2.name;
    }

    timeToString(time) {
        const date = new Date(time);
        return date.toISOString().split('T')[0];
    }
}

const styles = StyleSheet.create({
    calendarImage: {
        width: wp('5%'),
        height: hp('5%'),
        marginTop: wp('3%'),
        marginLeft: wp('2%'),
        resizeMode: 'contain'
    },
    item: {
        backgroundColor: 'white',
        flex: 1,
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
        marginTop: 10
    },
    emptyDate: {
        height: 15,
        flex: 1,
        paddingTop: 30
    }

});

const mapStateToProps = state => ({
    data: state.user.data
});

export default connect(
    mapStateToProps,
    null
)(withNavigation(MyCalendarScreen));
