import React from 'react';
import useUser from '../../hooks/useUser';
import { HashLoader } from 'react-spinners';
import DashboardNavigate from '../../routes/DashboardNavigate';

const Dashboard = () => {
  const { currentUser, isLoading } = useUser();
  const role = currentUser?.role;

  console.log('📊 Dashboard Debug:');
  console.log('Current User:', currentUser);
  console.log('Role:', role);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <HashLoader color="#36d7b7" size={50}/>
      </div>
    );
  }

  // KIRIM USER KE DASHBOARDNAVIGATE - INI YANG PENTING!
  return (
    <div>
      <DashboardNavigate user={currentUser} />
    </div>
  );
};

export default Dashboard;