const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

function writeTestData() {
  set(ref(db, 'test/'), {
    message: 'Firebase is working!',
  }).then(() => {
    console.log('Data written successfully!');
  }).catch((error) => {
    console.error('Error writing data:', error);
  });
}

writeTestData();