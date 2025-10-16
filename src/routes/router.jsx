// src/routes/router.jsx - FINAL FIXED
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import Home from "../pages/Home/Home";
import Classes from "../pages/Classes/Classes";
import Instructors from "../pages/Instructors/Instructors";
import Login from "../pages/User/Login";
import Register from "../pages/User/Register";
import SingleClass from "../pages/Classes/SingleClass";
import DashboardLayout from "../layout/DashboardLayout";
import Dashboard from "../pages/Dashboard/Dashboard";
import StudentCP from "../pages/Dashboard/Student/StudentCP";
import EnrolledClasses from "../pages/Dashboard/Student/Enroll/EnrolledClasses";
import MyPaymentHistory from "../pages/Dashboard/Student/Payment/History/MyPaymentHistory";
import SelectedClass from "../pages/Dashboard/Student/SelectedClass";
import AsInstructor from "../pages/Dashboard/Student/Apply/AsInstructor";
import Payment from "../pages/Dashboard/Student/Payment/Payment";
import CoursesStudy from "../pages/Dashboard/Student/Enroll/CoursesStudy";
import InstructorCP from "../pages/Dashboard/Instructor/InstructorCP";
import AddClass from "../pages/Dashboard/Instructor/AddClass";
import MyClasses from "../pages/Dashboard/Instructor/MyClasses";
import PendingCourse from "../pages/Dashboard/Instructor/PendingCourse";
import ApprovedCourse from "../pages/Dashboard/Instructor/ApprovedCourse";
import AdminHome from "../pages/Dashboard/Admin/AdminHome";
import AdminStats from "../pages/Dashboard/Admin/AdminStats";
import ManageClasses from "../pages/Dashboard/Admin/ManageClasses";
import UpdateUser from "../pages/Dashboard/Admin/UpdateUser";
import ManageUsers from "../pages/Dashboard/Admin/ManageUsers";
import UpdateClass from "../pages/Dashboard/Instructor/UpdateClass";
import FeedbackForm from "../pages/Dashboard/Admin/FeedbackForm";

// ✅ FIX: ADD MISSING IMPORT
import DashboardNavigate from "../components/DashboardNavigate";

// Loader functions
const safeLoader = async ({ params }) => {
  try {
    if (!params.id || params.id === 'undefined') {
      return { success: false, error: 'Invalid class ID', data: null };
    }

    let response = await fetch(`https://frasa-backend.vercel.app/api/class-with-modules/${params.id}`);
    
    if (!response.ok) {
      response = await fetch(`https://frasa-backend.vercel.app/api/class/${params.id}`);
    }

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    return { success: true, data: data.data || data };

  } catch (error) {
    return { success: false, error: error.message, data: null };
  }
};

const userLoader = async ({ params }) => {
  try {
    if (!params.id || params.id === 'undefined') {
      return { success: false, error: 'Invalid user ID', data: null };
    }

    const response = await fetch(`https://frasa-backend.vercel.app/api/users/${params.id}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    return { success: true, data: data.data || data };

  } catch (error) {
    return { success: false, error: error.message, data: null };
  }
};

// Error Boundary Component
const ErrorBoundary = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className="text-6xl mb-4">😵</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h1>
        <p className="text-gray-600 mb-6">We encountered an error while loading this page.</p>
        <button onClick={() => window.location.reload()} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded">
          Reload Page
        </button>
      </div>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout/>,
    children: [
      { path: "/", element: <Home/> },
      { path: "instructors", element: <Instructors/> },
      { path: "classes", element: <Classes/> },
      { path: "/login", element: <Login/> },
      { path: "/register", element: <Register/> },
      { 
        path: "/class/:id", 
        element: <SingleClass />, 
        loader: safeLoader,
        errorElement: <ErrorBoundary />
      },
    ]
  },
  {
    path: "/dashboard",
    element: <DashboardLayout/>,
    children: [
      // ✅ FIX: Use DashboardNavigate for index route
      { index: true, element: <DashboardNavigate/> },
      
      // Student routes
      { path: "student-cp", element: <StudentCP/> },
      { path: "enrolled-classes", element: <EnrolledClasses/> },
      { path: "my-selected", element: <SelectedClass/> },
      { path: "my-payments", element: <MyPaymentHistory/> },
      { path: "apply-instructor", element: <AsInstructor/> },
      { path: "user/payment", element: <Payment/> },
      { path: "courses-study", element: <CoursesStudy/> },

      // Instructor routes
      { path: "instructor-cp", element: <InstructorCP/> },
      { path: "add-class", element: <AddClass/> },
      { path: "my-classes", element: <MyClasses/> },
      { 
        path: "update-class/:id", 
        element: <UpdateClass/>, 
        loader: safeLoader,
        errorElement: <ErrorBoundary />
      },
      { path: "my-pending", element: <PendingCourse/> },
      { path: "my-approved", element: <ApprovedCourse/> },

      // Admin routes
      { path: "admin-home", element: <AdminHome/> },
      { path: "admin-status", element: <AdminStats/> },
      { path: "manage-class", element: <ManageClasses/> },
      { path: "manage-users", element: <ManageUsers/> },
      { 
        path: "update-user/:id", 
        element: <UpdateUser />, 
        loader: userLoader,
        errorElement: <ErrorBoundary />
      },
      { 
        path: "feedback/:id", 
        element: <FeedbackForm />, 
        loader: safeLoader,
        errorElement: <ErrorBoundary />
      }
    ]
  }
]);

export default router;