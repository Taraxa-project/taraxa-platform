// (c) 2023-2024, Taraxa, Inc. All rights reserved.
// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IDPOS {
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

    // Undelegates <amount> of tokens from specified validator - creates undelegate request
    function undelegate(address validator, uint256 amount) external;

    // Confirms undelegate request
    function confirmUndelegate(address validator) external;

    // Cancel undelegate request
    function cancelUndelegate(address validator) external;

    // Redelegates <amount> of tokens from one validator to the other
    function reDelegate(address validator_from, address validator_to, uint256 amount) external;

    // Claims staking rewards from <validator>
    function claimRewards(address validator) external;

    /**
     * @notice Claims staking rewards from all validators (limited by batch) that caller has delegated to
     *
     * @param batch Batch number - there is a limit of 10 validators per batch that delegator can claim rewards from in single tranaction
     * @return end  Flag if there are no more validators left that delegator can claim rewards from
     **/
    function claimAllRewards(uint32 batch) external returns (bool end);

    // Claims tokens from validator's commission rewards
    function claimCommissionRewards(address validator) external;

    // Registers new validator - validator also must delegate to himself, he can later withdraw his delegation
    function registerValidator(
        address validator,
        bytes memory proof,
        bytes memory vrf_key,
        uint16 commission,
        string calldata description,
        string calldata endpoint
    ) external payable;

    /**
     * @notice Sets some of the static validator details.
     *
     * @param description   New description (e.g name, short purpose description, etc...)
     * @param endpoint      New endpoint, might be a validator's website
     **/
    function setValidatorInfo(address validator, string calldata description, string calldata endpoint) external;

    // Sets validator's commission [%] * 100 so 1% is 100 & 10% is 1000
    function setCommission(address validator, uint16 commission) external;

    // TODO: these 4 methods below can be all replaced by "getValidator" and "getValidators" calls, but it should be
    //       considered in terms of performance, etc...

    // Returns true if acc is eligible validator, otherwise false
    function isValidatorEligible(address validator) external view returns (bool);

    // Returns all validators eligible votes counts
    function getTotalEligibleVotesCount() external view returns (uint64);

    // Returns specified validator eligible votes count
    function getValidatorEligibleVotesCount(address validator) external view returns (uint64);

    // Returns validator basic info (everything except list of his delegators)
    function getValidator(address validator) external view returns (ValidatorBasicInfo memory validator_info);

    /**
     * @notice Returns list of registered validators
     *
     * @param batch        Batch number to be fetched. If the list is too big it cannot return all validators in one call. Instead, users are fetching batches of 100 account at a time
     *
     * @return validators  Batch of N validators basic info
     * @return end         Flag if there are no more accounts left. To get all accounts, caller should fetch all batches until he sees end == true
     **/
    function getValidators(uint32 batch) external view returns (ValidatorData[] memory validators, bool end);

    /**
     * @notice Returns list of validators owned by an address
     *
     * @param owner        Owner address
     * @param batch        Batch number to be fetched. If the list is too big it cannot return all validators in one call. Instead, users are fetching batches of 100 account at a time
     *
     * @return validators  Batch of N validators basic info
     * @return end         Flag if there are no more accounts left. To get all accounts, caller should fetch all batches until he sees end == true
     **/
    function getValidatorsFor(
        address owner,
        uint32 batch
    ) external view returns (ValidatorData[] memory validators, bool end);

    /**
     * @notice Returns list of delegations for specified delegator - which validators delegator delegated to
     *
     * @param delegator     delegator account address
     * @param batch         Batch number to be fetched. If the list is too big it cannot return all delegations in one call. Instead, users are fetching batches of 50 delegations at a time
     *
     * @return delegations  Batch of N delegations
     * @return end          Flag if there are no more delegations left. To get all delegations, caller should fetch all batches until he sees end == true
     **/
    function getDelegations(
        address delegator,
        uint32 batch
    ) external view returns (DelegationData[] memory delegations, bool end);

    /**
     * @notice Returns list of undelegations for specified delegator
     *
     * @param delegator       delegator account address
     * @param batch           Batch number to be fetched. If the list is too big it cannot return all undelegations in one call. Instead, users are fetching batches of 50 undelegations at a time
     *
     * @return undelegations  Batch of N undelegations
     * @return end            Flag if there are no more undelegations left. To get all undelegations, caller should fetch all batches until he sees end == true
     **/
    function getUndelegations(
        address delegator,
        uint32 batch
    ) external view returns (UndelegationData[] memory undelegations, bool end);
}
