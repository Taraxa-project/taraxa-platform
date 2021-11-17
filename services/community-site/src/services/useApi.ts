import { useCallback } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useLoading } from './useLoading';
import { useAuth } from './useAuth';

abstract class ResponseHandler<T> {
  handleResponse(response: AxiosResponse<any>) {
    return {
      success: true,
      response: this.convertResponse(response),
    };
  }

  abstract convertResponse(response: AxiosResponse<any>): T;
}

class RawResponseHandler extends ResponseHandler<any> {
  convertResponse(response: AxiosResponse<any>): any {
    return response.data;
  }
}

class TypedResponseHandler<T> extends ResponseHandler<T> {
  convertResponse(response: AxiosResponse<any>): T {
    return response.data as T;
  }
}

export const useApi = () => {
  const { startLoading, finishLoading } = useLoading();
  const auth = useAuth();
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
    (includeToken: boolean = false) => {
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

    if (err.response!.status === 401) {
      auth.setSessionExpired!();
      return {
        success: false,
        response: 'Session expired',
      };
    }

    const data = err.response.data;
    const response = data.data ?? data;
    const message = response.message ?? response;
    return {
      success: false,
      response: message,
    };
  }, []);

  const post = useCallback(
    async <T>(url: string, data: {}, includeToken: boolean = false) => {
      const responseHandler = new TypedResponseHandler<T>();
      const options = getOptions(includeToken);
      startLoading!();
      return axios
        .post<T>(getUrl(url), data, options)
        .then((response) => responseHandler.handleResponse(response))
        .catch((err) => getErrorResponse(err))
        .finally(() => finishLoading!());
    },
    [getOptions, getUrl, getErrorResponse],
  );

  const put = useCallback(
    async (url: string, data: {}, includeToken: boolean = false) => {
      const responseHandler = new RawResponseHandler();
      const options = getOptions(includeToken);
      startLoading!();
      return axios
        .put(getUrl(url), data, options)
        .then((response) => responseHandler.handleResponse(response))
        .catch((err) => getErrorResponse(err))
        .finally(() => finishLoading!());
    },
    [getOptions, getUrl, getErrorResponse],
  );

  const del = useCallback(
    async (url: string, includeToken: boolean = false) => {
      const responseHandler = new RawResponseHandler();
      const options = getOptions(includeToken);
      startLoading!();
      return axios
        .delete(getUrl(url), options)
        .then((response) => responseHandler.handleResponse(response))
        .catch((err) => getErrorResponse(err))
        .finally(() => finishLoading!());
    },
    [getOptions, getUrl, getErrorResponse],
  );

  const get = useCallback(
    async (url: string, includeToken: boolean = false) => {
      const responseHandler = new RawResponseHandler();
      const options = getOptions(includeToken);
      startLoading!();
      return axios
        .get(getUrl(url), options)
        .then((response) => responseHandler.handleResponse(response))
        .catch((err) => getErrorResponse(err))
        .finally(() => finishLoading!());
    },
    [getOptions, getUrl, getErrorResponse],
  );

  return { post, put, del, get };
};
