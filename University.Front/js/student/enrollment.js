// Student Course Enrollment
let studentProfile = null;
let availableCourses = [];
let myEnrollments = [];

document.addEventListener("DOMContentLoaded", async function () {
  if (!authService.requireRole("Student")) return;

  const user = authService.getUserFromToken();
  document.getElementById("studentName").textContent = user.name || user.email;

  await loadStudentData();
});

async function loadStudentData() {
  try {
    // Load student profile
    studentProfile = await apiService.get(API_ENDPOINTS.STUDENT_PROFILE);

    if (studentProfile && studentProfile.studentId) {
      await Promise.all([loadAvailableCourses(), loadMyEnrollments()]);
    }
  } catch (error) {
    console.error("Error loading student data:", error);
  }
}

async function loadAvailableCourses() {
  showLoading("availableCourses");

  try {
    availableCourses = await apiService.get(
      API_ENDPOINTS.COURSES_AVAILABLE_FOR_STUDENT(studentProfile.studentId)
    );
    // console.log("Available courses response:", availableCourses);
    displayAvailableCourses(availableCourses);
  } catch (error) {
    showError("availableCourses", "Failed to load available courses");
  }
}

async function loadMyEnrollments() {
  showLoading("myEnrollments");

  try {
    myEnrollments = await apiService.get(
      API_ENDPOINTS.ENROLLMENTS_BY_STUDENT(studentProfile.studentId)
    );
    displayMyEnrollments(myEnrollments);
  } catch (error) {
    showError("myEnrollments", "Failed to load enrollments");
  }
}

function displayAvailableCourses(courses) {
  const container = document.getElementById("availableCourses");
  courses = courses.data;

  if (!courses || courses.length === 0) {
    showEmptyState("availableCourses", "No available courses to enroll");
    return;
  }

  // Filter out already enrolled courses
  const enrolledCourseIds = myEnrollments.map((e) => e.courseId);
  const unenrolledCourses = courses.filter(
    (c) => !enrolledCourseIds.includes(c.courseId)
  );

  if (unenrolledCourses.length === 0) {
    showEmptyState(
      "availableCourses",
      "You are already enrolled in all available courses"
    );
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
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

  unenrolledCourses.forEach((course) => {
    html += `
            <tr>
                <td>${course.courseCode || "N/A"}</td>
                <td>${course.name || "N/A"}</td>
                <td>${course.creditHours || course.credits || "N/A"}</td>
                <td>${course.instructorName || "N/A"}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="enrollInCourse(${
                      course.courseId
                    })">Enroll</button>
                </td>
            </tr>
        `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

function displayMyEnrollments(enrollments) {
  const container = document.getElementById("myEnrollments");

  enrollments = enrollments.data;

  if (!enrollments || enrollments.length === 0) {
    showEmptyState("myEnrollments", "You are not enrolled in any courses yet");
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
                    <th>Status</th>
                    <th>Grade</th>
                    <th>Action</th>
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
    const canDrop = enrollment.status === "Enrolled";

    html += `
            <tr>
                <td>${enrollment.courseCode || "N/A"}</td>
                <td>${enrollment.courseName || "N/A"}</td>
                <td>${
                  enrollment.creditHours || enrollment.credits || "N/A"
                }</td>
                <td>${enrollment.instructorName || "N/A"}</td>
                <td>${getStatusBadge(enrollment.status)}</td>
                <td>${gradeDisplay}</td>
                <td>
                    ${
                      canDrop
                        ? `<button class="btn btn-sm btn-danger" onclick="dropCourse(${enrollment.enrollmentId})">Drop</button>`
                        : "-"
                    }
                </td>
            </tr>
        `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

async function enrollInCourse(courseId) {
  if (!confirmAction("Are you sure you want to enroll in this course?")) {
    return;
  }

  try {
    await apiService.post(API_ENDPOINTS.ENROLLMENTS, {
      studentId: studentProfile.studentId,
      courseId: courseId,
    });

    alert("Successfully enrolled in the course!");
    await loadStudentData();
  } catch (error) {
    alert("Failed to enroll: " + error.message);
  }
}

async function dropCourse(enrollmentId) {
  if (!confirmAction("Are you sure you want to drop this course?")) {
    return;
  }

  try {
    await apiService.delete(API_ENDPOINTS.ENROLLMENT_BY_ID(enrollmentId));

    alert("Successfully dropped the course!");
    await loadStudentData();
  } catch (error) {
    alert("Failed to drop course: " + error.message);
  }
}
