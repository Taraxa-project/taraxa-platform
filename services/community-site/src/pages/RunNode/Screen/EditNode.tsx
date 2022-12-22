import React, { useState } from "react";
import { Text, Button, InputField, Modal } from "@taraxa_project/taraxa-ui";
import Title from "../../../components/Title/Title";
import { useDelegationApi } from "../../../services/useApi";
import CloseIcon from "../../../assets/icons/close";
import NodeCommissionChangeIcon from "../../../assets/icons/nodeCommissionChange";
import UpdateCommission from "../Modal/UpdateCommission";
import OwnNode from "../../../interfaces/OwnNode";

interface EditNodeProps {
  closeEditNode: (refreshNodes: boolean) => void;
  node: OwnNode;
}

const EditNode = ({ closeEditNode, node }: EditNodeProps) => {
  const [name, setName] = useState(node.name || "");
  const [nameError, setNameError] = useState("");
  const [ip, setIp] = useState(node.ip || "");
  const [ipError, setIpError] = useState("");
  const [isUpdatingCommission, setIsUpdatingCommssion] = useState(false);
  const delegationApi = useDelegationApi();

  const submit = async (
    event: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setNameError("");
    setIpError("");
    const result = await delegationApi.put(
      `/nodes/${node.id}`,
      { name: name || null, ip: ip || null },
      true
    );

    if (result.success) {
      closeEditNode(true);
      return;
    }

    if (Array.isArray(result.response)) {
      result.response.forEach((errMsg) => {
        if (errMsg.startsWith("name")) {
          setNameError(errMsg.slice("name".length + 1));
        }
        if (errMsg.startsWith("ip")) {
          setIpError(errMsg.slice("ip".length + 1));
        }
      });
    }
  };

  return (
    <div className="editNodeScreen">
      {isUpdatingCommission && (
        <Modal
          id="signinModal"
          title="Update Commission"
          show={isUpdatingCommission}
          children={
            <UpdateCommission
              id={node.id}
              currentCommission={node.currentCommission}
              onSuccess={() => {
                setIsUpdatingCommssion(false);
                closeEditNode(true);
              }}
            />
          }
          parentElementID="root"
          onRequestClose={() => {
            setIsUpdatingCommssion(false);
          }}
          closeIcon={CloseIcon}
        />
      )}
      <Title title="Edit node" />
      <p className="editNodeAddressWrapper">
        <span className="editNodeAddress">{node.address}</span>
      </p>
      <form onSubmit={submit}>
        <div className="editProfileForm">
          <div className="formInputContainer">
            <div>
              <Text
                className="profile-inputLabel"
                label="Node name (optional)"
                variant="body2"
                color="primary"
              />
              <InputField
                error={!!nameError}
                helperText={nameError}
                type="string"
                className="profileInput"
                label=""
                color="secondary"
                value={name}
                variant="standard"
                onChange={(event: any) => {
                  setName(event.target.value);
                }}
                margin="normal"
              />
            </div>
          </div>
          <div className="formInputContainer">
            <div>
              <Text
                className="profile-inputLabel"
                label="Node IP (optional)"
                variant="body2"
                color="primary"
              />
              <InputField
                error={!!ipError}
                helperText={ipError}
                type="string"
                className="profileInput"
                label=""
                color="secondary"
                value={ip}
                variant="standard"
                onChange={(event: any) => {
                  setIp(event.target.value);
                }}
                margin="normal"
              />
            </div>
          </div>
          {node.type === "mainnet" && (
            <div className="formInputContainer">
              <div className="commissionWrapper">
                <Text
                  className="profile-inputLabel"
                  label="Commission"
                  variant="body2"
                  color="primary"
                />
                {node.hasPendingCommissionChange ? (
                  <div className="commissionDisplay">
                    <NodeCommissionChangeIcon />{" "}
                    <span className="commissionDisplayPendingChange">
                      {node.currentCommission}% ➞ {node.pendingCommission}%
                    </span>
                  </div>
                ) : (
                  <div className="commissionDisplay">
                    {node.currentCommission}%
                  </div>
                )}

                <Button
                  className="commissionUpdate"
                  variant="outlined"
                  color="secondary"
                  size="small"
                  label="Update"
                  onClick={() => {
                    setIsUpdatingCommssion(true);
                  }}
                  disabled={node.hasPendingCommissionChange}
                />
              </div>
            </div>
          )}
        </div>
        <div id="buttonsContainer">
          <Button
            type="submit"
            label="Save changes"
            variant="contained"
            color="secondary"
            onClick={submit}
          />
          <Button
            label="Cancel"
            variant="contained"
            id="grayButton"
            onClick={() => {
              closeEditNode(false);
            }}
          />
        </div>
      </form>
    </div>
  );
};

export default EditNode;
