import simpleRestProvider from "ra-data-simple-rest";
import httpClient from "./httpClient";
import constants from "../constants";
const dataProvider = simpleRestProvider(constants.baseUrl, httpClient);

const myDataProvider = {
  ...dataProvider,
  create: (resource, params) => {
    if (resource !== "batches" || !params.data.file) {
      return dataProvider.create(resource, params);
    }

    let formData = new FormData();
    formData.append("name", params.data.name);
    formData.append("type", params.data.type);
    formData.append("file", params.data.file.rawFile);

    return httpClient(`${constants.baseUrl}/${resource}`, {
      method: "POST",
      body: formData,
    }).then(({ json }) => ({
      data: { ...params.data, id: json.id },
    }));
  },
};

export default myDataProvider;
