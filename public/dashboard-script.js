// Tunggu hingga seluruh konten HTML halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  // --- INISIALISASI AWAL ---

  // Konfigurasi Firebase
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

  // Ambil elemen-elemen dari HTML
  const userNameElement = document.getElementById("user-name");
  const logoutBtn = document.getElementById("logout-btn");
  const adminContent = document.getElementById("admin-content");
  const userTableBody = document.getElementById("user-table-body");
  const assignmentTableBody = document.getElementById("assignment-table-body");

  // --- ELEMEN MODAL ---
  const addUserModal = document.getElementById("add-user-modal");
  const addUserBtn = document.getElementById("add-user-btn");
  const cancelAddUserBtn = document.getElementById("cancel-add-user");
  const addUserForm = document.getElementById("add-user-form");
  const newRoleSelect = document.getElementById("new-role");
  const gpaiFields = document.getElementById("gpai-fields");

  const editUserModal = document.getElementById("edit-user-modal");
  const cancelEditUserBtn = document.getElementById("cancel-edit-user");
  const editUserForm = document.getElementById("edit-user-form");
  const editRoleSelect = document.getElementById("edit-role");
  const editGpaiFields = document.getElementById("edit-gpai-fields");
  const editGpqFields = document.getElementById("edit-gpq-fields");

  const addAssignmentModal = document.getElementById("add-assignment-modal");
  const cancelAddAssignmentBtn = document.getElementById(
    "cancel-add-assignment"
  );
  const addAssignmentForm = document.getElementById("add-assignment-form");
  const assignmentProgramSelect = document.getElementById("assignment-program");
  const assignmentMateriContainer = document.getElementById(
    "assignment-materi-container"
  );

  // --- ELEMEN FILTER ---
  const filterProgram = document.getElementById("filter-program");
  const filterSemester = document.getElementById("filter-semester");
  const filterGrade = document.getElementById("filter-grade");
  const resetFiltersBtn = document.getElementById("reset-filters");

  let allAssignments = []; // Variabel global untuk menyimpan semua data assignment

  // --- FUNGSI-FUNGSI UTAMA ---

  const getUserData = async (user) => {
    try {
      const userDoc = await db.collection("users").doc(user.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        userNameElement.textContent = userData.name || user.email;
        const adminContent = document.getElementById("admin-content");
        const guruGpqContent = document.getElementById("guru-gpq-content");
        const guruGpaiContent = document.getElementById("guru-gpai-content");
        adminContent.classList.add("hidden");
        guruGpqContent.classList.add("hidden");
        guruGpaiContent.classList.add("hidden");
        if (userData.role === "admin") {
          adminContent.classList.remove("hidden");
          loadAndDisplayUsers();
        } else if (userData.role === "guru_gpq") {
          guruGpqContent.classList.remove("hidden");
          // TODO: Load data for GPQ
        } else if (userData.role === "guru_gpai") {
          guruGpaiContent.classList.remove("hidden");
          // TODO: Load data for GPAI
        }
      } else {
        console.log("Dokumen user tidak ditemukan!");
        userNameElement.textContent = user.email;
      }
    } catch (error) {
      console.error("Error mengambil data user:", error);
      userNameElement.textContent = user.email;
    }
  };

  const loadAndDisplayUsers = async () => {
    userTableBody.innerHTML =
      '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">Memuat data pengguna...</td></tr>';
    try {
      const snapshot = await db.collection("users").get();
      userTableBody.innerHTML = "";
      if (snapshot.empty) {
        userTableBody.innerHTML =
          '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">Tidak ada pengguna.</td></tr>';
      } else {
        snapshot.forEach((doc) => {
          const userData = doc.data();
          const row = document.createElement("tr");
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
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${
                          userData.name
                        }</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${
                          userData.email
                        }</td>
                        <td class="px-6 py-4 whitespace-nowrap">${roleBadge}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button class="edit-btn text-indigo-600 hover:text-indigo-900" data-user-id="${
                              doc.id
                            }" data-user-data='${JSON.stringify(
            userData
          ).replace(/'/g, "&apos;")}'>Edit</button>
                            <button onclick="deleteUser('${doc.id}', '${
            userData.email
          }')" class="text-red-600 hover:text-red-900">Hapus</button>
                        </td>
                    `;
          userTableBody.appendChild(row);
        });
      }
    } catch (error) {
      console.error("Error getting users: ", error);
      userTableBody.innerHTML =
        '<tr><td colspan="4" class="px-6 py-4 text-center text-red-500">Gagal memuat data.</td></tr>';
    }
  };

  const loadAndDisplayAssignments = async () => {
    console.log("Fungsi loadAndDisplayAssignments dipanggil!");
    try {
      const snapshot = await db
        .collection("programAssignments")
        .orderBy("createdAt", "desc")
        .get();
      allAssignments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Data berhasil diambil:", allAssignments);
      populateFilters();
      renderAssignmentTable(allAssignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      assignmentTableBody.innerHTML =
        '<tr><td colspan="5" class="px-6 py-4 text-center text-red-500">Gagal memuat data.</td></tr>';
    }
  };

  const populateFilters = () => {
    const programs = [...new Set(allAssignments.map((a) => a.programId))];
    const semesters = [...new Set(allAssignments.map((a) => a.semester))];
    const grades = [...new Set(allAssignments.map((a) => a.grade))];
    populateDropdown(filterProgram, programs);
    populateDropdown(filterSemester, semesters);
    populateDropdown(filterGrade, grades);
  };

  const populateDropdown = (element, values) => {
    const currentValue = element.value;
    element.innerHTML = '<option value="">Semua</option>';
    values.sort().forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      element.appendChild(option);
    });
    element.value = currentValue;
  };

  const renderAssignmentTable = (data) => {
    assignmentTableBody.innerHTML = "";
    if (data.length === 0) {
      assignmentTableBody.innerHTML =
        '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">Tidak ada data yang cocok dengan filter.</td></tr>';
      return;
    }
    data.forEach((assignment) => {
      const row = document.createElement("tr");
      let materiDisplay = "";
      if (assignment.materi.namaSurah) {
        materiDisplay = `<strong>${assignment.materi.namaSurah}</strong> (${assignment.materi.jumlahAyat} ayat)`;
      } else if (assignment.materi.deskripsi) {
        materiDisplay = assignment.materi.deskripsi;
      }
      row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${assignment.programId}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${assignment.semester}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${assignment.grade}</td>
                <td class="px-6 py-4 text-sm text-gray-900">${materiDisplay}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium"><button class="text-red-600 hover:text-red-900">Hapus</button></td>
            `;
      assignmentTableBody.appendChild(row);
    });
  };

  const applyFilters = () => {
    const programFilter = filterProgram.value;
    const semesterFilter = filterSemester.value;
    const gradeFilter = filterGrade.value;
    const filteredData = allAssignments.filter((assignment) => {
      return (
        (!programFilter || assignment.programId === programFilter) &&
        (!semesterFilter || assignment.semester === semesterFilter) &&
        (!gradeFilter || assignment.grade.toString() === gradeFilter)
      );
    });
    renderAssignmentTable(filteredData);
  };

  // --- EKSEKUSI UTAMA ---
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      await getUserData(user);
    } else {
      console.log("User not logged in, redirecting...");
      window.location.href = "index.html";
    }
  });

  // --- EVENT LISTENERS ---

  // Event Delegation untuk Menu Admin
  adminContent.addEventListener("click", (e) => {
    const action = e.target.dataset.action;
    if (action) {
      const showUserManagement = () => {
        document
          .getElementById("user-management-section")
          .classList.remove("hidden");
        document
          .getElementById("program-management-section")
          .classList.add("hidden");
      };
      const openAddAssignmentModal = () => {
        addAssignmentModal.classList.remove("hidden");
      };
      const showProgramManagement = () => {
        document
          .getElementById("user-management-section")
          .classList.add("hidden");
        document
          .getElementById("program-management-section")
          .classList.remove("hidden");
        loadAndDisplayAssignments();
      };
      switch (action) {
        case "showUserManagement":
          showUserManagement();
          break;
        case "openAddAssignmentModal":
          openAddAssignmentModal();
          break;
        case "showProgramManagement":
          showProgramManagement();
          break;
      }
    }
  });

  addUserBtn.addEventListener("click", () => {
    addUserModal.classList.remove("hidden");
  });

  // Event Delegation untuk Tombol Edit
  document.getElementById("user-table-body").addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn")) {
      const userId = e.target.dataset.userId;
      const userData = JSON.parse(e.target.dataset.userData);
      // TODO: Implementasikan openEditModal(userId, userData);
      alert("Fitur edit akan segera hadir!");
    }
  });

  // Event Listeners untuk Modal Tambah User
  cancelAddUserBtn.addEventListener("click", () => {
    /* ... */
  });
  newRoleSelect.addEventListener("change", (e) => {
    /* ... */
  });
  addUserForm.addEventListener("submit", (e) => {
    /* ... */
  });

  // Event Listeners untuk Modal Assignment
  cancelAddAssignmentBtn.addEventListener("click", () => {
    addAssignmentModal.classList.add("hidden");
    addAssignmentForm.reset();
    assignmentMateriContainer.innerHTML =
      '<p class="text-gray-500">Pilih program terlebih dahulu.</p>';
  });
  assignmentProgramSelect.addEventListener("change", (e) => {
    /* ... */
  });
  addAssignmentForm.addEventListener("submit", (e) => {
    /* ... */
  });

  // Event Listeners untuk Filter
  filterProgram.addEventListener("change", applyFilters);
  filterSemester.addEventListener("change", applyFilters);
  filterGrade.addEventListener("change", applyFilters);
  resetFiltersBtn.addEventListener("click", () => {
    filterProgram.value = "";
    filterSemester.value = "";
    filterGrade.value = "";
    renderAssignmentTable(allAssignments);
  });

  // Fungsi Logout
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
}); // AKHIR DARI DOMContentLoaded
