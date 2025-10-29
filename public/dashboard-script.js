// Konfigurasi Firebase (sama seperti di script.js)
const firebaseConfig = {
  apiKey: "AIzaSyCdnuxrphMRWMlWBNrin_d-EUG8vQD6PPY",
  authDomain: "aplikasi-rapor-mengaji.firebaseapp.com",
  projectId: "aplikasi-rapor-mengaji",
  storageBucket: "aplikasi-rapor-mengaji.firebasestorage.app",
  messagingSenderId: "849130501807",
  appId: "1:849130501807:web:64f36159c59e21247e465a",
  measurementId: "G-N5QNWYL1LW"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- LOGIKA DASHBOARD ---

const userNameElement = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');

// Cek status login pengguna saat halaman dimuat
auth.onAuthStateChanged((user) => {
  if (user) {
    // Pengguna sudah login
    console.log('User logged in:', user);
    userNameElement.textContent = user.email; // Sementara tampilkan email

    // TODO: Ambil data lengkap user dari Firestore untuk menampilkan nama dan role

  } else {
    // Pengguna belum login, arahkan kembali ke halaman login
    console.log('User not logged in, redirecting...');
    window.location.href = 'index.html';
  }
});

// Fungsi untuk logout
logoutBtn.addEventListener('click', () => {
  auth.signOut().then(() => {
    console.log('User signed out.');
  }).catch((error) => {
    console.error('Sign out error:', error);
  });
});