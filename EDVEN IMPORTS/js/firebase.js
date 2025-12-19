// Prevent redeclaration errors
if (typeof firebaseConfig === 'undefined') {
  var firebaseConfig = {
    apiKey: "AIzaSyDvbpaq5fFG1cP_iQHaidCBBX5TD-VotDY",
    authDomain: "axisberlinda.firebaseapp.com",
    databaseURL: "https://axisberlinda-default-rtdb.firebaseio.com",
    projectId: "axisberlinda",
    storageBucket: "axisberlinda.firebasestorage.app",
    messagingSenderId: "491796856622",
    appId: "1:491796856622:web:2166f19353ae1a7b4fc4bf",
    measurementId: "G-2ZSDDP6G24"
  }
}

// Initialize Firebase only if not already initialized
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

// Declare db only if not already declared
if (typeof db === 'undefined') {
  var db = firebase.database().ref('products')
}