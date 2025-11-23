// Instructor Exams Management
let allExams = [];
let myCourses = [];
let instructorId = null;

document.addEventListener("DOMContentLoaded", async function () {
  if (!authService.requireRole("Instructor")) return;

  const user = authService.getUserFromToken();
  document.getElementById("instructorName").textContent =
    user.name || user.email;
  instructorId = user.id;

  await loadCourses();
  await loadExams();

  document
    .getElementById("courseFilter")
    .addEventListener("change", filterExams);
  document.getElementById("typeFilter").addEventListener("change", filterExams);
  document
    .getElementById("examForm")
    .addEventListener("submit", handleCreateExam);
});

async function loadCourses() {
  try {
    const response = await apiService.get(
      API_ENDPOINTS.COURSES_BY_INSTRUCTOR(instructorId)
    );
    myCourses = response.data || response || [];

    const courseFilter = document.getElementById("courseFilter");
    const courseSelect = document.getElementById("courseId");

    myCourses.forEach((course) => {
      courseFilter.innerHTML += `<option value="${course.courseId}">${course.courseCode} - ${course.name}</option>`;
      courseSelect.innerHTML += `<option value="${course.courseId}">${course.courseCode} - ${course.name}</option>`;
    });
  } catch (error) {
    console.error("Error loading courses:", error);
  }
}

async function loadExams() {
  showLoading("examsTable");

  try {
    // Get all exams for instructor's courses
    const promises = myCourses.map(
      (course) =>
        apiService
          .get(API_ENDPOINTS.EXAMS_BY_COURSE(course.courseId))
          .catch(() => []) // If endpoint fails, return empty array
    );

    const results = await Promise.all(promises);
    allExams = results.flat();

    displayExams(allExams);
  } catch (error) {
    console.error("Error loading exams:", error);
    showError("examsTable", "Failed to load exams");
  }
}

function displayExams(exams) {
  const container = document.getElementById("examsTable");

  if (!exams || exams.length === 0) {
    showEmptyState("examsTable", "No exams found");
    return;
  }

  let html = `
        <table>
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Course</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Duration</th>
                    <th>Total Marks</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

  exams.forEach((exam) => {
    const course = myCourses.find((c) => c.courseId === exam.courseId);
    const isUpcoming = new Date(exam.scheduledDate) > new Date();

    html += `
            <tr>
                <td><strong>${exam.title || "N/A"}</strong></td>
                <td>${course ? course.courseCode : "N/A"}</td>
                <td><span class="badge badge-info">${
                  exam.examType || "N/A"
                }</span></td>
                <td>${formatDateTime(exam.scheduledDate)}</td>
                <td>${exam.duration || 0} min</td>
                <td>${exam.totalMarks || 0}</td>
                <td class="actions">
                    ${
                      isUpcoming
                        ? `<button class="btn btn-sm btn-secondary" onclick="viewExamDetails(${exam.examId})">View</button>`
                        : `<button class="btn btn-sm btn-primary" onclick="viewSubmissions(${exam.examId})">Submissions</button>`
                    }
                    <button class="btn btn-sm btn-danger" onclick="deleteExam(${
                      exam.examId
                    })">Delete</button>
                </td>
            </tr>
        `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

function filterExams() {
  const courseFilter = document.getElementById("courseFilter").value;
  const typeFilter = document.getElementById("typeFilter").value;

  let filtered = allExams.filter((exam) => {
    const matchesCourse = !courseFilter || exam.courseId == courseFilter;
    const matchesType = !typeFilter || exam.examType === typeFilter;

    return matchesCourse && matchesType;
  });

  displayExams(filtered);
}

function openCreateExamModal() {
  document.getElementById("examForm").reset();
  document.getElementById("formError").style.display = "none";

  // Set minimum date to now
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  document.getElementById("scheduledDate").min = now.toISOString().slice(0, 16);

  openModal("examModal");
}

async function handleCreateExam(e) {
  e.preventDefault();

  const formError = document.getElementById("formError");
  formError.style.display = "none";

  const examData = {
    courseId: parseInt(document.getElementById("courseId").value),
    title: document.getElementById("title").value,
    examType: document.getElementById("examType").value,
    scheduledDate: document.getElementById("scheduledDate").value,
    duration: parseInt(document.getElementById("duration").value),
    totalMarks: parseInt(document.getElementById("totalMarks").value),
  };

  const submitButton = e.target.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Creating...";

  try {
    await apiService.post(API_ENDPOINTS.EXAMS, examData);
    closeModal("examModal");
    await loadExams();
    alert("Exam created successfully!");
  } catch (error) {
    formError.textContent = error.message || "Failed to create exam";
    formError.style.display = "block";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Create Exam";
  }
}

async function viewExamDetails(examId) {
  try {
    const exam = allExams.find((e) => e.examId === examId);
    if (!exam) {
      alert("Exam not found");
      return;
    }
    const course = myCourses.find((c) => c.courseId === exam.courseId);
    const examDetails = await apiService.get(
      API_ENDPOINTS.EXAM_BY_ID(examId, exam.courseId)
    );

    alert(
      `Exam: ${examDetails.title}\nCourse: ${
        course ? course.courseCode : "N/A"
      }\nType: ${examDetails.examType}\nDate: ${formatDateTime(
        examDetails.scheduledDate
      )}\nDuration: ${examDetails.duration} minutes\nTotal Marks: ${
        examDetails.totalMarks
      }`
    );
  } catch (error) {
    alert("Failed to load exam details");
  }
}

async function viewSubmissions(examId) {
  try {
    const submissions = await apiService.get(
      API_ENDPOINTS.EXAM_SUBMISSIONS(examId)
    );

    if (!submissions || submissions.length === 0) {
      alert("No submissions yet for this exam");
      return;
    }

    let message = "Exam Submissions:\n\n";
    submissions.forEach((sub) => {
      message += `Student: ${sub.studentName || "N/A"}\nScore: ${
        sub.score || 0
      }/${sub.totalMarks || 0}\nSubmitted: ${formatDateTime(
        sub.submittedAt
      )}\n\n`;
    });

    alert(message);
  } catch (error) {
    alert("Failed to load submissions");
  }
}

async function deleteExam(examId) {
  if (!confirmAction("Are you sure you want to delete this exam?")) {
    return;
  }

  try {
    const exam = allExams.find((e) => e.examId === examId);
    if (!exam) {
      alert("Exam not found");
      return;
    }
    await apiService.delete(API_ENDPOINTS.EXAM_BY_ID(examId, exam.courseId));
    await loadExams();
    alert("Exam deleted successfully!");
  } catch (error) {
    alert("Failed to delete exam: " + error.message);
  }
}

function formatDateTime(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString();
}
