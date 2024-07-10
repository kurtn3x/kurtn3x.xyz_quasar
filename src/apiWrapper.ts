import { api } from 'src/boot/axios';

export async function apiGet(endpoint: string, axiosConfig: any) {
  const returnData = {
    error: true,
    errorMessage: '',
    data: {},
  };
  await api
    .get(endpoint, axiosConfig)
    .then((response) => {
      if (response.status == 200) {
        returnData.error = false;
        returnData.data = response.data;
      } else {
        returnData.error = true;
        returnData.errorMessage = response.data;
      }
    })
    .catch((error) => {
      if (error.response) {
        returnData.error = true;
        returnData.errorMessage = error.response.data.error;
      } else {
        returnData.error = true;
        returnData.errorMessage = error.message;
      }
    });

  return returnData;
}

export async function apiDelete(endpoint: string, axiosConfig: any) {
  const returnData = {
    error: true,
    errorMessage: '',
    data: {},
  };
  await api
    .delete(endpoint, axiosConfig)
    .then((response) => {
      if (response.status == 200) {
        returnData.error = false;
        returnData.data = response.data;
      } else {
        returnData.error = true;
        returnData.errorMessage = response.data;
      }
    })
    .catch((error) => {
      if (error.response) {
        returnData.error = true;
        returnData.errorMessage = error.response.data.error;
      } else {
        returnData.error = true;
        returnData.errorMessage = error.message;
      }
    });

  return returnData;
}

export async function apiPost(endpoint: string, data: any, axiosConfig: any) {
  const returnData = {
    error: true,
    errorMessage: '',
    data: {} as any,
  };
  await api
    .post(endpoint, data, axiosConfig)
    .then((response) => {
      if (response.status == 200) {
        returnData.error = false;
        returnData.data = response.data;
      } else {
        returnData.error = true;
        returnData.errorMessage = response.data;
      }
    })
    .catch((error) => {
      if (error.response) {
        returnData.error = true;
        returnData.errorMessage = error.response.data.error;
      } else {
        returnData.error = true;
        returnData.errorMessage = error.message;
      }
    });

  return returnData;
}

export async function apiPut(endpoint: string, data: any, axiosConfig: any) {
  const returnData = {
    error: true,
    errorMessage: '',
    data: {} as any,
  };
  await api
    .put(endpoint, data, axiosConfig)
    .then((response) => {
      if (response.status == 200) {
        returnData.error = false;
        returnData.data = response.data;
      } else {
        returnData.error = true;
        returnData.errorMessage = response.data;
      }
    })
    .catch((error) => {
      if (error.response) {
        returnData.error = true;
        returnData.errorMessage = error.response.data.error;
      } else {
        returnData.error = true;
        returnData.errorMessage = error.message;
      }
    });

  return returnData;
}
