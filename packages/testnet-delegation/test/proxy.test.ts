/* eslint-disable no-unused-vars */
import { ethers } from "hardhat";
import { expect } from "chai";
import { DelegationOrchestrator, MockDpos } from "../types";
import IDPOS from "../artifacts/contracts/interfaces/IDPOS.sol/IDPOS.json";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers as baseEthers } from "ethers";

describe("DelegationOrchestrator Proxy tests", () => {
  let orchestrator: DelegationOrchestrator;
  let owner: SignerWithAddress;
  let mockDPOS: MockDpos;
  let ownValidators: SignerWithAddress[];
  let newValidatorOwner1: SignerWithAddress;
  const MIN_DELEGATION = ethers.utils.parseEther("1000");
  const BASE_ORCHESTRATOR_BALANCE = MIN_DELEGATION.mul("30");

  let ethersContract: baseEthers.Contract;
  before(async () => {
    const [signer, signer1, signer2, signer3, signer4] = await ethers.getSigners();
    ownValidators = [signer, signer1, signer2];
    newValidatorOwner1 = signer1;

    const MockDPOS = await ethers.getContractFactory("MockDpos");
    const Orchestrator = await ethers.getContractFactory("DelegationOrchestrator");
    const mockDposDeployment = await MockDPOS.connect(newValidatorOwner1).deploy(
      ownValidators.map((v) => v.address),
      {
        value: MIN_DELEGATION.mul(`${ownValidators.length}`),
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
    ethersContract = new ethers.Contract(orchestrator.address, IDPOS.abi);
  });

  it("Is able to forward getValdiator call", async () => {
    const directCall = await mockDPOS.getValidator(ownValidators[0].address);
    expect(directCall.owner).to.equal(ownValidators[1].address);

    const funcSignature =
      "getValidator(address) external view returns (uint256,uint256,uint256,uint16,uint64,address,string,string)";
    const txData = ethersContract.interface.encodeFunctionData(funcSignature, [ownValidators[0].address]);
    const tx = {
      to: orchestrator.address,
      data: txData,
    };
    const txResult = await ethers.provider.send("eth_sendTransaction", [tx]);
    expect(txResult).not.to.be.undefined;
  });

  it("is able to undelegate", async () => {
    const validator4 = ethers.Wallet.createRandom().address;
    const registerValidator = await mockDPOS
      .connect(owner)
      .registerValidator(
        validator4,
        ethers.utils.randomBytes(32),
        ethers.utils.randomBytes(32),
        22,
        "Random description",
        "Random endpoint",
        { value: MIN_DELEGATION.mul(3) }
      );
    expect(registerValidator).not.to.be.undefined;

    const funcSignature = "undelegate(address,uint256) external";
    const txData = ethersContract
      .connect(owner)
      .interface.encodeFunctionData(funcSignature, [validator4, MIN_DELEGATION]);
    const tx = {
      to: orchestrator.address,
      data: txData,
    };
    const txResult = await ethers.provider.send("eth_sendTransaction", [tx]);
    expect(txResult).not.to.be.undefined;
  });
});
