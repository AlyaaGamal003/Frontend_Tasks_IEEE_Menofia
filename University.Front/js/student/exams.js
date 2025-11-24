// Student Exams
let studentProfile = null;
let currentExam = null;
let currentSubmission = null;
let examTimer = null;

document.addEventListener("DOMContentLoaded", async function () {
  if (!authService.requireRole("Student")) return;

  const user = authService.getUserFromToken();
  document.getElementById("studentName").textContent = user.name || user.email;

  await loadStudentExams();
});

async function loadStudentExams() {
  try {
    studentProfile = await apiService.get(API_ENDPOINTS.STUDENT_PROFILE);

    console.log("Student profile:", studentProfile);
    if (studentProfile && studentProfile.studentId) {
      console.log("Student ID:", studentProfile.studentId);
      // Get student's enrollments
      let enrollments = await apiService.get(
        API_ENDPOINTS.ENROLLMENTS_BY_STUDENT(studentProfile.studentId)
      );

      enrollments = enrollments.data;
      console.log("Student enrollments:", enrollments);
      // Get exams for each enrolled course
      let allExams = [];
      for (const enrollment of enrollments) {
        try {
          const exams = await apiService.get(
            API_ENDPOINTS.EXAMS_BY_COURSE(enrollment.courseId)
          );
          const examsArray = exams.data || exams || [];
          examsArray.forEach((exam) => {
            exam.courseInfo = enrollment;
          });
          allExams = allExams.concat(examsArray);
        } catch (e) {
          console.error("Error loading exams for course:", e);
        }
      }

      // Get submissions
      const submissions = await apiService.get(
        API_ENDPOINTS.STUDENT_SUBMISSIONS(studentProfile.studentId)
      );

      // Separate available and completed exams
      const submittedExamIds = submissions
        .filter((s) => s.submittedAt)
        .map((s) => s.examId);
      const availableExams = allExams.filter(
        (e) => !submittedExamIds.includes(e.examId)
      );

      displayAvailableExams(availableExams);
      displayExamResults(submissions);
    }
  } catch (error) {
    console.error("Error loading exams:", error);
    showError("availableExams", "Failed to load exams");
  }
}

