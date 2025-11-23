// Login page script
document.addEventListener("DOMContentLoaded", function () {
  // Redirect if already logged in
//   if (authService.isAuthenticated()) {
//     authService.redirectToDashboard();
//     return;
//   }

  const loginForm = document.getElementById("loginForm");
  const errorMessage = document.getElementById("errorMessage");

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Hide previous error
    errorMessage.style.display = "none";

    // Disable submit button
    const submitButton = loginForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Logging in...";

    try {
      const response = await apiService.post(API_ENDPOINTS.LOGIN, {
        email: email,
        password: password,
      });

      console.log("Login response:", response);

      if (response && response.token) {
        // Store token
        authService.setToken(response.token);

        // Parse user info from token
          const user = authService.getUserFromToken();
          console.log("Logged in user:", user, response.token);
        authService.setUser(user);

        // Redirect to appropriate dashboard
        authService.redirectToDashboard();
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg = error.message || "Invalid email or password";
      errorMessage.innerHTML = errorMsg.replace(/\n/g, "<br>");
      errorMessage.style.display = "block";

      // Re-enable submit button
      submitButton.disabled = false;
      submitButton.textContent = "Login";
    }
  });
});
