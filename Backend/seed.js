const admin = require("firebase-admin");
const serviceAccount = require("./publicAccountKey.json");

// Initialize Firebase Admin SDK with Firestore
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function seedData() {
  try {
    // Clear existing data (optional, remove if you want to append)
    const collections = ["sales_report", "user_details", "inventoryItems"];
    for (const collection of collections) {
      const snapshot = await db.collection(collection).get();
      const deletePromises = snapshot.docs.map((doc) => doc.ref.delete());
      await Promise.all(deletePromises);
      console.log(`Cleared ${collection} collection`);
    }

    // Seed sales_report collection
    const salesReports = [
      // Current Week (April 6–11, 2025)
      { retailerId: "RT-001", itemId: "ITM-001", noOfUnitsSold: 10, sales: 900, date: "2025-04-06T09:00:00Z", categoryOfItem: "Office", season: "Spring" },
      { retailerId: "RT-002", itemId: "ITM-002", noOfUnitsSold: 15, sales: 375, date: "2025-04-07T14:30:00Z", categoryOfItem: "Desk", season: "Spring" },
      { retailerId: "RT-003", itemId: "ITM-003", noOfUnitsSold: 5, sales: 1500, date: "2025-04-08T11:15:00Z", categoryOfItem: "Monitors", season: "Spring" },
      { retailerId: "RT-001", itemId: "ITM-004", noOfUnitsSold: 20, sales: 1000, date: "2025-04-09T16:00:00Z", categoryOfItem: "Keyboards", season: "Spring" },
      { retailerId: "RT-004", itemId: "ITM-005", noOfUnitsSold: 25, sales: 225, date: "2025-04-10T10:45:00Z", categoryOfItem: "Desk", season: "Spring" },
      { retailerId: "RT-002", itemId: "ITM-006", noOfUnitsSold: 8, sales: 600, date: "2025-04-11T13:00:00Z", categoryOfItem: "Whiteboards", season: "Spring" },

      // Current Month (April 1–11, 2025)
      { retailerId: "RT-003", itemId: "ITM-007", noOfUnitsSold: 12, sales: 1800, date: "2025-04-01T15:30:00Z", categoryOfItem: "Filing", season: "Spring" },
      { retailerId: "RT-004", itemId: "ITM-001", noOfUnitsSold: 18, sales: 1620, date: "2025-04-02T09:30:00Z", categoryOfItem: "Office", season: "Spring" },
      { retailerId: "RT-001", itemId: "ITM-002", noOfUnitsSold: 22, sales: 550, date: "2025-04-03T14:00:00Z", categoryOfItem: "Desk", season: "Spring" },

      // Past Month (March 2025) for Quarter filter
      { retailerId: "RT-002", itemId: "ITM-003", noOfUnitsSold: 7, sales: 2100, date: "2025-03-15T11:00:00Z", categoryOfItem: "Monitors", season: "Spring" },
      { retailerId: "RT-003", itemId: "ITM-004", noOfUnitsSold: 14, sales: 700, date: "2025-03-20T16:30:00Z", categoryOfItem: "Keyboards", season: "Spring" },
    ];
    for (const report of salesReports) {
      await db.collection("sales_report").add(report);
      console.log(`Added sales report: ${JSON.stringify(report)}`);
    }

    // Seed user_details for retailers
    const retailers = [
      { id: "RT-001", companyName: "City Electronics", typeOfUser: "retailers" },
      { id: "RT-002", companyName: "Office Depot", typeOfUser: "retailers" },
      { id: "RT-003", companyName: "Tech World", typeOfUser: "retailers" },
      { id: "RT-004", companyName: "Furniture Plus", typeOfUser: "retailers" },
    ];
    for (const retailer of retailers) {
      await db.collection("user_details").doc(retailer.id).set(retailer);
      console.log(`Added retailer: ${JSON.stringify(retailer)}`);
    }

    // Seed inventoryItems
    const inventoryItems = [
      { itemId: "ITM-001", name: "Office Chairs", supplier: "Supplier A", quantity: 100, reorderPoint: 20, category: "Furniture" },
      { itemId: "ITM-002", name: "Desk Lamps", supplier: "Supplier B", quantity: 50, reorderPoint: 10, category: "Lighting" },
      { itemId: "ITM-003", name: "Monitors", supplier: "Supplier C", quantity: 30, reorderPoint: 5, category: "Electronics" },
      { itemId: "ITM-004", name: "Keyboards", supplier: "Supplier D", quantity: 80, reorderPoint: 15, category: "Accessories" },
      { itemId: "ITM-005", name: "Desk Organizers", supplier: "Supplier E", quantity: 200, reorderPoint: 30, category: "Stationery" },
      { itemId: "ITM-006", name: "Whiteboards", supplier: "Supplier F", quantity: 20, reorderPoint: 5, category: "Office" },
      { itemId: "ITM-007", name: "Filing Cabinets", supplier: "Supplier G", quantity: 15, reorderPoint: 3, category: "Storage" },
    ];
    for (const item of inventoryItems) {
      await db.collection("inventoryItems").doc(item.itemId).set(item);
      console.log(`Added inventory item: ${JSON.stringify(item)}`);
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
}

// Run the seeding function

seedDatabase();

//seedData();

