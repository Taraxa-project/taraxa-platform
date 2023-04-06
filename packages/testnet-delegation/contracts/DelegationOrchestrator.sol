// (c) 2022-2023, Taraxa, Inc. All rights reserved.
// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./interfaces/IDelegation.sol";
import "./interfaces/IDPOS.sol"; // import the DPOS contract interface
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract DelegationOrchestrator is IDelegation, Ownable, Pausable {
    using Address for address;
    uint256 MIN_REGISTRATION_DELEGATION = 1000000000000000000000;
    IDPOS private dpos;

    address[] internalValidators;
    mapping(address => bool) validatorRegistered;

    receive() external payable {}

    constructor(address[] memory _internalValidators, address _dpos) payable {
        internalValidators = _internalValidators;
        dpos = IDPOS(_dpos);
        for (uint256 i = 0; i < _internalValidators.length; ++i) {
            validatorRegistered[_internalValidators[i]] = true;
        }
        require(
            validatorRegistered[_internalValidators[_internalValidators.length - 1]] == true,
            "Failed to set own validators"
        );
    }

    function addInternalValidator(address _newValidator) external onlyOwner {
        require(validatorRegistered[_newValidator] == false, "Validator already registered");
        internalValidators.push(_newValidator);
        require(
            internalValidators[internalValidators.length - 1] == _newValidator,
            "Failed to add validator to own validators array"
        );
        validatorRegistered[_newValidator] = true;
        emit InternalValidatorAdded(_newValidator);
    }

    function registerExternalValidator(
        address _validator,
        bytes memory _proof,
        bytes memory _vrf_key,
        uint16 _commission,
        string calldata _description,
        string calldata _endpoint
    ) external payable override {
        uint256 delegationValue = 2 * msg.value;
        require(validatorRegistered[_validator] == false, "Validator already registered");
        require(msg.value >= MIN_REGISTRATION_DELEGATION, "Sent value less than minimal delegation for registration");
        require(
            address(this).balance >= delegationValue * internalValidators.length,
            "Insufficient funds in contract for testnet rebalance"
        );

        // Delegate 2*tokens to our validators
        for (uint256 i = 0; i < internalValidators.length; ++i) {
            dpos.delegate{value: delegationValue}(internalValidators[i]);
            emit InternalValidatorDelegationIncreased(internalValidators[i], delegationValue);
        }

        dpos.registerValidator{value: msg.value}(_validator, _proof, _vrf_key, _commission, _description, _endpoint);
        emit ExternalValidatorRegistered(_validator, msg.sender, msg.value);
    }
}
