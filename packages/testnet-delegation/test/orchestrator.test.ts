/* eslint-disable no-unused-vars */
import { ethers } from "hardhat";
import { expect } from "chai";
import { DelegationOrchestrator, MockDpos } from "../types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";

describe("DelegationOrchestrator", () => {
  let orchestrator: DelegationOrchestrator;
  let owner: SignerWithAddress;
  let mockDPOS: MockDpos;
  let ownValidators: SignerWithAddress[];
  let newValidatorOwner1: SignerWithAddress;
  let newValidator1: string;
  let newValidatorOwner2: SignerWithAddress;
  let newValidator2: string;
  let newValidatorOwner3: SignerWithAddress;
  let newValidator3: string;
  let newInternalValidator: string;
  const MIN_DELEGATION = ethers.utils.parseEther("1000");
  const TESTNET_DELEGATION = ethers.utils.parseEther("500000");
  const BASE_ORCHESTRATOR_BALANCE = TESTNET_DELEGATION.mul("30");
  const ownValidatorBalancesAfterFirstExternalAddition = TESTNET_DELEGATION;
  let ownValidatorBalancesAfterSecondExternalAddition = BigNumber.from("0");
  let ownValidatorBalancesAfterThirdExternalAddition = BigNumber.from("0");

  const commission = 10;
  const description = "Test validator";
  const endpoint = "http://localhost:8545";

  before(async () => {
    const [signer, signer1, signer2, signer3, signer4] = await ethers.getSigners();
    ownValidators = [signer, signer1, signer2];
    newValidatorOwner1 = signer3;
    newValidatorOwner2 = signer4;
    newValidatorOwner3 = signer2;

    const MockDPOS = await ethers.getContractFactory("MockDpos");
    const Orchestrator = await ethers.getContractFactory("DelegationOrchestrator");
    const mockDposDeployment = await MockDPOS.connect(signer1).deploy(
      ownValidators.map((v) => v.address),
      {
        value: TESTNET_DELEGATION.mul(`${ownValidators.length}`),
      }
    );

    mockDPOS = await mockDposDeployment.deployed();

    console.log("MockDPOS deployed at: ", mockDPOS.address);
    owner = signer;
    const orchestratorDeployment = await Orchestrator.connect(owner).deploy(
      ownValidators.map((v) => v.address),
      mockDPOS.address,
      {
        value: BASE_ORCHESTRATOR_BALANCE,
      }
    );
    orchestrator = await orchestratorDeployment.deployed();
    console.log("Orchestrator deployed at: ", orchestrator.address);
  });

  it("MockDPOS - getValidator: Checks initial validator balances in mock DPOS", async () => {
    for (const validator of ownValidators) {
      const validatorInfo = await mockDPOS.getValidator(validator.address);
      expect(validatorInfo.total_stake).to.be.equal(TESTNET_DELEGATION);
    }
  });
  it("Orchestrator - registerValidator: should register the first new validator, not delegate to internals", async () => {
    newValidator1 = ethers.Wallet.createRandom().address;
    console.log("Validator1 address: ", newValidator1);
    const value = MIN_DELEGATION;

    const tx = await orchestrator
      .connect(newValidatorOwner1)
      .registerValidator(
        newValidator1,
        ethers.utils.randomBytes(32),
        ethers.utils.randomBytes(32),
        commission,
        description,
        endpoint,
        { from: newValidatorOwner1.address }
      );

    // Check that the validator was registered
    const firstNewValidator = await mockDPOS.getValidator(newValidator1);
    expect(firstNewValidator.owner).to.equal(orchestrator.address);
    expect(firstNewValidator.total_stake).to.equal(TESTNET_DELEGATION);

    const owner3 = await orchestrator.getValidator(newValidator1);
    expect(owner3.owner).to.equal(newValidatorOwner1.address);
    // Check that the delegation was successful
    for (const validator of ownValidators) {
      const validatorData = await mockDPOS.getValidator(validator.address);
      expect(validatorData.total_stake).to.equal(TESTNET_DELEGATION);
    }
    // Check that the event was emitted
    await expect(tx)
      .to.emit(orchestrator, "ExternalValidatorRegistered")
      .withArgs(newValidator1, newValidatorOwner1, value)
      .to.emit(mockDPOS, "ValidatorRegistered")
      .withArgs(newValidator1);
  });

  it("Orchestrator -  registerValidator: should revert if validator is already registered", async function () {
    const validator = ownValidators[0].address;

    await expect(
      orchestrator
        .connect(newValidatorOwner2)
        .registerValidator(
          validator,
          ethers.utils.randomBytes(32),
          ethers.utils.randomBytes(32),
          commission,
          description,
          endpoint,
          { from: newValidatorOwner2.address }
        )
    ).to.be.revertedWith("Validator already registered");
  });

  it("MockDPOS & Orchestrator - registerValidator & registerValidator: should register the second new validator and delegate to internals", async () => {
    newValidator2 = ethers.Wallet.createRandom().address;
    const value = TESTNET_DELEGATION;

    const tx = await orchestrator
      .connect(newValidatorOwner2)
      .registerValidator(
        newValidator2,
        ethers.utils.randomBytes(32),
        ethers.utils.randomBytes(32),
        commission,
        description,
        endpoint,
        { from: newValidatorOwner2.address }
      );

    // Check that the validator was registered
    const secondNewValidator = await mockDPOS.getValidator(newValidator2);
    expect(secondNewValidator.owner).to.equal(orchestrator.address);
    expect(secondNewValidator.total_stake).to.equal(value);
    const owner1 = await orchestrator.getValidator(newValidator2);
    expect(owner1.owner).to.equal(newValidatorOwner2.address);
    // Check that the delegation was successful
    for (const validator of ownValidators) {
      ownValidatorBalancesAfterSecondExternalAddition = ownValidatorBalancesAfterFirstExternalAddition;
      const validatorData = await mockDPOS.getValidator(validator.address);
      expect(validatorData.total_stake).to.equal(ownValidatorBalancesAfterSecondExternalAddition);
    }
    // Check that the event was emitted
    await expect(tx)
      .to.emit(orchestrator, "ExternalValidatorRegistered")
      .withArgs(newValidator2, newValidatorOwner2, value)
      .to.emit(orchestrator, "InternalValidatorDelegationIncreased")
      .withArgs(ownValidators[0], value.mul(2).div(ownValidators.length))
      .to.emit(orchestrator, "InternalValidatorDelegationIncreased")
      .withArgs(ownValidators[1], value.mul(2).div(ownValidators.length))
      .to.emit(orchestrator, "InternalValidatorDelegationIncreased")
      .withArgs(ownValidators[2], value.mul(2).div(ownValidators.length))
      .to.emit(mockDPOS, "ValidatorRegistered")
      .withArgs(newValidator2);
  });

  it("Orchestrator - addInternalValidator: should fail adding a new internal validator", async () => {
    const validator = ethers.Wallet.createRandom().address;
    await expect(orchestrator.connect(newValidatorOwner2).addInternalValidator(validator)).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
    await expect(orchestrator.connect(owner).addInternalValidator(ownValidators[0].address)).to.be.revertedWith(
      "Validator already registered"
    );
  });
  it("Orchestrator - addInternalValidator: should add a new internal validator", async () => {
    newInternalValidator = ethers.Wallet.createRandom().address;
    ownValidators.push(await ethers.getSigner(newInternalValidator));
    await expect(orchestrator.connect(owner).addInternalValidator(newInternalValidator))
      .to.emit(orchestrator, "InternalValidatorAdded")
      .withArgs(newInternalValidator);
  });

  it("MockDPOS & Orchestrator - registerValidator & registerValidator: should register a third new validator and delegate to internals", async () => {
    newValidator3 = ethers.Wallet.createRandom().address;
    const value = TESTNET_DELEGATION;

    const dposRegistration = await mockDPOS
      .connect(owner)
      .registerValidator(
        newInternalValidator,
        ethers.utils.randomBytes(32),
        ethers.utils.randomBytes(32),
        commission,
        description,
        endpoint,
        { from: owner.address, value }
      );

    await expect(dposRegistration).to.emit(mockDPOS, "ValidatorRegistered").withArgs(newInternalValidator);

    const tx = await orchestrator
      .connect(newValidatorOwner3)
      .registerValidator(
        newValidator3,
        ethers.utils.randomBytes(32),
        ethers.utils.randomBytes(32),
        commission,
        description,
        endpoint,
        { from: newValidatorOwner3.address }
      );

    // Check that the validator was registered
    const thirdNewValidator = await mockDPOS.getValidator(newValidator3);
    expect(thirdNewValidator.owner).to.equal(orchestrator.address);
    expect(thirdNewValidator.total_stake).to.equal(TESTNET_DELEGATION);
    const owner2 = await orchestrator.getValidator(newValidator3);
    expect(owner2.owner).to.equal(newValidatorOwner3.address);
    // Check that the delegation was successful
    for (const validator of ownValidators) {
      ownValidatorBalancesAfterThirdExternalAddition = ownValidatorBalancesAfterSecondExternalAddition.add(
        TESTNET_DELEGATION.add(MIN_DELEGATION).div(ownValidators.length) // because we added an internal validator
      );
      const validatorData = await mockDPOS.getValidator(validator.address);
      expect(validatorData.total_stake).to.equal(ownValidatorBalancesAfterThirdExternalAddition);
    }
    // Check that the event was emitted
    await expect(tx)
      .to.emit(orchestrator, "ExternalValidatorRegistered")
      .withArgs(newValidator3, newValidatorOwner3, value)
      .to.emit(orchestrator, "InternalValidatorDelegationIncreased")
      .withArgs(ownValidators[0], value.mul(2).div(ownValidators.length))
      .to.emit(orchestrator, "InternalValidatorDelegationIncreased")
      .withArgs(ownValidators[1], value.mul(2).div(ownValidators.length))
      .to.emit(orchestrator, "InternalValidatorDelegationIncreased")
      .withArgs(ownValidators[2], value.mul(2).div(ownValidators.length))
      .to.emit(orchestrator, "InternalValidatorDelegationIncreased")
      .withArgs(ownValidators[3], value.mul(2).div(ownValidators.length))
      .to.emit(mockDPOS, "ValidatorRegistered")
      .withArgs(newValidator3);
  });

  it("Shadows getValidators call and inputs real owners", async () => {
    const validators = await orchestrator.getValidators(0);

    const _validators = await mockDPOS.getValidators(0);
    const firstExtValidatorFromMock = _validators.validatorsOut.find(
      (val) => val.account.toLowerCase() === newValidator1.toLowerCase()
    );
    expect(firstExtValidatorFromMock?.info.owner).not.to.be.eq(newValidatorOwner1.address);
    expect(firstExtValidatorFromMock?.info.owner).to.be.eq(orchestrator.address);

    const firstExtValidator = validators.validators.find(
      (val) => val.account.toLowerCase() === newValidator1.toLowerCase()
    );
    const secondExtValidator = validators.validators.find(
      (val) => val.account.toLowerCase() === newValidator2.toLowerCase()
    );
    const thirdExtValidator = validators.validators.find(
      (val) => val.account.toLowerCase() === newValidator3.toLowerCase()
    );
    expect(firstExtValidator?.info.owner).to.be.eq(newValidatorOwner1.address);
    expect(secondExtValidator?.info.owner).to.be.eq(newValidatorOwner2.address);
    expect(thirdExtValidator?.info.owner).to.be.eq(newValidatorOwner3.address);
  });

  it("Shadows getValidatorsFor call and inputs real owner", async () => {
    const validators = await orchestrator.getValidatorsFor(newValidatorOwner1.address, 0);
    const _validators = await mockDPOS.getValidatorsFor(newValidatorOwner1.address, 0);
    const noExtValidatorFromMock = _validators.validatorsOut.some(
      (val) => val.account.toLowerCase() === newValidator1.toLowerCase()
    );
    expect(noExtValidatorFromMock).to.be.false;
    expect(validators.validators.length).to.be.eq(1);
    expect(validators.validators[0].owner).to.be.eq(newValidatorOwner1.address);
  });
});
