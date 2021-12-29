/* eslint-disable no-console */
import React, { useState } from 'react';
import { Text, Button, InputField } from '@taraxa_project/taraxa-ui';
import { useDelegationApi } from '../../../services/useApi';

interface Profile {
  description: string;
  website: string;
  social: string;
}
interface CreateOrEditProfileProps {
  closeCreateOrEditProfile: (refreshProfile: boolean) => void;
  action: 'create' | 'edit';
  profile?: Profile;
}

const CreateOrEditProfile = ({
  closeCreateOrEditProfile,
  action,
  profile,
}: CreateOrEditProfileProps) => {
  const [description, setDescription] = useState(profile ? profile.description : '');
  const [descriptionError, setDescriptionError] = useState('');
  const [website, setWebsite] = useState(profile ? profile.website : '');
  const [social, setSocial] = useState(profile ? profile.social : '');
  const delegationApi = useDelegationApi();

  const submit = async (
    event: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!description) {
      setDescriptionError("can't be empty");
      return;
    }
    setDescriptionError('');

    const payload = { description, social, website };
    let result;
    if (action === 'create') {
      result = await delegationApi.post('/profiles', payload, true);
    } else {
      result = await delegationApi.put('/profiles', payload, true);
    }

    if (result.success) {
      closeCreateOrEditProfile(true);
    }
  };

  return (
    <>
      <Text
        label={action === 'create' ? 'Create profile' : 'Update profile'}
        variant="h6"
        color="primary"
      />
      <form onSubmit={submit}>
        <div className="editProfileForm">
          <div className="formInputContainer">
            <div>
              <Text
                className="profile-inputLabel"
                label="Description"
                variant="body2"
                color="primary"
              />
              <InputField
                error={!!descriptionError}
                helperText={descriptionError}
                type="string"
                className="profileInput"
                label=""
                color="secondary"
                value={description}
                variant="standard"
                onChange={(event: any) => {
                  setDescription(event.target.value);
                }}
                margin="normal"
              />
            </div>
          </div>
          <div className="formInputContainer">
            <div>
              <Text
                className="profile-inputLabel"
                label="Website (optional)"
                variant="body2"
                color="primary"
              />
              <InputField
                type="string"
                className="profileInput"
                label=""
                color="secondary"
                value={website}
                variant="standard"
                onChange={(event: any) => {
                  setWebsite(event.target.value);
                }}
                margin="normal"
              />
            </div>
          </div>
          <div className="formInputContainer">
            <div>
              <Text
                className="profile-inputLabel"
                label="Social (optional)"
                variant="body2"
                color="primary"
              />
              <InputField
                type="string"
                className="profileInput"
                label=""
                color="secondary"
                value={social}
                variant="standard"
                onChange={(event: any) => {
                  setSocial(event.target.value);
                }}
                margin="normal"
              />
            </div>
          </div>
        </div>
        <div id="buttonsContainer">
          <Button
            type="submit"
            label={action === 'create' ? 'Create profile' : 'Update profile'}
            variant="contained"
            color="secondary"
            onClick={submit}
          />
          <Button
            label="Cancel"
            variant="contained"
            id="grayButton"
            onClick={() => {
              closeCreateOrEditProfile(false);
            }}
          />
        </div>
      </form>
    </>
  );
};

export type { Profile };
export default CreateOrEditProfile;
