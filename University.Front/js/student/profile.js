// Student Profile Page
let studentId = null;

document.addEventListener("DOMContentLoaded", async function () {
  if (!authService.requireRole("Student")) return;

  const user = authService.getUserFromToken();
  document.getElementById("studentName").textContent = user.name || user.email;
  studentId = user.id;

  await loadProfile();
  await loadAcademicInfo();

  document
    .getElementById("passwordForm")
    .addEventListener("submit", handlePasswordChange);
});

async function loadProfile() {
  showLoading("profileInfo");

  try {
    const student = await apiService.get(API_ENDPOINTS.STUDENT_PROFILE);
    displayProfile(student);
  } catch (error) {
    console.error("Error loading profile:", error);
    showError("profileInfo", "Failed to load profile");
  }
}

function displayProfile(student) {
  const container = document.getElementById("profileInfo");

  let html = `
        <div class="details-grid">
            <div class="detail-item">
                <strong>Full Name:</strong>
                <span>${student.fullName || "N/A"}</span>
            </div>
            <div class="detail-item">
                <strong>First Name:</strong>
                <span>${student.firstName || "N/A"}</span>
            </div>
            <div class="detail-item">
                <strong>Last Name:</strong>
                <span>${student.lastName || "N/A"}</span>
            </div>
            <div class="detail-item">
                <strong>Email:</strong>
                <span>${student.email || "N/A"}</span>
            </div>
            <div class="detail-item">
                <strong>Student Code:</strong>
                <span>${student.studentCode || "N/A"}</span>
            </div>
            <div class="detail-item">
                <strong>Contact Number:</strong>
                <span>${student.contactNumber || "N/A"}</span>
            </div>
            <div class="detail-item">
                <strong>Department:</strong>
                <span>${student.departmentName || "N/A"}</span>
            </div>
            <div class="detail-item">
                <strong>Date of Birth:</strong>
                <span>${formatDate(student.dateOfBirth)}</span>
            </div>
        </div>
    `;

  container.innerHTML = html;
}

async function loadAcademicInfo() {
  showLoading("academicInfo");

  try {
    const enrollments = await apiService.get(
      API_ENDPOINTS.ENROLLMENTS_BY_STUDENT(studentId)
    );
    const courses = enrollments.data || enrollments || [];

    const totalCourses = courses.length;
    const completedCourses = courses.filter(
      (c) => c.status === "Completed"
    ).length;
    const totalCredits = courses.reduce((sum, c) => sum + (c.credits || 0), 0);

    // Calculate GPA
    const gradedCourses = courses.filter(
      (c) => c.finalGrade && c.finalGrade > 0
    );
    const gpa =
      gradedCourses.length > 0
        ? (
            gradedCourses.reduce((sum, c) => sum + c.finalGrade, 0) /
            gradedCourses.length
          ).toFixed(2)
        : "N/A";

    let html = `
            <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
                <div class="stat-card">
                    <div class="stat-label">Total Courses</div>
                    <div class="stat-value">${totalCourses}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Completed Courses</div>
                    <div class="stat-value">${completedCourses}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Total Credits</div>
                    <div class="stat-value">${totalCredits}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">GPA</div>
                    <div class="stat-value">${gpa}</div>
                </div>
            </div>
        `;

    document.getElementById("academicInfo").innerHTML = html;
  } catch (error) {
    console.error("Error loading academic info:", error);
    document.getElementById("academicInfo").innerHTML =
      '<div class="empty-state">Unable to load academic information</div>';
  }
}

async function handlePasswordChange(e) {
  e.preventDefault();

  const errorDiv = document.getElementById("passwordError");
  const successDiv = document.getElementById("passwordSuccess");
  errorDiv.style.display = "none";
  successDiv.style.display = "none";

  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Validate passwords match
  if (newPassword !== confirmPassword) {
    errorDiv.textContent = "New passwords do not match";
    errorDiv.style.display = "block";
    return;
  }

  // Validate password strength
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    errorDiv.textContent =
      "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character";
    errorDiv.style.display = "block";
    return;
  }

  const submitButton = e.target.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = "Changing...";

  try {
    await apiService.post(`${API_ENDPOINTS.AUTH}/change-password`, {
      currentPassword,
      newPassword,
    });

    successDiv.textContent = "Password changed successfully!";
    successDiv.style.display = "block";

    // Reset form
    document.getElementById("passwordForm").reset();
  } catch (error) {
    errorDiv.textContent = error.message || "Failed to change password";
    errorDiv.style.display = "block";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Change Password";
  }
}
