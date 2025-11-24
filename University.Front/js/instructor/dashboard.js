// Instructor Dashboard
let instructorProfile = null;

document.addEventListener("DOMContentLoaded", async function () {
  if (!authService.requireRole("Instructor")) return;

  const user = authService.getUserFromToken();
  document.getElementById("userName").textContent = user.name || user.email;
  document.getElementById("instructorName").textContent =
    user.name || user.email;

  await loadDashboard();
});

async function loadDashboard() {
  try {
    // Load instructor profile
    instructorProfile = await apiService.get(API_ENDPOINTS.INSTRUCTOR_PROFILE);

    if (instructorProfile && instructorProfile.instructorId) {
      // Load courses
      const coursesResponse = await apiService.get(
        API_ENDPOINTS.COURSES_BY_INSTRUCTOR(instructorProfile.instructorId)
      );
      const courses = coursesResponse.data || coursesResponse || [];

      // Calculate statistics
      document.getElementById("totalCourses").textContent = courses.length;

      let totalCredits = 0;
      let totalStudents = 0;
      let totalExams = 0;

      for (const course of courses) {
        totalCredits += course.creditHours || course.credits || 0;

        // Get enrollments for each course
        try {
          const enrollments = await apiService.get(
            API_ENDPOINTS.ENROLLMENTS_BY_COURSE(course.courseId)
          );
          totalStudents += enrollments.length || 0;
        } catch (e) {
          console.error("Error loading enrollments:", e);
        }

        // Get exams for each course
        try {
          const exams = await apiService.get(
            API_ENDPOINTS.EXAMS_BY_COURSE(course.courseId)
          );
          totalExams += exams.data?.length || exams.length || 0;
        } catch (e) {
          console.error("Error loading exams:", e);
        }
      }

      document.getElementById("totalCredits").textContent = totalCredits;
      document.getElementById("totalStudents").textContent = totalStudents;
      document.getElementById("totalExams").textContent = totalExams;

      // Display courses list
      displayCoursesList(courses);
    }
  } catch (error) {
    console.error("Error loading dashboard:", error);
    showError("coursesList", "Failed to load dashboard data");
  }
}

function displayCoursesList(courses) {
  const container = document.getElementById("coursesList");

  if (!courses || courses.length === 0) {
    container.innerHTML = "<p>No courses assigned yet.</p>";
    return;
  }

  let html = `
        <table>
            <thead>
                <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Credits</th>
                    <th>Department</th>
                </tr>
            </thead>
            <tbody>
    `;

  courses.forEach((course) => {
    html += `
            <tr>
                <td>${course.courseCode || "N/A"}</td>
                <td>${course.name || "N/A"}</td>
                <td>${course.creditHours || course.credits || "N/A"}</td>
                <td>${course.departmentName || "N/A"}</td>
            </tr>
        `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}
