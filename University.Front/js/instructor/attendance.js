// Instructor Attendance Management
let instructorProfile = null;
let courses = [];
let allAttendance = [];

document.addEventListener("DOMContentLoaded", async function () {
  if (!authService.requireRole("Instructor")) return;

  const user = authService.getUserFromToken();
  document.getElementById("instructorName").textContent =
    user.name || user.email;

  // Set default date to today
  document.getElementById("date").valueAsDate = new Date();

  await loadInstructorData();
  await loadAttendanceRecords();

  document
    .getElementById("attendanceForm")
    .addEventListener("submit", handleMarkAttendance);
});

async function loadInstructorData() {
  try {
    instructorProfile = await apiService.get(API_ENDPOINTS.INSTRUCTOR_PROFILE);

    if (instructorProfile && instructorProfile.instructorId) {
      const coursesResponse = await apiService.get(
        API_ENDPOINTS.COURSES_BY_INSTRUCTOR(instructorProfile.instructorId)
      );
      courses = coursesResponse.data || coursesResponse || [];

      const courseFilter = document.getElementById("courseFilter");
      const courseSelect = document.getElementById("courseId");

      courses.forEach((course) => {
        courseFilter.innerHTML += `<option value="${course.courseId}">${course.courseCode} - ${course.name}</option>`;
        courseSelect.innerHTML += `<option value="${course.courseId}">${course.courseCode} - ${course.name}</option>`;
      });
    }
  } catch (error) {
    console.error("Error loading instructor data:", error);
  }
}

async function loadAttendanceRecords() {
  showLoading("attendanceTable");

  try {
    const response = await apiService.get(API_ENDPOINTS.FILTER_ATTENDANCE);
    allAttendance = response || [];
    displayAttendance(allAttendance);
  } catch (error) {
    showError("attendanceTable", "Failed to load attendance records");
  }
}

async function filterAttendance() {
  showLoading("attendanceTable");

  const courseId = document.getElementById("courseFilter").value;
  const dateFrom = document.getElementById("dateFrom").value;
  const dateTo = document.getElementById("dateTo").value;

  let url = API_ENDPOINTS.FILTER_ATTENDANCE;
  const params = new URLSearchParams();

  if (courseId) params.append("courseId", courseId);
  if (dateFrom) params.append("from", dateFrom);
  if (dateTo) params.append("to", dateTo);

  if (params.toString()) {
    url += "?" + params.toString();
  }

  try {
    const response = await apiService.get(url);
    allAttendance = response || [];
    displayAttendance(allAttendance);
  } catch (error) {
    showError("attendanceTable", "Failed to filter attendance records");
  }
}

function displayAttendance(records) {
  const container = document.getElementById("attendanceTable");

  if (!records || records.length === 0) {
    showEmptyState("attendanceTable", "No attendance records found");
    return;
  }

  let html = `
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

  records.forEach((record) => {
    html += `
            <tr>
                <td>${formatDate(record.date)}</td>
                <td>${record.studentName || "N/A"}</td>
                <td>${record.courseName || "N/A"}</td>
                <td>${getStatusBadge(record.status)}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-secondary" onclick="updateAttendanceStatus(${
                      record.attendanceId
                    })">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAttendance(${
                      record.attendanceId
                    })">Delete</button>
                </td>
            </tr>
        `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

function openMarkAttendanceModal() {
  document.getElementById("attendanceForm").reset();
  document.getElementById("date").valueAsDate = new Date();
  document.getElementById("formError").style.display = "none";
  openModal("attendanceModal");
}

async function loadStudentsForCourse() {
  const courseId = document.getElementById("courseId").value;
  const studentSelect = document.getElementById("studentId");

  if (!courseId) {
    studentSelect.innerHTML = '<option value="">Select Course First</option>';
    return;
  }

  studentSelect.innerHTML = '<option value="">Loading...</option>';

  try {
    const enrollments = await apiService.get(
      API_ENDPOINTS.ENROLLMENTS_BY_COURSE(courseId)
    );

    studentSelect.innerHTML = '<option value="">Select Student</option>';
    enrollments.forEach((enrollment) => {
      studentSelect.innerHTML += `<option value="${enrollment.studentId}">${
        enrollment.studentName || "Student"
      }</option>`;
    });
  } catch (error) {
    studentSelect.innerHTML =
      '<option value="">Error loading students</option>';
    console.error("Error loading students:", error);
  }
}

async function handleMarkAttendance(e) {
  e.preventDefault();

  const formError = document.getElementById("formError");
  formError.style.display = "none";

  const attendanceData = {
    studentId: parseInt(document.getElementById("studentId").value),
    courseId: parseInt(document.getElementById("courseId").value),
    date: document.getElementById("date").value + "T00:00:00Z",
    status: document.getElementById("status").value,
  };

  const submitButton = e.target.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Marking...";

  try {
    await apiService.post(API_ENDPOINTS.MARK_ATTENDANCE, attendanceData);
    closeModal("attendanceModal");
    await loadAttendanceRecords();
    alert("Attendance marked successfully!");
  } catch (error) {
    formError.textContent = error.message || "Failed to mark attendance";
    formError.style.display = "block";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Mark Attendance";
  }
}

async function updateAttendanceStatus(id) {
  const newStatus = prompt(
    "Enter new status (Present, Absent, Late, Excused):"
  );

  if (
    !newStatus ||
    !["Present", "Absent", "Late", "Excused"].includes(newStatus)
  ) {
    alert("Invalid status");
    return;
  }

  try {
    await apiService.put(API_ENDPOINTS.UPDATE_ATTENDANCE(id), {
      status: newStatus,
    });
    await loadAttendanceRecords();
    alert("Attendance updated successfully!");
  } catch (error) {
    alert("Failed to update attendance: " + error.message);
  }
}

async function deleteAttendance(id) {
  if (
    !confirmAction("Are you sure you want to delete this attendance record?")
  ) {
    return;
  }

  try {
    await apiService.delete(API_ENDPOINTS.DELETE_ATTENDANCE(id));
    await loadAttendanceRecords();
    alert("Attendance deleted successfully!");
  } catch (error) {
    alert("Failed to delete attendance: " + error.message);
  }
}
