// // Admin Students Management
// let allStudents = [];
// let departments = [];
// let isEditMode = false;

// document.addEventListener("DOMContentLoaded", async function () {
//   if (!authService.requireRole("Admin")) return;

//   const user = authService.getUserFromToken();
//   document.getElementById("adminName").textContent = user.name || user.email;

//   await loadDepartments();
//   await loadStudents();

//   // Search functionality
//   document
//     .getElementById("searchInput")
//     .addEventListener("input", debounce(filterStudents, 300));
//   document
//     .getElementById("departmentFilter")
//     .addEventListener("change", filterStudents);

//   // Form submission
//   document
//     .getElementById("studentForm")
//     .addEventListener("submit", handleFormSubmit);
// });

// async function loadDepartments() {
//   try {
//     departments = await apiService.get(API_ENDPOINTS.DEPARTMENTS);

//     // Populate department filters
//     const departmentFilter = document.getElementById("departmentFilter");
//     const departmentSelect = document.getElementById("departmentId");

//     departments.forEach((dept) => {
//       departmentFilter.innerHTML += `<option value="${dept.id}">${dept.name}</option>`;
//       departmentSelect.innerHTML += `<option value="${dept.id}">${dept.name}</option>`;
//     });
//   } catch (error) {
//     console.error("Error loading departments:", error);
//   }
// }

// async function loadStudents() {
//   showLoading("studentsTable");

//   try {
//     allStudents = await apiService.get(API_ENDPOINTS.STUDENTS);
//     displayStudents(allStudents);
//   } catch (error) {
//     showError("studentsTable", "Failed to load students");
//   }
// }

// function displayStudents(students) {
//   const container = document.getElementById("studentsTable");

//   if (!students || students.length === 0) {
//     showEmptyState("studentsTable", "No students found");
//     return;
//   }

//   let html = `
//         <table>
//             <thead>
//                 <tr>
//                     <th>Code</th>
//                     <th>Name</th>
//                     <th>Email</th>
//                     <th>Department</th>
//                     <th>Level</th>
//                     <th>Contact</th>
//                     <th>Actions</th>
//                 </tr>
//             </thead>
//             <tbody>
//     `;

//   students.forEach((student) => {
//     const dept = departments.find((d) => d.id === student.departmentId);
//     html += `
//             <tr>
//                 <td>${student.studentCode || "N/A"}</td>
//                 <td>${student.fullName || "N/A"}</td>
//                 <td>${student.email || "N/A"}</td>
//                 <td>${dept ? dept.name : "N/A"}</td>
//                 <td>Level ${student.level || "N/A"}</td>
//                 <td>${student.contactNumber || "N/A"}</td>
//                 <td class="actions">
//                     <button class="btn btn-sm btn-secondary" onclick="editStudent(${
//                       student.studentId
//                     })">Edit</button>
//                     <button class="btn btn-sm btn-danger" onclick="deleteStudent(${
//                       student.studentId
//                     })">Delete</button>
//                 </td>
//             </tr>
//         `;
//   });

//   html += `
//             </tbody>
//         </table>
//     `;

//   container.innerHTML = html;
// }

// function filterStudents() {
//   const searchTerm = document.getElementById("searchInput").value.toLowerCase();
//   const deptFilter = document.getElementById("departmentFilter").value;

//   let filtered = allStudents.filter((student) => {
//     const matchesSearch =
//       !searchTerm ||
//       (student.fullName &&
//         student.fullName.toLowerCase().includes(searchTerm)) ||
//       (student.email && student.email.toLowerCase().includes(searchTerm)) ||
//       (student.studentCode &&
//         student.studentCode.toLowerCase().includes(searchTerm));

//     const matchesDept = !deptFilter || student.departmentId == deptFilter;

//     return matchesSearch && matchesDept;
//   });

//   displayStudents(filtered);
// }

// function openAddStudentModal() {
//   isEditMode = false;
//   document.getElementById("modalTitle").textContent = "Add Student";
//   document.getElementById("studentForm").reset();
//   document.getElementById("studentId").value = "";
//   document.getElementById("passwordGroup").style.display = "block";
//   document.getElementById("password").required = true;
//   document.getElementById("formError").style.display = "none";
//   openModal("studentModal");
// }

// async function editStudent(id) {
//   isEditMode = true;
//   document.getElementById("modalTitle").textContent = "Edit Student";
//   document.getElementById("formError").style.display = "none";

//   try {
//     const student = await apiService.get(API_ENDPOINTS.STUDENT_BY_ID(id));

