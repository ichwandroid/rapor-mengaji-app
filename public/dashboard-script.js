// Konfigurasi Firebase (sama seperti di script.js)
const firebaseConfig = {
  apiKey: "AIzaSyCdnuxrphMRWMlWBNrin_d-EUG8vQD6PPY",
  authDomain: "aplikasi-rapor-mengaji.firebaseapp.com",
  projectId: "aplikasi-rapor-mengaji",
  storageBucket: "aplikasi-rapor-mengaji.firebasestorage.app",
  messagingSenderId: "849130501807",
  appId: "1:849130501807:web:64f36159c59e21247e465a",
  measurementId: "G-N5QNWYL1LW",
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- LOGIKA DASHBOARD ---

const userNameElement = document.getElementById("user-name");
const logoutBtn = document.getElementById("logout-btn");

// Fungsi untuk mengambil data user dari Firestore
const getUserData = async (user) => {
  try {
    const userDoc = await db.collection("users").doc(user.uid).get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log("Data user dari Firestore:", userData);

      // Tampilkan nama lengkap
      userNameElement.textContent = userData.name || user.email;

      // TODO: Berdasarkan userData.role, tampilkan konten yang berbeda
      const adminContent = document.getElementById("admin-content");
      const guruGpqContent = document.getElementById("guru-gpq-content");
      const guruGpaiContent = document.getElementById("guru-gpai-content");

      // Sembunyikan semua konten terlebih dahulu
      adminContent.classList.add("hidden");
      guruGpqContent.classList.add("hidden");
      guruGpaiContent.classList.add("hidden");

      if (userData.role === "admin") {
        console.log("Ini adalah Admin");
        adminContent.classList.remove("hidden"); // Tampilkan konten admin

        // Ambil daftar semua pengguna
        const userTableBody = document.getElementById("user-table-body");

        db.collection("users")
          .get()
          .then((querySnapshot) => {
            userTableBody.innerHTML = ""; // Kosongkan loading text
            if (querySnapshot.empty) {
              userTableBody.innerHTML =
                '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">Tidak ada pengguna.</td></tr>';
            } else {
              querySnapshot.forEach((doc) => {
                const userData = doc.data();
                const row = document.createElement("tr");

                // Tentukan warna badge role
                let roleBadge = "";
                if (userData.role === "admin") {
                  roleBadge =
                    '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Admin</span>';
                } else if (userData.role === "guru_gpq") {
                  roleBadge =
                    '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Guru GPQ</span>';
                } else if (userData.role === "guru_gpai") {
                  roleBadge =
                    '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Guru GPAI</span>';
                }

                row.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${userData.name}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${userData.email}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${roleBadge}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button class="text-indigo-600 hover:text-indigo-900">Detail</button>
                        </td>
                    `;
                userTableBody.appendChild(row);
              });
            }
          })
          .catch((error) => {
            console.error("Error getting users: ", error);
            userTableBody.innerHTML =
              '<tr><td colspan="4" class="px-6 py-4 text-center text-red-500">Gagal memuat data.</td></tr>';
          });
      } else if (userData.role === "guru_gpq") {
        console.log("Ini adalah Guru GPQ");
        guruGpqContent.classList.remove("hidden"); // Tampilkan konten guru GPQ
      } else if (userData.role === "guru_gpai") {
        console.log("Ini adalah Guru GPAI");
        guruGpaiContent.classList.remove("hidden"); // Tampilkan konten guru GPAI
      }
    } else {
      console.log("Dokumen user tidak ditemukan di Firestore!");
      userNameElement.textContent = user.email;
    }
  } catch (error) {
    console.error("Error mengambil data user:", error);
    userNameElement.textContent = user.email;
  }
};

// Cek status login pengguna saat halaman dimuat
auth.onAuthStateChanged(async (user) => {
  if (user) {
    // Pengguna sudah login, ambil datanya
    console.log("User logged in:", user);
    await getUserData(user);
  } else {
    // Pengguna belum login, arahkan kembali ke halaman login
    console.log("User not logged in, redirecting...");
    window.location.href = "index.html";
  }
});

// Fungsi untuk logout
logoutBtn.addEventListener("click", () => {
  auth
    .signOut()
    .then(() => {
      console.log("User signed out.");
    })
    .catch((error) => {
      console.error("Sign out error:", error);
    });
});

// --- LOGIKA MODAL TAMBAH PENGGUNA ---

const addUserModal = document.getElementById('add-user-modal');
const addUserBtn = document.getElementById('add-user-btn');
console.log('Tombol tambah user ditemukan:', addUserBtn); // Tambahkan baris ini
const cancelAddUserBtn = document.getElementById('cancel-add-user');
const addUserForm = document.getElementById('add-user-form');
const newRoleSelect = document.getElementById('new-role');
const gpaiFields = document.getElementById('gpai-fields');

// Buka modal
addUserBtn.addEventListener('click', () => {
    addUserModal.classList.remove('hidden');
});

// Tutup modal
cancelAddUserBtn.addEventListener('click', () => {
    addUserModal.classList.add('hidden');
    addUserForm.reset();
});

// Tampilkan/sembunyikan field khusus saat role berubah
newRoleSelect.addEventListener('change', (e) => {
    console.log('Event listener dipanggil! Role yang dipilih:', e.target.value); // Tambahkan ini

    // Sembunyikan semua field khusus terlebih dahulu
    gpaiFields.classList.add('hidden');
    const gpqFields = document.getElementById('gpq-fields'); // Tambahkan ini
    gpqFields.classList.add('hidden');

    if (e.target.value === 'guru_gpai') {
        console.log('Menampilkan field GPAI'); // Tambahkan ini
        gpaiFields.classList.remove('hidden');
    } else if (e.target.value === 'guru_gpq') {
        console.log('Menampilkan field GPQ'); // Tambahkan ini
        gpqFields.classList.remove('hidden');
    }
});

// Proses penambahan user
addUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('new-name').value;
    const email = document.getElementById('new-email').value;
    const password = document.getElementById('new-password').value;
    const role = newRoleSelect.value;
    const kelasDiampu = document.getElementById('new-kelas').value.split(',').map(k => k.trim()).filter(k => k);

    // 1. Buat user di Firebase Authentication
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        console.log('User created in Auth:', user);

        // 2. Buat data user di Firestore
        const userData = {
            name: name,
            email: email,
            role: role,
            nip: '', // Bisa diisi nanti
        };

        if (role === 'guru_gpai') {
            userData.kelasDiampu = kelasDiampu;
        } else if (role === 'guru_gpq') {
            const assignments = [
                { shift: 1, kelompok: parseInt(document.getElementById('kelompok-shift-1').value) },
                { shift: 2, kelompok: parseInt(document.getElementById('kelompok-shift-2').value) },
                { shift: 3, kelompok: parseInt(document.getElementById('kelompok-shift-3').value) }
            ];
            userData.assignments = assignments;
        }

        await db.collection('users').doc(user.uid).set(userData);
        console.log('User data saved to Firestore');

        alert('Pengguna baru berhasil ditambahkan!');
        addUserModal.classList.add('hidden');
        addUserForm.reset();
        
        // Refresh halaman untuk menampilkan user baru di tabel
        window.location.reload();

    } catch (error) {
        console.error('Error adding user:', error);
        alert('Gagal menambahkan pengguna: ' + error.message);
    }
});