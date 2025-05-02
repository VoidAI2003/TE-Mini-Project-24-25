const admin = require("firebase-admin");
const serviceAccount = require("./publicAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function seedTransactions() {
  try {
    const transactions = [
      {
        date: "2025-04-06T09:00:00Z",
        orderId: 1,
        sender: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        receiver: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        item: "Office Chairs",
        quantity: 50,
        status: "Confirmed",
      },
    ];

    for (const transaction of transactions) {
      await db.collection("transactions").add(transaction);
      console.log(`Added transaction: ${JSON.stringify(transaction)}`);
    }

    console.log("Seeding transactions completed successfully!");
  } catch (error) {
    console.error("Error seeding transactions:", error);
  }
}

seedTransactions();