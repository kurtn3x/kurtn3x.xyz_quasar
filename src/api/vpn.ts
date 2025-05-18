import { reactive } from 'vue';
import { useQuasar } from 'quasar';
import { apiGet, apiPost, apiDelete } from 'src/components/apiWrapper';
import { VPNConnectionType, VPNSetupType, VPNInfoType } from 'src/types';
import * as wireguard from 'src/components/vpn/wireguard.js';
import { useLocalStore } from 'stores/localStore';
import { defaultVPNInfo, defaultVPNConnection } from 'src/types/test';

export function useVPN() {
  const q = useQuasar();

  const state = reactive({
    connections: [] as VPNInfoType[],
    loading: true,
    error: false,
    errorMessage: '',
  });

  const localStore = useLocalStore();

  const axiosConfig = {
    withCredentials: true,
    headers: {
      'X-CSRFToken': q.cookies.get('csrftoken'),
    },
  };

  const getConnections = async () => {
    state.loading = true;
    state.error = false;

    if (localStore.isDebugMode) {
      q.notify({ type: 'info', message: 'Debug' });
      await new Promise((resolve) => setTimeout(resolve, 500));
      state.loading = false;
      state.error = false;
      state.connections = [defaultVPNInfo()];
      return;
    }

    try {
      const apiData = await apiGet('/vpn/client', axiosConfig);
      if (apiData.error === false) {
        state.connections = apiData.data as VPNInfoType[];
      } else {
        q.notify({ type: 'negative', message: apiData.errorMessage });
        state.error = true;
        state.errorMessage = apiData.errorMessage;
      }
    } catch (error) {
      state.error = true;
      state.errorMessage = 'Network error occurred';
      q.notify({ type: 'negative', message: 'Network error occurred' });
    } finally {
      state.loading = false;
    }
  };

  const deleteConnection = async (id: string) => {
    try {
      const apiData = await apiDelete('/vpn/client/' + id, axiosConfig);
      if (apiData.error === false) {
        q.notify({ type: 'positive', message: 'Deleted.' });
        await getConnections();
      } else {
        q.notify({ type: 'negative', message: apiData.errorMessage });
      }
    } catch (error) {
      q.notify({ type: 'negative', message: 'Network error during deletion' });
    }
  };

  const createVPNClient = async (setup: VPNSetupType) => {
    let keys = {
      privateKey: '',
      publicKey: '',
    };

    if (setup.autoKeyGeneration == true) {
      keys = wireguard.generateKeypair();
      setup.clientPublicKey = keys.publicKey;
    }

    // don't transmit private key
    const privateKey = setup.clientPrivateKey;
    setup.clientPrivateKey = '';

    let vpnConnection = {} as VPNConnectionType;

    if (localStore.isDebugMode) {
      q.notify({ type: 'info', message: 'Debug' });
      await new Promise((resolve) => setTimeout(resolve, 500));
      vpnConnection = defaultVPNConnection();
      return vpnConnection;
    }

    apiPost('/vpn/client', setup, axiosConfig).then((apiData) => {
      if (apiData.error == false) {
        vpnConnection = apiData.data;
        if (setup.autoKeyGeneration == true) {
          // use generated keys
          vpnConnection.clientPrivateKey = keys.privateKey;
          vpnConnection.clientPublicKey = keys.publicKey;
        } else {
          // use keys from input
          vpnConnection.clientPrivateKey = privateKey;
          vpnConnection.clientPublicKey = setup.clientPublicKey;
        }
      } else {
        q.notify({ type: 'negative', message: apiData.errorMessage });
      }
    });

    return vpnConnection;
  };

  return {
    state,
    getConnections,
    deleteConnection,
    createVPNClient,
  };
}
