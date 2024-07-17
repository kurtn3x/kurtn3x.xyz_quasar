import { api } from 'src/boot/axios';

export async function apiGet(endpoint: string, axiosConfig: any) {
  const returnData = {
    error: true,
    errorMessage: '',
    data: {},
    returnCode: 0,
  };
  await api
    .get(endpoint, axiosConfig)
    .then((response) => {
      returnData.returnCode = response.status;
      if (response.status == 200) {
        returnData.error = false;
        returnData.data = response.data;
      } else {
        returnData.error = true;
        returnData.errorMessage = response.data;
        if (returnData.errorMessage == '') {
          returnData.errorMessage =
            'API Error returned code ' + response.status + '.';
        }
      }
    })
    .catch((error) => {
      returnData.returnCode = 1;
      if (error.response) {
        returnData.error = true;
        returnData.errorMessage = error.response.data.error;
        if (returnData.errorMessage == '') {
          returnData.errorMessage =
            'API Error returned code ' + error.response.status + '.';
        }
      } else {
        returnData.error = true;
        returnData.errorMessage = error.message;
        if (returnData.errorMessage == '') {
          returnData.errorMessage = 'Encountered error during request.';
        }
      }
    });

  return returnData;
}

export async function apiDelete(endpoint: string, axiosConfig: any) {
  const returnData = {
    error: true,
    errorMessage: '',
    data: {},
    returnCode: 0,
  };
  await api
    .delete(endpoint, axiosConfig)
    .then((response) => {
      returnData.returnCode = response.status;
      if (response.status == 200) {
        returnData.error = false;
        returnData.data = response.data;
      } else {
        returnData.error = true;
        returnData.errorMessage = response.data;
        if (returnData.errorMessage == '') {
          returnData.errorMessage =
            'API Error returned code ' + response.status + '.';
        }
      }
    })
    .catch((error) => {
      returnData.returnCode = 1;
      if (error.response) {
        returnData.error = true;
        returnData.errorMessage = error.response.data.error;
        if (returnData.errorMessage == '') {
          returnData.errorMessage =
            'API Error returned code ' + error.response.status + '.';
        }
      } else {
        returnData.error = true;
        returnData.errorMessage = error.message;
        if (returnData.errorMessage == '') {
          returnData.errorMessage = 'Encountered error during request.';
        }
      }
    });

  return returnData;
}

export async function apiPost(endpoint: string, data: any, axiosConfig: any) {
  const returnData = {
    error: true,
    errorMessage: '',
    data: {} as any,
    returnCode: 0,
  };
  await api
    .post(endpoint, data, axiosConfig)
    .then((response) => {
      returnData.returnCode = response.status;
      if (response.status == 200) {
        returnData.error = false;
        returnData.data = response.data;
      } else {
        returnData.error = true;
        returnData.errorMessage = response.data;
        if (returnData.errorMessage == '') {
          returnData.errorMessage =
            'API Error returned code ' + response.status + '.';
        }
      }
    })
    .catch((error) => {
      returnData.returnCode = 1;
      if (error.response) {
        returnData.error = true;
        returnData.errorMessage = error.response.data.error;
        if (returnData.errorMessage == '') {
          returnData.errorMessage =
            'API Error returned code ' + error.response.status + '.';
        }
      } else {
        returnData.error = true;
        returnData.errorMessage = error.message;
        if (returnData.errorMessage == '') {
          returnData.errorMessage = 'Encountered error during request.';
        }
      }
    });

  return returnData;
}

export async function apiPut(endpoint: string, data: any, axiosConfig: any) {
  const returnData = {
    error: true,
    errorMessage: '',
    data: {} as any,
    returnCode: 0,
  };
  await api
    .put(endpoint, data, axiosConfig)
    .then((response) => {
      returnData.returnCode = response.status;
      if (response.status == 200) {
        returnData.error = false;
        returnData.data = response.data;
      } else {
        returnData.error = true;
        returnData.errorMessage = response.data;
        if (returnData.errorMessage == '') {
          returnData.errorMessage =
            'API Error returned code ' + response.status + '.';
        }
      }
    })
    .catch((error) => {
      returnData.returnCode = 1;
      if (error.response) {
        returnData.error = true;
        returnData.errorMessage = error.response.data.error;
        if (returnData.errorMessage == '') {
          returnData.errorMessage =
            'API Error returned code ' + error.response.status + '.';
        }
      } else {
        returnData.error = true;
        returnData.errorMessage = error.message;
        if (returnData.errorMessage == '') {
          returnData.errorMessage = 'Encountered error during request.';
        }
      }
    });

  return returnData;
}
