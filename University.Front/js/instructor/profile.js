// Instructor Profile Page
let instructorId = null;

document.addEventListener("DOMContentLoaded", async function () {
  if (!authService.requireRole("Instructor")) return;

  const user = authService.getUserFromToken();
  document.getElementById("instructorName").textContent =
    user.name || user.email;
  instructorId = user.id;
  console.log("Instructor:", user);

  await loadProfile();

  document
    .getElementById("passwordForm")
    .addEventListener("submit", handlePasswordChange);
});

async function loadProfile() {
  showLoading("profileInfo");

  try {
    const instructor = await apiService.get(API_ENDPOINTS.INSTRUCTOR_PROFILE);
    displayProfile(instructor);
  } catch (error) {
    console.error("Error loading profile:", error);
    showError("profileInfo", "Failed to load profile");
  }
}

function displayProfile(instructor) {
  const container = document.getElementById("profileInfo");

  let html = `
        <div class="details-grid">
            <div class="detail-item">
                <strong>Full Name:</strong>
                <span>${instructor.fullName || "N/A"}</span>
            </div>
            <div class="detail-item">
                <strong>First Name:</strong>
                <span>${instructor.firstName || "N/A"}</span>
            </div>
            <div class="detail-item">
                <strong>Last Name:</strong>
                <span>${instructor.lastName || "N/A"}</span>
            </div>
            <div class="detail-item">
                <strong>Email:</strong>
                <span>${instructor.email || "N/A"}</span>
            </div>
            <div class="detail-item">
                <strong>Contact Number:</strong>
                <span>${instructor.contactNumber || "N/A"}</span>
            </div>
            <div class="detail-item">
                <strong>Department:</strong>
                <span>${instructor.departmentName || "N/A"}</span>
            </div>
        </div>
    `;

  container.innerHTML = html;
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
