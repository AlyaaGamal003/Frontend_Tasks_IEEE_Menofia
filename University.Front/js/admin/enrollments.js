// Admin Enrollments Management
let allEnrollments = [];
let courses = [];

document.addEventListener("DOMContentLoaded", async function () {
  if (!authService.requireRole("Admin")) return;

  const user = authService.getUserFromToken();
  document.getElementById("adminName").textContent = user.name || user.email;

  await loadCourses();
  await loadEnrollments();
});

async function loadCourses() {
  try {
    const response = await apiService.get(API_ENDPOINTS.COURSES);
    courses = response.data || response;

    const courseFilter = document.getElementById("courseFilter");
    courses.forEach((course) => {
      courseFilter.innerHTML += `<option value="${course.courseId}">${course.courseCode} - ${course.name}</option>`;
    });
  } catch (error) {
    console.error("Error loading courses:", error);
  }
}

async function loadEnrollments() {
  showLoading("enrollmentsTable");

  try {
    // Try to get all enrollments - this might need adjustment based on your API
    const response = await apiService.get(
      API_ENDPOINTS.ENROLLMENTS_ALL_INCLUDING_DELETED
    );
    allEnrollments = response.data || response || [];
    displayEnrollments(allEnrollments);
  } catch (error) {
    // If that endpoint doesn't work, just show empty state
    showEmptyState(
      "enrollmentsTable",
      "Unable to load enrollments. Please check API permissions."
    );
    console.error("Error loading enrollments:", error);
  }
}

function filterEnrollments() {
  const courseFilter = document.getElementById("courseFilter").value;
  const statusFilter = document.getElementById("statusFilter").value;

  let filtered = allEnrollments.filter((enrollment) => {
    const matchesCourse = !courseFilter || enrollment.courseId == courseFilter;
    const matchesStatus = !statusFilter || enrollment.status === statusFilter;

    return matchesCourse && matchesStatus;
  });

  displayEnrollments(filtered);
}

function displayEnrollments(enrollments) {
  const container = document.getElementById("enrollmentsTable");

  if (!enrollments || enrollments.length === 0) {
    showEmptyState("enrollmentsTable", "No enrollments found");
    return;
  }

  let html = `
        <table>
            <thead>
                <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Enrollment Date</th>
                    <th>Status</th>
                    <th>Grade</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

  enrollments.forEach((enrollment) => {
    const course = courses.find((c) => c.courseId === enrollment.courseId);
    const gradeLetter =
      enrollment.gradeLetter ||
      (enrollment.finalGrade ? getGradeLetter(enrollment.finalGrade) : "N/A");
    const gradeDisplay = enrollment.finalGrade
      ? `${enrollment.finalGrade.toFixed(1)} (${gradeLetter})`
      : "N/A";

    html += `
            <tr>
                <td>${enrollment.studentName || "N/A"}</td>
                <td>${
                  course
                    ? `${course.courseCode} - ${course.name}`
                    : enrollment.courseName || "N/A"
                }</td>
                <td>${formatDate(enrollment.enrollmentDate)}</td>
                <td>${getStatusBadge(enrollment.status)}</td>
                <td>${gradeDisplay}</td>
                <td class="actions">
                    ${
                      !enrollment.isDeleted
                        ? `<button class="btn btn-sm btn-danger" onclick="softDeleteEnrollment(${enrollment.enrollmentId})">Delete</button>`
                        : `<button class="btn btn-sm btn-success" onclick="restoreEnrollment(${enrollment.enrollmentId})">Restore</button>`
                    }
                </td>
            </tr>
        `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

async function softDeleteEnrollment(id) {
  if (!confirmAction("Are you sure you want to delete this enrollment?")) {
    return;
  }

  try {
    await apiService.delete(API_ENDPOINTS.ENROLLMENT_SOFT_DELETE(id));
    await loadEnrollments();
    alert("Enrollment deleted successfully!");
  } catch (error) {
    alert("Failed to delete enrollment: " + error.message);
  }
}

async function restoreEnrollment(id) {
  if (!confirmAction("Are you sure you want to restore this enrollment?")) {
    return;
  }

  try {
    await apiService.post(API_ENDPOINTS.ENROLLMENT_RESTORE(id), {});
    await loadEnrollments();
    alert("Enrollment restored successfully!");
  } catch (error) {
    alert("Failed to restore enrollment: " + error.message);
  }
}
