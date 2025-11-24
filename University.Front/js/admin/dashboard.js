// Admin Dashboard
document.addEventListener("DOMContentLoaded", async function () {
  // Check authentication and role
  if (!authService.requireRole("Admin")) {
    return;
  }

  // Display user info
  const user = authService.getUserFromToken();
  document.getElementById("userName").textContent = user.name || user.email;
  document.getElementById("adminName").textContent = user.name || user.email;

  // Load dashboard statistics
  await loadDashboardStats();
});

async function loadDashboardStats() {
  try {
    // Load all statistics in parallel
    const [students, instructors, courses, departments] = await Promise.all([
      apiService.get(API_ENDPOINTS.STUDENTS),
      apiService.get(API_ENDPOINTS.INSTRUCTORS),
      apiService.get(API_ENDPOINTS.COURSES),
      apiService.get(API_ENDPOINTS.DEPARTMENTS),
    ]);

    // Update stats
    document.getElementById("totalStudents").textContent =
      students?.length || 0;
    document.getElementById("totalInstructors").textContent =
      instructors?.length || 0;
    document.getElementById("totalCourses").textContent =
      courses?.data?.length || courses?.length || 0;
    document.getElementById("totalDepartments").textContent =
      departments?.length || 0;
  } catch (error) {
    console.error("Error loading dashboard stats:", error);
  }
}
