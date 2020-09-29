import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from '../../styles/Common';
import styleConstants from '../../styles/StyleConstants';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const Tab = ({
    selected,
    onPress,
    index,
    label,
    count
}) => {
    if (!selected) {
        return (
            <TouchableOpacity
                onPress={() => {
                    onPress(index);
                }}
                style={[cssStyles.unselected_button]}>

               {count||count==0? <Text style={cssStyles.unselected_button_text}>{label} ({count})</Text>:<Text style={cssStyles.unselected_button_text}>{label}</Text>}
            </TouchableOpacity>
        )
    }
    else {
        return (
                <LinearGradient
                    colors={[styleConstants.gradientStartColor, styleConstants.gradientEndColor]}
                    style={[cssStyles.selected_button]}
                    start={{ x: 0.0, y: 0.25 }} end={{ x: 1.2, y: 1.0 }}>
                   {count||count==0?  <Text style={cssStyles.selected_button_text}>{label} ({count})</Text>: <Text style={cssStyles.selected_button_text}>{label}</Text>}
                </LinearGradient>
        )
    }
}

const cssStyles = StyleSheet.create({
    selected_button: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: wp('0.5%'),
        marginTop: hp('3%'),
        marginBottom: hp('3%'),
        height: hp('7.5%'),
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderRadius: 5
    },
    unselected_button: {
        flex: 1,
        marginLeft: wp('0.5%'),
        height: hp('7.3%'),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: hp('3%'),
        marginBottom: hp('3%'),
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        backgroundColor: "#ffffff",
        borderRadius: 5
    },
    selected_button_text: {
        alignSelf: 'center',
        fontFamily: 'Catamaran-Bold',
        fontSize: hp('1.6%'),
        color: '#ffffff',
    },
    unselected_button_text: {
        alignSelf: 'center',
        fontFamily: 'Catamaran-Bold',
        fontSize: hp('1.6%'),
        color: "#293D68",
    },
});
export default Tab;