import { useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { useLoading } from './useLoading';

const useApi = () => {
  const { startLoading, finishLoading } = useLoading();
  const baseUrl = process.env.REACT_APP_API_HOST;
  const token = localStorage.getItem('auth');

  const getUrl = useCallback(
    (url: string) => {
      let parsedUrl;
      try {
        parsedUrl = new URL(url);
        return parsedUrl.toString();
      } catch (e) {
        parsedUrl = new URL(`${baseUrl}${url}`);
        return parsedUrl.toString();
      }
    },
    [baseUrl],
  );

  const getOptions = useCallback(
    (includeToken = false) => {
      let options = {};

      if (includeToken) {
        if (token !== null) {
          options = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
        }
      }

      return options;
    },
    [token],
  );

  const getErrorResponse = useCallback((err: AxiosError) => {
    if (!err.response) {
      return {
        success: false,
        response: err.toString(),
      };
    }

    const { data } = err.response;
    const response = data.data ?? data;
    const message = response.message ?? response;
    return {
      success: false,
      response: message,
    };
  }, []);

  const post = useCallback(
    async <T>(url: string, data: Record<string, unknown> | FormData, includeToken = false) => {
      const options = getOptions(includeToken);
      startLoading!();
      return axios
        .post<T>(getUrl(url), data, options)
        .then((response) => {
          return {
            success: true,
            response: response.data as T,
          };
        })
        .catch((err) => getErrorResponse(err))
        .finally(() => finishLoading!());
    },
    [getOptions, getUrl, getErrorResponse],
  );

  const put = useCallback(
    async (url: string, data: Record<string, unknown> | FormData, includeToken = false) => {
      const options = getOptions(includeToken);
      startLoading!();
      return axios
        .put(getUrl(url), data, options)
        .then((response) => {
          return {
            success: true,
            response: response.data,
          };
        })
        .catch((err) => getErrorResponse(err))
        .finally(() => finishLoading!());
    },
    [getOptions, getUrl, getErrorResponse],
  );

  const del = useCallback(
    async (url: string, includeToken = false) => {
      const options = getOptions(includeToken);
      startLoading!();
      return axios
        .delete(getUrl(url), options)
        .then((response) => {
          return {
            success: true,
            response: response.data,
          };
        })
        .catch((err) => getErrorResponse(err))
        .finally(() => finishLoading!());
    },
    [getOptions, getUrl, getErrorResponse],
  );

  const get = useCallback(
    async (url: string, includeToken = false) => {
      const options = getOptions(includeToken);
      startLoading!();
      return axios
        .get(getUrl(url), options)
        .then((response) => {
          return {
            success: true,
            response: response.data,
          };
        })
        .catch((err) => getErrorResponse(err))
        .finally(() => finishLoading!());
    },
    [getOptions, getUrl, getErrorResponse],
  );

  return { post, put, del, get };
};

export default useApi;
