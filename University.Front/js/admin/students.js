// Modern Students Management
let allStudents = [];
let departments = [];
let isEditMode = false;

document.addEventListener("DOMContentLoaded", async function () {
  if (!authService.requireRole("Admin")) return;

  const user = authService.getUserFromToken();
  document.getElementById("adminName").textContent = user.name || user.email;

  await loadDepartments();
  await loadStudents();

  document
    .getElementById("searchInput")
    .addEventListener("input", debounce(filterStudents, 300));
  document
    .getElementById("departmentFilter")
    .addEventListener("change", filterStudents);
  document
    .getElementById("studentForm")
    .addEventListener("submit", handleFormSubmit);
});

async function loadDepartments() {
  try {
    departments = await apiService.get(API_ENDPOINTS.DEPARTMENTS);

    const departmentFilter = document.getElementById("departmentFilter");
    const departmentSelect = document.getElementById("departmentId");

    departments.forEach((dept) => {
      departmentFilter.innerHTML += `<option value="${dept.id}">${dept.name}</option>`;
      departmentSelect.innerHTML += `<option value="${dept.id}">${dept.name}</option>`;
    });
  } catch (error) {
    console.error("Error loading departments:", error);
    showInlineMessage("studentsTable", "Failed to load departments", "danger");
  }
}

