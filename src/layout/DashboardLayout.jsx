// /src/layout/DashboardLayout.jsx - FINAL FIXED VERSION dengan Auth Protection
import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import useUser from '../hooks/useUser';
import { BiHomeAlt, BiLogInCircle, BiSelectMultiple } from "react-icons/bi";
import { FaHome, FaUsers } from "react-icons/fa";
import { IoSchoolSharp } from "react-icons/io5";
import { IoMdDoneAll } from "react-icons/io";
import { BsFillPostcardFill } from 'react-icons/bs';
import { SiGoogleclassroom, SiInstructure } from 'react-icons/si';
import { TbBrandAppleArcade } from 'react-icons/tb';
import { MdExplore, MdOfflineBolt, MdPayments, MdPendingActions } from 'react-icons/md';
import { GiFigurehead } from 'react-icons/gi';
import { NavLink, useNavigate, Link, Outlet } from 'react-router-dom';
import Swal from 'sweetalert2';
import Scroll from '../hooks/useScroll';
import { HashLoader } from 'react-spinners';
import DebugRole from '../components/DebugRole';

const adminNavItems = [
  { to: "/dashboard/admin-home", icon: <BiHomeAlt className="text-2xl" />, label: "Beranda Admin" },
  { to: "/dashboard/manage-users", icon: <FaUsers className="text-2xl" />, label: "Kelola Pengguna" },
  { to: "/dashboard/manage-class", icon: <BsFillPostcardFill className="text-2xl" />, label: "Kelola Kelas" },
  { to: "/dashboard/manage-applications", icon: <TbBrandAppleArcade className="text-2xl" />, label: "Aplikasi" }
];

const instructorNavItem = [
  { to: "/dashboard/instructor-cp", icon: <FaHome className="text-2xl"/>, label: "Beranda"},
  { to: "/dashboard/add-class", icon: <MdExplore className="text-2xl"/>, label: "Tambah Kelas"},
  { to: "/dashboard/my-classes", icon: <IoSchoolSharp className="text-2xl"/>, label: "Kelas Saya"},
  { to: "/dashboard/my-pending", icon: <MdPendingActions className="text-2xl"/>, label: "Kelas Tertunda"},
  { to: "/dashboard/my-approved", icon: <IoMdDoneAll className="text-2xl"/>, label: "Kelas Disetujui"},
];

const students = [
  {to: "/dashboard/student-cp", icon: <BiHomeAlt className="text-2xl" />, label: "Beranda"},
  {to: "/dashboard/enrolled-classes", icon: <SiGoogleclassroom className="text-2xl" />,label: "Kelas Saya"},
  {to: "/dashboard/my-selected", icon: <BiSelectMultiple className="text-2xl" />, label: "Kelas Dipilih"},
  {to: "/dashboard/my-payments", icon: <MdPayments className="text-2xl" />, label: "Riwayat Pembayaran"},
  {to: "/dashboard/apply-instructor", icon: <SiInstructure className="text-2xl" />, label: "Daftar Instruktur"}
];

const lastMenuItems = [
  {
    to: "/",
    icon: <BiHomeAlt className="text-2xl" />,
    label: "Beranda Utama",
  },
  { 
    to: "/trending", 
    icon: <MdOfflineBolt className="text-2xl" />, 
    label: "Trending" 
  },
  { 
    to: "/browse", 
    icon: <GiFigurehead className="text-2xl" />, 
    label: "Mengikuti" 
  },
];

