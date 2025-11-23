// Student Dashboard
let studentProfile = null;

document.addEventListener("DOMContentLoaded", async function () {
  if (!authService.requireRole("Student")) return;

  const user = authService.getUserFromToken();
  document.getElementById("userName").textContent = user.name || user.email;
  document.getElementById("studentName").textContent = user.name || user.email;

  await loadDashboard();
});

async function loadDashboard() {
  try {
    // Load student profile
    studentProfile = await apiService.get(API_ENDPOINTS.STUDENT_PROFILE);

    if (studentProfile && studentProfile.studentId) {
      // Load enrollments
      const enrollments = await apiService.get(
        API_ENDPOINTS.ENROLLMENTS_BY_STUDENT(studentProfile.studentId)
      );

      // Calculate statistics
      document.getElementById("enrolledCourses").textContent =
        enrollments.length || 0;

      let totalCredits = 0;
      enrollments.forEach((enrollment) => {
        totalCredits += enrollment.creditHours || enrollment.credits || 0;
      });
      document.getElementById("totalCredits").textContent = totalCredits;

      // Load exam submissions
      try {
        const submissions = await apiService.get(
          API_ENDPOINTS.STUDENT_SUBMISSIONS(studentProfile.studentId)
        );
        const completedSubmissions = submissions.filter((s) => s.submittedAt);
        document.getElementById("completedExams").textContent =
          completedSubmissions.length || 0;
      } catch (e) {
        console.error("Error loading submissions:", e);
      }

      // Load attendance summary
      try {
        const attendanceSummary = await apiService.get(
          API_ENDPOINTS.ATTENDANCE_SUMMARY(studentProfile.studentId)
        );
        if (
          attendanceSummary &&
          attendanceSummary.attendanceRate !== undefined
        ) {
          document.getElementById("attendanceRate").textContent =
            attendanceSummary.attendanceRate.toFixed(1) + "%";
        }
      } catch (e) {
        console.error("Error loading attendance:", e);
      }

      // Display courses
      displayCoursesList(enrollments);
    }
  } catch (error) {
    console.error("Error loading dashboard:", error);
    showError("coursesList", "Failed to load dashboard data");
  }
}

function displayCoursesList(enrollments) {
  const container = document.getElementById("coursesList");

  if (!enrollments || enrollments.length === 0) {
    container.innerHTML =
      '<p>No enrolled courses yet. <a href="enrollment.html">Enroll in courses</a></p>';
    return;
  }

  let html = `
        <table>
            <thead>
                <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Instructor</th>
                    <th>Credits</th>
                    <th>Grade</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;

  enrollments.forEach((enrollment) => {
    const gradeLetter =
      enrollment.gradeLetter ||
      (enrollment.finalGrade ? getGradeLetter(enrollment.finalGrade) : "N/A");
    const gradeDisplay = enrollment.finalGrade
      ? `${enrollment.finalGrade.toFixed(1)} (${gradeLetter})`
      : "N/A";

    html += `
            <tr>
                <td>${enrollment.courseCode || "N/A"}</td>
                <td>${enrollment.courseName || "N/A"}</td>
                <td>${enrollment.instructorName || "N/A"}</td>
                <td>${
                  enrollment.creditHours || enrollment.credits || "N/A"
                }</td>
                <td>${gradeDisplay}</td>
                <td>${getStatusBadge(enrollment.status)}</td>
            </tr>
        `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}
