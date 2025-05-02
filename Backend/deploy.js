const hre = require("hardhat");

async function main() {
  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");

  const supplyChain = await SupplyChain.deploy();
  await supplyChain.waitForDeployment(); // ✅ Wait for deployment in Ethers v6

  console.log("SupplyChain deployed to:", supplyChain.target); // ✅ Use .target to get address in v6
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