function displayAvailableExams(exams) {
  const container = document.getElementById("availableExams");

  if (!exams || exams.length === 0) {
    showEmptyState("availableExams", "No exams available at this time");
    return;
  }

  let html = `
        <table>
            <thead>
                <tr>
                    <th>Course</th>
                    <th>Exam Title</th>
                    <th>Date</th>
                    <th>Duration</th>
                    <th>Total Points</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

  exams.forEach((exam) => {
    const examDate = new Date(exam.examDate);
    const isAvailable = examDate <= new Date();

    html += `
            <tr>
                <td>${exam.courseInfo?.courseName || "N/A"}</td>
                <td>${exam.title || "N/A"}</td>
                <td>${formatDateTime(exam.examDate)}</td>
                <td>${exam.duration || "N/A"} min</td>
                <td>${exam.totalPoints || "N/A"}</td>
                <td>
                    ${
                      isAvailable
                        ? `<button class="btn btn-sm btn-primary" onclick="startExam(${exam.examId}, ${exam.courseId})">Start Exam</button>`
                        : `<span class="badge badge-warning">Not Available Yet</span>`
                    }
                </td>
            </tr>
        `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

function displayExamResults(submissions) {
  const container = document.getElementById("examResults");

  const completedSubmissions = submissions.filter((s) => s.submittedAt);

  if (!completedSubmissions || completedSubmissions.length === 0) {
    showEmptyState("examResults", "No completed exams yet");
    return;
  }

  let html = `
        <table>
            <thead>
                <tr>
                    <th>Exam</th>
                    <th>Submitted At</th>
                    <th>Score</th>
                    <th>Grade</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

  completedSubmissions.forEach((submission) => {
    const grade =
      submission.score && submission.totalPoints
        ? getGradeLetter((submission.score / submission.totalPoints) * 100)
        : "N/A";
    const scoreDisplay =
      submission.score !== undefined && submission.totalPoints
        ? `${submission.score}/${submission.totalPoints}`
        : "N/A";

    html += `
            <tr>
                <td>${submission.examTitle || "Exam"}</td>
                <td>${formatDateTime(submission.submittedAt)}</td>
                <td>${scoreDisplay}</td>
                <td><span class="badge badge-info">${grade}</span></td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="viewResult(${
                      submission.examId
                    }, ${studentProfile.studentId})">View Details</button>
                </td>
            </tr>
        `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

async function startExam(examId, courseId) {
  if (
    !confirmAction(
      "Are you ready to start the exam? The timer will begin once you click OK."
    )
  ) {
    return;
  }

  try {
    // Start the exam
    currentSubmission = await apiService.post(API_ENDPOINTS.START_EXAM, {
      examId: examId,
      studentId: studentProfile.studentId,
    });

    // Load exam with questions
    currentExam = await apiService.get(
      API_ENDPOINTS.EXAM_WITH_QUESTIONS(examId, courseId)
    );

    // Display exam
    displayExam(currentExam);
    openModal("examModal");

    // Start timer
    startExamTimer(currentExam.duration);
  } catch (error) {
    alert("Failed to start exam: " + error.message);
  }
}

function displayExam(exam) {
  document.getElementById("examTitle").textContent = exam.title || "Exam";

  const questionsContainer = document.getElementById("examQuestions");
  let html = "";

  if (!exam.questions || exam.questions.length === 0) {
    html = "<p>No questions available.</p>";
  } else {
    exam.questions.forEach((question, index) => {
      html += `
                <div class="question-card">
                    <div class="question-header">
                        Question ${index + 1}: ${question.questionText}
                        <span style="float: right; color: var(--primary-color);">(${
                          question.score
                        } points)</span>
                    </div>
                    <div class="options-list">
            `;

      if (question.options && question.options.length > 0) {
        question.options.forEach((option) => {
          html += `
                        <label class="option-item">
                            <input type="radio" name="question_${question.questionId}" value="${option.optionId}">
                            <span>${option.optionText}</span>
                        </label>
                    `;
        });
      }

      html += `
                    </div>
                </div>
            `;
    });
  }

  questionsContainer.innerHTML = html;
}

function startExamTimer(duration) {
  let timeLeft = duration * 60; // Convert to seconds

  const timerElement = document.getElementById("examTimer");

  examTimer = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    timerElement.textContent = `Time Left: ${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;

    if (timeLeft <= 0) {
      clearInterval(examTimer);
      alert("Time is up! Submitting exam...");
      submitExam();
    }

    timeLeft--;
  }, 1000);
}

async function submitExam() {
  if (
    !confirmAction(
      "Are you sure you want to submit the exam? You cannot change your answers after submission."
    )
  ) {
    return;
  }

  // Clear timer
  if (examTimer) {
    clearInterval(examTimer);
  }

  // Collect answers
  const answers = [];
  currentExam.questions.forEach((question) => {
    const selectedOption = document.querySelector(
      `input[name="question_${question.questionId}"]:checked`
    );
    if (selectedOption) {
      answers.push({
        questionId: question.questionId,
        selectedOptionId: parseInt(selectedOption.value),
      });
    }
  });

  try {
    const result = await apiService.post(API_ENDPOINTS.SUBMIT_EXAM, {
      examId: currentExam.examId,
      studentId: studentProfile.studentId,
      answers: answers,
    });

    closeModal("examModal");
    alert("Exam submitted successfully!");

    // Reload exams
    await loadStudentExams();

    // Show result
    if (result) {
      viewResult(currentExam.examId, studentProfile.studentId);
    }
  } catch (error) {
    alert("Failed to submit exam: " + error.message);
  }
}

async function viewResult(examId, studentId) {
  try {
    const result = await apiService.get(
      API_ENDPOINTS.EXAM_RESULT(examId, studentId)
    );

    if (!result) {
      alert("Result not available yet");
      return;
    }

    const percentage = result.totalPoints
      ? (result.score / result.totalPoints) * 100
      : 0;
    const grade = getGradeLetter(percentage);

    const content = document.getElementById("resultContent");
    content.innerHTML = `
            <div class="grade-display">
                <div class="grade-circle">
                    <div class="grade-number">${percentage.toFixed(1)}%</div>
                    <div class="grade-letter">${grade}</div>
                </div>
                <h3>${result.examTitle || "Exam Result"}</h3>
                <p><strong>Score:</strong> ${result.score} / ${
      result.totalPoints
    }</p>
                <p><strong>Submitted:</strong> ${formatDateTime(
                  result.submittedAt
                )}</p>
            </div>
        `;

    openModal("resultModal");
  } catch (error) {
    alert("Failed to load result: " + error.message);
  }
}
