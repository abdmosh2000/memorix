// Simple script to determine environment and API URL
import config from './config';

export const getEnvironmentInfo = () => {
  return {
    isDevelopment: process.env.NODE_ENV === 'development',
    nodeEnv: process.env.NODE_ENV || 'undefined',
    apiUrl: config.apiUrl
  };
};
