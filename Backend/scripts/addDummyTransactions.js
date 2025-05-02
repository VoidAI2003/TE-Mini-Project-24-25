const { ethers } = require("hardhat");

async function main() {
  // Contract address (same as in index.js)
  const contractAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

  // Get the signer (using the same private key as in index.js)
  const [signer] = await ethers.getSigners();
  console.log("Using signer address:", signer.address);

  // Attach to the deployed SupplyChain contract
  const SupplyChain = await ethers.getContractFactory("SupplyChain");
  const supplyChain = SupplyChain.attach(contractAddress);

  // Dummy transaction data
  const dummyTransactions = [
    {
      orderId: 1,
      itemId: "ITM-001",
      itemName: "Office Chair",
      quantity: 10,
      category: "Furniture",
    },
    {
      orderId: 2,
      itemId: "ITM-002",
      itemName: "Laptop",
      quantity: 5,
      category: "Electronics",
    },
    {
      orderId: 3,
      itemId: "ITM-003",
      itemName: "Desk Lamp",
      quantity: 20,
      category: "Lighting",
    },
  ];

  // Add each dummy transaction
  for (const tx of dummyTransactions) {
    console.log(`Adding transaction with orderId ${tx.orderId}...`);
    const transaction = await supplyChain.connect(signer).addTransaction(
      tx.orderId,
      tx.itemId,
      tx.itemName,
      tx.quantity,
      tx.category
    );
    await transaction.wait();
    console.log(`Transaction ${tx.orderId} added, tx hash: ${transaction.hash}`);
  }

  console.log("All dummy transactions added successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error adding dummy transactions:", error);
    process.exit(1);
  });