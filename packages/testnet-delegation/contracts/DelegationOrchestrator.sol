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

    constructor(address[] memory _internalValidators, address _dpos) payable {
        internalValidators = _internalValidators;
        dpos = IDPOS(_dpos);
        for (uint256 i = 0; i < _internalValidators.length; ++i) {
            internalValidatorRegistered[_internalValidators[i]] = i + 1;
        }
    }

    /**
     * returns the array of external validator addresses for the owner
     * @param _owner owner address
     */
    function getExternalValidatorsByOwner(address _owner) external view override returns (address[] memory validators) {
        return externalValidatorsByOwners[_owner];
    }

    /**
     * returns the owner of an external validator
     * @param _validator the address of the extarnal validator
     */
    function getOwnerOfExternalValidator(address _validator) external view returns (address owner) {
        return externalValidatorOwners[_validator];
    }

    /**
     * Adds the internal validator to the contract storage.
     * Must be called after scaling internal validators to keep the testnet majority.
     * @param _newValidator the address of the new internal validator
     */
    function addInternalValidator(address _newValidator) external onlyOwner {
        require(internalValidatorRegistered[_newValidator] == 0, "Validator already registered");
        internalValidators.push(_newValidator);
        internalValidatorRegistered[_newValidator] = internalValidators.length;
        emit InternalValidatorAdded(_newValidator);
    }

    /**
     * Registers the new external validator after ensuring that internal ones still have vote majority.
     * @param _validator address
     * @param _proof proof
     * @param _vrf_key public vrf key
     * @param _commission commission in hundreds
     * @param _description validator description
     * @param _endpoint validator endpoint
     */
    function registerExternalValidator(
        address _validator,
        bytes memory _proof,
        bytes memory _vrf_key,
        uint16 _commission,
        string calldata _description,
        string calldata _endpoint
    ) external payable override nonReentrant {
        uint256 delegationValue = (2 * msg.value) / internalValidators.length;
        require(
            externalValidatorRegistered[_validator] == 0 && internalValidatorRegistered[_validator] == 0,
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
        externalValidatorsByOwners[msg.sender].push(_validator);
        externalValidators.push(_validator);
        externalValidatorRegistered[_validator] = externalValidators.length;
        externalValidatorOwners[_validator] = msg.sender;
        dpos.registerValidator{value: msg.value}(_validator, _proof, _vrf_key, _commission, _description, _endpoint);
        emit ExternalValidatorRegistered(_validator, msg.sender, msg.value);
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
