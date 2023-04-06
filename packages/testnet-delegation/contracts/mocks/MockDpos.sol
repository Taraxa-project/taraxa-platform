// (c) 2022-2023, Taraxa, Inc. All rights reserved.
// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./MockIDPOS.sol";

contract MockDpos is MockIDPOS {
    mapping(address => MockIDPOS.ValidatorData) public validators;

    constructor(address[] memory _internalValidators) payable {
        for (uint256 i = 0; i < _internalValidators.length; ++i) {
            MockIDPOS.ValidatorBasicInfo memory info = MockIDPOS.ValidatorBasicInfo(
                msg.value / _internalValidators.length,
                0,
                100,
                uint64(block.number),
                msg.sender,
                "Sample description",
                "https://endpoint.some"
            );
            MockIDPOS.ValidatorData memory validatorData = MockIDPOS.ValidatorData(_internalValidators[i], info);
            validators[_internalValidators[i]] = validatorData;
        }
        require(
            validators[_internalValidators[_internalValidators.length - 1]].account != address(0),
            "Failed to set own validators"
        );
    }

    function isValidatorRegistered(address validator) external view returns (bool) {
        return validators[validator].account != address(0);
    }

    function getValidator(address validator) external view returns (MockIDPOS.ValidatorData memory) {
        return validators[validator];
    }

    function delegate(address validator) external payable override {
        MockIDPOS.ValidatorData storage validatorData = validators[validator];
        require(validatorData.account != address(0), "Validator doesn't exist");
        require(msg.value > 0, "Delegation value not provided");

        validatorData.info.total_stake += msg.value;
        emit Delegated(msg.sender, validatorData.account, msg.value);
    }

    function registerValidator(
        address validator,
        bytes memory proof,
        bytes memory vrf_key,
        uint16 commission,
        string calldata description,
        string calldata endpoint
    ) external payable override {
        require(proof.length != 0, "Invalid proof");
        require(vrf_key.length != 0, "VRF Public key not porvided");
        require(validators[validator].account == address(0), "Validator already registered");
        require(msg.value >= 1000000000000000000000, "Base delegation value not provided");

        MockIDPOS.ValidatorBasicInfo memory info = MockIDPOS.ValidatorBasicInfo(
            msg.value,
            0,
            commission,
            uint64(block.number),
            msg.sender,
            description,
            endpoint
        );
        MockIDPOS.ValidatorData memory validatorData = MockIDPOS.ValidatorData(validator, info);
        validators[validator] = validatorData;

        emit ValidatorRegistered(validator);
    }
}
