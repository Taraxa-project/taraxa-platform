import axios, { AxiosError } from 'axios';

export const useApi = () => {
  const getUrl = (url: string) => {
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
      return parsedUrl.toString();
    } catch (e) {
      parsedUrl = new URL(`${process.env.REACT_APP_API_HOST}${url}`);
      return parsedUrl.toString();
    }
  };

  const getOptions = (includeToken: boolean = false) => {
    let options = {};

    if (includeToken) {
      const token = localStorage.getItem('auth');

      if (token !== null) {
        options = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
      }
    }

    return options;
  };

  const getErrorResponse = (err: AxiosError) => {
    if (!err.response) {
      return {
        success: false,
        response: err.toString(),
      };
    }

    const data = err.response.data;
    const response = data.data ?? data;
    const message = response.message ?? response;
    return {
      success: false,
      response: message,
    };
  };

  const post = async <T>(url: string, data: {}, includeToken: boolean = false) => {
    const options = getOptions(includeToken);
    return axios
      .post<T>(getUrl(url), data, options)
      .then((response) => {
        return {
          success: true,
          response: response.data as T,
        };
      })
      .catch((err) => getErrorResponse(err));
  };

  const put = async (url: string, data: {}, includeToken: boolean = false) => {
    const options = getOptions(includeToken);
    return axios
      .put(getUrl(url), data, options)
      .then((response) => {
        return {
          success: true,
          response: response.data,
        };
      })
      .catch((err) => getErrorResponse(err));
  };

  const del = async (url: string, includeToken: boolean = false) => {
    const options = getOptions(includeToken);
    return axios
      .delete(getUrl(url), options)
      .then((response) => {
        return {
          success: true,
          response: response.data,
        };
      })
      .catch((err) => getErrorResponse(err));
  };

  const get = async (url: string, includeToken: boolean = false) => {
    const options = getOptions(includeToken);
    return axios
      .get(getUrl(url), options)
      .then((response) => {
        return {
          success: true,
          response: response.data,
        };
      })
      .catch((err) => getErrorResponse(err));
  };

  return { post, put, del, get };
};
