import React, { useState } from "react";
import { Text, Button, InputField } from "@taraxa_project/taraxa-ui";
import Title from "../../../components/Title/Title";
import { useDelegationApi } from "../../../services/useApi";

interface Profile {
  description: string;
  website: string;
  social: string;
}
interface CreateOrEditProfileProps {
  closeCreateOrEditProfile: (refreshProfile: boolean) => void;
  action: "create" | "edit";
  profile?: Profile;
}

const CreateOrEditProfile = ({
  closeCreateOrEditProfile,
  action,
  profile,
}: CreateOrEditProfileProps) => {
  const [description, setDescription] = useState(
    profile ? profile.description : ""
  );
  const [descriptionError, setDescriptionError] = useState("");
  const [website, setWebsite] = useState(profile ? profile.website : "");
  const [websiteError, setWebsiteError] = useState("");
  const [social, setSocial] = useState(profile ? profile.social : "");
  const [socialError, setSocialError] = useState("");
  const delegationApi = useDelegationApi();

  const submit = async (
    event: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setDescriptionError("");

    const payload = { description, social, website };
    let result;
    if (action === "create") {
      result = await delegationApi.post("/profiles", payload, true);
    } else {
      result = await delegationApi.put("/profiles", payload, true);
    }

    if (result.success) {
      closeCreateOrEditProfile(true);
      return;
    }

    if (Array.isArray(result.response)) {
      result.response.forEach((errMsg) => {
        if (errMsg.startsWith("description")) {
          setDescriptionError(errMsg.slice("description".length + 1));
        }
        if (errMsg.startsWith("website")) {
          setWebsiteError(errMsg.slice("website".length + 1));
        }
        if (errMsg.startsWith("social")) {
          setSocialError(errMsg.slice("social".length + 1));
        }
      });
    }
  };

  return (
    <>
      <Title
        title={action === "create" ? "Create profile" : "Update profile"}
      />
      <form onSubmit={submit}>
        <div className="editProfileForm">
          <div className="formInputContainer">
            <div>
              <Text
                className="profile-inputLabel"
                label="Description (optional)"
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
                error={!!websiteError}
                helperText={websiteError}
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
                error={!!socialError}
                helperText={socialError}
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
            label={action === "create" ? "Create profile" : "Update profile"}
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
