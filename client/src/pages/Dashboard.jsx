import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DashSidebar from '../components/DashSidebar';
import DashProfile from '../components/DashProfile';
import DashPosts from '../components/DashPosts';
import DashUsers from '../components/DashUsers';
import DashComments from '../components/DashComments';
import DashboardComp from '../components/DashboardComp';


const Dashboard = () => {
  const location = useLocation();
  const [tab, setTab] = useState('');
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);    // it's JS native functionality to get the current tab location
    const tabFromUrl = urlParams.get('tab');
    // console.log(tabFromUrl);

    if (tabFromUrl) {
      setTab(tabFromUrl);
    }

  }, [location.search]);

  return (
    <div className='min-h-screen flex flex-col md:flex-row'>
      <div className="md:w-56">
        {/* sidebar  */}
        <DashSidebar />
      </div>
      {/* profile and etc..  */}
      {tab === 'profile' && <DashProfile />}

      {/* Profile posts  */}
      {tab === 'posts' && <DashPosts />}

      {/* Users  */}
      {tab === 'users' && <DashUsers />}

      {/* Comments  */}
      {tab === 'comments' && <DashComments />}

      {/* Dashboard component  */}
      {tab === 'dash' && <DashboardComp />}
    </div>
  )
}

export default Dashboard