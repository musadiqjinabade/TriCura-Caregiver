export default class APIService {

  static async execute(method, url, data, loginData) {
    const axios = require('axios');
    console.log('loginData ', loginData);
    if (loginData) {
      var request = {};
      request.method = method;
      request.headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'App-Token': '96ef950f-bfae-4ee5-89a0-f23ab9e50b96',
        'Authentication-Token': loginData
      };

      if (request.method !== 'GET') {
        request.body = data;
      }

      return fetch(url, request)
        .then(res => {
          console.log('res', res.json);
          return res.json();
        })
        .then((response) => {
          console.log('API Response = ', response);
          return {
            success: true,
            data: response
          }
        })
        .catch((error) => {
          var error = (_.get(error, 'response.status', null) ? _.get(error, 'response.data.errors', 'Something went wrong!') : 'Network error!');
        })
    }

  }
}