import React, { useState, useEffect } from 'react';
import UserProfile from './UserProfile/UserProfile';
import UserProfileInfo from './ProfileForm/UserProfileInfo';
import OrderTab from './OrderTab/OrderTab';
import VoucherTab from './VoucherTab/VoucherTab';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  
  useEffect(() => {
    const hash = window.location.hash.substring(1); // Bỏ dấu #
    if (hash === 'orders') {
      setActiveTab('orders');
    } else if (hash === 'vouchers') {
      setActiveTab('vouchers');
    } else {
      setActiveTab('profile'); // Mặc định là profile nếu hash không khớp
    }
  }, []);
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    window.location.hash = tab; // Cập nhật URL hash
  };
  
  return (
    <UserProfile activeTab={activeTab} onTabChange={handleTabChange}>
      {activeTab === 'profile' && <UserProfileInfo />}
      {activeTab === 'orders' && <OrderTab />}
      {activeTab === 'vouchers' && <VoucherTab />}
    </UserProfile>
  );
};

export default ProfilePage; 