// Student Attendance Page
let allAttendance = [];
let enrolledCourses = [];
let studentId = null;

document.addEventListener("DOMContentLoaded", async function () {
  if (!authService.requireRole("Student")) return;

  const user = authService.getUserFromToken();
  document.getElementById("studentName").textContent = user.name || user.email;
  studentId = user.id;

  await loadEnrolledCourses();
  await loadAttendanceSummary();
  await loadAttendanceHistory();
});

async function loadEnrolledCourses() {
  try {
    const enrollments = await apiService.get(
      API_ENDPOINTS.ENROLLMENTS_BY_STUDENT(studentId)
    );
    enrolledCourses = enrollments.data || enrollments || [];

    const courseFilter = document.getElementById("courseFilter");
    enrolledCourses.forEach((enrollment) => {
      courseFilter.innerHTML += `<option value="${enrollment.courseId}">${enrollment.courseCode} - ${enrollment.courseName}</option>`;
    });
  } catch (error) {
    console.error("Error loading courses:", error);
  }
}

async function loadAttendanceSummary() {
  showLoading("attendanceSummary");

  try {
    const summary = await apiService.get(
      API_ENDPOINTS.ATTENDANCE_SUMMARY(studentId)
    );
    displaySummary(summary);
  } catch (error) {
    console.error("Error loading attendance summary:", error);
    document.getElementById("attendanceSummary").innerHTML =
      '<div class="empty-state">Unable to load attendance summary</div>';
  }
}

function displaySummary(summary) {
  const container = document.getElementById("attendanceSummary");

  const totalClasses = summary.totalClasses || 0;
  const presentCount = summary.presentCount || 0;
  const absentCount = summary.absentCount || 0;
  const lateCount = summary.lateCount || 0;
  const attendanceRate =
    totalClasses > 0
      ? (((presentCount + lateCount) / totalClasses) * 100).toFixed(1)
      : 0;

  let html = `
        <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
            <div class="stat-card">
                <div class="stat-label">Total Classes</div>
                <div class="stat-value">${totalClasses}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Present</div>
                <div class="stat-value" style="color: #4caf50;">${presentCount}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Absent</div>
                <div class="stat-value" style="color: #f44336;">${absentCount}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Late</div>
                <div class="stat-value" style="color: #ff9800;">${lateCount}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Attendance Rate</div>
                <div class="stat-value">${attendanceRate}%</div>
            </div>
        </div>
    `;

  container.innerHTML = html;
}

async function loadAttendanceHistory() {
  showLoading("attendanceTable");

  try {
    const history = await apiService.get(
      API_ENDPOINTS.STUDENT_ATTENDANCE_HISTORY(studentId)
    );
    allAttendance = history.data || history || [];
    displayAttendance(allAttendance);
  } catch (error) {
    console.error("Error loading attendance history:", error);
    showError("attendanceTable", "Failed to load attendance history");
  }
}

function displayAttendance(attendanceRecords) {
  const container = document.getElementById("attendanceTable");

  if (!attendanceRecords || attendanceRecords.length === 0) {
    showEmptyState("attendanceTable", "No attendance records found");
    return;
  }

  let html = `
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Course</th>
                    <th>Status</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>
    `;

  attendanceRecords.forEach((record) => {
    const statusClass =
      record.status === "Present"
        ? "success"
        : record.status === "Absent"
        ? "danger"
        : "warning";

    html += `
            <tr>
                <td>${formatDate(record.date)}</td>
                <td>${record.courseName || record.courseCode || "N/A"}</td>
                <td><span class="badge badge-${statusClass}">${
      record.status || "N/A"
    }</span></td>
                <td>${record.notes || "-"}</td>
            </tr>
        `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

function filterAttendance() {
  const courseFilter = document.getElementById("courseFilter").value;
  const statusFilter = document.getElementById("statusFilter").value;

  let filtered = allAttendance.filter((record) => {
    const matchesCourse = !courseFilter || record.courseId == courseFilter;
    const matchesStatus = !statusFilter || record.status === statusFilter;

    return matchesCourse && matchesStatus;
  });

  displayAttendance(filtered);
}
