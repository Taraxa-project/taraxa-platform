// (c) 2022-2023, Taraxa, Inc. All rights reserved.
// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./interfaces/IDelegation.sol";
import "./IDPOS.sol"; // import the DPOS contract interface
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract DelegationOrchestrator is IDelegation, Ownable, Pausable {
  using Address for address;

  IDPOS private dpos;
  mapping(address => IDelegation.Validator) public validators;
  mapping(address => bool) public validatorExists;

  event ValidatorAdded(address indexed validator);
  event ValidatorRegistered(address indexed validator, address indexed delegator, uint256 tokens);

  constructor(address[] memory _validators, address _dposAddress) payable {
    require(_validators.length > 0, "Validators array not set");
    require(_dposAddress != "", "DPOS address not set");
    require(Address.isContract(_dposAddress), "DPOS Address not a contract");
    
    dpos = IDPOS(_dposAddress);

    for (uint256 i = 0; i < _validators.length; ++i) {
      validators.push(_validators[i]);
      validatorExists[_validators[i]] = true;
    }
  }

  function getValidator(address _wallet) external view override returns (Validator memory) {
    require(validatorExists[_wallet], "Validator does not exist");
    return validators[_wallet];
  }

  function addValidator(string memory _name, address _wallet, bytes32 _addressProof, bytes32 _vrfKey, uint256 _commission, string memory _ip) external override {
    require(validators[_wallet].wallet == address(0), "Validator already exists");

    Validator memory validator = Validator(_name, _wallet, _addressProof, _vrfKey, _commission, _ip);
    validators[_wallet] = validator;
    validatorExists[_wallet] = true;
    emit ValidatorAdded(_wallet);
  }

  function registerValidator(address _validator, uint256 _tokens) external payable override {
    require(validatorExists[_validator], "Validator does not exist");
    require(validatorDelegatedTokens[msg.sender] >= 2 * _tokens, "Not enough delegated tokens");
    // Delegate tokens to validator
    validatorDelegatedTokens[msg.sender] -= 2 * _tokens;
    validatorDelegatedTokens[_validator] += 2 * _tokens;

    emit ValidatorRegistered(_validator, msg.sender, _tokens);
    // Register validator in DPOS contract
    // ...
  }
}
