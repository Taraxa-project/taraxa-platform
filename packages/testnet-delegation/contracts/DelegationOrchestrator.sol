// (c) 2023-2024, Taraxa, Inc. All rights reserved.
// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "./interfaces/IDelegation.sol";
import "./interfaces/IDPOS.sol"; // import the DPOS contract interface
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract DelegationOrchestrator is IDelegation, Ownable, Pausable, ReentrancyGuard {
    using Address for address;
    uint256 constant MIN_REGISTRATION_DELEGATION = 1000 ether;
    IDPOS private immutable dpos;

    // @note contains the internal validator addresses
    address[] internalValidators;
    // @note contains the external validator addresses
    address[] externalValidators;
    // @note backwards mapping to register ownage
    mapping(address => address) externalValidatorOwners;
    // @note registrar of validators per owner
    mapping(address => address[]) externalValidatorsByOwners;
    // @note registrar of indexes+1 of validators in the internalValidators
    mapping(address => uint256) internalValidatorRegistered;
    // @note registrar of indexes+1 of validators in the externalValidators
    mapping(address => uint256) externalValidatorRegistered;

    receive() external payable {}

    constructor(address[] memory validators, address dposAddress) payable {
        internalValidators = validators;
        dpos = IDPOS(dposAddress);
        for (uint256 i = 0; i < validators.length; ++i) {
            internalValidatorRegistered[validators[i]] = i + 1;
        }
    }

    /**
     * returns the array of external validator addresses for the owner
     * @param validatorOwner owner address
     */
    function getExternalValidatorsByOwner(
        address validatorOwner
    ) external view override returns (address[] memory validators) {
        return externalValidatorsByOwners[validatorOwner];
    }

    /**
     * returns the owner of an external validator
     * @param validator the address of the extarnal validator
     */
    function getOwnerOfExternalValidator(address validator) external view returns (address owner) {
        return externalValidatorOwners[validator];
    }

    /**
     * Adds the internal validator to the contract storage.
     * Must be called after scaling internal validators to keep the testnet majority.
     * @param newValidator the address of the new internal validator
     */
    function addInternalValidator(address newValidator) external onlyOwner {
        require(internalValidatorRegistered[newValidator] == 0, "Validator already registered");
        internalValidators.push(newValidator);
        internalValidatorRegistered[newValidator] = internalValidators.length;
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
    function registerExternalValidator(
        address validator,
        bytes memory proof,
        bytes memory vrfKey,
        uint16 commission,
        string calldata description,
        string calldata endpoint
    ) external payable override nonReentrant {
        uint256 delegationValue = (2 * msg.value) / internalValidators.length;
        require(
            externalValidatorRegistered[validator] == 0 && internalValidatorRegistered[validator] == 0,
            "Validator already registered"
        );
        require(msg.value >= (MIN_REGISTRATION_DELEGATION), "Sent value less than minimal delegation for registration");
        require(
            address(this).balance >= delegationValue * internalValidators.length,
            "Insufficient funds in contract for testnet rebalance"
        );
        uint256 internalStake = 0;
        uint256 externalStake = 0;
        (internalStake, externalStake) = _calculateStakes();
        uint256 majorityStake = 2 * externalStake + msg.value + MIN_REGISTRATION_DELEGATION;
        if (internalStake < majorityStake) {
            // Delegate 2*tokens to our validators
            for (uint8 i = 0; i < internalValidators.length; ) {
                dpos.delegate{value: delegationValue}(internalValidators[i]);
                emit InternalValidatorDelegationIncreased(internalValidators[i], delegationValue);
                unchecked {
                    ++i;
                }
            }
        }
        externalValidatorsByOwners[msg.sender].push(validator);
        externalValidators.push(validator);
        externalValidatorRegistered[validator] = externalValidators.length;
        externalValidatorOwners[validator] = msg.sender;
        dpos.registerValidator{value: msg.value}(validator, proof, vrfKey, commission, description, endpoint);
        emit ExternalValidatorRegistered(validator, msg.sender, msg.value);
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
}
