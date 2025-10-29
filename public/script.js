// Ganti dengan konfigurasi Firebase Anda yang sudah disalin
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

// --- LOGIKA LOGIN ---

// Ambil elemen-elemen dari HTML
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');

// Tambahkan event listener untuk saat form disubmit
loginForm.addEventListener('submit', (e) => {
  e.preventDefault(); // Cegah halaman reload

  const email = emailInput.value;
  const password = passwordInput.value;

  // Tampilkan pesan loading (opsional)
  errorMessage.textContent = 'Sedang masuk...';

  // Proses login dengan Firebase
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Login berhasil
      const user = userCredential.user;
      console.log('Login berhasil! User:', user);
      alert('Login berhasil! Selamat datang, ' + user.email);
      // TODO: Arahkan pengguna ke halaman dashboard
      // Arahkan ke halaman dashboard
      window.location.href = 'dashboard.html';
    })
    .catch((error) => {
      // Login gagal
      const errorCode = error.code;
      const errorMessageText = error.message;
      console.error('Error login:', errorCode, errorMessageText);
      errorMessage.textContent = 'Login gagal: ' + errorMessageText;
    });
});