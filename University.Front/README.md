# University Management System - Frontend

A comprehensive frontend application for the University Management System built with pure HTML, CSS, and JavaScript.

## 🎨 Design

- **Color Scheme**: Light blue theme with clean, professional design
- **Responsive**: Works on desktop and mobile devices
- **Modern UI**: Card-based layout with smooth animations and transitions

## 📁 Project Structure

```
University.Front/
├── index.html                 # Login page
├── css/
│   └── style.css             # Main stylesheet
├── js/
│   ├── config.js             # API endpoints configuration
│   ├── auth.js               # Authentication utilities
│   ├── api.js                # API service and utilities
│   ├── login.js              # Login page logic
│   ├── admin/                # Admin functionality
│   │   ├── dashboard.js
│   │   ├── students.js
│   │   └── courses.js
│   ├── instructor/           # Instructor functionality
│   │   ├── dashboard.js
│   │   └── attendance.js
│   └── student/              # Student functionality
│       ├── dashboard.js
│       ├── enrollment.js
│       └── exams.js
└── pages/
    ├── admin/                # Admin pages
    │   ├── dashboard.html
    │   ├── students.html
    │   ├── instructors.html
    │   ├── departments.html
    │   ├── courses.html
    │   └── enrollments.html
    ├── instructor/           # Instructor pages
    │   ├── dashboard.html
    │   ├── courses.html
    │   ├── exams.html
    │   └── attendance.html
    └── student/              # Student pages
        ├── dashboard.html
        ├── courses.html
        ├── enrollment.html
        ├── exams.html
        └── attendance.html
```

## 🚀 Getting Started

### Prerequisites

1. **Backend API**: Ensure your ASP.NET Core API is running
2. **Web Server**: Use a local web server to serve the frontend files

### Configuration

1. **Update API URL**: Edit `js/config.js` and set your API base URL:

   ```javascript
   const API_BASE_URL = "https://localhost:5001/api"; // Your API URL
   ```

2. **CORS**: Make sure your backend API allows CORS from your frontend domain

### Running the Application

#### Option 1: Using Visual Studio Code with Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

#### Option 2: Using Python

```bash
# Navigate to the University.Front directory
cd University.Front

# Python 3
python -m http.server 8000

# Then open http://localhost:8000 in your browser
```

#### Option 3: Using Node.js

```bash
# Install http-server globally
npm install -g http-server

# Navigate to the University.Front directory
cd University.Front

# Start the server
http-server -p 8000

# Then open http://localhost:8000 in your browser
```

## 👥 User Roles & Features

### Admin

- **Dashboard**: View system statistics
- **Students Management**: Add, edit, delete students
- **Instructors Management**: Add, edit, delete instructors
- **Departments Management**: Create and manage departments
- **Courses Management**: Create, edit, delete courses
- **Enrollments**: View and manage enrollments

### Instructor

- **Dashboard**: View teaching statistics
- **Courses**: View assigned courses and students
- **Exams**: Create and manage exams, view submissions
- **Attendance**: Mark and manage student attendance
- **Profile**: Update personal information

### Student

- **Dashboard**: View enrolled courses and grades
- **Course Enrollment**: Enroll in available courses
- **Exams**: Take exams and view results
- **Attendance**: View attendance records
- **Grades**: Check course grades
- **Profile**: Update personal information

## 🔑 Demo Credentials

Use these credentials to login and test different roles:

### Admin

- Email: `amal@gmail.com`
- Password: `Password@123`

### Instructor

- Email: `ali@gmail.com`
- Password: `Password@123`

### Student

- Email: `mona@gmail.com`
- Password: `Password@123`

## 🎯 Key Features

### Authentication

- JWT token-based authentication
- Role-based access control
- Automatic redirection based on user role
- Token stored in localStorage

### Admin Features

- Complete CRUD operations for students, instructors, courses
- Department management
- Search and filter functionality
- Enrollment monitoring

### Instructor Features

- View assigned courses and enrolled students
- Create and manage exams with MCQ questions
- Mark and manage student attendance
- View exam submissions and results

### Student Features

- Enroll in courses (with credit hour limits)
- Take exams with timer
- View grades and attendance
- Drop courses (when eligible)

## 🛠️ Technical Details

### Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript**: No frameworks, pure JS
- **Fetch API**: For HTTP requests
- **LocalStorage**: For token and user data storage

### Key JavaScript Patterns

- **ES6+ Features**: Arrow functions, async/await, template literals
- **Modular Code**: Separated concerns across multiple files
- **Service Pattern**: ApiService for centralized API calls
- **Authentication Service**: Centralized auth management

### Security Features

- JWT token authentication
- Automatic logout on 401 responses
- Role-based page access
- Input validation

## 🎨 Styling

The application uses a custom CSS framework with:

- CSS Custom Properties (CSS Variables) for theming
- Responsive grid layouts
- Card-based design system
- Consistent spacing and typography
- Light blue color scheme (#4A90E2 primary color)

## 📱 Responsive Design

The application is responsive and works on:

- Desktop (1024px and above)
- Tablet (768px - 1023px)
- Mobile (below 768px)

## 🔧 Customization

### Changing Colors

Edit the CSS variables in `css/style.css`:

```css
:root {
  --primary-color: #4a90e2; /* Change this for different primary color */
  --primary-dark: #357abd;
  --primary-light: #e8f4f8;
  /* ... other colors */
}
```

### Adding New Pages

1. Create HTML file in appropriate `pages/` directory
2. Create corresponding JavaScript file in `js/` directory
3. Follow the existing structure and patterns
4. Update navigation in sidebar

## 🐛 Troubleshooting

### Login Issues

- Check API URL in `config.js`
- Verify backend is running
- Check browser console for errors
- Ensure CORS is configured on backend

### API Connection Issues

- Open browser DevTools Network tab
- Check if requests are reaching the backend
- Verify API endpoints match your backend
- Check for CORS errors

### Authentication Issues

- Clear localStorage: `localStorage.clear()`
- Check JWT token expiration
- Verify role-based access in backend

## 📝 API Endpoints Used

The frontend uses these main endpoint groups:

- `/api/Auth/login` - Authentication
- `/api/Student/*` - Student operations
- `/api/Instructor/*` - Instructor operations
- `/api/Department/*` - Department operations
- `/api/Course/*` - Course operations
- `/api/Enrollment/*` - Enrollment operations
- `/api/Exam/*` - Exam operations
- `/api/Submission/*` - Exam submission operations
- `/api/Attendance/*` - Attendance operations

## 🚀 Future Enhancements

Potential improvements:

- Real-time notifications using SignalR
- File upload for student/instructor photos
- Advanced reporting and analytics
- Email notifications
- Mobile app version
- Dark mode theme
- Export data to PDF/Excel

## 📄 License

This project is part of the University Management System and follows the same license as the backend.

## 👨‍💻 Support

For issues or questions:

1. Check the browser console for errors
2. Verify backend API is running
3. Check CORS configuration
4. Review the documentation above

---

**Note**: This is a frontend-only application. It requires the ASP.NET Core backend API to be running for full functionality.
