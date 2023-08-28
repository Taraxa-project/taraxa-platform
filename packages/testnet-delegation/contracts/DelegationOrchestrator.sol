// (c) 2023-2024, Taraxa, Inc. All rights reserved.
// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "./interfaces/IDelegation.sol";
import "./interfaces/IDPOS.sol"; // import the DPOS contract interface
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./CallProxy.sol";

contract DelegationOrchestrator is CallProxy, IDelegation, Ownable, Pausable, ReentrancyGuard {
    using Address for address;
    uint256 constant MIN_REGISTRATION_DELEGATION = 1000 ether;
    uint256 constant TESTNET_DELEGATION = 500000 ether;
    bytes4 constant REGISTER_VALIDATOR_SELECTOR = 0xd6fdc127;
    IDPOS private immutable dpos;

    // @note contains the internal validator addresses
    address[] public internalValidators;
    // @note contains the external validator addresses
    address[] public externalValidators;
    // @note registrar of validators per owner
    mapping(address => address[]) externalValidatorsByOwners;
    // @note contains the external validators' owner addresses
    mapping(address => address) public externalValidatorOwners;

    constructor(address[] memory validators, address dposAddress) payable CallProxy(dposAddress) {
        internalValidators = validators;
        dpos = IDPOS(dposAddress);
    }

    /**
     * returns the validator struct
     * @param validator address
     */
    function getValidator(
        address validator
    ) external view override returns (IDPOS.ValidatorBasicInfo memory validatorData) {
        IDPOS.ValidatorBasicInfo memory validatorInfo = dpos.getValidator(validator);
        if (externalValidatorOwners[validator] != address(0)) {
            validatorInfo.owner = externalValidatorOwners[validator];
        }
        return validatorInfo;
    }

    function getValidators(uint32 batch) external view returns (IDPOS.ValidatorData[] memory validators, bool end) {
        return _fetchValidatorsFromImplementation(batch);
    }

    /**
     * returns the owner of an external validator
     * @param owner the address of the extarnal validator
     */
    function getValidatorsFor(
        address owner,
        uint32 batch
    ) external view returns (IDPOS.ValidatorBasicInfo[] memory validators, bool end) {
        IDPOS.ValidatorBasicInfo[] memory _validators = _getValidatorsOf(owner, batch);
        return (_validators, _validators.length == externalValidatorsByOwners[owner].length);
    }

    /**
     * Adds the internal validator to the contract storage.
     * Must be called after scaling internal validators to keep the testnet majority.
     * @param newValidator the address of the new internal validator
     */
    function addInternalValidator(address newValidator) external onlyOwner {
        for (uint8 i = 0; i < internalValidators.length; ) {
            require(internalValidators[i] != newValidator, "Validator already registered");
            unchecked {
                ++i;
            }
        }
        internalValidators.push(newValidator);
        emit InternalValidatorAdded(newValidator);
    }

    /**
     * Registers the new external validator after ensuring that internal ones still have vote majority.
     * @param validator address
     * @param proof proof
     * @param vrfKey public vrf key
     * @param commission commission in hundreds
     * @param description validator description
     * @param endpoint validator endpoint
     */
    function registerValidator(
        address validator,
        bytes memory proof,
        bytes memory vrfKey,
        uint16 commission,
        string calldata description,
        string calldata endpoint
    ) external override nonReentrant {
        for (uint8 y = 0; y < internalValidators.length; ) {
            require(internalValidators[y] != validator, "Validator already registered");
            unchecked {
                ++y;
            }
        }
        for (uint8 j = 0; j < externalValidators.length; ) {
            require(externalValidators[j] != validator, "Validator already registered");
            unchecked {
                ++j;
            }
        }
        require(address(this).balance >= TESTNET_DELEGATION, "Insufficient funds in contract for testnet rebalance");
        uint256 internalStake = 0;
        uint256 externalStake = 0;
        (internalStake, externalStake) = _calculateStakes();
        require(internalStake != 0 || externalStake != 0, "Calculating current stakes failed!");
        uint256 majorityStake = 2 * externalStake + TESTNET_DELEGATION;
        if (internalStake < majorityStake) {
            uint256 delegationValue = (TESTNET_DELEGATION + MIN_REGISTRATION_DELEGATION) / internalValidators.length;
            // Delegate 2*tokens to our validators
            for (uint8 i = 0; i < internalValidators.length; ) {
                (bool hasDelegated, ) = address(dpos).call{value: delegationValue}(
                    abi.encodeWithSignature("delegate(address)", internalValidators[i])
                );

                require(hasDelegated, "Delegate call failed");
                emit InternalValidatorDelegationIncreased(internalValidators[i], delegationValue);
                unchecked {
                    ++i;
                }
            }
        }
        externalValidatorsByOwners[msg.sender].push(validator);
        externalValidators.push(validator);
        externalValidatorOwners[validator] = msg.sender;
        bytes memory input = abi.encodeWithSelector(
            REGISTER_VALIDATOR_SELECTOR,
            validator,
            proof,
            vrfKey,
            commission,
            description,
            endpoint
        );
        (bool hasRegistered, ) = address(dpos).call{value: TESTNET_DELEGATION}(input);

        require(hasRegistered, "Register validator call failed");

        emit ExternalValidatorRegistered(validator, msg.sender, TESTNET_DELEGATION);
    }

    /**
     * Internal method that sums the internal and external stakes in the same loop.
     */
    function _calculateStakes() internal view returns (uint256, uint256) {
        bool hasMore = true;
        uint256 internalStake = 0;
        uint256 externalStake = 0;
        uint16 index = 0;
        while (hasMore) {
            if (index < internalValidators.length) {
                IDPOS.ValidatorBasicInfo memory internalValidatorInfo = dpos.getValidator(internalValidators[index]);
                internalStake += internalValidatorInfo.total_stake;
            }
            if (index < externalValidators.length) {
                IDPOS.ValidatorBasicInfo memory externalValidatorInfo = dpos.getValidator(externalValidators[index]);
                externalStake += externalValidatorInfo.total_stake;
            }
            if (index >= internalValidators.length && index >= externalValidators.length) {
                hasMore = false;
            }
            unchecked {
                ++index;
            }
        }
        return (internalStake, externalStake);
    }

    function _getValidatorsOf(
        address account,
        uint256 batch
    ) internal view returns (IDPOS.ValidatorBasicInfo[] memory) {
        address[] memory validators = externalValidatorsByOwners[account];
        IDPOS.ValidatorBasicInfo[] memory validatorsData = new IDPOS.ValidatorBasicInfo[](validators.length);
        for (uint64 i = 0; i < validators.length; ++i) {
            IDPOS.ValidatorBasicInfo memory validatorInfo = dpos.getValidator(validators[i]);
            validatorInfo.owner = account;
            validatorsData[i] = validatorInfo;
        }

        return validatorsData;
    }

    function _fetchValidatorsFromImplementation(
        uint32 batch
    ) internal view returns (IDPOS.ValidatorData[] memory validators, bool) {
        IDPOS.ValidatorData[] memory _validators;
        bool end;
        (_validators, end) = dpos.getValidators(batch);
        for (uint8 i = 0; i < _validators.length; ) {
            if (externalValidatorOwners[_validators[i].account] != address(0)) {
                _validators[i].info.owner = externalValidatorOwners[_validators[i].account];
            }
            unchecked {
                ++i;
            }
        }
        return (_validators, end);
    }
}
