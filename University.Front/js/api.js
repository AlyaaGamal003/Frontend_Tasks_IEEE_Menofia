// API Service for making HTTP requests
class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = authService.getToken();

    const config = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized
      if (response.status === 401) {
        authService.logout();
        return null;
      }

      // Try to parse JSON response
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text || "Unexpected response from server" };
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      // Provide more helpful error messages
      if (
        error.name === "TypeError" &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          "Cannot connect to server. Please check:\n1. API URL is correct\n2. Backend server is running\n3. CORS is enabled on the backend"
        );
      }
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }
}

// Create global API service instance
const apiService = new ApiService(API_BASE_URL);

// Utility functions
function showLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = '<div class="loading"><p>Loading...</p></div>';
  }
}

function showError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `<div class="alert alert-danger">${message}</div>`;
  }
}

function showSuccess(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `<div class="alert alert-success">${message}</div>`;
  }
}

function showEmptyState(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `
            <div class="empty-state">
                <h3>No Data Found</h3>
                <p>${message}</p>
            </div>
        `;
  }
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Modal utilities
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("active");
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
  }
}

// Close modal when clicking outside
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("modal")) {
    event.target.classList.remove("active");
  }
});

// Form validation
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const re =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return re.test(password);
}

// Debounce function for search inputs
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Get status badge HTML
function getStatusBadge(status) {
  const statusMap = {
    Present: "status-present",
    Absent: "status-absent",
    Late: "status-late",
    Excused: "status-excused",
    Enrolled: "badge-info",
    Dropped: "badge-danger",
    Completed: "badge-success",
  };

  const className = statusMap[status] || "badge-info";
  return `<span class="attendance-status ${className}">${status}</span>`;
}

// Get grade letter from score
function getGradeLetter(score) {
  if (score >= 97) return "A+";
  if (score >= 93) return "A";
  if (score >= 90) return "A-";
  if (score >= 87) return "B+";
  if (score >= 83) return "B";
  if (score >= 80) return "B-";
  if (score >= 77) return "C+";
  if (score >= 73) return "C";
  if (score >= 70) return "C-";
  if (score >= 67) return "D+";
  if (score >= 63) return "D";
  if (score >= 60) return "D-";
  return "F";
}

// Confirm dialog
function confirmAction(message) {
  return confirm(message);
}
