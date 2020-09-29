import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import commonStyles from '../../styles/Common';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default class AboutScreen extends React.Component {

    edit_contact(value){
        this.props.onAssignToMe(value)
    }

    render() {
        const data = this.props.data;
        const userData = data.user[Object.keys(this.props.data.user)[0]];
        console.log("about_data:",userData)

        return (
            userData.about ?
                <View style={[commonStyles.full, commonStyles.margin, {flex:1, marginBottom: wp('5%'), justifyContent: 'space-between', flexDirection: 'row' }]}>
                    <Text style={{ width:wp('80%'),fontFamily: 'Catamaran-Regular',color: '#293D68', fontSize: hp('2%'), marginLeft: wp('1%'), justifyContent: 'flex-start', alignSelf: 'flex-start', }}>{userData.about}</Text>
                    {userData.role=="caregiver"?<TouchableOpacity
                        onPress={() => this.edit_contact(userData.about)}
                        style={[commonStyles.center, { justifyContent: 'flex-start', alignSelf: 'flex-start', marginRight: wp('3%'), marginTop:hp('-1%')}]}>
                        <Image style={styles.editImage}
                            source={require('../../../assets/images/edit.png')} />
                    </TouchableOpacity>:null}
                </View> :
                <View style={[commonStyles.full, commonStyles.margin, { marginBottom: wp('5%'), justifyContent: 'space-between', flexDirection: 'row' }]}>
                    <Text style={{ fontFamily: 'Catamaran-Regular', color: '#293D68', fontSize: hp('2%'), justifyContent: 'flex-start', alignSelf: 'flex-start' }}>No Data</Text>
                    {userData.role=="caregiver"?<TouchableOpacity
                        onPress={() => this.edit_contact(userData.about)}
                        style={[commonStyles.center, { justifyContent: 'flex-start', alignSelf: 'flex-start',  marginRight: wp('3%'), marginTop:hp('-0.7%')  }]}>
                        <Image style={styles.editImage}
                            source={require('../../../assets/images/edit.png')} />
                    </TouchableOpacity>:null}
                </View>
        );
    }
}

const styles = StyleSheet.create({
    editImage: {
        width: wp('4%'),
        height: hp('4%'),
        resizeMode: 'contain'
    },

});