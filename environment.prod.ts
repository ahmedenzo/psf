export const environment = {
  production: true,
  apiUrl: `${window.location.origin}/api`, // Uses the current origin (http or https)
  brokerURL: `${window.location.origin.replace(/^http/, 'ws').replace(/^https/, 'wss')}/ws`, // Ensures wss for https
  enableLogging: false,
};