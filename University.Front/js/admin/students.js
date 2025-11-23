// Admin Students Management
let allStudents = [];
let departments = [];
let isEditMode = false;

document.addEventListener("DOMContentLoaded", async function () {
  if (!authService.requireRole("Admin")) return;

  const user = authService.getUserFromToken();
  document.getElementById("adminName").textContent = user.name || user.email;

  await loadDepartments();
  await loadStudents();

  // Search functionality
  document
    .getElementById("searchInput")
    .addEventListener("input", debounce(filterStudents, 300));
  document
    .getElementById("departmentFilter")
    .addEventListener("change", filterStudents);

  // Form submission
  document
    .getElementById("studentForm")
    .addEventListener("submit", handleFormSubmit);
});

async function loadDepartments() {
  try {
    departments = await apiService.get(API_ENDPOINTS.DEPARTMENTS);

    // Populate department filters
    const departmentFilter = document.getElementById("departmentFilter");
    const departmentSelect = document.getElementById("departmentId");

    departments.forEach((dept) => {
      departmentFilter.innerHTML += `<option value="${dept.id}">${dept.name}</option>`;
      departmentSelect.innerHTML += `<option value="${dept.id}">${dept.name}</option>`;
    });
  } catch (error) {
    console.error("Error loading departments:", error);
  }
}

async function loadStudents() {
  showLoading("studentsTable");

  try {
    allStudents = await apiService.get(API_ENDPOINTS.STUDENTS);
    displayStudents(allStudents);
  } catch (error) {
    showError("studentsTable", "Failed to load students");
  }
}

function displayStudents(students) {
  const container = document.getElementById("studentsTable");

  if (!students || students.length === 0) {
    showEmptyState("studentsTable", "No students found");
    return;
  }

  let html = `
        <table>
            <thead>
                <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Level</th>
                    <th>Contact</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

  students.forEach((student) => {
    const dept = departments.find((d) => d.id === student.departmentId);
    html += `
            <tr>
                <td>${student.studentCode || "N/A"}</td>
                <td>${student.fullName || "N/A"}</td>
                <td>${student.email || "N/A"}</td>
                <td>${dept ? dept.name : "N/A"}</td>
                <td>Level ${student.level || "N/A"}</td>
                <td>${student.contactNumber || "N/A"}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-secondary" onclick="editStudent(${
                      student.studentId
                    })">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteStudent(${
                      student.studentId
                    })">Delete</button>
                </td>
            </tr>
        `;
  });

  html += `
            </tbody>
        </table>
    `;

  container.innerHTML = html;
}

function filterStudents() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const deptFilter = document.getElementById("departmentFilter").value;

  let filtered = allStudents.filter((student) => {
    const matchesSearch =
      !searchTerm ||
      (student.fullName &&
        student.fullName.toLowerCase().includes(searchTerm)) ||
      (student.email && student.email.toLowerCase().includes(searchTerm)) ||
      (student.studentCode &&
        student.studentCode.toLowerCase().includes(searchTerm));

    const matchesDept = !deptFilter || student.departmentId == deptFilter;

    return matchesSearch && matchesDept;
  });

  displayStudents(filtered);
}

function openAddStudentModal() {
  isEditMode = false;
  document.getElementById("modalTitle").textContent = "Add Student";
  document.getElementById("studentForm").reset();
  document.getElementById("studentId").value = "";
  document.getElementById("passwordGroup").style.display = "block";
  document.getElementById("password").required = true;
  document.getElementById("formError").style.display = "none";
  openModal("studentModal");
}

async function editStudent(id) {
  isEditMode = true;
  document.getElementById("modalTitle").textContent = "Edit Student";
  document.getElementById("formError").style.display = "none";

  try {
    const student = await apiService.get(API_ENDPOINTS.STUDENT_BY_ID(id));

    document.getElementById("studentId").value = student.studentId;
    document.getElementById("firstName").value = student.firstName || "";
    document.getElementById("lastName").value = student.lastName || "";
    document.getElementById("fullName").value = student.fullName || "";
    document.getElementById("email").value = student.email || "";
    document.getElementById("studentCode").value = student.studentCode || "";
    document.getElementById("contactNumber").value =
      student.contactNumber || "";
    document.getElementById("level").value = student.level || "";
    document.getElementById("departmentId").value = student.departmentId || "";

    // Hide password field for edit
    document.getElementById("passwordGroup").style.display = "none";
    document.getElementById("password").required = false;

    openModal("studentModal");
  } catch (error) {
    alert("Failed to load student details");
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const formError = document.getElementById("formError");
  formError.style.display = "none";

  const studentData = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    fullName: document.getElementById("fullName").value,
    email: document.getElementById("email").value,
    studentCode: document.getElementById("studentCode").value,
    contactNumber: document.getElementById("contactNumber").value,
    level: document.getElementById("level").value,
    departmentId: parseInt(document.getElementById("departmentId").value),
  };

  if (!isEditMode) {
    studentData.password = document.getElementById("password").value;
  }

  const submitButton = e.target.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Saving...";

  try {
    if (isEditMode) {
      const id = document.getElementById("studentId").value;
      await apiService.put(API_ENDPOINTS.STUDENT_BY_ID(id), studentData);
    } else {
      await apiService.post(API_ENDPOINTS.STUDENTS, studentData);
    }

    closeModal("studentModal");
    await loadStudents();
    alert("Student saved successfully!");
  } catch (error) {
    formError.textContent = error.message || "Failed to save student";
    formError.style.display = "block";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Save Student";
  }
}

async function deleteStudent(id) {
  if (!confirmAction("Are you sure you want to delete this student?")) {
    return;
  }

  try {
    await apiService.delete(API_ENDPOINTS.STUDENT_BY_ID(id));
    await loadStudents();
    alert("Student deleted successfully!");
  } catch (error) {
    alert("Failed to delete student: " + error.message);
  }
}
