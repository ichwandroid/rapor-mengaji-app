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
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <!-- TOMBOL EDIT YANG BARU -->
                        <button class="edit-btn text-indigo-600 hover:text-indigo-900" data-user-id="${doc.id}" data-user-data='${JSON.stringify(userData).replace(/'/g, "&apos;")}'>Edit</button>
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

// --- EVENT DELEGATION UNTUK TOMBOL EDIT ---
// Ini akan menangkap klik pada tombol edit di mana saja di dalam tabel
document.getElementById('user-table-body').addEventListener('click', (e) => {
    // Periksa apakah yang diklik adalah tombol dengan class 'edit-btn'
    if (e.target.classList.contains('edit-btn')) {
        
        // Ambil data dari atribut data-*
        const userId = e.target.dataset.userId;
        const userData = JSON.parse(e.target.dataset.userData);

        // Panggil fungsi untuk membuka modal
        openEditModal(userId, userData);
    }
});

// --- LOGIKA MODAL EDIT PENGGUNA ---

const editUserModal = document.getElementById('edit-user-modal');
const cancelEditUserBtn = document.getElementById('cancel-edit-user');
const editUserForm = document.getElementById('edit-user-form');
const editRoleSelect = document.getElementById('edit-role');
const editGpaiFields = document.getElementById('edit-gpai-fields');
const editGpqFields = document.getElementById('edit-gpq-fields');

// Fungsi untuk membuka modal dan mengisi data
function openEditModal(userId, userData) {
    console.log('Mengedit user:', userId, userData);

    // Isi form dengan data yang ada
    document.getElementById('edit-user-id').value = userId;
    document.getElementById('edit-name').value = userData.name;
    document.getElementById('edit-email').value = userData.email;
    editRoleSelect.value = userData.role;

    // Tampilkan/sembunyikan field dan isi datanya
    if (userData.role === 'guru_gpai') {
        editGpaiFields.classList.remove('hidden');
        editGpqFields.classList.add('hidden');
        document.getElementById('edit-kelas').value = userData.kelasDiampu ? userData.kelasDiampu.join(', ') : '';
    } else if (userData.role === 'guru_gpq') {
        editGpqFields.classList.remove('hidden');
        editGpaiFields.classList.add('hidden');
        if (userData.assignments) {
            document.getElementById('edit-kelompok-shift-1').value = userData.assignments.find(a => a.shift === 1)?.kelompok || '';
            document.getElementById('edit-kelompok-shift-2').value = userData.assignments.find(a => a.shift === 2)?.kelompok || '';
            document.getElementById('edit-kelompok-shift-3').value = userData.assignments.find(a => a.shift === 3)?.kelompok || '';
        }
    }

    editUserModal.classList.remove('hidden');
}

// Tutup modal
cancelEditUserBtn.addEventListener('click', () => {
    editUserModal.classList.add('hidden');
});

// Tampilkan/sembunyikan field saat role diubah di modal edit
editRoleSelect.addEventListener('change', (e) => {
    if (e.target.value === 'guru_gpai') {
        editGpaiFields.classList.remove('hidden');
        editGpqFields.classList.add('hidden');
    } else if (e.target.value === 'guru_gpq') {
        editGpqFields.classList.remove('hidden');
        editGpaiFields.classList.add('hidden');
    }
});

// Proses pembaruan user
editUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userId = document.getElementById('edit-user-id').value;
    const name = document.getElementById('edit-name').value;
    const role = editRoleSelect.value;
    
    const updatedData = { name: name, role: role };

    if (role === 'guru_gpai') {
        const kelasDiampu = document.getElementById('edit-kelas').value.split(',').map(k => k.trim()).filter(k => k);
        updatedData.kelasDiampu = kelasDiampu;
        updatedData.assignments = firebase.firestore.FieldValue.delete(); // Hapus field lama
    } else if (role === 'guru_gpq') {
        const assignments = [
            { shift: 1, kelompok: parseInt(document.getElementById('edit-kelompok-shift-1').value) },
            { shift: 2, kelompok: parseInt(document.getElementById('edit-kelompok-shift-2').value) },
            { shift: 3, kelompok: parseInt(document.getElementById('edit-kelompok-shift-3').value) }
        ];
        updatedData.assignments = assignments;
        updatedData.kelasDiampu = firebase.firestore.FieldValue.delete(); // Hapus field lama
    }

    try {
        await db.collection('users').doc(userId).update(updatedData);
        console.log('User successfully updated!');
        alert('Data pengguna berhasil diperbarui!');
        editUserModal.classList.add('hidden');
        window.location.reload(); // Refresh untuk menampilkan perubahan
    } catch (error) {
        console.error('Error updating user: ', error);
        alert('Gagal memperbarui data: ' + error.message);
    }
});

