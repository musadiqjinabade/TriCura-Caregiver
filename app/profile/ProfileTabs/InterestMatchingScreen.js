import React from "react";
import { StyleSheet, View, Image, TouchableOpacity, Text, FlatList } from 'react-native';
import commonStyles from '../../styles/Common';
import { ScrollView } from "react-native-gesture-handler";
import { withNavigation, StackActions, NavigationActions  } from 'react-navigation';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Modal from 'react-native-modalbox';
import {CheckBox } from 'native-base';
// const iMatching ='';

const items = [
    {
      itemKey:true,
      itemDescription:'Item 1'
      },
    {
      itemKey:true,
      itemDescription:'Item 2'
      },
    {
      itemKey:true,
      itemDescription:'Item 3'
      }
  ];
class InterestMatchingScreen extends React.Component {

    constructor(props){
        super(props)
        this.state={
            editcheckbox:true,
            interest_data:''
        }
        this.iMatching=[]
    }

    componentDidMount(){
        this.setState({interest_data:this.props.data},()=>{
            console.log('interest_data:',this.state.interest_data)
        })
    }

    render() {
        const { navigate } = this.props.navigation;
        const data = this.props.data;
        const userData = data.user[Object.keys(this.props.data.user)[0]];

        return (
            <View style={{marginLeft: wp('1%'),
            marginRight: wp('5%')}}>
                <View style={[commonStyles.row, commonStyles.full]}>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                        <TouchableOpacity onPress={() => navigate('EditInterestMatching',{item:userData.matching_interests})} >
                            <Image style={styles.editImage}
                                source={require('../../../assets/images/edit.png')} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{  flexDirection: 'row', marginBottom: wp('3%')}}>
                    <View style={{ marginBottom: hp('5%'),  }}>
                        {userData.matching_interests.length>0?
                            userData.matching_interests.map((item) => (
                                <View style={[commonStyles.full, commonStyles.margin]} >
                                    <View style={[commonStyles.row, { alignItems: 'center' }]}>
                                        <Image style={styles.greenCheckImage}
                                            source={require('../../../assets/images/green-check.png')} />
                                        <Text style={{ fontFamily: 'Catamaran-Regular', color: '#293D68', fontSize: hp('1.8%'), marginLeft: wp('2%') }}>{item.title}</Text>
                                    </View>
                                </View>
                            )):<View style={[commonStyles.full, commonStyles.margin,{marginTop:hp('-4%')}]}>
                            <View style={[commonStyles.row, { alignItems: 'center' }]}>
                                <Text style={{ fontFamily: 'Catamaran-Regular', color: '#293D68', fontSize: hp('2%') }}>No Data</Text>
                            </View>
                        </View>
                        }
                    </View>
                </View>
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
    greenCheckImage: {
        width: wp('3.2%'),
        height: hp('3.3%'),
        resizeMode: 'contain'
    },
});

export default withNavigation(InterestMatchingScreen) 