//     document.getElementById("studentId").value = student.studentId;
//     document.getElementById("firstName").value = student.firstName || "";
//     document.getElementById("lastName").value = student.lastName || "";
//     document.getElementById("fullName").value = student.fullName || "";
//     document.getElementById("email").value = student.email || "";
//     document.getElementById("studentCode").value = student.studentCode || "";
//     document.getElementById("contactNumber").value =
//       student.contactNumber || "";
//     document.getElementById("level").value = student.level || "";
//     document.getElementById("departmentId").value = student.departmentId || "";

//     // Hide password field for edit
//     document.getElementById("passwordGroup").style.display = "none";
//     document.getElementById("password").required = false;

//     openModal("studentModal");
//   } catch (error) {
//     alert("Failed to load student details");
//   }
// }

// async function handleFormSubmit(e) {
//   e.preventDefault();

//   const formError = document.getElementById("formError");
//   formError.style.display = "none";

//   const studentData = {
//     firstName: document.getElementById("firstName").value,
//     lastName: document.getElementById("lastName").value,
//     fullName: document.getElementById("fullName").value,
//     email: document.getElementById("email").value,
//     studentCode: document.getElementById("studentCode").value,
//     contactNumber: document.getElementById("contactNumber").value,
//     level: document.getElementById("level").value,
//     departmentId: parseInt(document.getElementById("departmentId").value),
//   };

//   if (!isEditMode) {
//     studentData.password = document.getElementById("password").value;
//   }

//   const submitButton = e.target.querySelector('button[type="submit"]');
//   submitButton.disabled = true;
//   submitButton.textContent = "Saving...";

//   try {
//     if (isEditMode) {
//       const id = document.getElementById("studentId").value;
//       await apiService.put(API_ENDPOINTS.STUDENT_BY_ID(id), studentData);
//     } else {
//       await apiService.post(API_ENDPOINTS.STUDENTS, studentData);
//     }

//     closeModal("studentModal");
//     await loadStudents();
//     alert("Student saved successfully!");
//   } catch (error) {
//     formError.textContent = error.message || "Failed to save student";
//     formError.style.display = "block";
//   } finally {
//     submitButton.disabled = false;
//     submitButton.textContent = "Save Student";
//   }
// }

// async function deleteStudent(id) {
//   if (!confirmAction("Are you sure you want to delete this student?")) {
//     return;
//   }

//   try {
//     await apiService.delete(API_ENDPOINTS.STUDENT_BY_ID(id));
//     await loadStudents();
//     alert("Student deleted successfully!");
//   } catch (error) {
//     alert("Failed to delete student: " + error.message);
//   }
// }


// Admin Students Management - FIXED VERSION
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

    const departmentFilter = document.getElementById("departmentFilter");
    const departmentSelect = document.getElementById("departmentId");

    departments.forEach((dept) => {
      departmentFilter.innerHTML += `<option value="${dept.id}">${dept.name}</option>`;
      departmentSelect.innerHTML += `<option value="${dept.id}">${dept.name}</option>`;
    });
  } catch (error) {
    console.error("Error loading departments:", error);
    showNotification("Failed to load departments", "error");
  }
}

