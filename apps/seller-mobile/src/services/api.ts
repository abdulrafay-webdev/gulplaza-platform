import { Platform } from 'react-native';
import { createApiClient } from '../../../mobile-shared/src/api/client';

const getBaseURL = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api/v1';
  }
  return 'http://localhost:8000/api/v1';
};

export const api = createApiClient(getBaseURL());
export default api;
