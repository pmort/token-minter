import { ethers } from "hardhat";

async function main() {
  const safeTokenFactory = await ethers.getContractAt("SafeTokenFactory", "0xDF0153069580bcACe55176bB2C62884f90A7359E");
  await safeTokenFactory.setFee(ethers.utils.parseEther("0.001"));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
