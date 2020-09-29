import React, { PureComponent } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { withNavigation, StackActions, NavigationActions } from 'react-navigation';
import NetInfo from "@react-native-community/netinfo";
import { Toast } from 'native-base';
import Globals from '../../Globals';
import { connect } from "react-redux";
import AsyncStorage from '@react-native-community/async-storage';



const { width } = Dimensions.get('window');


class OfflineNotice extends PureComponent {
  state = {
    isConnected: true
  };

  async componentDidMount() {
    // NetInfo.fetch("wifi").then(state => {
    //     console.log("Connection type", state.type);
    //     console.log("Is connected?", state.isConnected);
    //     this.setState({isConnected:state.isConnected})
    //   }); 
    console.log("offline")
    if (await this.checkInternet()) {
    this.getdata()
    }
    else{
      this.showToast("No Internet Connectivity!")
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

    async getdata(){
      const axios = require('axios');
      var agency_code = await AsyncStorage.getItem('agency_code');
      var url = Globals.httpMode + agency_code  + Globals.domain + '/api/v1/notices?page=1&per_page=10';
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
          console.log("token : ", access_token);
          try {
              var response = await axios.get(url, {
                  headers: headers
              })
              if (response.status === 200) {
              console.log("response: ", response);
                 
              }
              else {
              console.log("error1 : ", response);
                  
              }
          }
          catch (error) {
              console.log("error1 : ", error);
              if(error = 'Error: Request failed with status code 401'){
                  this.navigateToLogin()
              }
          }
      }
      catch (e) {
          var error = (_.get(e, 'response.status', null) ? _.get(e, 'response.data.errors', 'Something went wrong!') : 'Network error!');
          this.setState({
              loading: false,
          })
      }
    }

    async navigateToLogin() {
      await AsyncStorage.removeItem('agency_code', null);
      await AsyncStorage.removeItem('USER_DATA', null);
      await AsyncStorage.removeItem('agency_email', null);
      const resetAction = StackActions.reset({
          index: 0,
          actions: [
              NavigationActions.navigate({
                  routeName: "LoginScreen"
              })
          ]
      });
      this.props.navigation.dispatch(resetAction);
  }

    componentWillMount(){
        // NetInfo.fetch("wifi").then(state => {
        //     console.log("Connection type", state.type);
        //     console.log("Is connected?", state.isConnected);
        //     this.setState({isConnected:state.isConnected})
        //   });
    }


//   handleConnectivityChange = isConnected => {
//       this.setState({ isConnected });
//   };
  showToast(message) {
    Toast.show({
        text: message,
        duration: 2000
    })
}

  render() {
    // if (!this.state.isConnected) {
    //   this.showToast("No Internet Connectivity!")
    // }
    return null;
  }
}

const styles = StyleSheet.create({
  offlineContainer: {
    backgroundColor: '#b52424',
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width,
    position: 'absolute',
    top: 30
  },
  offlineText: { color: '#fff' }
});


const mapStateToProps = state => ({
  data: state.user.data
});

export default connect(
  mapStateToProps,
  null
)(withNavigation(OfflineNotice));