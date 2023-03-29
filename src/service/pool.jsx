import axios from 'axios';

export function queryPoolListByPage(parameter) {
  return axios({
    url: 'https://test.ezswap.io/api/api/queryCollectionPoolList',
    method: 'post',
    data: parameter,
  });
}
export function a() {

}