async function loadStudents() {
  showLoading("studentsTable");

  try {
    allStudents = await apiService.get(API_ENDPOINTS.STUDENTS);
    displayStudents(allStudents);
  } catch (error) {
    console.error("Error loading students:", error);
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
          <th>Student Code</th>
          <th>Full Name</th>
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
    const email = student.email || student.userEmail || student.user?.email || "N/A";
    
    html += `
      <tr>
        <td><strong>${student.studentCode || "N/A"}</strong></td>
        <td>${student.fullName || "N/A"}</td>
        <td>${email}</td>
        <td>${dept ? dept.name : "N/A"}</td>
        <td><span class="badge badge-info">Level ${student.level || "N/A"}</span></td>
        <td>${student.contactNumber || "N/A"}</td>
        <td class="actions">
          <button class="btn btn-sm btn-secondary" onclick="editStudent(${student.studentId})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="confirmDeleteStudent(${student.studentId}, '${(student.fullName || "this student").replace(/'/g, "\\'")}')">Delete</button>
        </td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

function filterStudents() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const deptFilter = document.getElementById("departmentFilter").value;

  let filtered = allStudents.filter((student) => {
    const email = student.email || student.userEmail || student.user?.email || "";
    
    const matchesSearch =
      !searchTerm ||
      (student.fullName && student.fullName.toLowerCase().includes(searchTerm)) ||
      (email && email.toLowerCase().includes(searchTerm)) ||
      (student.studentCode && student.studentCode.toLowerCase().includes(searchTerm));

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
    // document.getElementById("fullName").value = student.fullName || "";
    
    const email = student.email || student.userEmail || student.user?.email || "";
    document.getElementById("email").value = email;
    
    document.getElementById("studentCode").value = student.studentCode || "";
    document.getElementById("contactNumber").value = student.contactNumber || "";
    document.getElementById("level").value = student.level || "";
    document.getElementById("departmentId").value = student.departmentId || "";

    document.getElementById("passwordGroup").style.display = "none";
    document.getElementById("password").required = false;

    openModal("studentModal");
  } catch (error) {
    console.error("Error loading student:", error);
    showFormError("Failed to load student details");
  }
}

// Frontend Validation - Matches backend validation rules
function validateForm() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const studentCode = document.getElementById("studentCode").value.trim();
  const contactNumber = document.getElementById("contactNumber").value.trim();
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const fullName = document.getElementById("fullName").value.trim();

  // Email validation - must be valid format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    showFormError("Invalid email format (e.g., user@example.com)");
    return false;
  }

  if (email.length > 100) {
    showFormError("Email cannot exceed 100 characters");
    return false;
  }

  // Password validation (only for new students)
  if (!isEditMode) {
    if (password.length < 8 || password.length > 100) {
      showFormError("Password must be between 8 and 100 characters");
      return false;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      showFormError(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)"
      );
      return false;
    }
  }

  // Name validation - must contain only letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[A-Za-z\s\-']+$/;
  
  if (!nameRegex.test(firstName)) {
    showFormError("First name can only contain letters, spaces, hyphens, and apostrophes");
    return false;
  }

  if (firstName.length < 2 || firstName.length > 50) {
    showFormError("First name must be between 2 and 50 characters");
    return false;
  }

  if (firstName !== firstName.trim()) {
    showFormError("First name cannot start or end with spaces");
    return false;
  }

  if (!nameRegex.test(lastName)) {
    showFormError("Last name can only contain letters, spaces, hyphens, and apostrophes");
    return false;
  }

  if (lastName.length < 2 || lastName.length > 50) {
    showFormError("Last name must be between 2 and 50 characters");
    return false;
  }

  if (lastName !== lastName.trim()) {
    showFormError("Last name cannot start or end with spaces");
    return false;
  }

  if (!nameRegex.test(fullName)) {
    showFormError("Full name can only contain letters, spaces, hyphens, and apostrophes");
    return false;
  }

  if (fullName.length < 5 || fullName.length > 150) {
    showFormError("Full name must be between 5 and 150 characters");
    return false;
  }

  if (fullName !== fullName.trim()) {
    showFormError("Full name cannot start or end with spaces");
    return false;
  }

  // Validate full name contains first and last name
  if (!fullName.includes(firstName) || !fullName.includes(lastName)) {
    showFormError("Full name should contain both first name and last name");
    return false;
  }

  // Student code validation - must start with letter, alphanumeric only, 3-20 chars
  if (!studentCode) {
    showFormError("Student code is required");
    return false;
  }

  const studentCodeRegex = /^[A-Za-z][A-Za-z0-9]*$/;
  if (!studentCodeRegex.test(studentCode)) {
    showFormError("Student code must start with a letter and contain only letters and numbers");
    return false;
  }

  if (studentCode.length < 3 || studentCode.length > 20) {
    showFormError("Student code must be between 3 and 20 characters");
    return false;
  }

  // Contact number validation - exactly 11 digits
  const phoneDigitsOnly = contactNumber.replace(/[\s-]/g, "");
  const phoneRegex = /^[0-9]{11}$/;
  
  if (!phoneRegex.test(phoneDigitsOnly)) {
    showFormError("Contact number must be exactly 11 digits");
    return false;
  }

  return true;
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const formError = document.getElementById("formError");
  formError.style.display = "none";

  if (!validateForm()) {
    return;
  }

  const studentData = {
    firstName: document.getElementById("firstName").value.trim(),
    lastName: document.getElementById("lastName").value.trim(),
    fullName: document.getElementById("fullName").value.trim(),
    email: document.getElementById("email").value.trim(),
    studentCode: document.getElementById("studentCode").value.trim(),
    contactNumber: document.getElementById("contactNumber").value.trim(),
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
      showInlineMessage("studentsTable", "Student updated successfully!", "success");
    } else {
      await apiService.post(API_ENDPOINTS.STUDENTS, studentData);
      showInlineMessage("studentsTable", "Student created successfully!", "success");
    }

    closeModal("studentModal");
    await loadStudents();
  } catch (error) {
    console.error("Error saving student:", error);
    formError.textContent = error.message || "Failed to save student. Please try again.";
    formError.style.display = "block";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Save Student";
  }
}

function confirmDeleteStudent(id, name) {
  const modal = document.createElement("div");
  modal.className = "modal active";
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px;">
      <div class="modal-header">
        <h3>Confirm Delete</h3>
        <button class="close-modal" onclick="this.closest('.modal').remove(); document.body.style.overflow = ''">×</button>
      </div>
      <div style="padding: 2rem;">
        <p style="font-size: 1.125rem; color: var(--dark-3); margin-bottom: 1rem;">Are you sure you want to delete <strong>${name}</strong>?</p>
        <p style="color: var(--danger); font-weight: 500;">This action cannot be undone.</p>
      </div>
      <div class="btn-group" style="padding: 0 2rem 2rem;">
        <button class="btn btn-danger" onclick="deleteStudent(${id})">Yes, Delete</button>
        <button class="btn btn-secondary" onclick="this.closest('.modal').remove(); document.body.style.overflow = ''">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function deleteStudent(id) {
  const modals = document.querySelectorAll(".modal");
  modals.forEach((m) => m.remove());
  document.body.style.overflow = '';

  try {
    await apiService.delete(API_ENDPOINTS.STUDENT_BY_ID(id));
    showInlineMessage("studentsTable", "Student deleted successfully!", "success");
    await loadStudents();
  } catch (error) {
    console.error("Error deleting student:", error);
    showInlineMessage("studentsTable", error.message || "Failed to delete student. Please try again.", "danger");
  }
}