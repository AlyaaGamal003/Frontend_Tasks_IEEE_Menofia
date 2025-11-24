// Student Courses Page
let enrolledCourses = [];
let studentId = null;

document.addEventListener("DOMContentLoaded", async function () {
  if (!authService.requireRole("Student")) return;

  const user = authService.getUserFromToken();
  document.getElementById("studentName").textContent = user.name || user.email;
  studentId = user.id;

  await loadEnrolledCourses();
});

async function loadEnrolledCourses() {
  showLoading("coursesTable");

  try {
    const enrollments = await apiService.get(
      API_ENDPOINTS.ENROLLMENTS_BY_STUDENT(studentId)
    );
    enrolledCourses = enrollments.data || enrollments || [];
    displayCourses(enrolledCourses);
  } catch (error) {
    console.error("Error loading courses:", error);
    showError("coursesTable", "Failed to load courses");
  }
}

function displayCourses(courses) {
  const container = document.getElementById("coursesTable");

  if (!courses || courses.length === 0) {
    showEmptyState(
      "coursesTable",
      "No enrolled courses. Visit the Enrollment page to enroll in courses."
    );
    return;
  }

  let html = `
        <table>
            <thead>
                <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Credits</th>
                    <th>Instructor</th>
                    <th>Status</th>
                    <th>Grade</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

  courses.forEach((enrollment) => {
    const gradeLetter =
      enrollment.gradeLetter ||
      (enrollment.finalGrade ? getGradeLetter(enrollment.finalGrade) : "N/A");
    const gradeDisplay = enrollment.finalGrade
      ? `${enrollment.finalGrade.toFixed(1)} (${gradeLetter})`
      : "N/A";

    html += `
            <tr>
                <td><strong>${enrollment.courseCode || "N/A"}</strong></td>
                <td>${enrollment.courseName || "N/A"}</td>
                <td>${enrollment.credits || 0}</td>
                <td>${enrollment.instructorName || "N/A"}</td>
                <td>${getStatusBadge(enrollment.status)}</td>
                <td>${gradeDisplay}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-primary" onclick="viewCourseDetails(${
                      enrollment.courseId
                    })">View Details</button>
                    ${
                      enrollment.status === "Enrolled"
                        ? `<button class="btn btn-sm btn-danger" onclick="dropCourse(${enrollment.enrollmentId})">Drop</button>`
                        : ""
                    }
                </td>
            </tr>
        `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

async function viewCourseDetails(courseId) {
  const detailsContainer = document.getElementById("courseDetails");
  detailsContainer.innerHTML =
    '<div class="loading">Loading course details...</div>';
  openModal("courseModal");

  try {
    const course = await apiService.get(API_ENDPOINTS.COURSE_BY_ID(courseId));
    const enrollment = enrolledCourses.find((e) => e.courseId === courseId);

    let html = `
            <div class="details-grid">
                <div class="detail-item">
                    <strong>Course Code:</strong>
                    <span>${course.courseCode || "N/A"}</span>
                </div>
                <div class="detail-item">
                    <strong>Course Name:</strong>
                    <span>${course.name || "N/A"}</span>
                </div>
                <div class="detail-item">
                    <strong>Credits:</strong>
                    <span>${course.credits || 0}</span>
                </div>
                <div class="detail-item">
                    <strong>Instructor:</strong>
                    <span>${course.instructorName || "N/A"}</span>
                </div>
                <div class="detail-item">
                    <strong>Department:</strong>
                    <span>${course.departmentName || "N/A"}</span>
                </div>
                <div class="detail-item">
                    <strong>Description:</strong>
                    <span>${
                      course.description || "No description available"
                    }</span>
                </div>
                <div class="detail-item">
                    <strong>Enrollment Date:</strong>
                    <span>${formatDate(enrollment?.enrollmentDate)}</span>
                </div>
                <div class="detail-item">
                    <strong>Status:</strong>
                    <span>${getStatusBadge(enrollment?.status)}</span>
                </div>
                ${
                  enrollment?.finalGrade
                    ? `
                <div class="detail-item">
                    <strong>Final Grade:</strong>
                    <span>${enrollment.finalGrade.toFixed(1)} (${
                        enrollment.gradeLetter ||
                        getGradeLetter(enrollment.finalGrade)
                      })</span>
                </div>
                `
                    : ""
                }
            </div>
            <div class="btn-group" style="margin-top: 20px;">
                <button class="btn btn-secondary" onclick="closeModal('courseModal')">Close</button>
            </div>
        `;

    detailsContainer.innerHTML = html;
  } catch (error) {
    detailsContainer.innerHTML =
      '<div class="error-message">Failed to load course details</div>';
  }
}

async function dropCourse(enrollmentId) {
  if (!confirmAction("Are you sure you want to drop this course?")) {
    return;
  }

  try {
    await apiService.delete(API_ENDPOINTS.ENROLLMENT_SOFT_DELETE(enrollmentId));
    await loadEnrolledCourses();
    alert("Course dropped successfully!");
  } catch (error) {
    alert("Failed to drop course: " + error.message);
  }
}
