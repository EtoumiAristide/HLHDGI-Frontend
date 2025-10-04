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
  BASE_URL_API: "https://app.camandsonsentreprises.com/api/v1",
  keycloak: {
    enable: true, //Enable or disable Keycloak for Frontend app
    authority: 'https://auth.camandsonsentreprises.com', //Keycloak URL
    redirectUri: 'https://app.camandsonsentreprises.com', //Frontend app URL
    postLogoutRedirectUri: 'https://app.camandsonsentreprises.com/logout', //Optional value
    realm: 'dgifne', //Realm name
    clientId: 'frontend',
  },
  pageSize: 10,
  // entpriseBK: "BURGER KING"
};
