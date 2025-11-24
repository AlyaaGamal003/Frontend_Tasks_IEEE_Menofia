// Authentication utilities
class AuthService {
  constructor() {
    this.TOKEN_KEY = "auth_token";
    this.USER_KEY = "user_info";
  }

  // Store token
  setToken(token) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // Get token
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Store user info
  setUser(user) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Get user info
  getUser() {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }

  // Parse JWT token
  parseJwt(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  // Get user info from token
  getUserFromToken() {
    const token = this.getToken();
    if (!token) return null;

    const decoded = this.parseJwt(token);
    if (!decoded) return null;

    // Handle both standard claim names and XML schema URLs
    const nameIdentifier =
      decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] ||
      decoded.nameid ||
      decoded.sub;
    const email =
      decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
      ] || decoded.email;
    const name =
      decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
      decoded.unique_name ||
      decoded.name;
    const role =
      decoded["Role"] ||
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      decoded.role;
    const firstName = decoded["FirstName"] || decoded.firstName;
    const lastName = decoded["LastName"] || decoded.lastName;

    return {
      id: nameIdentifier,
      email: email,
      role: role,
      name: name || `${firstName} ${lastName}`.trim(),
      firstName: firstName,
      lastName: lastName,
    };
  }

  // Logout
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    window.location.href = "/index.html";
  }

  // Check authorization for role
  hasRole(role) {
    const user = this.getUserFromToken();
    return user && user.role === role;
  }

  // Redirect based on role
  redirectToDashboard() {
    const user = this.getUserFromToken();

    if (!user) {
      window.location.href = "index.html";
      return;
    }

    switch (user.role) {
      case "Admin":
        window.location.href = "pages/admin/dashboard.html";
        break;
      case "Instructor":
        window.location.href = "pages/instructor/dashboard.html";
        break;
      case "Student":
        window.location.href = "pages/student/dashboard.html";
        break;
      default:
        window.location.href = "index.html";
    }
  }

  // Check if user has required role, redirect if not
  requireRole(role) {
    if (!this.isAuthenticated()) {
      window.location.href = "../../index.html";
      return false;
    }

    const user = this.getUserFromToken();
    if (!user || user.role !== role) {
      this.redirectToDashboard();
      return false;
    }

    return true;
  }
}

// Create global auth service instance
const authService = new AuthService();

// Check authentication on protected pages
function checkAuth() {
  if (!authService.isAuthenticated()) {
    window.location.href = "../../index.html";
    return false;
  }
  return true;
}

// Get auth headers for API calls
function getAuthHeaders() {
  const token = authService.getToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}
