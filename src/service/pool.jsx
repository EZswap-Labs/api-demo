import axios from 'axios';
import { BASE_URL } from '../config/constant';

export function queryPoolListByPage(parameter) {
  console.log('BASE_URL', BASE_URL);
  return axios({
    url: BASE_URL + 'queryCollectionPoolList',
    method: 'post',
    data: parameter,
  });
}
export function a() {

}
