// Admin Instructors Management
let allInstructors = [];
let departments = [];
let isEditMode = false;

document.addEventListener("DOMContentLoaded", async function () {
  if (!authService.requireRole("Admin")) return;

  const user = authService.getUserFromToken();
  document.getElementById("adminName").textContent = user.name || user.email;

  await loadDepartments();
  await loadInstructors();

  document
    .getElementById("searchInput")
    .addEventListener("input", debounce(filterInstructors, 300));
  document
    .getElementById("departmentFilter")
    .addEventListener("change", filterInstructors);
  document
    .getElementById("instructorForm")
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
  }
}

async function loadInstructors() {
  showLoading("instructorsTable");

  try {
    allInstructors = await apiService.get(API_ENDPOINTS.INSTRUCTORS);
    displayInstructors(allInstructors);
  } catch (error) {
    showError("instructorsTable", "Failed to load instructors");
  }
}

function displayInstructors(instructors) {
  const container = document.getElementById("instructorsTable");

  if (!instructors || instructors.length === 0) {
    showEmptyState("instructorsTable", "No instructors found");
    return;
  }

  let html = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Contact</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

  instructors.forEach((instructor) => {
    const dept = departments.find((d) => d.id === instructor.departmentId);
    html += `
            <tr>
                <td>${instructor.fullName || "N/A"}</td>
                <td>${instructor.email || "N/A"}</td>
                <td>${dept ? dept.name : "N/A"}</td>
                <td>${instructor.contactNumber || "N/A"}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-secondary" onclick="editInstructor(${
                      instructor.instructorId
                    })">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteInstructor(${
                      instructor.instructorId
                    })">Delete</button>
                </td>
            </tr>
        `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

function filterInstructors() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const deptFilter = document.getElementById("departmentFilter").value;

  let filtered = allInstructors.filter((instructor) => {
    const matchesSearch =
      !searchTerm ||
      (instructor.fullName &&
        instructor.fullName.toLowerCase().includes(searchTerm)) ||
      (instructor.email && instructor.email.toLowerCase().includes(searchTerm));

    const matchesDept = !deptFilter || instructor.departmentId == deptFilter;

    return matchesSearch && matchesDept;
  });

  displayInstructors(filtered);
}

function openAddInstructorModal() {
  isEditMode = false;
  document.getElementById("modalTitle").textContent = "Add Instructor";
  document.getElementById("instructorForm").reset();
  document.getElementById("instructorId").value = "";
  document.getElementById("passwordGroup").style.display = "block";
  document.getElementById("password").required = true;
  document.getElementById("formError").style.display = "none";
  openModal("instructorModal");
}

async function editInstructor(id) {
  isEditMode = true;
  document.getElementById("modalTitle").textContent = "Edit Instructor";
  document.getElementById("formError").style.display = "none";

  try {
    const instructor = await apiService.get(API_ENDPOINTS.INSTRUCTOR_BY_ID(id));

    document.getElementById("instructorId").value = instructor.instructorId;
    document.getElementById("firstName").value = instructor.firstName || "";
    document.getElementById("lastName").value = instructor.lastName || "";
    document.getElementById("fullName").value = instructor.fullName || "";
    document.getElementById("email").value = instructor.email || "";
    document.getElementById("contactNumber").value =
      instructor.contactNumber || "";
    document.getElementById("departmentId").value =
      instructor.departmentId || "";

    document.getElementById("passwordGroup").style.display = "none";
    document.getElementById("password").required = false;

    openModal("instructorModal");
  } catch (error) {
    alert("Failed to load instructor details");
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const formError = document.getElementById("formError");
  formError.style.display = "none";

  const instructorData = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    fullName: document.getElementById("fullName").value,
    email: document.getElementById("email").value,
    contactNumber: document.getElementById("contactNumber").value,
    departmentId: parseInt(document.getElementById("departmentId").value),
  };

  if (!isEditMode) {
    instructorData.password = document.getElementById("password").value;
  }

  const submitButton = e.target.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Saving...";

  try {
    if (isEditMode) {
      const id = document.getElementById("instructorId").value;
      await apiService.put(API_ENDPOINTS.INSTRUCTOR_BY_ID(id), instructorData);
    } else {
      await apiService.post(API_ENDPOINTS.INSTRUCTORS, instructorData);
    }

    closeModal("instructorModal");
    await loadInstructors();
    alert("Instructor saved successfully!");
  } catch (error) {
    formError.textContent = error.message || "Failed to save instructor";
    formError.style.display = "block";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Save Instructor";
  }
}

async function deleteInstructor(id) {
  if (!confirmAction("Are you sure you want to delete this instructor?")) {
    return;
  }

  try {
    await apiService.delete(API_ENDPOINTS.INSTRUCTOR_BY_ID(id));
    await loadInstructors();
    alert("Instructor deleted successfully!");
  } catch (error) {
    alert("Failed to delete instructor: " + error.message);
  }
}
