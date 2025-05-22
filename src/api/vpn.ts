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

    const apiData = await apiGet('/vpn/client', axiosConfig);
    if (apiData.error === false) {
      state.connections = apiData.data as VPNInfoType[];
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
      state.error = true;
      state.errorMessage = apiData.errorMessage;
    }

    state.loading = false;
  };

  const deleteConnection = async (id: string) => {
    const apiData = await apiDelete('/vpn/client/' + id, axiosConfig);
    if (apiData.error === false) {
      q.notify({ type: 'positive', message: 'Deleted.' });
      await getConnections();
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }
  };

  const createVPNClient = async (
    setup: VPNSetupType
  ): Promise<VPNConnectionType | null> => {
    let keys = {
      privateKey: '',
      publicKey: '',
    };

    if (setup.autoKeyGeneration === true) {
      keys = wireguard.generateKeypair();
      setup.clientPublicKey = keys.publicKey;
    }

    // Store private key but don't transmit it
    const privateKey = setup.clientPrivateKey;
    setup.clientPrivateKey = '';

    // Debug mode handling
    if (localStore.isDebugMode) {
      q.notify({ type: 'info', message: 'Debug' });
      await new Promise((resolve) => setTimeout(resolve, 500));
      const debugConnection = defaultVPNConnection();
      return debugConnection;
    }

    // Make API call
    const apiData = await apiPost('/vpn/client', setup, axiosConfig);

    if (apiData.error === false) {
      const vpnConnection = apiData.data as VPNConnectionType;

      // Add the key information back
      if (setup.autoKeyGeneration === true) {
        // Use generated keys
        vpnConnection.clientPrivateKey = keys.privateKey;
        vpnConnection.clientPublicKey = keys.publicKey;
      } else {
        // Use keys from input
        vpnConnection.clientPrivateKey = privateKey;
        vpnConnection.clientPublicKey = setup.clientPublicKey;
      }
      return vpnConnection;
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
      return null;
    }
  };

  return {
    state,
    getConnections,
    deleteConnection,
    createVPNClient,
  };
}
