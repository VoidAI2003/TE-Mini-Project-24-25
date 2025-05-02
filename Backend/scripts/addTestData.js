const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
  
  // Attach to the deployed contract
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const supplyChain = SupplyChain.attach(contractAddress);

  // Add test transactions
  const testTransactions = [
    {
      orderId: 1,
      itemId: "ITM-001",
      itemName: "Office Chair",
      quantity: 10,
      category: "Furniture"
    },
    {
      orderId: 2,
      itemId: "ITM-002",
      itemName: "Laptop",
      quantity: 5,
      category: "Electronics"
    },
    {
      orderId: 3,
      itemId: "ITM-003",
      itemName: "Desk Lamp",
      quantity: 20,
      category: "Lighting"
    }
  ];

  console.log("Adding test transactions...");
  for (const tx of testTransactions) {
    const transaction = await supplyChain.addTransaction(
      tx.orderId,
      tx.itemId,
      tx.itemName,
      tx.quantity,
      tx.category
    );
    await transaction.wait();
    console.log(`Added transaction ${tx.orderId}: ${tx.itemName}`);
  }

  console.log("All test transactions added successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 