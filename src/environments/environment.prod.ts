export const environment = {
  production: true,
  defaultauth: 'fakebackend',
  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: ''
  },
  BASE_URL_API: "http://localhost:8082/api/v1",
  keycloak: {
    enable: true, //Enable or disable Keycloak for Frontend app
    authority: 'http://localhost:8090', //Keycloak URL
    redirectUri: 'http://localhost:4200', //Frontend app URL
    postLogoutRedirectUri: 'http://localhost:4200/logout', //Optional value
    realm: 'dgifne', //Realm name
    clientId: 'frontend',
  },
};
