import axios from "axios";
const baseUrl = "https://randomuser.me/api/?";
let numberOfResults = 'results=10';
let nationalities = 'nat=us';

let fullUrl = `${baseUrl+numberOfResults}&${nationalities}`;

export default {
    search: function () {
        // console.log('query: ', query);
    return axios.get(fullUrl);
  }
};
