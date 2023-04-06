// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

interface IDelegation {
    struct Validator {
        string name;
        address wallet;
        bytes32 addressProof;
        bytes32 vrfKey;
        uint256 commission;
        string ip;
        uint256 stake;
    }

    event InternalValidatorAdded(address indexed wallet);
    event InternalValidatorDelegationIncreased(address indexed validatorAddress, uint256 delegatedValue);
    event ExternalValidatorRegistered(address indexed wallet, address indexed delegator, uint256 tokens);

    // function addOwnValidator(address _newValidator) external;

    function registerExternalValidator(
        address _validator,
        bytes memory proof,
        bytes memory vrf_key,
        uint16 commission,
        string calldata description,
        string calldata endpoint
    ) external payable;
}
