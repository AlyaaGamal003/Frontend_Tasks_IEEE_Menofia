// API Configuration
const API_BASE_URL = "https://smartcampus-university.runasp.net/api"; // Update with your API URL

const API_ENDPOINTS = {
  // Auth
  AUTH: "/Auth",
  LOGIN: "/Auth/login",

  // Students
  STUDENTS: "/Student",
  STUDENT_BY_ID: (id) => `/Student/${id}`,
  STUDENT_BY_DEPARTMENT: (deptId) => `/Student/department/${deptId}`,
  STUDENT_BY_CODE: (code) => `/Student/code/${code}`,
  STUDENT_PROFILE: "/Student/me",

  // Instructors
  INSTRUCTORS: "/Instructor",
  INSTRUCTOR_BY_ID: (id) => `/Instructor/${id}`,
  INSTRUCTOR_BY_DEPARTMENT: (deptId) => `/Instructor/department/${deptId}`,
  INSTRUCTOR_PROFILE: "/Instructor/me",

  // Departments
  DEPARTMENTS: "/Department",
  DEPARTMENT_BY_ID: (id) => `/Department/${id}`,

  // Courses
  COURSES: "/Course",
  COURSE_BY_ID: (id) => `/Course/${id}`,
  COURSES_ALL_INCLUDING_DELETED: "/Course/all-including-deleted",
  COURSES_BY_INSTRUCTOR: (instructorId) => `/Course/instructor/${instructorId}`,
  COURSES_BY_DEPARTMENT: (deptId) => `/Course/department/${deptId}`,
  COURSES_AVAILABLE_FOR_STUDENT: (studentId) =>
    `/Course/student/${studentId}/available`,
  COURSE_CAN_RUN: (courseId) => `/Course/${courseId}/can-run`,
  COURSE_RESTORE: (courseId) => `/Course/${courseId}/restore`,

  // Enrollments
  ENROLLMENTS: "/Enrollment",
  ENROLLMENT_BY_ID: (id) => `/Enrollment/${id}`,
  ENROLLMENTS_BY_STUDENT: (studentId) => `/Enrollment/student/${studentId}`,
  ENROLLMENTS_BY_COURSE: (courseId) => `/Enrollment/course/${courseId}`,
  ENROLLMENT_GRADE: (studentId, courseId) =>
    `/Enrollment/student/${studentId}/course/${courseId}/grade`,
  ENROLLMENTS_ALL_INCLUDING_DELETED: "/Enrollment/all-including-deleted",
  ENROLLMENT_SOFT_DELETE: (id) => `/Enrollment/soft-delete/${id}`,
  ENROLLMENT_RESTORE: (id) => `/Enrollment/${id}/restore`,

  // Exams
  EXAMS: "/Exam",
  EXAMS_BY_COURSE: (courseId) => `/Exam/course/${courseId}`,
  EXAM_BY_ID: (examId, courseId) => `/Exam/${examId}/course/${courseId}`,
  EXAM_WITH_QUESTIONS: (examId, courseId) =>
    `/Exam/${examId}/course/${courseId}/with-questions`,
  EXAM_QUESTIONS: (examId) => `/Exam/${examId}/questions`,
  EXAM_QUESTION_BY_ID: (examId, questionId) =>
    `/Exam/${examId}/questions/${questionId}`,
  ADD_QUESTION: "/Exam/questions",
  UPDATE_QUESTION: (examId, questionId) =>
    `/Exam/${examId}/questions/${questionId}`,
  DELETE_QUESTION: (examId, questionId) =>
    `/Exam/${examId}/questions/${questionId}`,

  // Submissions
  START_EXAM: "/Submission/start",
  SUBMIT_EXAM: "/Submission/submit",
  EXAM_RESULT: (examId, studentId) =>
    `/Submission/result/${examId}/${studentId}`,
  SUBMISSION_STATUS: (examId, studentId) =>
    `/Submission/status/${examId}/${studentId}`,
  STUDENT_SUBMISSIONS: (studentId) => `/Submission/student/${studentId}`,
  EXAM_SUBMISSIONS: (examId) => `/Submission/exam/${examId}`,
  SUBMISSIONS_ALL_INCLUDING_DELETED: "/Submission/all-including-deleted",
  DELETE_SUBMISSION: (id) => `/Submission/${id}`,
  RESTORE_SUBMISSION: (id) => `/Submission/${id}/restore`,

  // Attendance
  MARK_ATTENDANCE: "/Attendance/mark",
  STUDENT_ATTENDANCE_HISTORY: (studentId) => `/Attendance/student/${studentId}`,
  FILTER_ATTENDANCE: "/Attendance/filter",
  ATTENDANCE_SUMMARY: (studentId) => `/Attendance/summary/${studentId}`,
  UPDATE_ATTENDANCE: (id) => `/Attendance/${id}`,
  DELETE_ATTENDANCE: (id) => `/Attendance/${id}`,
};
