// router.jsx - FIXED VERSION
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

// ✅ SAFE LOADER FUNCTION
const safeLoader = async ({ params }) => {
  try {
    console.log('🔍 Loader fetching data for ID:', params.id);
    
    if (!params.id || params.id === 'undefined') {
      console.error('❌ Invalid ID in loader:', params.id);
      return { 
        success: false, 
        error: 'Invalid class ID',
        data: null 
      };
    }

    // Coba endpoint utama dulu
    let response = await fetch(`https://frasa-backend.vercel.app/api/class-with-modules/${params.id}`);
    
    if (!response.ok) {
      console.log('🔄 Fallback to basic class endpoint...');
      // Fallback ke endpoint basic
      response = await fetch(`https://frasa-backend.vercel.app/api/class/${params.id}`);
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Loader data received:', data);

    // Pastikan return value konsisten
    return {
      success: true,
      data: data.data || data, // Handle both {data: ...} and direct object
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Loader error:', error);
    return {
      success: false,
      error: error.message,
      data: null,
      timestamp: new Date().toISOString()
    };
  }
};

// ✅ SAFE USER LOADER
const userLoader = async ({ params }) => {
  try {
    console.log('🔍 User loader fetching for ID:', params.id);
    
    if (!params.id || params.id === 'undefined') {
      return {
        success: false,
        error: 'Invalid user ID',
        data: null
      };
    }

    const response = await fetch(`https://frasa-backend.vercel.app/api/users/${params.id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data || data,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ User loader error:', error);
    return {
      success: false,
      error: error.message,
      data: null,
      timestamp: new Date().toISOString()
    };
  }
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout/>,
    children: [
      {
        path: "/",
        element: <Home/>
      },
      {
        path: "instructors",
        element: <Instructors/>
      },
      {
        path: "classes",
        element: <Classes/>
      },
      {
        path: "/login",
        element: <Login/>
      },
      {
        path: "/register",
        element: <Register/>
      },
      {
        path: "/class/:id",
        element: <SingleClass />,
        loader: safeLoader, // ✅ Gunakan safe loader
        errorElement: <ErrorBoundary /> // ✅ Tambahkan error boundary
      },
    ]
  },
  {
    path: "/dashboard",
    element: <DashboardLayout/>,
    children: [
      {
        index: true,
        element: <Dashboard/>
      },

      // student routes
      {
        path: "student-cp",
        element: <StudentCP/>
      },
      {
        path: "enrolled-classes",
        element: <EnrolledClasses/>
      },
      {
        path: "my-selected",
        element: <SelectedClass/>
      },
      {
        path: "my-payments",
        element: <MyPaymentHistory/>
      },
      {
        path: "apply-instructor",
        element: <AsInstructor/>
      },
      {
        path: "user/payment",
        element: <Payment/>
      },
      {
        path: "courses-study",
        element: <CoursesStudy/>
      },

      // instructor route
      {
        path: "instructor-cp",
        element: <InstructorCP/>
      },
      {
        path: "add-class",
        element: <AddClass/>
      },
      {
        path: "my-classes",
        element: <MyClasses/>
      },
      {
        path: "update-class/:id",
        element: <UpdateClass/>,
        loader: safeLoader, // ✅ Gunakan safe loader
        errorElement: <ErrorBoundary />
      },
      {
        path: "my-pending",
        element: <PendingCourse/>
      },
      {
        path: "my-approved",
        element: <ApprovedCourse/>
      },

      // Admin Router
      {
        path: "admin-home",
        element: <AdminHome/>
      },
      {
        path: "admin-status",
        element: <AdminStats/>
      },
      {
        path: "manage-class",
        element: <ManageClasses/>
      },
      {
        path: "manage-users",
        element: <ManageUsers/>
      },
      {
        path: "update-user/:id",
        element: <UpdateUser />,
        loader: userLoader, // ✅ Gunakan user loader
        errorElement: <ErrorBoundary />
      },
      {
        path: "feedback/:id",
        element: <FeedbackForm />,
        loader: safeLoader, // ✅ Gunakan safe loader
        errorElement: <ErrorBoundary />
      }
    ]
  }
]);

// ✅ ERROR BOUNDARY COMPONENT
const ErrorBoundary = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className="text-6xl mb-4">😵</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h1>
        <p className="text-gray-600 mb-6">
          We encountered an error while loading this page. Please try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded transition duration-200"
        >
          Reload Page
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="ml-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded transition duration-200"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default router;