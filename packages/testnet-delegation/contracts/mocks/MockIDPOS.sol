// (c) 2023-2024, Taraxa, Inc. All rights reserved.
// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface MockIDPOS {
    event Delegated(address indexed delegator, address indexed validator, uint256 amount);
    event Undelegated(address indexed delegator, address indexed validator, uint256 amount);
    event UndelegateConfirmed(address indexed delegator, address indexed validator, uint256 amount);
    event UndelegateCanceled(address indexed delegator, address indexed validator, uint256 amount);
    event Redelegated(address indexed delegator, address indexed from, address indexed to, uint256 amount);
    event RewardsClaimed(address indexed account, address indexed validator);
    event CommissionRewardsClaimed(address indexed account, address indexed validator);
    event CommissionSet(address indexed validator, uint16 comission);
    event ValidatorRegistered(address indexed validator);
    event ValidatorInfoSet(address indexed validator);

    struct ValidatorBasicInfo {
        // Total number of delegated tokens to the validator
        uint256 total_stake;
        // Validator's reward from delegators rewards commission
        uint256 commission_reward;
        // Validator's commission - max value 1000(precision up to 0.1%)
        uint16 commission;
        // Block number of last commission change
        uint64 last_commission_change;
        // Validator's owner account
        address owner;
        // Validators description/name
        string description;
        // Validators website endpoint
        string endpoint;
    }

    // Retun value for getValidators method
    struct ValidatorData {
        address account;
        ValidatorBasicInfo info;
    }

    struct UndelegateRequest {
        // Block num, during which UndelegateRequest can be confirmed - during creation it is
        // set to block.number + STAKE_UNLOCK_PERIOD
        uint256 eligible_block_num;
        // Amount of tokens to be unstaked
        uint256 amount;
    }

    // Delegator data
    struct DelegatorInfo {
        // Number of tokens that were staked
        uint256 stake;
        // Number of tokens that were rewarded
        uint256 rewards;
    }

    // Retun value for getDelegations method
    struct DelegationData {
        // Validator's(in case of getDelegations) or Delegator's (in case of getValidatorDelegations) account address
        address account;
        // Delegation info
        DelegatorInfo delegation;
    }

    // Retun value for getUndelegations method
    struct UndelegationData {
        // Number of tokens that were locked
        uint256 stake;
        // block number when it will be unlocked
        uint64 block;
        // Validator address
        address validator;
        // Flag if validator still exists - in case he has 0 stake and 0 rewards, validator is deleted from memory & db
        bool validator_exists;
    }

    // Delegates tokens to specified validator
    function delegate(address validator) external payable;

    // Registers new validator - validator also must delegate to himself, he can later withdraw his delegation
    function registerValidator(
        address validator,
        bytes memory proof,
        bytes memory vrf_key,
        uint16 commission,
        string calldata description,
        string calldata endpoint
    ) external payable;

    // Returns validator basic info (everything except list of his delegators)
    function getValidator(address validator) external view returns (ValidatorBasicInfo memory validator_info);

    // Undelegates <amount> of tokens from specified validator - creates undelegate request
    function undelegate(address validator, uint256 amount) external;
}
