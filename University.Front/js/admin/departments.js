// Admin Departments Management
let allDepartments = [];
let instructors = [];
let isEditMode = false;

document.addEventListener("DOMContentLoaded", async function () {
  if (!authService.requireRole("Admin")) return;

  const user = authService.getUserFromToken();
  document.getElementById("adminName").textContent = user.name || user.email;

  await loadInstructors();
  await loadDepartments();

  document
    .getElementById("departmentForm")
    .addEventListener("submit", handleFormSubmit);
});

async function loadInstructors() {
  try {
    instructors = await apiService.get(API_ENDPOINTS.INSTRUCTORS);

    const headSelect = document.getElementById("headId");
    instructors.forEach((inst) => {
      headSelect.innerHTML += `<option value="${inst.instructorId}">${inst.fullName}</option>`;
    });
  } catch (error) {
    console.error("Error loading instructors:", error);
  }
}

async function loadDepartments() {
  showLoading("departmentsTable");

  try {
    allDepartments = await apiService.get(API_ENDPOINTS.DEPARTMENTS);
    displayDepartments(allDepartments);
  } catch (error) {
    showError("departmentsTable", "Failed to load departments");
  }
}

function displayDepartments(departments) {
  const container = document.getElementById("departmentsTable");

  if (!departments || departments.length === 0) {
    showEmptyState("departmentsTable", "No departments found");
    return;
  }

  let html = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Building</th>
                    <th>Department Head</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

  departments.forEach((dept) => {
    const head = instructors.find((i) => i.instructorId === dept.headId);
    html += `
            <tr>
                <td>${dept.name || "N/A"}</td>
                <td>${dept.building || "N/A"}</td>
                <td>${head ? head.fullName : "None"}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-secondary" onclick="editDepartment(${
                      dept.id
                    })">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteDepartment(${
                      dept.id
                    })">Delete</button>
                </td>
            </tr>
        `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

function openAddDepartmentModal() {
  isEditMode = false;
  document.getElementById("modalTitle").textContent = "Add Department";
  document.getElementById("departmentForm").reset();
  document.getElementById("departmentId").value = "";
  document.getElementById("formError").style.display = "none";
  openModal("departmentModal");
}

async function editDepartment(id) {
  isEditMode = true;
  document.getElementById("modalTitle").textContent = "Edit Department";
  document.getElementById("formError").style.display = "none";

  try {
    const dept = await apiService.get(API_ENDPOINTS.DEPARTMENT_BY_ID(id));

    document.getElementById("departmentId").value = dept.id;
    document.getElementById("name").value = dept.name || "";
    document.getElementById("building").value = dept.building || "";
    document.getElementById("headId").value = dept.headId || "";

    openModal("departmentModal");
  } catch (error) {
    alert("Failed to load department details");
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const formError = document.getElementById("formError");
  formError.style.display = "none";

  const departmentData = {
    name: document.getElementById("name").value,
    building: document.getElementById("building").value,
    headId: document.getElementById("headId").value
      ? parseInt(document.getElementById("headId").value)
      : null,
  };

  const submitButton = e.target.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Saving...";

  try {
    if (isEditMode) {
      const id = document.getElementById("departmentId").value;
      await apiService.put(API_ENDPOINTS.DEPARTMENT_BY_ID(id), departmentData);
    } else {
      await apiService.post(API_ENDPOINTS.DEPARTMENTS, departmentData);
    }

    closeModal("departmentModal");
    await loadDepartments();
    alert("Department saved successfully!");
  } catch (error) {
    formError.textContent = error.message || "Failed to save department";
    formError.style.display = "block";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Save Department";
  }
}

async function deleteDepartment(id) {
  if (!confirmAction("Are you sure you want to delete this department?")) {
    return;
  }

  try {
    await apiService.delete(API_ENDPOINTS.DEPARTMENT_BY_ID(id));
    await loadDepartments();
    alert("Department deleted successfully!");
  } catch (error) {
    alert("Failed to delete department: " + error.message);
  }
}
