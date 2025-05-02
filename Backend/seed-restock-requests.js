const admin = require("firebase-admin");
const serviceAccount = require("./publicAccountKey.json");

// Initialize Firebase Admin SDK with Firestore
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function seedRestockRequests() {
  try {
    const restockRequests = [
      {
        id: "RR-001",
        states: "Pending",
        dateOfRequest: "2025-04-06T09:00:00Z",
        productId: "ITM-001",
        productName: "Office Chairs",
        vendorSupplierId: "SUP-001",
        quantity: 50,
        urgency: "Urgent",
        shortNote: "Urgent for new office setup",
        stockCategory: "Furniture",
        description: "Needed for new hires",
        retailerId: "RT-001", // Updated to retailer ID format
        requested: { date: "2025-04-06T09:00:00Z", user: "John Doe" },
        underReview: null,
        approved: null,
      },
      {
        id: "RR-002",
        states: "Under Review",
        dateOfRequest: "2025-04-07T14:30:00Z",
        productId: "ITM-002",
        productName: "Desk Lamps",
        vendorSupplierId: "SUP-002",
        quantity: 100,
        urgency: "Normal",
        shortNote: "Standard order",
        stockCategory: "Lighting",
        description: "For new team members",
        retailerId: "RT-002", // Updated to retailer ID format
        requested: { date: "2025-04-07T14:30:00Z", user: "Jane Smith" },
        underReview: { date: "2025-04-08T10:00:00Z", user: "Admin" },
        approved: null,
      },
      {
        id: "RR-003",
        states: "Approved",
        dateOfRequest: "2025-04-08T11:15:00Z",
        productId: "ITM-003",
        productName: "Monitors",
        vendorSupplierId: "SUP-003",
        quantity: 25,
        urgency: "High",
        shortNote: "High priority",
        stockCategory: "Electronics",
        description: "For development team",
        retailerId: "RT-003", // Updated to retailer ID format
        requested: { date: "2025-04-08T11:15:00Z", user: "Mike Johnson" },
        underReview: { date: "2025-04-09T09:00:00Z", user: "Admin" },
        approved: { date: "2025-04-10T14:00:00Z", user: "Manager" },
      },
      {
        id: "RR-004",
        states: "Pending",
        dateOfRequest: "2025-04-09T15:00:00Z",
        productId: "ITM-004",
        productName: "Keyboards",
        vendorSupplierId: "SUP-004",
        quantity: 75,
        urgency: "Normal",
        shortNote: "Additional stock needed",
        stockCategory: "Electronics",
        description: "For office upgrades",
        retailerId: "RT-004", // Updated to retailer ID format
        requested: { date: "2025-04-09T15:00:00Z", user: "Alice Brown" },
        underReview: null,
        approved: null,
      },
    ];

    for (const request of restockRequests) {
      await db.collection("restock_requests").doc(request.id).set(request);
      console.log(`Added restock request: ${JSON.stringify(request)}`);
    }

    console.log("Seeding restock_requests completed successfully!");
  } catch (error) {
    console.error("Error seeding restock_requests:", error);
  }
}

// Run the seeding function
seedRestockRequests();