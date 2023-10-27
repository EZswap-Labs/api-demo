export const BASE_URL = {
  dev: 'https://testapi.ezswap.io/api/',
  test: 'https://testapi.ezswap.io/api/',
  prod: 'https://api.ezswap.io/api/',
}[process.env.REACT_APP_MODE];