const DashboardLayout = () => {
  const [open, setOpen] = useState(true);
  const { logout, user: firebaseUser, loading: authLoading, authInitialized } = useAuth();
  const { currentUser, isLoading: userLoading, refreshUser } = useUser();
  const role = currentUser?.role?.toLowerCase() || '';
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // ✅ FIX: Proper auth check dengan timeout fallback
  useEffect(() => {
    console.log('🔐 DashboardLayout - Auth Check:', {
      firebaseUser: firebaseUser?.email,
      authLoading,
      authInitialized,
      currentUser: currentUser?.email,
      userLoading,
      role
    });

    // ✅ PENTING: Wait untuk authInitialized dulu
    if (!authInitialized) {
      console.log('⏳ Waiting untuk Firebase auth initialization...');
      return;
    }

    // ✅ If Firebase not authenticated, redirect to login
    if (!firebaseUser) {
      console.warn('❌ Firebase user tidak ditemukan - redirecting to login');
      setIsCheckingAuth(false);
      navigate('/login', { replace: true });
      return;
    }

    // ✅ Both auth checks passed
    console.log('✅ Auth verification passed');
    setIsCheckingAuth(false);
  }, [firebaseUser, authInitialized, navigate]);

  useEffect(() => {
    console.log('📊 DashboardLayout - Current Role:', role);
    console.log('📊 DashboardLayout - User Data:', currentUser);
  }, [role, currentUser]);

  const handleLogOut = async () => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Anda akan keluar dari sistem!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Keluar!"
    });

    if (result.isConfirmed) {
      try {
        await logout();
        localStorage.removeItem('token');
        localStorage.removeItem('access-token');
        
        Swal.fire({
          title: "Berhasil Keluar",
          text: "Anda telah keluar dari sistem.",
          icon: "success"
        });
        
        navigate("/login", { replace: true });
      } catch (err) {
        console.error('❌ Logout error:', err);
        Swal.fire({
          title: "Error",
          text: "Gagal keluar dari sistem",
          icon: "error"
        });
      }
    }
  };

  // ✅ FIX: Show loading selama auth check berlangsung
  if (isCheckingAuth || !authInitialized || authLoading) {
    return (
      <div className='flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
        <div className="text-center">
          <HashLoader color="#36d7b7" size={50}/>
          <p className="text-gray-600 font-medium mt-4">Memverifikasi akses...</p>
          <p className="text-gray-500 text-sm mt-1">Harap tunggu sebentar</p>
        </div>
      </div>
    );
  }

  // ✅ FIX: Jika user belum ter-load tapi sudah di-auth, masih tampilkan loading
  if (userLoading) {
    return (
      <div className='flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
        <div className="text-center">
          <HashLoader color="#36d7b7" size={50}/>
          <p className="text-gray-600 font-medium mt-4">Memuat data pengguna...</p>
          <p className="text-gray-500 text-sm mt-1">Harap tunggu sebentar</p>
        </div>
      </div>
    );
  }

  // ✅ FIX: Jika tidak ada currentUser, redirect ke login
  if (!currentUser) {
    console.error('❌ currentUser tidak ditemukan - redirecting ke login');
    navigate('/login', { replace: true });
    return null;
  }

  // ✅ FIX: Jika tidak ada Firebase user, redirect ke login
  if (!firebaseUser) {
    console.error('❌ firebaseUser tidak ditemukan - redirecting ke login');
    navigate('/login', { replace: true });
    return null;
  }

  const renderSidebarContent = () => {
    switch(role) {
      case 'admin':
        return (
          <ul className="pt-6">
            <p className={`ml-3 text-gray-500 ${!open && "hidden"}`}>
              <small>MENU ADMIN</small>
            </p>
            {adminNavItems.map((menuItem, index) => (
              <li key={index} className="mb-2">
                <NavLink
                  to={menuItem.to}
                  className={({ isActive }) =>
                    `flex ${
                      isActive ? "bg-primary text-white" : "text-[#413F44]"
                    } duration-150 rounded-md p-2 cursor-pointer hover:bg-secondary hover:text-white font-bold text-sm items-center gap-x-4`
                  }
                >
                  {menuItem.icon}
                  <span className={`${!open && "hidden"} origin-left duration-200`}>
                    {menuItem.label}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        );

      case 'instructor':
        return (
          <ul className="pt-6">
            <p className={`ml-3 text-gray-500 ${!open && "hidden"}`}>
              <small>MENU INSTRUKTUR</small>
            </p>
            {instructorNavItem.map((menuItem, index) => (
              <li key={index} className="mb-2">
                <NavLink
                  to={menuItem.to}
                  className={({ isActive }) =>
                    `flex ${
                      isActive ? "bg-primary text-white" : "text-[#413F44]"
                    } duration-150 rounded-md p-2 cursor-pointer hover:bg-secondary hover:text-white font-bold text-sm items-center gap-x-4`
                  }
                >
                  {menuItem.icon}
                  <span className={`${!open && "hidden"} origin-left duration-200`}>
                    {menuItem.label}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        );

      case 'user':
      case 'student':
        return (
          <ul className="pt-6">
            <p className={`ml-3 text-gray-500 ${!open && "hidden"}`}>
              <small>MENU SISWA</small>
            </p>
            {students.map((menuItem, index) => (
              <li key={index} className="mb-2">
                <NavLink
                  to={menuItem.to}
                  className={({ isActive }) =>
                    `flex ${
                      isActive ? "bg-primary text-white" : "text-[#413F44]"
                    } duration-150 rounded-md p-2 cursor-pointer hover:bg-secondary hover:text-white font-bold text-sm items-center gap-x-4`
                  }
                >
                  {menuItem.icon}
                  <span className={`${!open && "hidden"} origin-left duration-200`}>
                    {menuItem.label}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        );

      default:
        console.warn(`⚠️ Unknown role: ${role}, showing default student menu`);
        return (
          <ul className="pt-6">
            <p className={`ml-3 text-gray-500 ${!open && "hidden"}`}>
              <small>MENU</small>
            </p>
            {students.map((menuItem, index) => (
              <li key={index} className="mb-2">
                <NavLink
                  to={menuItem.to}
                  className={({ isActive }) =>
                    `flex ${
                      isActive ? "bg-primary text-white" : "text-[#413F44]"
                    } duration-150 rounded-md p-2 cursor-pointer hover:bg-secondary hover:text-white font-bold text-sm items-center gap-x-4`
                  }
                >
                  {menuItem.icon}
                  <span className={`${!open && "hidden"} origin-left duration-200`}>
                    {menuItem.label}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        );
    }
  };

  return (
    <div className='flex'>
      {/* Sidebar */}
      <div className={`${open ? "w-72 overflow-y-auto" : "w-[90px] overflow-auto"} bg-white h-screen p-5 md:block hidden pt-8 relative duration-300`}>
        <div className='flex gap-x-4 items-center'>
          <img 
            onClick={() => setOpen(!open)} 
            src="/frasa-logo.png" 
            alt="Logo" 
            className={`cursor-pointer h-[40px] duration-500 ${open && "rotate-[360deg]"}`}
          />
          <Link to="/">
            <h1 
              onClick={() => setOpen(!open)} 
              className={`text-dark-primary cursor-pointer font-bold origin-left text-xl duration-200 ${!open && "scale-0"}`}
            >
              Frasa ID
            </h1>
          </Link>
        </div>

        {renderSidebarContent()}

        <ul className='pt-6 border-t mt-6'>
          <p className={`ml-3 text-gray-500 uppercase mb-3 ${!open && "hidden"}`}>
            <small>Link</small>
          </p>
          {lastMenuItems.map((menuItem, index) => (
            <li key={index} className="mb-2">
              <NavLink
                to={menuItem.to}
                className={({ isActive }) =>
                  `flex ${
                    isActive ? "bg-primary text-white" : "text-[#413F44]"
                  } duration-150 rounded-md p-2 cursor-pointer hover:bg-secondary hover:text-white font-bold text-sm items-center gap-x-4`
                }
              >
                {menuItem.icon}
                <span className={`${!open && "hidden"} origin-left duration-200`}>
                  {menuItem.label}
                </span>
              </NavLink>
            </li>
          ))}
          <li>
            <button                        
              onClick={handleLogOut}
              className="flex duration-150 rounded-md p-2 cursor-pointer hover:bg-secondary hover:text-white font-bold text-sm items-center gap-x-4 w-full text-left"
            >
              <BiLogInCircle className='text-2xl'/>
              <span className={`${!open && "hidden"} origin-left duration-200`}>
                Keluar
              </span>
            </button>
          </li>
        </ul>
      </div>
      
      {/* Main Content */}
      <div className='h-screen overflow-y-auto px-8 flex-1'>
        <Scroll/>
        <Outlet/>
        <DebugRole />
      </div>
    </div>
  );
};

export default DashboardLayout;