// (c) 2023-2024, Taraxa, Inc. All rights reserved.
// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "./IDPOS.sol";

interface IDelegation {
    event InternalValidatorAdded(address indexed wallet);
    event InternalValidatorDelegationIncreased(address indexed validatorAddress, uint256 delegatedValue);
    event ExternalValidatorRegistered(address indexed wallet, address indexed delegator, uint256 tokens);

    function getExternalValidator(
        address validator
    ) external view returns (IDPOS.ValidatorBasicInfo memory validatorInfo);

    function getExternalValidatorsByOwner(address owner) external view returns (address[] memory extValidators);

    function getOwnerOfExternalValidator(address validator) external view returns (address owner);

    function addInternalValidator(address newValidator) external;

    function registerExternalValidator(
        address validator,
        bytes memory proof,
        bytes memory vrfKey,
        uint16 commission,
        string calldata description,
        string calldata endpoint
    ) external payable;
}
