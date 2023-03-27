// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.14;

interface IDelegation {
  struct Validator {
      string name;
      address wallet;
      bytes32 addressProof;
      bytes32 vrfKey;
      uint256 commission;
      string ip;
  }

  event ValidatorAdded(address indexed wallet);
  event ValidatorRegistered(address indexed wallet, address indexed delegator, uint256 tokens);

  function addValidator(string calldata _name, address _wallet, bytes32 _addressProof, bytes32 _vrfKey, uint256 _commission, string calldata _ip) external;
  function register(address _validator, uint256 _tokens) external;
  function getValidator(address _wallet) external view returns (Validator memory);
}
