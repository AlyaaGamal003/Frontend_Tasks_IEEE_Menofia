{
  "openapi": "3.0.1",
  "info": {
    "title": "Smart Campus University API",
    "description": "University management system API for managing students, instructors, courses, enrollments, exams, attendance, and submissions",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://smartcampus-university.runasp.net",
      "description": "Production server"
    }
  ],
  "security": [
    {
      "BearerAuth": []
    }
  ],
  "paths": {
    "/api/Auth/login": {
      "post": {
        "tags": ["Authentication"],
        "summary": "User login",
        "security": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/LoginDTO"
              }
            }
          }
        },
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Attendance/mark": {
      "post": {
        "tags": ["Attendance"],
        "summary": "Mark attendance (Instructor only)",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/MarkAttendanceDto" }
            }
          }
        },
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Attendance/student/{studentId}": {
      "get": {
        "tags": ["Attendance"],
        "summary": "Get student attendance history (Admin/Instructor)",
        "parameters": [
          {
            "name": "studentId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Attendance/filter": {
      "get": {
        "tags": ["Attendance"],
        "summary": "Filter attendances (Instructor/Admin)",
        "parameters": [
          {
            "name": "studentId",
            "in": "query",
            "schema": { "type": "integer" }
          },
          {
            "name": "courseId",
            "in": "query",
            "schema": { "type": "integer" }
          },
          {
            "name": "from",
            "in": "query",
            "schema": { "type": "string", "format": "date-time" }
          },
          {
            "name": "to",
            "in": "query",
            "schema": { "type": "string", "format": "date-time" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Attendance/summary/{studentId}": {
      "get": {
        "tags": ["Attendance"],
        "summary": "Get attendance summary (Admin/Student/Instructor)",
        "parameters": [
          {
            "name": "studentId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          },
          {
            "name": "courseId",
            "in": "query",
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Attendance/{id}": {
      "put": {
        "tags": ["Attendance"],
        "summary": "Update attendance (Instructor only)",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/UpdateAttendanceDto" }
            }
          }
        },
        "responses": {
          "200": { "description": "Success" }
        }
      },
      "delete": {
        "tags": ["Attendance"],
        "summary": "Delete attendance (Instructor only)",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": {
            "description": "Login successful",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "token": { "type": "string" },
                    "message": { "type": "string" }
                  }
                }
              }
            }
          },
          "401": {
            "description": "Invalid credentials"
          }
        }
      }
    },
    "/api/Student": {
      "get": {
        "tags": ["Student"],
        "summary": "Get all students (Admin only)",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": { "$ref": "#/components/schemas/StudentDto" }
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": ["Student"],
        "summary": "Create student (Admin only)",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/CreateStudentDto" }
            }
          }
        },
        "responses": {
          "201": { "description": "Created" },
          "400": { "description": "Bad request" }
        }
      }
    },
    "/api/Student/{id}": {
      "get": {
        "tags": ["Student"],
        "summary": "Get student by ID (Admin only)",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" },
          "404": { "description": "Not found" }
        }
      },
      "put": {
        "tags": ["Student"],
        "summary": "Update student (Admin only)",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/UpdateStudentDto" }
            }
          }
        },
        "responses": {
          "200": { "description": "Success" },
          "404": { "description": "Not found" }
        }
      },
      "delete": {
        "tags": ["Student"],
        "summary": "Delete student (Admin only)",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" },
          "404": { "description": "Not found" }
        }
      }
    },
    "/api/Student/me": {
      "get": {
        "tags": ["Student"],
        "summary": "Get my profile (Student only)",
        "responses": {
          "200": { "description": "Success" },
          "404": { "description": "Not found" }
        }
      },
      "put": {
        "tags": ["Student"],
        "summary": "Update my profile (Student only)",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/UpdateStudentProfileDto" }
            }
          }
        },
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Student/department/{departmentId}": {
      "get": {
        "tags": ["Student"],
        "summary": "Get students by department (Admin only)",
        "parameters": [
          {
            "name": "departmentId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Student/code/{studentCode}": {
      "get": {
        "tags": ["Student"],
        "summary": "Get student by code (Admin only)",
        "parameters": [
          {
            "name": "studentCode",
            "in": "path",
            "required": true,
            "schema": { "type": "string" }
          }
        ],
        "responses": {
          "200": { "description": "Success" },
          "404": { "description": "Not found" }
        }
      }
    },
    "/api/Instructor": {
      "get": {
        "tags": ["Instructor"],
        "summary": "Get all instructors (Admin only)",
        "responses": {
          "200": { "description": "Success" }
        }
      },
      "post": {
        "tags": ["Instructor"],
        "summary": "Create instructor (Admin only)",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/CreateInstructorDto" }
            }
          }
        },
        "responses": {
          "201": { "description": "Created" }
        }
      }
    },
    "/api/Instructor/{id}": {
      "get": {
        "tags": ["Instructor"],
        "summary": "Get instructor by ID (Admin only)",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" },
          "404": { "description": "Not found" }
        }
      },
      "put": {
        "tags": ["Instructor"],
        "summary": "Update instructor (Admin only)",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/UpdateInstructorDto" }
            }
          }
        },
        "responses": {
          "200": { "description": "Success" }
        }
      },
      "delete": {
        "tags": ["Instructor"],
        "summary": "Delete instructor (Admin only)",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Instructor/me": {
      "get": {
        "tags": ["Instructor"],
        "summary": "Get my profile (Instructor only)",
        "responses": {
          "200": { "description": "Success" }
        }
      },
      "put": {
        "tags": ["Instructor"],
        "summary": "Update my profile (Instructor only)",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/UpdateInstructorProfileDto" }
            }
          }
        },
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Instructor/department/{departmentId}": {
      "get": {
        "tags": ["Instructor"],
        "summary": "Get instructors by department (Admin only)",
        "parameters": [
          {
            "name": "departmentId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Department": {
      "get": {
        "tags": ["Department"],
        "summary": "Get all departments",
        "responses": {
          "200": { "description": "Success" }
        }
      },
      "post": {
        "tags": ["Department"],
        "summary": "Create department (Admin only)",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/CreateDepartmentDTO" }
            }
          }
        },
        "responses": {
          "201": { "description": "Created" }
        }
      }
    },
    "/api/Department/{id}": {
      "get": {
        "tags": ["Department"],
        "summary": "Get department by ID",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      },
      "put": {
        "tags": ["Department"],
        "summary": "Update department (Admin only)",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/UpdateDepartmentDTO" }
            }
          }
        },
        "responses": {
          "200": { "description": "Success" }
        }
      },
      "delete": {
        "tags": ["Department"],
        "summary": "Delete department (Admin only)",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Course": {
      "get": {
        "tags": ["Course"],
        "summary": "Get all courses",
        "responses": {
          "200": { "description": "Success" }
        }
      },
      "post": {
        "tags": ["Course"],
        "summary": "Create course (Admin only)",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/CreateCourseDTO" }
            }
          }
        },
        "responses": {
          "201": { "description": "Created" }
        }
      }
    },
    "/api/Course/{id}": {
      "get": {
        "tags": ["Course"],
        "summary": "Get course by ID",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      },
      "put": {
        "tags": ["Course"],
        "summary": "Update course (Admin only)",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/UpdateCourseDTO" }
            }
          }
        },
        "responses": {
          "200": { "description": "Success" }
        }
      },
      "delete": {
        "tags": ["Course"],
        "summary": "Soft delete course (Admin only)",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Course/{id}/restore": {
      "post": {
        "tags": ["Course"],
        "summary": "Restore deleted course (Admin only)",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Course/all-including-deleted": {
      "get": {
        "tags": ["Course"],
        "summary": "Get all courses including deleted (Admin only)",
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Course/instructor/{instructorId}": {
      "get": {
        "tags": ["Course"],
        "summary": "Get courses by instructor",
        "parameters": [
          {
            "name": "instructorId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Course/department/{departmentId}": {
      "get": {
        "tags": ["Course"],
        "summary": "Get courses by department",
        "parameters": [
          {
            "name": "departmentId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Course/student/{studentId}/available": {
      "get": {
        "tags": ["Course"],
        "summary": "Get available courses for student",
        "parameters": [
          {
            "name": "studentId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Course/{courseId}/can-run": {
      "get": {
        "tags": ["Course"],
        "summary": "Check if course can run (minimum 5 students)",
        "parameters": [
          {
            "name": "courseId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Enrollment": {
      "post": {
        "tags": ["Enrollment"],
        "summary": "Enroll student in course (Student only)",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/CreateEnrollmentDTO" }
            }
          }
        },
        "responses": {
          "201": { "description": "Created" }
        }
      }
    },
    "/api/Enrollment/{enrollmentId}": {
      "delete": {
        "tags": ["Enrollment"],
        "summary": "Remove enrollment (Student only)",
        "parameters": [
          {
            "name": "enrollmentId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Enrollment/student/{studentId}": {
      "get": {
        "tags": ["Enrollment"],
        "summary": "Get enrollments by student",
        "parameters": [
          {
            "name": "studentId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Enrollment/course/{courseId}": {
      "get": {
        "tags": ["Enrollment"],
        "summary": "Get enrollments by course (Admin/Instructor)",
        "parameters": [
          {
            "name": "courseId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Enrollment/student/{studentId}/course/{courseId}/grade": {
      "get": {
        "tags": ["Enrollment"],
        "summary": "Get student course grade",
        "parameters": [
          {
            "name": "studentId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          },
          {
            "name": "courseId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Enrollment/all-including-deleted": {
      "get": {
        "tags": ["Enrollment"],
        "summary": "Get all enrollments including deleted (Admin only)",
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Enrollment/soft-delete/{enrollmentId}": {
      "delete": {
        "tags": ["Enrollment"],
        "summary": "Soft delete enrollment (Admin only)",
        "parameters": [
          {
            "name": "enrollmentId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Enrollment/{enrollmentId}/restore": {
      "post": {
        "tags": ["Enrollment"],
        "summary": "Restore deleted enrollment (Admin only)",
        "parameters": [
          {
            "name": "enrollmentId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Exam": {
      "get": {
        "tags": ["Exam"],
        "summary": "Get all exams",
        "responses": {
          "200": { "description": "Success" }
        }
      },
      "post": {
        "tags": ["Exam"],
        "summary": "Create exam (Admin/Instructor)",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/CreateExamDto" }
            }
          }
        },
        "responses": {
          "201": { "description": "Created" }
        }
      }
    },
    "/api/Exam/course/{courseId}": {
      "get": {
        "tags": ["Exam"],
        "summary": "Get exams by course",
        "parameters": [
          {
            "name": "courseId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Exam/{id}/course/{courseId}": {
      "get": {
        "tags": ["Exam"],
        "summary": "Get exam by ID",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          },
          {
            "name": "courseId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      },
      "put": {
        "tags": ["Exam"],
        "summary": "Update exam (Admin/Instructor)",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          },
          {
            "name": "courseId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/UpdateExamDto" }
            }
          }
        },
        "responses": {
          "200": { "description": "Success" }
        }
      },
      "delete": {
        "tags": ["Exam"],
        "summary": "Delete exam (Admin/Instructor)",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          },
          {
            "name": "courseId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Exam/{id}/course/{courseId}/with-questions": {
      "get": {
        "tags": ["Exam"],
        "summary": "Get exam with questions",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          },
          {
            "name": "courseId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Exam/{examId}/questions": {
      "get": {
        "tags": ["Exam"],
        "summary": "Get exam questions (Admin/Instructor)",
        "parameters": [
          {
            "name": "examId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Exam/questions": {
      "post": {
        "tags": ["Exam"],
        "summary": "Add exam question (Admin/Instructor)",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/CreateQuestionDto" }
            }
          }
        },
        "responses": {
          "201": { "description": "Created" }
        }
      }
    },
    "/api/Exam/{examId}/questions/{questionId}": {
      "get": {
        "tags": ["Exam"],
        "summary": "Get question by ID (Admin/Instructor)",
        "parameters": [
          {
            "name": "examId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          },
          {
            "name": "questionId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      },
      "put": {
        "tags": ["Exam"],
        "summary": "Update question (Admin/Instructor)",
        "parameters": [
          {
            "name": "examId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          },
          {
            "name": "questionId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/UpdateQuestionDto" }
            }
          }
        },
        "responses": {
          "200": { "description": "Success" }
        }
      },
      "delete": {
        "tags": ["Exam"],
        "summary": "Delete question (Admin/Instructor)",
        "parameters": [
          {
            "name": "examId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          },
          {
            "name": "questionId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Submission/start": {
      "post": {
        "tags": ["Submission"],
        "summary": "Start exam (Student only)",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/StartExamDto" }
            }
          }
        },
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Submission/submit": {
      "post": {
        "tags": ["Submission"],
        "summary": "Submit exam (Student only)",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/SubmitExamDto" }
            }
          }
        },
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Submission/result/{examId}/{studentId}": {
      "get": {
        "tags": ["Submission"],
        "summary": "Get exam result (Student/Instructor)",
        "parameters": [
          {
            "name": "examId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          },
          {
            "name": "studentId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Submission/status/{examId}/{studentId}": {
      "get": {
        "tags": ["Submission"],
        "summary": "Get submission status (Instructor only)",
        "parameters": [
          {
            "name": "examId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          },
          {
            "name": "studentId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Submission/student/{studentId}": {
      "get": {
        "tags": ["Submission"],
        "summary": "Get student submissions (Student/Instructor)",
        "parameters": [
          {
            "name": "studentId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Submission/exam/{examId}": {
      "get": {
        "tags": ["Submission"],
        "summary": "Get exam submissions (Instructor only)",
        "parameters": [
          {
            "name": "examId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Submission/all-including-deleted": {
      "get": {
        "tags": ["Submission"],
        "summary": "Get all submissions including deleted (Admin/Instructor)",
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Submission/{submissionId}": {
      "delete": {
        "tags": ["Submission"],
        "summary": "Delete submission (Admin/Instructor)",
        "parameters": [
          {
            "name": "submissionId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {
          "200": { "description": "Success" }
        }
      }
    },
    "/api/Submission/{submissionId}/restore": {
      "post": {
        "tags": ["Submission"],
        "summary": "Restore submission (Admin/Instructor)",
        "parameters": [
          {
            "name": "submissionId",
            "in": "path",
            "required": true,
            "schema": { "type": "integer" }
          }
        ],
        "responses": {