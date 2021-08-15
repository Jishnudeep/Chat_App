import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

const config = {
  apiKey: 'AIzaSyDFeui0TFOhyhetQI7vDTvipEoREB6ssIk',
  authDomain: 'chat-web-app-b041a.firebaseapp.com',
  databaseURL:
    'https://chat-web-app-b041a-default-rtdb.asia-southeast1.firebasedatabase.app/',
  projectId: 'chat-web-app-b041a',
  storageBucket: 'chat-web-app-b041a.appspot.com',
  messagingSenderId: '26636133793',
  appId: '1:26636133793:web:319fb5c154f37518c057e0',
};

const app = firebase.initializeApp(config);

export const auth = app.auth();
export const database = app.database();
