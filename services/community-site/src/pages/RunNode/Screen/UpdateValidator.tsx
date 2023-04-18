import React, { useState } from 'react';
import { Text, Button, InputField, Modal, useInterval } from '@taraxa_project/taraxa-ui';
import { blocksToDays } from '../../../utils/time';
import { useWalletPopup } from '../../../services/useWalletPopup';
import { Validator } from '../../../interfaces/Validator';
// import useValidators from 'services/community-site/src/services/useValidators';
import Title from '../../../components/Title/Title';
import CloseIcon from '../../../assets/icons/close';
import UpdateCommission, { VALIDATOR_COMMISSION_CHANGE_FREQUENCY } from '../Modal/UpdateCommission';
import useValidators from '../../../services/useValidators';
import useChain from '../../../services/useChain';

const MAX_ENDPOINT_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 100;

interface UpdateValidatorProps {
  closeEditValidator: (refreshValidators: boolean) => void;
  validator: Validator;
}

const UpdateValidator = ({ closeEditValidator, validator }: UpdateValidatorProps) => {
  const { setValidatorInfo } = useValidators();
  const { asyncCallback } = useWalletPopup();
  const { provider } = useChain();

  const [description, setDescription] = useState(validator.description || '');
  const [descriptionError, setDescriptionError] = useState('');
  const [endpoint, setEndpoint] = useState(validator.endpoint || '');
  const [endpointError, setEndpointError] = useState('');
  const [currentBlock, setCurrentBlock] = useState(0);
  const [isUpdatingCommission, setIsUpdatingCommission] = useState(false);

  const getCurrentBlock = async () => {
    if (provider) {
      setCurrentBlock(await provider.getBlockNumber());
    }
  };

  useInterval(async () => {
    getCurrentBlock();
  }, 5000);

  const canChangeCommission =
    currentBlock - Number(validator.lastCommissionChange) > VALIDATOR_COMMISSION_CHANGE_FREQUENCY;

  const submit = async (
    event: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const regex =
      /^(ftp|http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?$/;

    if (!regex.test(endpoint)) {
      setEndpointError('Website is required and must be a valid url');
      return;
    }

    if (endpoint.length > MAX_ENDPOINT_LENGTH) {
      setEndpointError(`Website is required and can be ${MAX_ENDPOINT_LENGTH} characters at most`);
      return;
    }
    if (!description || description.length > MAX_DESCRIPTION_LENGTH) {
      setDescriptionError(
        `Description is required and can be ${MAX_DESCRIPTION_LENGTH} characters at most`,
      );
      return;
    }

    setDescriptionError('');
    setEndpointError('');

    if (description && endpoint) {
      asyncCallback(
        async () => {
          return await setValidatorInfo(validator.address, description, endpoint);
        },
        () => closeEditValidator(true),
      );
    }
  };

  return (
    <div className="editValidatorScreen">
      {isUpdatingCommission && (
        <Modal
          id="signinModal"
          title="Update Commission"
          show={isUpdatingCommission}
          children={
            <UpdateCommission
              id={validator.address}
              currentCommission={validator.commission}
              onSuccess={() => {
                setIsUpdatingCommission(false);
                closeEditValidator(true);
              }}
            />
          }
          parentElementID="root"
          onRequestClose={() => {
            setIsUpdatingCommission(false);
          }}
          closeIcon={CloseIcon}
        />
      )}
      <Title
        title={
          <p>
            Edit validator{' '}
            <span style={{ wordBreak: 'break-all', fontSize: '25px' }}>{validator.address}</span>
          </p>
        }
      />
      <form onSubmit={submit}>
        <div className="detailsForm">
          <div className="inputContainer">
            <Text
              className="detailsFormLabel"
              label="Node nickname"
              variant="body2"
              color="primary"
            />
            <InputField
              error={!!descriptionError}
              helperText={descriptionError}
              type="string"
              className="detailsFormInput"
              placeholder="Give your node a memorable nickname"
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
          <div className="inputContainer">
            <Text
              className="detailsFormLabel"
              label="Link to your social"
              variant="body2"
              color="primary"
            />
            <InputField
              error={!!endpointError}
              helperText={endpointError}
              type="string"
              className="detailsFormInput"
              placeholder="Where stakers can find out more about you"
              label=""
              color="secondary"
              value={endpoint}
              variant="standard"
              onChange={(event: any) => {
                setEndpoint(event.target.value);
              }}
              margin="normal"
            />
          </div>
          <div className="inputContainer">
            <Text
              className="detailsFormLabel detailsFormUpdateLabel"
              label="Commission"
              variant="body2"
              color="primary"
            />
            <div className="detailsFormUpdate">
              <InputField
                // error={!canChangeCommission}
                error={!canChangeCommission}
                helperText={
                  canChangeCommission
                    ? ''
                    : `Your validator's last commission change was at PBFT ${
                        validator.lastCommissionChange
                      }. You need to wait until PBFT ${
                        Number(validator.lastCommissionChange) +
                        VALIDATOR_COMMISSION_CHANGE_FREQUENCY
                      } (~${blocksToDays(
                        VALIDATOR_COMMISSION_CHANGE_FREQUENCY,
                      )}) to change it again!`
                }
                type="string"
                className="detailsFormUpdateInput"
                placeholder="0%"
                label=""
                color="secondary"
                value={`${validator.commission} %`}
                disabled
                variant="standard"
                margin="normal"
              />
              <Text
                className="detailsFormHelper"
                label={
                  canChangeCommission
                    ? ''
                    : `Your validator's last commission change was at PBFT block ${
                        validator.lastCommissionChange
                      }. You need to wait until PBFT block ~${blocksToDays(
                        VALIDATOR_COMMISSION_CHANGE_FREQUENCY,
                      )} to be able to update your commission.`
                }
                variant="inherit"
                color="primary"
              />
            </div>
            <Button
              className="detailsFormUpdateBtn"
              variant="contained"
              color="secondary"
              size="small"
              label="Change Commission"
              onClick={() => {
                setIsUpdatingCommission(true);
              }}
              disabled={!canChangeCommission}
            />
          </div>
        </div>
        <div id="detailsFormButtonsContainer">
          <Button
            type="submit"
            label="Save changes"
            variant="contained"
            color="secondary"
            onClick={submit}
            disabled={description === validator.description && endpoint === validator.endpoint}
          />
          <Button
            label="Cancel"
            variant="contained"
            id="grayButton"
            onClick={() => {
              closeEditValidator(false);
            }}
          />
        </div>
      </form>
    </div>
  );
};

export default UpdateValidator;
