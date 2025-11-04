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
  const studentManagementSection = document.getElementById(
    "student-management-section"
  );
  const stuendtTableBody = document.getElementById("student-table-body");

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

  const addStudentModal = document.getElementById("add-student-modal");
  const cancelAddStudentBtn = document.getElementById("cancel-add-student");
  const addStudentForm = document.getElementById("add-student-form");
  const studentGradeSelect = document.getElementById("student-grade");
  const studentClassSelect = document.getElementById("student-class");
  const studentGroupSelect = document.getElementById("student-group");
  const studentTableBody = document.getElementById("student-table-body");

  // --- ELEMEN FILTER ---
  const filterProgram = document.getElementById("filter-program");
  const filterSemester = document.getElementById("filter-semester");
  const filterGrade = document.getElementById("filter-grade");
  const resetFiltersBtn = document.getElementById("reset-filters");

  let allAssignments = []; // Variabel global untuk menyimpan semua data assignment
  let allKelas = []; // Variabel global untuk menyimpan semua kelas
  let allStudents = []; // Variabel untuk menyimpan semua data siswa

  // --- FUNGSI-FUNGSI PEMBANTU ---
  const populateDropdown = (element, values, prefix = "") => {
    element.innerHTML = '<option value="">-- Pilih --</option>';
    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = prefix ? `${prefix} ${value}` : value;
      element.appendChild(option);
    });
  };

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
          let jobdescription = "";
          if (userData.role === "guru_gpai" && userData.kelasDiampu) {
            jobdescription = `Mengampu kelas: ${userData.kelasDiampu.join(", ")}`;
          } else if (userData.role === "guru_gpq" && userData.assignments) {
            const assignmentsDesc = userData.assignments
              .map((a) => `Shift ${a.shift}: Kelompok ${a.kelompok}`)
              .join("; ");
            jobdescription = `Tugas: ${assignmentsDesc}`;
          }
          row.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${
                          userData.name
                        }</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${
                          userData.email
                        }</td>
                        <td class="px-6 py-4 whitespace-nowrap">${roleBadge}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${jobdescription}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button class="edit-btn text-indigo-600 hover:text-indigo-900" data-user-id="${
                              doc.id
                            }" data-user-data='${JSON.stringify(
            userData
          ).replace(/'/g, "&apos;")}'>Edit</button>
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

  // Fungsi untuk mengambil semua data kelas
  const fetchAllKelas = async () => {
    try {
      const snapshot = await db.collection("kelas").get();
      allKelas = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching kelas:", error);
    }
  };

  // Fungsi untuk membuka modal tambah siswa
  const openAddStudentModal = async () => {
    addStudentModal.classList.remove("hidden");
    populateDropdown(
      studentGroupSelect,
      Array.from({ length: 12 }, (_, i) => i + 1),
      "Kelompok"
    );
    if (allKelas.length === 0) {
      await fetchAllKelas();
    }
  };

  // Event Listener untuk perubahan Grade
  studentGradeSelect.addEventListener("change", (e) => {
    console.log("Grade dropdown changed!"); // 1. Apakah event ini jalan?
    const selectedGrade = e.target.value;
    console.log("Selected Grade:", selectedGrade); // 2. Apa nilai Grade yang dipilih?
    console.log("All kelas data before filtering:", allKelas); // 3. Apa isi variabel allKelas?

    const filteredKelas = allKelas.filter(
      (k) => k.tingkat.toString() === selectedGrade
    );
    console.log("Filtered kelas data:", filteredKelas); // 4. Apa hasil filternya?

    // Aktifkan dropdown kelas
    studentClassSelect.disabled = false;

    // Isi dropdown kelas
    populateDropdown(
      studentClassSelect,
      filteredKelas.map((k) => k.id)
    );
  });

  // Event Listener untuk submit form
  addStudentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const studentData = {
      nis: document.getElementById("student-nis").value,
      nama: document.getElementById("student-name").value,
      grade: parseInt(studentGradeSelect.value),
      kelasId: studentClassSelect.value,
      shift: parseInt(document.getElementById("student-shift").value),
      kelompok: parseInt(document.getElementById("student-group").value),
    };
    try {
      await db.collection("students").doc(studentData.nis).set(studentData);
      alert("Data siswa berhasil ditambahkan!");
      addStudentModal.classList.add("hidden");
      addStudentForm.reset();
      studentClassSelect.disabled = true;
      await loadAndDisplayStudents();
    } catch (error) {
      console.error("Error creating student:", error);
      alert("Gagal menambahkan siswa: " + error.message);
    }
  });

  // Tutup modal
  cancelAddStudentBtn.addEventListener("click", () => {
    addStudentModal.classList.add("hidden");
    addStudentForm.reset();
    studentClassSelect.disabled = true;
  });

  // Fungsi untuk memuat dan menampilkan data siswa
  const loadAndDisplayStudents = async () => {
    studentTableBody.innerHTML =
      '<tr><td colspan="7" class="px-6 py-4 text-center text-gray-500">Memuat data siswa...</td></tr>';
    try {
      const [studentsSnapshot, kelasSnapshot] = await Promise.all([
        db.collection("students").get(),
        db.collection("kelas").get(),
      ]);

      allStudents = studentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const kelasMap = {};
      kelasSnapshot.docs.forEach((doc) => {
        kelasMap[doc.id] = doc.data().nama;
      });

      populateStudentFilters();
      renderStudentTable(allStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
      studentTableBody.innerHTML =
        '<tr><td colspan="7" class="px-6 py-4 text-center text-red-500">Gagal memuat data.</td></tr>';
    }
  };

  // Fungsi untuk mengisi dropdown filter
  const populateStudentFilters = () => {
    const grades = [...new Set(allStudents.map((s) => s.grade))];
    const kelas = [...new Set(allStudents.map((s) => s.kelasId))];

    populateDropdown(document.getElementById("student-filter-grade"), grades);
    populateDropdown(document.getElementById("student-filter-class"), kelas);
  };

  // Fungsi untuk merender tabel
  const renderStudentTable = (data) => {
    studentTableBody.innerHTML = "";
    if (data.length === 0) {
      studentTableBody.innerHTML =
        '<tr><td colspan="7" class="px-6 py-4 text-center text-gray-500">Tidak ada data siswa yang cocok dengan filter.</td></tr>';
      return;
    }

    // Buat map kelas untuk lookup yang cepat
    const kelasMap = {};
    // Asumsikan allKelas sudah terisi dari fungsi lain
    allKelas.forEach((k) => {
      kelasMap[k.id] = k.nama;
    });

    data.forEach((student) => {
      const row = document.createElement("tr");
      row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${
              student.nis
            }</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${
              student.nama
            }</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${
              student.grade
            }</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${
              kelasMap[student.kelasId] || student.kelasId
            }</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${
              student.shift
            }</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${
              student.kelompok
            }</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button onclick="openEditStudentModal('${
                  student.nis
                }')" class="text-indigo-600 hover:text-indigo-900">Edit</button>
                <button onclick="deleteStudent('${student.nis}', '${
        student.nama
      }')" class="text-red-600 hover:text-red-900">Hapus</button>
            </td>
        `;
      studentTableBody.appendChild(row);
    });
  };

  // Fungsi untuk menerapkan filter
  const applyStudentFilters = () => {
    const gradeFilter = document.getElementById("student-filter-grade").value;
    const classFilter = document.getElementById("student-filter-class").value;
    const shiftFilter = document.getElementById("student-filter-shift").value;

    const filteredData = allStudents.filter((student) => {
      return (
        (!gradeFilter || student.grade.toString() === gradeFilter) &&
        (!classFilter || student.kelasId === classFilter) &&
        (!shiftFilter || student.shift.toString() === shiftFilter)
      );
    });

    renderStudentTable(filteredData);
  };

  // Event Listeners untuk filter
  document
    .getElementById("student-filter-grade")
    .addEventListener("change", applyStudentFilters);
  document
    .getElementById("student-filter-class")
    .addEventListener("change", applyStudentFilters);
  document
    .getElementById("student-filter-shift")
    .addEventListener("change", applyStudentFilters);

  document
    .getElementById("reset-student-filters")
    .addEventListener("click", () => {
      document.getElementById("student-filter-grade").value = "";
      document.getElementById("student-filter-class").value = "";
      document.getElementById("student-filter-shift").value = "";
      renderStudentTable(allStudents);
    });

  const populateFilters = () => {
    const programs = [...new Set(allAssignments.map((a) => a.programId))];
    const semesters = [...new Set(allAssignments.map((a) => a.semester))];
    const grades = [...new Set(allAssignments.map((a) => a.grade))];
    populateDropdown(filterProgram, programs);
    populateDropdown(filterSemester, semesters);
    populateDropdown(filterGrade, grades);
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
        document
          .getElementById("student-management-section")
          .classList.add("hidden");
        loadAndDisplayUsers();
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
        document
          .getElementById("student-management-section")
          .classList.add("hidden");
        loadAndDisplayAssignments();
      };
      const showStudentManagement = () => {
        document
          .getElementById("student-management-section")
          .classList.remove("hidden");
        document
          .getElementById("user-management-section")
          .classList.add("hidden");
        document
          .getElementById("program-management-section")
          .classList.add("hidden");
        loadAndDisplayStudents();
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
        case "showStudentManagement":
          showStudentManagement();
          break;
        case "showStudentManagement":
          document
            .getElementById("student-management-section")
            .classList.add("hidden");
          document
            .getElementById("user-management-section")
            .classList.add("hidden");
          studentManagementSection.classList.remove("hidden");
          loadAndDisplayStudents();
          break;
        case "openAddStudentModal":
          openAddStudentModal();
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
      editUserModal.classList.remove("hidden");
      // Isi form edit dengan data user
      document.getElementById("edit-user-id").value = userId;
      document.getElementById("edit-name").value = userData.name || "";
      document.getElementById("edit-email").value = userData.email || "";
      editRoleSelect.value = userData.role || "";
      // Tampilkan/Sembunyikan field khusus berdasarkan role
      // Tampilkan/sembunyikan field dan isi datanya
      if (userData.role === "guru_gpai") {
        editGpaiFields.classList.remove("hidden");
        editGpqFields.classList.add("hidden");
        document.getElementById("edit-kelas").value = userData.kelasDiampu
          ? userData.kelasDiampu.join(", ")
          : "";
      } else if (userData.role === "guru_gpq") {
        editGpqFields.classList.remove("hidden");
        editGpaiFields.classList.add("hidden");
        if (userData.assignments) {
          document.getElementById("edit-kelompok-shift-1").value =
            userData.assignments.find((a) => a.shift === 1)?.kelompok || "";
          document.getElementById("edit-kelompok-shift-2").value =
            userData.assignments.find((a) => a.shift === 2)?.kelompok || "";
          document.getElementById("edit-kelompok-shift-3").value =
            userData.assignments.find((a) => a.shift === 3)?.kelompok || "";
        }
      }

      editUserModal.classList.remove("hidden");
    }
  });

  cancelEditUserBtn.addEventListener("click", () => {
    editUserModal.classList.add("hidden");
  });

  editUserForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userId = document.getElementById("edit-user-id").value;
    const name = document.getElementById("edit-name").value;
    const role = editRoleSelect.value;

    const updatedData = { name: name, role: role };

    if (role === "guru_gpai") {
      const kelasDiampu = document
        .getElementById("edit-kelas")
        .value.split(",")
        .map((k) => k.trim())
        .filter((k) => k);
      updatedData.kelasDiampu = kelasDiampu;
      updatedData.assignments = firebase.firestore.FieldValue.delete(); // Hapus field lama
    } else if (role === "guru_gpq") {
      const assignments = [
        {
          shift: 1,
          kelompok: parseInt(
            document.getElementById("edit-kelompok-shift-1").value
          ),
        },
        {
          shift: 2,
          kelompok: parseInt(
            document.getElementById("edit-kelompok-shift-2").value
          ),
        },
        {
          shift: 3,
          kelompok: parseInt(
            document.getElementById("edit-kelompok-shift-3").value
          ),
        },
      ];
      updatedData.assignments = assignments;
      updatedData.kelasDiampu = firebase.firestore.FieldValue.delete(); // Hapus field lama
    }

    try {
      await db.collection("users").doc(userId).update(updatedData);
      console.log("User successfully updated!");
      alert("Data pengguna berhasil diperbarui!");
      editUserModal.classList.add("hidden");
      window.location.reload(); // Refresh untuk menampilkan perubahan
    } catch (error) {
      console.error("Error updating user: ", error);
      alert("Gagal memperbarui data: " + error.message);
    }
  });

  // Event Listeners untuk Modal Tambah User
  cancelAddUserBtn.addEventListener("click", () => {
    addUserModal.classList.add("hidden");
    addUserForm.reset();
  });

  newRoleSelect.addEventListener("change", (e) => {
    console.log("Event listener dipanggil! Role yang dipilih:", e.target.value); // Tambahkan ini

    // Sembunyikan semua field khusus terlebih dahulu
    gpaiFields.classList.add("hidden");
    const gpqFields = document.getElementById("gpq-fields"); // Tambahkan ini
    gpqFields.classList.add("hidden");

    if (e.target.value === "guru_gpai") {
      console.log("Menampilkan field GPAI"); // Tambahkan ini
      gpaiFields.classList.remove("hidden");
    } else if (e.target.value === "guru_gpq") {
      console.log("Menampilkan field GPQ"); // Tambahkan ini
      gpqFields.classList.remove("hidden");
    }
  });

  addUserForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("new-name").value;
    const email = document.getElementById("new-email").value;
    const password = document.getElementById("new-password").value;
    const role = newRoleSelect.value;
    const kelasDiampu = document
      .getElementById("new-kelas")
      .value.split(",")
      .map((k) => k.trim())
      .filter((k) => k);

    // 1. Buat user di Firebase Authentication
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(
        email,
        password
      );
      const user = userCredential.user;
      console.log("User created in Auth:", user);

      // 2. Buat data user di Firestore
      const userData = {
        name: name,
        email: email,
        role: role,
        nip: "", // Bisa diisi nanti
      };

      if (role === "guru_gpai") {
        userData.kelasDiampu = kelasDiampu;
      } else if (role === "guru_gpq") {
        const assignments = [
          {
            shift: 1,
            kelompok: parseInt(
              document.getElementById("kelompok-shift-1").value
            ),
          },
          {
            shift: 2,
            kelompok: parseInt(
              document.getElementById("kelompok-shift-2").value
            ),
          },
          {
            shift: 3,
            kelompok: parseInt(
              document.getElementById("kelompok-shift-3").value
            ),
          },
        ];
        userData.assignments = assignments;
      }

      await db.collection("users").doc(user.uid).set(userData);
      console.log("User data saved to Firestore");

      alert("Pengguna baru berhasil ditambahkan!");
      addUserModal.classList.add("hidden");
      addUserForm.reset();

      // Refresh halaman untuk menampilkan user baru di tabel
      window.location.reload();
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Gagal menambahkan pengguna: " + error.message);
    }
  });

  // Event Listeners untuk Modal Assignment
  cancelAddAssignmentBtn.addEventListener("click", () => {
    addAssignmentModal.classList.add("hidden");
    addAssignmentForm.reset();
    assignmentMateriContainer.innerHTML =
      '<p class="text-gray-500">Pilih program terlebih dahulu.</p>';
  });

  assignmentProgramSelect.addEventListener("change", (e) => {
    const selectedProgramId = e.target.value;
    let materiHTML = "";

    // PERHATIKAN: Nilainya harus sama persis dengan 'value' di HTML
    if (selectedProgramId === "Tahfizh Al-Qur’An") {
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
      materiHTML =
        '<p class="text-gray-500">Pilih program terlebih dahulu.</p>';
    }

    assignmentMateriContainer.innerHTML = materiHTML;
  });

  addAssignmentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const programId = assignmentProgramSelect.value;
    const semester = document.getElementById("assignment-semester").value;
    const grade = parseInt(document.getElementById("assignment-grade").value);

    let materi = {};

    // Ambil data materi berdasarkan program yang dipilih
    if (programId === "Tahfizh Al-Qur’An") {
      materi.namaSurah = document.getElementById("materi-surah").value;
      materi.jumlahAyat = parseInt(
        document.getElementById("materi-ayat").value
      );
    } else {
      materi.deskripsi = document.getElementById("materi-deskripsi").value;
    }

    const assignmentData = {
      programId: programId,
      semester: semester,
      grade: grade,
      materi: materi,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    try {
      await db.collection("programAssignments").add(assignmentData);
      console.log("Program assignment successfully created!");
      alert("Kurikulum berhasil ditetapkan!");
      window.location.reload(); // Refresh untuk menampilkan data terbaru
      addAssignmentModal.classList.add("hidden");
      addAssignmentForm.reset();
      // assignmentMateriContainer.innerHTML =
      // '<p class="text-gray-500">Pilih program terlebih dahulu.</p>';
    } catch (error) {
      console.error("Error creating assignment:", error);
      alert("Gagal menetapkan kurikulum: " + error.message);
    }
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

  // --- LOGIKA EDIT DAN HAPUS SISWA ---

  // Elemen Modal Edit Siswa
  const editStudentModal = document.getElementById("edit-student-modal");
  const cancelEditStudentBtn = document.getElementById("cancel-edit-student");
  const editStudentForm = document.getElementById("edit-student-form");
  const editStudentGradeSelect = document.getElementById("edit-student-grade");
  const editStudentClassSelect = document.getElementById("edit-student-class");

  // Fungsi untuk membuka modal edit dan mengisi data
  window.openEditStudentModal = async (studentId) => {
    try {
      const doc = await db.collection("students").doc(studentId).get();
      if (doc.exists) {
        const student = doc.data();

        // Isi form dengan data siswa
        document.getElementById("edit-student-nis").value = student.nis;
        document.getElementById("edit-student-name").value = student.nama;
        document.getElementById("edit-student-grade").value = student.grade;
        document.getElementById("edit-student-shift").value = student.shift;
        document.getElementById("edit-student-group").value = student.kelompok;

        // Isi dropdown kelas
        const filteredKelas = allKelas.filter(
          (k) => k.tingkat.toString() === student.grade.toString()
        );
        editStudentClassSelect.disabled = false;
        populateDropdown(
          editStudentClassSelect,
          filteredKelas.map((k) => k.id)
        );
        // Pilih kelas yang sesuai
        editStudentClassSelect.value = student.kelasId;

        // Isi dropdown kelompok
        populateDropdown(
          document.getElementById("edit-student-group"),
          Array.from({ length: 12 }, (_, i) => i + 1),
          "Kelompok"
        );

        editStudentModal.classList.remove("hidden");
      } else {
        alert("Data siswa tidak ditemukan!");
      }
    } catch (error) {
      console.error("Error getting student document:", error);
      alert("Gagal mengambil data siswa.");
    }
  };

  // Event listener untuk perubahan Grade di modal edit
  editStudentGradeSelect.addEventListener("change", (e) => {
    const selectedGrade = e.target.value;
    const filteredKelas = allKelas.filter(
      (k) => k.tingkat.toString() === selectedGrade
    );
    editStudentClassSelect.disabled = false;
    populateDropdown(
      editStudentClassSelect,
      filteredKelas.map((k) => k.id)
    );
  });

  // Event listener untuk submit form edit
  editStudentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const studentId = document.getElementById("edit-student-nis").value;

    const updatedData = {
      nama: document.getElementById("edit-student-name").value,
      grade: parseInt(document.getElementById("edit-student-grade").value),
      kelasId: document.getElementById("edit-student-class").value,
      shift: parseInt(document.getElementById("edit-student-shift").value),
      kelompok: parseInt(document.getElementById("edit-student-group").value),
    };

    try {
      await db.collection("students").doc(studentId).update(updatedData);
      alert("Data siswa berhasil diperbarui!");
      editStudentModal.classList.add("hidden");
      await loadAndDisplayStudents();
    } catch (error) {
      console.error("Error updating student:", error);
      alert("Gagal memperbarui data siswa.");
    }
  });

  // Tutup modal edit
  cancelEditStudentBtn.addEventListener("click", () => {
    editStudentModal.classList.add("hidden");
  });

  // Fungsi hapus siswa
  window.deleteStudent = (studentId, studentName) => {
    const isConfirmed = confirm(
      `Apakah Anda yakin ingin menghapus siswa ${studentName}?`
    );
    if (isConfirmed) {
      db.collection("students")
        .doc(studentId)
        .delete()
        .then(() => {
          alert("Siswa berhasil dihapus.");
          loadAndDisplayStudents();
        })
        .catch((error) => {
          console.error("Error removing student: ", error);
          alert("Gagal menghapus siswa.");
        });
    }
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

  // --- LOGIKA UPLOAD CSV ---

  const csvFileUpload = document.getElementById("csv-file-upload");

  csvFileUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvData = event.target.result;
      const students = parseCSV(csvData);

      if (students.length === 0) {
        alert("File CSV kosong atau tidak valid.");
        return;
      }

      // Konfirmasi sebelum mengupload
      const isConfirmed = confirm(
        `Anda akan menambah ${students.length} siswa. Lanjutkan?`
      );
      if (!isConfirmed) return;

      try {
        // Gunakan Batch Write untuk efisiensi
        const batch = db.batch();
        students.forEach((student) => {
          const docRef = db.collection("students").doc(student.nis);
          batch.set(docRef, student);
        });

        await batch.commit();
        console.log("Batch write successful");
        alert(`Berhasil menambah ${students.length} siswa!`);

        // Reset input file dan muat ulang tabel
        csvFileUpload.value = "";
        await loadAndDisplayStudents();
      } catch (error) {
        console.error("Error batch writing students:", error);
        alert("Gagal mengupload data siswa. Pastikan format CSV sudah benar.");
      }
    };
    reader.onerror = () => alert("Gagal membaca file.");
    reader.readAsText(file);
  });

  // Fungsi sederhana untuk parsing CSV
  const parseCSV = (str) => {
    const lines = str.split("\n").filter((line) => line.trim() !== "");
    const headers = lines[0].split(",").map((h) => h.trim());
    const students = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      if (values.length !== headers.length) continue; // Lewati baris yang tidak valid

      const student = {
        nis: values[0],
        nama: values[1],
        grade: parseInt(values[2]),
        kelasId: values[3],
        shift: parseInt(values[4]),
        kelompok: parseInt(values[5]),
      };
      students.push(student);
    }
    return students;
  };
}); // AKHIR DARI DOMContentLoaded
