import axios from 'axios';

const EMPLOYEES_URL = 'https://randomuser.me/api/?results=200&nat=us';

export default {
  search() {
    return axios.get(EMPLOYEES_URL);
  },
};
