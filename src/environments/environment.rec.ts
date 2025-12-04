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
  BASE_URL_API: "http://38.242.201.239:8080/api/v1",
  keycloak: {
    enable: true, //Enable or disable Keycloak for Frontend app
    authority: 'http://38.242.201.239:8090', //Keycloak URL
    redirectUri: 'http://38.242.201.239:8080', //Frontend app URL
    postLogoutRedirectUri: 'http://38.242.201.239:8090/logout', //Optional value
    realm: 'dgifne', //Realm name
    clientId: 'frontend',
  },
  pageSize: 10,
  // entpriseBK: "BURGER KING"
};
