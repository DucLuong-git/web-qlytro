import axios from 'axios';

const api = axios.create({
  baseURL: 'https://luong.io.vn/api',
  timeout: 10000,
});

export default api;
