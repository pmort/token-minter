import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

const deployContract = async (feeWallet: string, ethFee: string) => {
  const SafeTokenFactory = await ethers.getContractFactory("SafeTokenFactory");
  const safeTokenFactory = await SafeTokenFactory.deploy(feeWallet, ethers.utils.parseEther(ethFee));
  await safeTokenFactory.deployed();
  return safeTokenFactory;
}

describe("SafeTokenFactory", () => {
  it("Should return the new fee once it's changed", async () => {
    const [feeWallet] = await ethers.getSigners();
    const safeTokenFactory = await deployContract(feeWallet.address, "1");

    expect(await safeTokenFactory.getFee()).to.equal(ethers.utils.parseEther("1"));

    const setFeeTx = await safeTokenFactory.setFee(ethers.utils.parseEther("0.5"));

    await setFeeTx.wait();

    expect(await safeTokenFactory.getFee()).to.equal(ethers.utils.parseEther("0.5"));
  });
  it("Should get fees for new token creation in fee wallet", async () => {
    const [feeWallet, addr1] = await ethers.getSigners();
    const initialFeeBalance = await feeWallet.getBalance();
    const safeTokenFactory = await deployContract(feeWallet.address, "1");

    const mintToken = await safeTokenFactory.connect(addr1).mintToken(
      "US Dollar", 
      "USD", 
      "100", 
      18, 
      { value: ethers.utils.parseEther("1") }
    );

    await mintToken.wait();
    const finalFeeBalance = await feeWallet.getBalance();
    expect(finalFeeBalance > initialFeeBalance);
  });
  it("Should get new tokens issued in wallet performing mint", async () => {
    const [feeWallet, addr1] = await ethers.getSigners();
    const safeTokenFactory = await deployContract(feeWallet.address, "1");

    const mintToken = await safeTokenFactory.connect(addr1).mintToken(
      "US Dollar", 
      "USD", 
      "100", 
      18, 
      { value: ethers.utils.parseEther("1") }
    );
    
    await mintToken.wait();
    const tokenAddress = await safeTokenFactory.getTokenAtIndex(0);
    const token = await ethers.getContractAt("SafeToken", tokenAddress);
    expect(await token.balanceOf(addr1.address) == BigNumber.from(100));
  });
  it("Shouldn't be able to mint with fee too low", async () => {
    const [feeWallet, addr1] = await ethers.getSigners();
    const safeTokenFactory = await deployContract(feeWallet.address, "1");

    await expect(
      safeTokenFactory.connect(addr1).mintToken(
        "US Dollar", 
        "USD", 
        "100", 
        18, 
        { value: ethers.utils.parseEther("0.5") }
      )
    ).to.be.revertedWith("not enough to pay fee");
  });
  it("Should mint at new fee rate after its updated", async () => {
    const [feeWallet, addr1] = await ethers.getSigners();
    const safeTokenFactory = await deployContract(feeWallet.address, "1");

    expect(await safeTokenFactory.getFee()).to.equal(ethers.utils.parseEther("1"));

    const setFeeTx = await safeTokenFactory.setFee(ethers.utils.parseEther("2"));

    await setFeeTx.wait();

    expect(await safeTokenFactory.getFee()).to.equal(ethers.utils.parseEther("2"));

    const mintTokenFail = safeTokenFactory.connect(addr1).mintToken(
      "US Dollar", 
      "USD", 
      "100", 
      18, 
      { value: ethers.utils.parseEther("1") }
    );

    await expect(mintTokenFail).to.be.revertedWith("not enough to pay fee");

    const mintToken = await safeTokenFactory.connect(addr1).mintToken(
      "US Dollar", 
      "USD", 
      "100", 
      18, 
      { value: ethers.utils.parseEther("2") }
    );

    await mintToken.wait();
    const tokenAddress = await safeTokenFactory.getTokenAtIndex(0);
    const token = await ethers.getContractAt("SafeToken", tokenAddress);
    expect(await token.balanceOf(addr1.address) == BigNumber.from(100));
  });
});
