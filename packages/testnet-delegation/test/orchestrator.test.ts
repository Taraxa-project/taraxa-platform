/* eslint-disable no-unused-vars */
import { ethers } from "hardhat";
import { expect } from "chai";
import { DelegationOrchestrator, MockDpos } from "../types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("DelegationOrchestrator", () => {
  let orchestrator: DelegationOrchestrator;
  let mockDPOS: MockDpos;
  let ownValidators: SignerWithAddress[];
  let newValidatorOwner1: SignerWithAddress;
  let newValidator1: string;
  let newValidatorOwner2: SignerWithAddress;
  let newValidator2: string;
  const MIN_DELEGATION = ethers.utils.parseEther("1000");
  const BASE_ORCHESTRATOR_BALANCE = MIN_DELEGATION.mul("30");

  before(async () => {
    const [signer, signer1, signer2, signer3, signer4] = await ethers.getSigners();
    ownValidators = [signer, signer1, signer2];
    newValidatorOwner1 = signer3;
    newValidatorOwner2 = signer4;

    const MockDPOS = await ethers.getContractFactory("MockDpos");
    const Orchestrator = await ethers.getContractFactory("DelegationOrchestrator");
    const mockDposDeployment = await MockDPOS.connect(signer1).deploy(
      ownValidators.map((v) => v.address),
      {
        value: MIN_DELEGATION.mul(`${ownValidators.length}`),
      }
    );

    mockDPOS = await mockDposDeployment.deployed();

    console.log("MockDPOS deployed at: ", mockDPOS.address);
    const orchestratorDeployment = await Orchestrator.connect(signer).deploy(
      ownValidators.map((v) => v.address),
      mockDPOS.address,
      {
        value: BASE_ORCHESTRATOR_BALANCE,
      }
    );
    orchestrator = await orchestratorDeployment.deployed();
    console.log("Orchestrator deployed at: ", orchestrator.address);
  });

  it("Checks initial validator balances in mock DPOS", async () => {
    for (const validator of ownValidators) {
      const validatorData = await mockDPOS.getValidator(validator.address);
      expect(validatorData.info.total_stake).to.be.equal(MIN_DELEGATION);
    }
  });
  it("should register a new validator", async () => {
    newValidator1 = ethers.Wallet.createRandom().address;
    const commission = 10;
    const description = "Test validator";
    const endpoint = "http://localhost:8545";
    const value = MIN_DELEGATION;

    const tx = await orchestrator
      .connect(newValidatorOwner1)
      .registerExternalValidator(
        newValidator1,
        ethers.utils.randomBytes(32),
        ethers.utils.randomBytes(32),
        commission,
        description,
        endpoint,
        { value }
      );

    // Check that the validator was registered
    const firstNewValidator = await mockDPOS.getValidator(newValidator1);
    expect(firstNewValidator.account).to.equal(newValidator1);
    expect(firstNewValidator.info.total_stake).to.equal(MIN_DELEGATION);

    // Check that the delegation was successful
    for (const validator of ownValidators) {
      const expectedDelegations = value.mul(2).add(MIN_DELEGATION);
      const validatorData = await mockDPOS.getValidator(validator.address);
      expect(validatorData.info.total_stake).to.equal(expectedDelegations);
    }
    // Check that the event was emitted
    await expect(tx)
      .to.emit(orchestrator, "ExternalValidatorRegistered")
      .withArgs(newValidator1, newValidatorOwner1, value)
      .to.emit(orchestrator, "InternalValidatorDelegationIncreased")
      .withArgs(ownValidators[0], value.mul(2))
      .to.emit(orchestrator, "InternalValidatorDelegationIncreased")
      .withArgs(ownValidators[1], value.mul(2))
      .to.emit(orchestrator, "InternalValidatorDelegationIncreased")
      .withArgs(ownValidators[2], value.mul(2))
      .to.emit(mockDPOS, "ValidatorRegistered")
      .withArgs(newValidator1);
  });

  it("should revert if validator is already registered", async function () {
    const validator = ownValidators[0].address;
    const commission = 10;
    const description = "Test validator";
    const endpoint = "http://localhost:8545";
    const value = ethers.utils.parseEther("2");

    await expect(
      orchestrator
        .connect(newValidatorOwner2)
        .registerExternalValidator(
          validator,
          ethers.utils.randomBytes(32),
          ethers.utils.randomBytes(32),
          commission,
          description,
          endpoint,
          { value }
        )
    ).to.be.revertedWith("Validator already registered");
  });

  it("should revert if sent value is less than minimum delegation for registration", async function () {
    const validator = ethers.Wallet.createRandom().address;
    const commission = 10;
    const description = "Test validator";
    const endpoint = "http://localhost:8545";
    const value = ethers.utils.parseEther("1");

    await expect(
      orchestrator
        .connect(newValidatorOwner2)
        .registerExternalValidator(
          validator,
          ethers.utils.randomBytes(32),
          ethers.utils.randomBytes(32),
          commission,
          description,
          endpoint,
          { value }
        )
    ).to.be.revertedWith("Sent value less than minimal delegation for registration");
  });

  it("Registration: fails if contract doesn't have enough balance", async function () {
    const contractBalance = await ethers.provider.getBalance(orchestrator.address);
    const callerBalance = await ethers.provider.getBalance(newValidatorOwner2.address);
    console.log("balance of caller: ", callerBalance);
    const validator = ethers.Wallet.createRandom().address;
    const commission = 10;
    const description = "Test validator";
    const endpoint = "http://localhost:8545";
    const value = contractBalance;
    console.log("balance of contact: ", contractBalance.add(value));
    console.log("necessary baalnce: ", value.mul(ownValidators.length));
    console.log(contractBalance.add(value).gte(value.mul(ownValidators.length)));

    await expect(
      orchestrator
        .connect(newValidatorOwner2)
        .registerExternalValidator(
          validator,
          ethers.utils.randomBytes(32),
          ethers.utils.randomBytes(32),
          commission,
          description,
          endpoint,
          { value }
        )
    ).to.be.reverted;
  });

  it("should register a new validator", async () => {
    newValidator2 = ethers.Wallet.createRandom().address;
    const commission = 10;
    const description = "Test validator";
    const endpoint = "http://localhost:8545";
    const value = MIN_DELEGATION;

    const tx = await orchestrator
      .connect(newValidatorOwner2)
      .registerExternalValidator(
        newValidator2,
        ethers.utils.randomBytes(32),
        ethers.utils.randomBytes(32),
        commission,
        description,
        endpoint,
        { value }
      );

    // Check that the validator was registered
    const secondNewValidator = await mockDPOS.getValidator(newValidator2);
    expect(secondNewValidator.account).to.equal(newValidator2);
    expect(secondNewValidator.info.total_stake).to.equal(MIN_DELEGATION);

    // Check that the delegation was successful
    for (const validator of ownValidators) {
      const expectedDelegations = value.mul(2).add(MIN_DELEGATION);
      const validatorData = await mockDPOS.getValidator(validator.address);
      expect(validatorData.info.total_stake).to.equal(expectedDelegations.add(value.mul(2)));
    }
    // Check that the event was emitted
    await expect(tx)
      .to.emit(orchestrator, "ExternalValidatorRegistered")
      .withArgs(newValidator2, newValidatorOwner2, value)
      .to.emit(orchestrator, "InternalValidatorDelegationIncreased")
      .withArgs(ownValidators[0], value.mul(2))
      .to.emit(orchestrator, "InternalValidatorDelegationIncreased")
      .withArgs(ownValidators[1], value.mul(2))
      .to.emit(orchestrator, "InternalValidatorDelegationIncreased")
      .withArgs(ownValidators[2], value.mul(2))
      .to.emit(mockDPOS, "ValidatorRegistered")
      .withArgs(newValidator2);
  });
});
