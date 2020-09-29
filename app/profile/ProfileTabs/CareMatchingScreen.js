import React from "react";
import { StyleSheet, View, Text, Image } from 'react-native';
import commonStyles from '../../styles/Common';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Tooltip } from 'react-native-elements';
import styleConstants from '../../styles/StyleConstants';


export default class CareMatchingScreen extends React.Component {

    description(item){
        var regex = /(<([^>]+)>)/ig;
        var nbsp = /&nbsp;/g; 
        var data = item.replace(regex,'')
        console.log("item",data)
        data = data.replace(nbsp,'')
        console.log("data",data)

        return data

    }

    render() {
        const data = this.props.data;
        const userData = data.user[Object.keys(this.props.data.user)[0]];
        const cMatching = userData.care_matching
        // var care_data = Object.keys(cMatching)
        console.log('cmatch:',  cMatching)
        
        return (
            <View style={{marginBottom: hp('5%'),marginLeft: wp('1%')}}>
                { cMatching.length > 0?
                    cMatching.map((key) => (
                        // console.log("key",key)
                        <View style={[commonStyles.full, commonStyles.margin]}>
                            <View style={[commonStyles.row, { alignItems: 'center' }]}>
                                <Image style={styles.greenCheckImage}
                                    source={require('../../../assets/images/green-check.png')} />
                                {key.description!=null && key.description!=""?
                                <Tooltip           
                                ref="tooltip"
                                withOverlay={false}
                                height={key.description.length<30?wp('12%'):key.description.length<60?wp('25%'):key.description.length<100?wp('37%'):wp('60%')}
                                width={key.description.length<30?wp('50%'):key.description.length<120?wp('60%'):wp('65%')}
                                pointerColor={'#4f60c9'}backgroundColor={'#4f60c9'} popover={<View style={{justifyContent:'flex-start',alignSelf:'flex-start', 
                                    flex:1
                                 }}><Text style={{ flex: 1 ,color:'#FFFFFF'}} >{this.description(key.description)}</Text></View>} style={{backgroundColor:'red'}}>
                                <Text style={{ fontFamily: 'Catamaran-Regular', color: '#293D68', fontSize: hp('1.8%'), marginLeft: wp('2%') }}>{key.title}</Text>
                                </Tooltip>:
                                <Text style={{ fontFamily: 'Catamaran-Regular', color: '#293D68', fontSize: hp('1.8%'), marginLeft: wp('2%') }}>{key.title}</Text>}
                            </View>
                        </View>
                    )) : 
                    <View style={[commonStyles.full, commonStyles.margin]}>
                        <View style={[commonStyles.row, { alignItems: 'center' }]}>
                            <Text style={{ fontFamily: 'Catamaran-Regular', color: '#293D68', fontSize: hp('2%') }}>No Data</Text>
                        </View>
                    </View>
                }
            </View>

        );
    }
}

const styles = StyleSheet.create({
    greenCheckImage: {
        width: wp('3.2%'),
        height: hp('3.3%'),
        resizeMode: 'contain'
    },

});