import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export function createHttpClient(baseURL: string, config: AxiosRequestConfig = {}): AxiosInstance {
  const client = axios.create({ baseURL, timeout: 10000, ...config });

  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      const { config: reqConfig, response } = error;
      if (!reqConfig || reqConfig._retryCount >= 2) return Promise.reject(error);
      if (response?.status && response.status < 500) return Promise.reject(error);

      reqConfig._retryCount = (reqConfig._retryCount || 0) + 1;
      await new Promise((r) => setTimeout(r, reqConfig._retryCount * 1000));
      return client(reqConfig);
    }
  );

  return client;
}
