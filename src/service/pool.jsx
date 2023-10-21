import axios from 'axios';

export function queryPoolListByPage(parameter) {
  // aa
  return axios({
    url: 'https://testapi.ezswap.io/api/queryCollectionPoolList',
    method: 'post',
    data: parameter,
  });
}
export function a() {

}
