import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const SafeTokenFactory = await ethers.getContractFactory("SafeTokenFactory");
  const safeTokenFactory = await SafeTokenFactory.deploy(deployer.address, "1000000000000000000");

  await safeTokenFactory.deployed();

  console.log("SafeTokenFactory deployed to:", safeTokenFactory.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
