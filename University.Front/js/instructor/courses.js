// Instructor Courses Page
let myCourses = [];
let instructorId = null;

document.addEventListener("DOMContentLoaded", async function () {
  if (!authService.requireRole("Instructor")) return;

  const user = authService.getUserFromToken();
  document.getElementById("instructorName").textContent =
    user.name || user.email;
  console.log("Instructor user:", user);

  // Get instructor ID from token
  instructorId = user.id;

  await loadCourses();
});

async function loadCourses() {
  showLoading("coursesTable");

  try {
    // Get courses for this instructor
    const response = await apiService.get(
      API_ENDPOINTS.COURSES_BY_INSTRUCTOR(instructorId)
    );
    console.log("Courses response:", response);
    myCourses = response.data || response || [];
    displayCourses(myCourses);
  } catch (error) {
    console.error("Error loading courses:", error);
    showError("coursesTable", "Failed to load courses");
  }
}

function displayCourses(courses) {
  const container = document.getElementById("coursesTable");

  if (!courses || courses.length === 0) {
    showEmptyState("coursesTable", "No courses assigned");
    return;
  }

  let html = `
        <table>
            <thead>
                <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Credits</th>
                    <th>Department</th>
                    <th>Students Enrolled</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

  courses.forEach((course) => {
    html += `
            <tr>
                <td><strong>${course.courseCode || "N/A"}</strong></td>
                <td>${course.name || "N/A"}</td>
                <td>${course.credits || 0}</td>
                <td>${course.departmentName || "N/A"}</td>
                <td>${course.enrolledStudents || 0}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-primary" onclick="viewCourseDetails(${
                      course.courseId
                    })">View Details</button>
                    <button class="btn btn-sm btn-secondary" onclick="viewStudents(${
                      course.courseId
                    })">Students</button>
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
                    <strong>Enrolled Students:</strong>
                    <span>${course.enrolledStudents || 0}</span>
                </div>
            </div>
            <div class="btn-group" style="margin-top: 20px;">
                <button class="btn btn-primary" onclick="closeModal('courseModal'); window.location.href='attendance.html?courseId=${courseId}'">Mark Attendance</button>
                <button class="btn btn-secondary" onclick="viewStudents(${courseId}); closeModal('courseModal');">View Students</button>
                <button class="btn btn-secondary" onclick="closeModal('courseModal')">Close</button>
            </div>
        `;

    detailsContainer.innerHTML = html;
  } catch (error) {
    detailsContainer.innerHTML =
      '<div class="error-message">Failed to load course details</div>';
  }
}

async function viewStudents(courseId) {
  const course = myCourses.find((c) => c.courseId === courseId);
  if (!course) {
    alert("Course not found");
    return;
  }

  const detailsContainer = document.getElementById("courseDetails");
  document.getElementById(
    "modalTitle"
  ).textContent = `Students in ${course.courseCode}`;
  detailsContainer.innerHTML = '<div class="loading">Loading students...</div>';
  openModal("courseModal");

  try {
    const enrollments = await apiService.get(
      API_ENDPOINTS.ENROLLMENTS_BY_COURSE(courseId)
    );
    const students = enrollments.data || enrollments || [];

    if (!students || students.length === 0) {
      detailsContainer.innerHTML =
        '<div class="empty-state">No students enrolled in this course</div>';
      return;
    }

    let html = `
            <table>
                <thead>
                    <tr>
                        <th>Student Name</th>
                        <th>Email</th>
                        <th>Enrollment Date</th>
                        <th>Grade</th>
                    </tr>
                </thead>
                <tbody>
        `;

    students.forEach((student) => {
      const gradeDisplay = student.finalGrade
        ? `${student.finalGrade.toFixed(1)} (${
            student.gradeLetter || getGradeLetter(student.finalGrade)
          })`
        : "N/A";

      html += `
                <tr>
                    <td>${student.fullName || student.studentName || "N/A"}</td>
                    <td>${student.email || "N/A"}</td>
                    <td>${formatDate(student.enrollmentDate)}</td>
                    <td>${gradeDisplay}</td>
                </tr>
            `;
    });

    html += `
                </tbody>
            </table>
            <div class="btn-group" style="margin-top: 20px;">
                <button class="btn btn-secondary" onclick="closeModal('courseModal')">Close</button>
            </div>
        `;

    detailsContainer.innerHTML = html;
  } catch (error) {
    detailsContainer.innerHTML =
      '<div class="error-message">Failed to load students</div>';
  }
}
