import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Modal } from '@taraxa_project/taraxa-ui';
import { useMediaQuery } from 'react-responsive';

import CloseIcon from '../../assets/icons/close';

import { useAuth } from '../../services/useAuth';

import Title from '../../components/Title/Title';

import KYC from './Modal/KYC';
import KYCSuccess from './Modal/KYCSuccess';
import KYCError from './Modal/KYCError';

import ViewProfile from './ViewProfile';
import EditProfile from './EditProfile';

import './profile.scss';

interface ProfileModalProps {
  isKYCModalOpen: boolean;
  modalContent: string;
  setIsKYCModalOpen: (isKYCModalOpen: boolean) => void;
  setModalContent: (modalContent: string) => void;
}

function ProfileModal({
  isKYCModalOpen,
  modalContent,
  setIsKYCModalOpen,
  setModalContent,
}: ProfileModalProps) {
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });

  const resetModal = () => {
    setModalContent('kyc');
    setIsKYCModalOpen(false);
  };

  let content = <KYC onSuccess={resetModal} />;

  if (modalContent === 'kyc-success') {
    content = <KYCSuccess onSuccess={resetModal} />;
  }

  if (modalContent === 'kyc-error') {
    content = <KYCError onSuccess={resetModal} />;
  }

  return (
    <Modal
      id={isMobile ? 'mobile-signinModal' : 'signinModal'}
      title="Submit KYC"
      parentElementID="root"
      show={isKYCModalOpen}
      children={content}
      onRequestClose={resetModal}
      closeIcon={CloseIcon}
    />
  );
}

const Profile = () => {
  const auth = useAuth();
  const location = useLocation();
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });

  const isLoggedIn = auth.user?.id;

  const [editProfile, setEditProfile] = useState(false);
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('kyc');

  useEffect(() => {
    const getUser = () => auth.refreshUser!();
    getUser();
  }, []);

  useEffect(() => {
    const params = location.search
      .substr(1)
      .toString()
      .split('&')
      .reduce((previous: { [string: string]: string }, current: string) => {
        const [key, value] = current.split('=');
        previous[key] = value;
        return previous;
      }, {});

    if (params.transactionStatus) {
      setIsKYCModalOpen(true);
      if (params.transactionStatus === 'SUCCESS') {
        setModalContent('kyc-success');
      }

      if (params.transactionStatus !== 'SUCCESS') {
        setModalContent('kyc-error');
      }
    }
  }, []);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className={isMobile ? 'mobile-profile' : 'profile'}>
      <div className="profile-content">
        <Title title={editProfile ? 'My profile - settings' : 'My profile'} />
        <ProfileModal
          isKYCModalOpen={isKYCModalOpen}
          modalContent={modalContent}
          setIsKYCModalOpen={setIsKYCModalOpen}
          setModalContent={setModalContent}
        />
        {!editProfile ? (
          <ViewProfile
            openEditProfile={() => setEditProfile(true)}
            openKYCModal={() => setIsKYCModalOpen(true)}
          />
        ) : (
          <EditProfile closeEditProfile={() => setEditProfile(false)} />
        )}
      </div>
    </div>
  );
};

export default Profile;
