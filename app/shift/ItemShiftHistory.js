import React from "react";
import { StyleSheet, View, Image, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import commonStyles from '../styles/Common';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default class ItemShiftHistory extends React.Component {

    state = {
        mode: "Collapsed",

    }

    render() {

        if (this.state.mode === "Collapsed") {
            return (
                <View style={commonStyles.coloumn}>

                    <View style={[styles.itemRectangleShape, commonStyles.coloumn, { padding: wp('3%') }]} >
                        <View style={[commonStyles.row, commonStyles.full, { justifyContent: 'flex-start', alignItems: 'center' }]}>
                            <Image style={[styles.clientImage]}
                                source={require('../../assets/images/client.png')} />
                            <Text style={{ marginLeft: wp('2%'), justifyContent: 'center', alignItems: 'flex-start', fontSize: hp('2.3%'), color: '#293D68', fontFamily: 'Catamaran-Regular' }}>Mr. Dhaval Kotecha</Text>
                        </View>

                        <View style={styles.line} />

                        <View style={[commonStyles.full, commonStyles.row, commonStyles.mt(1.5)]}>
                            <View style={[commonStyles.row, commonStyles.center, commonStyles.full, { justifyContent: 'flex-start' }]}>
                                <Image style={[styles.smallImage]}
                                    source={require('../../assets/images/clock.png')} />
                                <Text style={[{ textAlignVertical: 'center', fontSize: hp('1.7%'), textAlign: 'center', color: '#293D68', fontFamily: 'Catamaran-Regular', }, commonStyles.ml(1)]}>07:30 PM - 04:30 AM</Text>
                            </View>

                            <View style={[commonStyles.row, commonStyles.center, commonStyles.full, { justifyContent: 'flex-end' }]}>
                                <Image style={[styles.smallImage]}
                                    source={require('../../assets/images/calendar.png')} />
                                <Text style={[{ textAlignVertical: 'center', fontSize: hp('1.7%'), textAlign: 'center', color: '#293D68', fontFamily: 'Catamaran-Regular', }, commonStyles.ml(1)]}>Tue, 29 Sep 2019</Text>
                            </View>
                        </View>

                        <View style={[commonStyles.full, commonStyles.row, commonStyles.mt(0.4)]}>
                            <View style={[commonStyles.row, commonStyles.full, { justifyContent: 'flex-start' }]}>
                                <Image style={[styles.smallImage, { marginTop: 6 }]}
                                    source={require('../../assets/images/location.png')} />
                                <Text style={[{ textAlignVertical: 'center', fontSize: hp('1.7%'), textAlign: 'left', color: '#293D68', fontFamily: 'Catamaran-Regular', color: '#41A2EB', textDecorationLine: 'underline' }, commonStyles.ml(1)]}>125 Brewster Avenue, Redwood City, CA, 12345, US</Text>
                            </View>

                            <View style={[commonStyles.row, commonStyles.full, { justifyContent: 'flex-end' }]}>
                                <Image style={[styles.smallImage, { marginTop: 5 }]}
                                    source={require('../../assets/images/distance.png')} />
                                <Text style={[{ fontSize: hp('1.7%'), textAlign: 'center', color: '#293D68', fontFamily: 'Catamaran-Regular', }, commonStyles.ml(1)]}>Distance: 84362 miles</Text>
                            </View>
                        </View>

                        <View style={[commonStyles.full, commonStyles.row, commonStyles.mt(0.4)]}>
                            <View style={[commonStyles.row, commonStyles.center, commonStyles.full, { justifyContent: 'flex-start' }]}>
                                <Image style={[styles.smallImage]}
                                    source={require('../../assets/images/pay-rate.png')} />
                                <Text style={[{ textAlignVertical: 'center', fontSize: hp('1.7%'), textAlign: 'center', color: '#293D68', fontFamily: 'Catamaran-Regular', }, commonStyles.ml(1)]}>Pay Rate: $16.00/hr</Text>
                            </View>

                            <View style={[commonStyles.row, commonStyles.center, commonStyles.full, { justifyContent: 'flex-end' }]}>

                            </View>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => {
                        this.setState({
                            mode: this.state.mode === "Collapsed" ? "Expanded" : "Collapsed"
                        })
                    }}>
                        <View style={[styles.itemRectangleShapeLast, commonStyles.coloumn, { padding: wp('1%'), justifyContent: 'center', alignItems: 'center' }]} >
                            <Image style={[styles.downUpArrow]}
                                source={require('../../assets/images/down-arrow.png')} />
                        </View>
                    </TouchableOpacity>

                </View>
            )
        }
        else {
            return (
                <View style={commonStyles.coloumn}>

                    <View style={[styles.itemRectangleShape, commonStyles.coloumn, { padding: wp('3%') }]} >
                        <View style={[commonStyles.row, commonStyles.full, { justifyContent: 'flex-start', alignItems: 'center' }]}>
                            <Image style={[styles.clientImage]}
                                source={require('../../assets/images/client.png')} />
                            <Text style={{ marginLeft: wp('2%'), justifyContent: 'center', alignItems: 'flex-start', fontSize: hp('2.3%'), color: '#293D68', fontFamily: 'Catamaran-Regular' }}>Mr. Dhaval Kotecha</Text>
                        </View>

                        <View style={styles.line} />

                        <View style={[commonStyles.full, commonStyles.row, commonStyles.mt(1.5)]}>
                            <View style={[commonStyles.row, commonStyles.center, commonStyles.full, { justifyContent: 'flex-start' }]}>
                                <Image style={[styles.smallImage]}
                                    source={require('../../assets/images/clock.png')} />
                                <Text style={[{ textAlignVertical: 'center', fontSize: hp('1.7%'), textAlign: 'center', color: '#293D68', fontFamily: 'Catamaran-Regular', }, commonStyles.ml(1)]}>07:30 PM - 04:30 AM</Text>
                            </View>

                            <View style={[commonStyles.row, commonStyles.center, commonStyles.full, { justifyContent: 'flex-end' }]}>
                                <Image style={[styles.smallImage]}
                                    source={require('../../assets/images/calendar.png')} />
                                <Text style={[{ textAlignVertical: 'center', fontSize: hp('1.7%'), textAlign: 'center', color: '#293D68', fontFamily: 'Catamaran-Regular', }, commonStyles.ml(1)]}>Tue, 29 Sep 2019</Text>
                            </View>
                        </View>

                        <View style={[commonStyles.full, commonStyles.row, commonStyles.mt(0.4)]}>
                            <View style={[commonStyles.row, commonStyles.full, { justifyContent: 'flex-start' }]}>
                                <Image style={[styles.smallImage, { marginTop: 6 }]}
                                    source={require('../../assets/images/location.png')} />
                                <Text style={[{ textAlignVertical: 'center', fontSize: hp('1.7%'), textAlign: 'left', color: '#293D68', fontFamily: 'Catamaran-Regular', color: '#41A2EB', textDecorationLine: 'underline' }, commonStyles.ml(1)]}>125 Brewster Avenue, Redwood City, CA, 12345, US</Text>
                            </View>

                            <View style={[commonStyles.row, commonStyles.full, { justifyContent: 'flex-end' }]}>
                                <Image style={[styles.smallImage, { marginTop: 5 }]}
                                    source={require('../../assets/images/distance.png')} />
                                <Text style={[{ fontSize: hp('1.7%'), textAlign: 'center', color: '#293D68', fontFamily: 'Catamaran-Regular', }, commonStyles.ml(1)]}>Distance: 84362 miles</Text>
                            </View>
                        </View>

                        <View style={[commonStyles.full, commonStyles.row, commonStyles.mt(0.4)]}>
                            <View style={[commonStyles.row, commonStyles.center, commonStyles.full, { justifyContent: 'flex-start' }]}>
                                <Image style={[styles.smallImage]}
                                    source={require('../../assets/images/pay-rate.png')} />
                                <Text style={[{ textAlignVertical: 'center', fontSize: hp('1.7%'), textAlign: 'center', color: '#293D68', fontFamily: 'Catamaran-Regular', }, commonStyles.ml(1)]}>Pay Rate: $16.00/hr</Text>
                            </View>

                            <View style={[commonStyles.row, commonStyles.center, commonStyles.full, { justifyContent: 'flex-end' }]}>

                            </View>
                        </View>

                        <View style={styles.line} />

                        <Text style={[styles.headerTextBoldFont]}>Care Matching (5 Items)</Text>
                        {/* Green check with text */}
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp('3%') }}>
                            <View style={[commonStyles.full]}>
                                <View style={[commonStyles.coloumn, commonStyles.full]}>
                                    <View style={[commonStyles.row, { alignItems: 'center' }]}>
                                        <Image style={styles.greenCheckImage}
                                            source={require('../../assets/images/green-check.png')} />
                                        <Text style={{ fontFamily: 'Catamaran-Regular', color: '#828EA5', fontSize: hp('1.8%'), marginLeft: wp('2%') }}>Oxygen Care</Text>
                                    </View>
                                    <View style={[commonStyles.row, { alignItems: 'center' }]}>
                                        <Image style={styles.greenCheckImage}
                                            source={require('../../assets/images/green-check.png')} />
                                        <Text style={{ fontFamily: 'Catamaran-Regular', color: '#828EA5', fontSize: hp('1.8%'), marginLeft: wp('2%') }}>Prefers Female</Text>
                                    </View>
                                    <View style={[commonStyles.row, { alignItems: 'center' }]}>
                                        <Image style={styles.greenCheckImage}
                                            source={require('../../assets/images/green-check.png')} />
                                        <Text style={{ fontFamily: 'Catamaran-Regular', color: '#828EA5', fontSize: hp('1.8%'), marginLeft: wp('2%') }}>Level 1: Companion Care</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={[commonStyles.full]}>
                                <View style={[commonStyles.coloumn, commonStyles.full]}>
                                    <View style={[commonStyles.row, { alignItems: 'center' }]}>
                                        <Image style={styles.greenCheckImage}
                                            source={require('../../assets/images/green-check.png')} />
                                        <Text style={{ fontFamily: 'Catamaran-Regular', color: '#828EA5', fontSize: hp('1.8%'), marginLeft: wp('2%') }}>Ok with Smoking</Text>
                                    </View>
                                    <View style={[commonStyles.row, { alignItems: 'center' }]}>
                                        <Image style={styles.greenCheckImage}
                                            source={require('../../assets/images/green-check.png')} />
                                        <Text style={{ fontFamily: 'Catamaran-Regular', color: '#828EA5', fontSize: hp('1.8%'), marginLeft: wp('2%') }}>Level 2: Personal Care</Text>
                                    </View>

                                </View>
                            </View>
                        </View>

                        <View style={styles.line} />

                        <Text style={[styles.headerTextBoldFont]}>Interest Matching : None</Text>

                        <View style={styles.line} />

                        <Text style={[styles.headerTextBoldFont]}>Shift Alert : None</Text>

                        <View style={styles.line} />

                        <Text style={[styles.headerTextBoldFont]}>Task (8 Items)</Text>
                        {/* Green check with text */}
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp('3%') }}>
                            <View style={[commonStyles.full]}>
                                <View style={[commonStyles.coloumn, commonStyles.full]}>
                                    <View style={[commonStyles.row, { alignItems: 'center' }]}>
                                        <Image style={styles.greenCheckImage}
                                            source={require('../../assets/images/green-check.png')} />
                                        <Text style={{ fontFamily: 'Catamaran-Regular', color: '#828EA5', fontSize: hp('1.8%'), marginLeft: wp('2%') }}>Arrive</Text>
                                    </View>
                                    <View style={[commonStyles.row, { alignItems: 'center' }]}>
                                        <Image style={styles.greenCheckImage}
                                            source={require('../../assets/images/green-check.png')} />
                                        <Text style={{ fontFamily: 'Catamaran-Regular', color: '#828EA5', fontSize: hp('1.8%'), marginLeft: wp('2%') }}>Toileting</Text>
                                    </View>
                                    <View style={[commonStyles.row, { alignItems: 'center' }]}>
                                        <Image style={styles.greenCheckImage}
                                            source={require('../../assets/images/green-check.png')} />
                                        <Text style={{ fontFamily: 'Catamaran-Regular', color: '#828EA5', fontSize: hp('1.8%'), marginLeft: wp('2%') }}>Bathing</Text>
                                    </View>
                                    <View style={[commonStyles.row, { alignItems: 'center' }]}>
                                        <Image style={styles.greenCheckImage}
                                            source={require('../../assets/images/green-check.png')} />
                                        <Text style={{ fontFamily: 'Catamaran-Regular', color: '#828EA5', fontSize: hp('1.8%'), marginLeft: wp('2%') }}>Laundry</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={[commonStyles.full]}>
                                <View style={[commonStyles.coloumn, commonStyles.full]}>
                                    <View style={[commonStyles.row, { alignItems: 'center' }]}>
                                        <Image style={styles.greenCheckImage}
                                            source={require('../../assets/images/green-check.png')} />
                                        <Text style={{ fontFamily: 'Catamaran-Regular', color: '#828EA5', fontSize: hp('1.8%'), marginLeft: wp('2%') }}>Bathing</Text>
                                    </View>
                                    <View style={[commonStyles.row, { alignItems: 'center' }]}>
                                        <Image style={styles.greenCheckImage}
                                            source={require('../../assets/images/green-check.png')} />
                                        <Text style={{ fontFamily: 'Catamaran-Regular', color: '#828EA5', fontSize: hp('1.8%'), marginLeft: wp('2%') }}>Dressing</Text>
                                    </View>
                                    <View style={[commonStyles.row, { alignItems: 'center' }]}>
                                        <Image style={styles.greenCheckImage}
                                            source={require('../../assets/images/green-check.png')} />
                                        <Text style={{ fontFamily: 'Catamaran-Regular', color: '#828EA5', fontSize: hp('1.8%'), marginLeft: wp('2%') }}>House work</Text>
                                    </View>
                                    <View style={[commonStyles.row, { alignItems: 'center' }]}>
                                        <Image style={styles.greenCheckImage}
                                            source={require('../../assets/images/green-check.png')} />
                                        <Text style={{ fontFamily: 'Catamaran-Regular', color: '#828EA5', fontSize: hp('1.8%'), marginLeft: wp('2%') }}>Leave</Text>
                                    </View>

                                </View>
                            </View>
                        </View>

                    </View>
                    <TouchableOpacity onPress={() => {
                        this.setState({
                            mode: this.state.mode === "Collapsed" ? "Expanded" : "Collapsed"
                        })
                    }}>
                        <View style={[styles.itemRectangleShapeLast, commonStyles.coloumn, { padding: wp('1%'), justifyContent: 'center', alignItems: 'center' }]} >
                            <Image style={[styles.downUpArrow]}
                                source={require('../../assets/images/up-arrow.png')} />
                        </View>
                    </TouchableOpacity>

                </View>
            )
        }
    }
}

const styles = StyleSheet.create({
    itemRectangleShape: {
        marginTop: wp('3%'),
        borderWidth: 0.01,
        borderTopRightRadius: 5,
        borderTopLeftRadius: 5,
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
        width: wp('9%'), height: hp('9%'),
        aspectRatio: 1,
        borderColor: '#fff',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        borderTopRightRadius: 8,
        borderTopLeftRadius: 8,
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
    },
    downUpArrow: {
        width: wp('3%'),
        height: hp('1.2%'),

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
});