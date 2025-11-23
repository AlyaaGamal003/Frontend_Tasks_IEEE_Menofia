// Admin Courses Management
let allCourses = [];
let departments = [];
let instructors = [];
let isEditMode = false;

document.addEventListener("DOMContentLoaded", async function () {
  if (!authService.requireRole("Admin")) return;

  const user = authService.getUserFromToken();
  document.getElementById("adminName").textContent = user.name || user.email;

  await loadDepartments();
  await loadInstructors();
  await loadCourses();

  document
    .getElementById("searchInput")
    .addEventListener("input", debounce(filterCourses, 300));
  document
    .getElementById("departmentFilter")
    .addEventListener("change", filterCourses);
  document
    .getElementById("courseForm")
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
  try {
    instructors = await apiService.get(API_ENDPOINTS.INSTRUCTORS);

    const instructorSelect = document.getElementById("instructorId");
    instructors.forEach((inst) => {
      instructorSelect.innerHTML += `<option value="${inst.instructorId}">${inst.fullName}</option>`;
    });
  } catch (error) {
    console.error("Error loading instructors:", error);
  }
}

async function loadCourses() {
  showLoading("coursesTable");

  try {
    const response = await apiService.get(API_ENDPOINTS.COURSES);
    allCourses = response.data || response;
    displayCourses(allCourses);
  } catch (error) {
    showError("coursesTable", "Failed to load courses");
  }
}

function displayCourses(courses) {
  const container = document.getElementById("coursesTable");

  if (!courses || courses.length === 0) {
    showEmptyState("coursesTable", "No courses found");
    return;
  }

  let html = `
        <table>
            <thead>
                <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Credits</th>
                    <th>Instructor</th>
                    <th>Department</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

  courses.forEach((course) => {
    const instructor = instructors.find(
      (i) => i.instructorId === course.instructorId
    );
    const dept = departments.find((d) => d.id === course.departmentId);

    html += `
            <tr>
                <td>${course.courseCode || "N/A"}</td>
                <td>${course.name || "N/A"}</td>
                <td>${course.creditHours || course.credits || "N/A"}</td>
                <td>${instructor ? instructor.fullName : "N/A"}</td>
                <td>${dept ? dept.name : "N/A"}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-secondary" onclick="editCourse(${
                      course.courseId
                    })">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCourse(${
                      course.courseId
                    })">Delete</button>
                </td>
            </tr>
        `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

function filterCourses() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const deptFilter = document.getElementById("departmentFilter").value;

  let filtered = allCourses.filter((course) => {
    const matchesSearch =
      !searchTerm ||
      (course.name && course.name.toLowerCase().includes(searchTerm)) ||
      (course.courseCode &&
        course.courseCode.toLowerCase().includes(searchTerm));

    const matchesDept = !deptFilter || course.departmentId == deptFilter;

    return matchesSearch && matchesDept;
  });

  displayCourses(filtered);
}

function openAddCourseModal() {
  isEditMode = false;
  document.getElementById("modalTitle").textContent = "Add Course";
  document.getElementById("courseForm").reset();
  document.getElementById("courseId").value = "";
  document.getElementById("formError").style.display = "none";
  openModal("courseModal");
}

async function editCourse(id) {
  isEditMode = true;
  document.getElementById("modalTitle").textContent = "Edit Course";
  document.getElementById("formError").style.display = "none";

  try {
    const course = await apiService.get(API_ENDPOINTS.COURSE_BY_ID(id));

    document.getElementById("courseId").value = course.courseId;
    document.getElementById("courseCode").value = course.courseCode || "";
    document.getElementById("name").value = course.name || "";
    document.getElementById("creditHours").value =
      course.creditHours || course.credits || "";
    document.getElementById("instructorId").value = course.instructorId || "";
    document.getElementById("departmentId").value = course.departmentId || "";

    openModal("courseModal");
  } catch (error) {
    alert("Failed to load course details");
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const formError = document.getElementById("formError");
  formError.style.display = "none";

  const courseData = {
    courseCode: document.getElementById("courseCode").value,
    name: document.getElementById("name").value,
    creditHours: parseInt(document.getElementById("creditHours").value),
    instructorId: parseInt(document.getElementById("instructorId").value),
    departmentId: parseInt(document.getElementById("departmentId").value),
  };

  const submitButton = e.target.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Saving...";

  try {
    if (isEditMode) {
      const id = document.getElementById("courseId").value;
      await apiService.put(API_ENDPOINTS.COURSE_BY_ID(id), courseData);
    } else {
      await apiService.post(API_ENDPOINTS.COURSES, courseData);
    }

    closeModal("courseModal");
    await loadCourses();
    alert("Course saved successfully!");
  } catch (error) {
    formError.textContent = error.message || "Failed to save course";
    formError.style.display = "block";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Save Course";
  }
}

async function deleteCourse(id) {
  if (!confirmAction("Are you sure you want to delete this course?")) {
    return;
  }

  try {
    await apiService.delete(API_ENDPOINTS.COURSE_BY_ID(id));
    await loadCourses();
    alert("Course deleted successfully!");
  } catch (error) {
    alert("Failed to delete course: " + error.message);
  }
}