async function loadStudents() {
  showLoading("studentsTable");

  try {
    allStudents = await apiService.get(API_ENDPOINTS.STUDENTS);
    console.log("Loaded students:", allStudents); // Debug log
    displayStudents(allStudents);
  } catch (error) {
    console.error("Error loading students:", error);
    showError("studentsTable", "Failed to load students");
    showNotification("Failed to load students: " + error.message, "error");
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
    
    // Fix: Get email from multiple possible fields
    const email = student.email || student.userEmail || student.user?.email || "N/A";
    
    html += `
            <tr>
                <td>${student.studentCode || "N/A"}</td>
                <td>${student.fullName || "N/A"}</td>
                <td>${email}</td>
                <td>${dept ? dept.name : "N/A"}</td>
                <td>Level ${student.level || "N/A"}</td>
                <td>${student.contactNumber || "N/A"}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-secondary" onclick="editStudent(${
                      student.studentId
                    })">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="confirmDeleteStudent(${
                      student.studentId
                    }, '${student.fullName || "this student"}')">Delete</button>
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
    const email = student.email || student.userEmail || student.user?.email || "";
    
    const matchesSearch =
      !searchTerm ||
      (student.fullName &&
        student.fullName.toLowerCase().includes(searchTerm)) ||
      (email && email.toLowerCase().includes(searchTerm)) ||
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
    console.log("Editing student:", student); // Debug log

    document.getElementById("studentId").value = student.studentId;
    document.getElementById("firstName").value = student.firstName || "";
    document.getElementById("lastName").value = student.lastName || "";
    document.getElementById("fullName").value = student.fullName || "";
    
    // Fix: Get email from multiple possible sources
    const email = student.email || student.userEmail || student.user?.email || "";
    document.getElementById("email").value = email;
    
    document.getElementById("studentCode").value = student.studentCode || "";
    document.getElementById("contactNumber").value = student.contactNumber || "";
    document.getElementById("level").value = student.level || "";
    document.getElementById("departmentId").value = student.departmentId || "";

    // Hide password field for edit
    document.getElementById("passwordGroup").style.display = "none";
    document.getElementById("password").required = false;

    openModal("studentModal");
  } catch (error) {
    console.error("Error loading student:", error);
    showNotification("Failed to load student details", "error");
  }
}

// Frontend Validation
function validateForm() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const studentCode = document.getElementById("studentCode").value;
  const contactNumber = document.getElementById("contactNumber").value;

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showFormError("Please enter a valid email address");
    return false;
  }

  // Password validation (only for new students)
  if (!isEditMode) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      showFormError(
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
      );
      return false;
    }
  }

  // Student code validation
  if (!studentCode || studentCode.length < 3) {
    showFormError("Student code must be at least 3 characters");
    return false;
  }

  // Contact number validation
  const phoneRegex = /^[0-9]{10,15}$/;
  if (!phoneRegex.test(contactNumber.replace(/[\s-]/g, ""))) {
    showFormError("Please enter a valid contact number (10-15 digits)");
    return false;
  }

  return true;
}

function showFormError(message) {
  const formError = document.getElementById("formError");
  formError.textContent = message;
  formError.style.display = "block";
  
  // Auto hide after 5 seconds
  setTimeout(() => {
    formError.style.display = "none";
  }, 5000);
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const formError = document.getElementById("formError");
  formError.style.display = "none";

  // Frontend validation
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
      showNotification("Student updated successfully!", "success");
    } else {
      await apiService.post(API_ENDPOINTS.STUDENTS, studentData);
      showNotification("Student created successfully!", "success");
    }

    closeModal("studentModal");
    await loadStudents();
  } catch (error) {
    console.error("Error saving student:", error);
    formError.textContent = error.message || "Failed to save student. Please try again.";
    formError.style.display = "block";
    showNotification(error.message || "Failed to save student", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Save Student";
  }
}

// Improved delete with confirmation
function confirmDeleteStudent(id, name) {
  const modal = document.createElement("div");
  modal.className = "modal active";
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 400px;">
      <div class="modal-header">
        <h3>Confirm Delete</h3>
        <button class="close-modal" onclick="this.closest('.modal').remove()">×</button>
      </div>
      <div style="padding: 20px;">
        <p>Are you sure you want to delete <strong>${name}</strong>?</p>
        <p style="color: #dc3545; margin-top: 10px;">This action cannot be undone.</p>
      </div>
      <div class="btn-group" style="padding: 0 20px 20px;">
        <button class="btn btn-danger" onclick="deleteStudent(${id})">Yes, Delete</button>
        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function deleteStudent(id) {
  // Close confirmation modal
  const modals = document.querySelectorAll(".modal");
  modals.forEach((m) => m.remove());

  try {
    // Show loading indicator
    showNotification("Deleting student...", "info");
    
    await apiService.delete(API_ENDPOINTS.STUDENT_BY_ID(id));
    
    showNotification("Student deleted successfully!", "success");
    await loadStudents();
  } catch (error) {
    console.error("Error deleting student:", error);
    showNotification(
      error.message || "Failed to delete student. Please try again.",
      "error"
    );
  }
}

// Notification system
function showNotification(message, type = "info") {
  // Remove existing notifications
  const existing = document.querySelectorAll(".notification");
  existing.forEach((n) => n.remove());

  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <span>${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" style="margin-left: auto; background: none; border: none; color: inherit; cursor: pointer; font-size: 20px;">&times;</button>
    </div>
  `;

  // Add styles
  const style = document.createElement("style");
  style.textContent = `
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      min-width: 300px;
      animation: slideIn 0.3s ease;
    }
    .notification-success {
      background: #d4edda;
      color: #155724;
      border-left: 4px solid #28a745;
    }
    .notification-error {
      background: #f8d7da;
      color: #721c24;
      border-left: 4px solid #dc3545;
    }
    .notification-info {
      background: #d1ecf1;
      color: #0c5460;
      border-left: 4px solid #17a2b8;
    }
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;

  if (!document.querySelector("style[data-notification-styles]")) {
    style.setAttribute("data-notification-styles", "true");
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = "slideIn 0.3s ease reverse";
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}