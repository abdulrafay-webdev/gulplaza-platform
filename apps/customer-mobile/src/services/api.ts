import { Platform } from 'react-native';
import { createApiClient } from '../../../mobile-shared/src/api/client';

// On Android Emulator, localhost is 10.0.2.2. On physical device or iOS, use host IP or standard port.
const getBaseURL = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api/v1';
  }
  return 'http://localhost:8000/api/v1';
};

export const api = createApiClient(getBaseURL());
export default api;
