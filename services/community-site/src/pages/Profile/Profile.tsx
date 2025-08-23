import React, { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';

import { useAuth } from '../../services/useAuth';

import Title from '../../components/Title/Title';

import ViewProfile from './ViewProfile';
import EditProfile from './EditProfile';

import './profile.scss';

const Profile = () => {
  const auth = useAuth();
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });

  const isLoggedIn = auth.user?.id;

  const [editProfile, setEditProfile] = useState(false);

  useEffect(() => {
    const getUser = () => auth.refreshUser!();
    getUser();
  }, []);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className={isMobile ? 'mobile-profile' : 'profile'}>
      <div className="profile-content">
        <Title title={editProfile ? 'My profile - settings' : 'My profile'} />
        {!editProfile ? (
          <ViewProfile openEditProfile={() => setEditProfile(true)} />
        ) : (
          <EditProfile closeEditProfile={() => setEditProfile(false)} />
        )}
      </div>
    </div>
  );
};

export default Profile;
