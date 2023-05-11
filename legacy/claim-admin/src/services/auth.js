import jwt_decode from "jwt-decode";
import constants from "../constants";

const login = (auth) => {
  const expiry = Date.now() + auth.token.expiresIn * 1000;
  localStorage.setItem("auth-token", auth.token.accessToken);
  localStorage.setItem("auth-expiry", expiry);
};
const logout = () => {
  localStorage.removeItem("auth-token");
  localStorage.removeItem("auth-expiry");
};
const getAuth = () => {
  const token = localStorage.getItem("auth-token");
  const expiry = localStorage.getItem("auth-expiry");
  return {
    token,
    expiry,
  };
};

const authProvider = {
  login: async ({ username: email, password }) => {
    const request = new Request(`${constants.baseUrl}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: new Headers({ "Content-Type": "application/json" }),
    });
    return fetch(request)
      .then((response) => {
        if (response.status < 200 || response.status >= 300) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then((auth) => login(auth))
      .catch(() => {
        throw new Error("Network error");
      });
  },
  checkError: (error) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      logout();
      return Promise.reject();
    }
    return Promise.resolve();
  },
  checkAuth: () => {
    const { token, expiry } = getAuth();
    const tokenExists = !!token;
    if (!tokenExists) {
      return Promise.reject();
    }
    if (!expiry || Date.now() > expiry) {
      return Promise.reject();
    }
    return Promise.resolve();
  },
  logout: () => {
    logout();
    return Promise.resolve();
  },
  getIdentity: () => {
    try {
      const { token } = getAuth();
      const { id, email: fullName } = jwt_decode(token);
      return Promise.resolve({ id, fullName });
    } catch (error) {
      return Promise.reject(error);
    }
  },
  getPermissions: (params) => Promise.resolve(),
};

export default authProvider;