// --- LOGIKA MODAL TAMBAH PROGRAM ASSIGNMENT (VERSI MANUAL) ---

const addAssignmentModal = document.getElementById('add-assignment-modal');
const cancelAddAssignmentBtn = document.getElementById('cancel-add-assignment');
const addAssignmentForm = document.getElementById('add-assignment-form');
const assignmentProgramSelect = document.getElementById('assignment-program');
const assignmentMateriContainer = document.getElementById('assignment-materi-container');

// Fungsi untuk membuka modal (lebih sederhana)
const openAddAssignmentModal = () => {
    console.log('Membuka modal tambah assignment');
    addAssignmentModal.classList.remove('hidden');
};

// Tutup modal
cancelAddAssignmentBtn.addEventListener('click', () => {
    addAssignmentModal.classList.add('hidden');
    addAssignmentForm.reset();
    assignmentMateriContainer.innerHTML = '<p class="text-gray-500">Pilih program terlebih dahulu.</p>';
});

// Event listener untuk perubahan dropdown program
assignmentProgramSelect.addEventListener('change', (e) => {
    const selectedProgramId = e.target.value;
    let materiHTML = '';

    // PERHATIKAN: Nilainya harus sama persis dengan 'value' di HTML
    if (selectedProgramId === 'Tahfizh Al-Qur’An') {
        // Form untuk TAHFIZH AL-QUR'AN
        materiHTML = `
            <div class="mb-3">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="materi-surah">Nama Surah</label>
                <input type="text" id="materi-surah" required class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight" placeholder="contoh: Al-Fatihah">
            </div>
            <div>
                <label class="block text-gray-700 text-sm font-bold mb-2" for="materi-ayat">Jumlah Ayat</label>
                <input type="number" id="materi-ayat" required min="1" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight" placeholder="contoh: 7">
            </div>
        `;
    } else if (selectedProgramId) {
        // Form untuk program lainnya (DO'A, TATHBIQ IBADAH)
        materiHTML = `
            <div>
                <label class="block text-gray-700 text-sm font-bold mb-2" for="materi-deskripsi">Deskripsi Materi</label>
                <textarea id="materi-deskripsi" required rows="4" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight" placeholder="Jelaskan materi yang akan diajarkan..."></textarea>
            </div>
        `;
    } else {
        // Tampilkan placeholder jika tidak ada program yang dipilih
        materiHTML = '<p class="text-gray-500">Pilih program terlebih dahulu.</p>';
    }
    
    assignmentMateriContainer.innerHTML = materiHTML;
});

// Proses submit form
addAssignmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const programId = assignmentProgramSelect.value;
    const semester = document.getElementById('assignment-semester').value;
    const grade = parseInt(document.getElementById('assignment-grade').value);
    
    let materi = {};

    // Ambil data materi berdasarkan program yang dipilih
    if (programId === 'Tahfizh Al-Qur’An') {
        materi.namaSurah = document.getElementById('materi-surah').value;
        materi.jumlahAyat = parseInt(document.getElementById('materi-ayat').value);
    } else {
        materi.deskripsi = document.getElementById('materi-deskripsi').value;
    }

    const assignmentData = {
        programId: programId,
        semester: semester,
        grade: grade,
        materi: materi,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection('programAssignments').add(assignmentData);
        console.log('Program assignment successfully created!');
        alert('Kurikulum berhasil ditetapkan!');
        addAssignmentModal.classList.add('hidden');
        addAssignmentForm.reset();
        assignmentMateriContainer.innerHTML = '<p class="text-gray-500">Pilih program terlebih dahulu.</p>';
    } catch (error) {
        console.error('Error creating assignment:', error);
        alert('Gagal menetapkan kurikulum: ' + error.message);
    }
});

// --- EVENT DELEGATION UNTUK MENU ADMIN ---

const adminContent = document.getElementById('admin-content');

adminContent.addEventListener('click', (e) => {
    const action = e.target.dataset.action;

    if (action) {
        // Fungsi untuk menampilkan/menyembunyikan menu
        const showUserManagement = () => {
            document.getElementById('user-management-section').classList.remove('hidden');
            document.getElementById('program-management-section').classList.add('hidden');
        };

        const showProgramManagement = () => {
            document.getElementById('program-management-section').classList.remove('hidden');
            document.getElementById('user-management-section').classList.add('hidden');
        }

        // Panggil fungsi yang sesuai berdasarkan aksi
        switch (action) {
            case 'showUserManagement':
                showUserManagement();
                break;
            case 'openAddAssignmentModal':
                openAddAssignmentModal();
                break;
            case 'showProgramManagement':
                showProgramManagement();
                break;
        }
    }
});