const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');
require('dotenv').config();

// Firebase Admin SDK setup with explicit path
const serviceAccount = require('./publicAccountKey.json'); // Ensure this file exists in the same directory
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Log environment variables to debug
console.log("Firebase Config:", {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
});

// Firebase Client SDK setup for Firestore
const firebaseApp = initializeApp({
  apiKey: "AIzaSyALh6y3svnXTv3j8qO0nMvkKKinaeNGla0",
  authDomain: "smartchain-cfffa.firebaseapp.com",
  projectId: "smartchain-cfffa",
  storageBucket: "smartchain-cfffa.firebasestorage.app",
  messagingSenderId: "989621610467",
  appId: "1:989621610467:web:519cfbcf2e78b9443062d6",
});
const db = getFirestore(firebaseApp);
const transactionsRef = collection(db, 'transactions');

// Helper function to remove null values and ensure valid data
function cleanData(data) {
  const cleaned = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

async function main() {
  // Test a simple write operation first
  try {
    console.log("Testing simple write to Firestore...");
    await setDoc(doc(transactionsRef, "test-doc"), { testField: "testValue" });
    console.log("Simple write successful!");
  } catch (error) {
    console.error("Error during simple write:", error);
    process.exit(1);
  }

  // Use the wallet.address from index.js logs
  const senderAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"; // Replace with the wallet.address from index.js logs

  // Dummy Firestore data corresponding to the blockchain transactions
  const dummyFirestoreData = [
    {
      orderId: "1",
      transactionId: "TX-001",
      senderId: senderAddress,
      receiverId: "0xReceiverAddress1",
      transactionDate: new Date("2025-04-01T10:00:00Z").toISOString(),
      confirmedByAllDate: new Date("2025-04-02T12:00:00Z").toISOString(),
      inTransitDate: new Date("2025-04-03T14:00:00Z").toISOString(),
      deliveredDate: new Date("2025-04-05T16:00:00Z").toISOString(),
    },
    {
      orderId: "2",
      transactionId: "TX-002",
      senderId: senderAddress,
      receiverId: "0xReceiverAddress2",
      transactionDate: new Date("2025-04-02T10:00:00Z").toISOString(),
      confirmedByAllDate: new Date("2025-04-03T12:00:00Z").toISOString(),
      inTransitDate: new Date("2025-04-04T14:00:00Z").toISOString(),
    },
    {
      orderId: "3",
      transactionId: "TX-003",
      senderId: senderAddress,
      receiverId: "0xReceiverAddress3",
      transactionDate: new Date("2025-04-03T10:00:00Z").toISOString(),
    },
  ];

  // Add each dummy transaction to Firestore
  for (const data of dummyFirestoreData) {
    try {
      const docId = String(data.orderId); // Ensure docId is a string
      console.log(`Adding Firestore data for orderId ${docId}...`);
      console.log("Data to write:", cleanData(data)); // Log the cleaned data
      await setDoc(doc(transactionsRef, docId), cleanData(data));
      console.log(`Firestore data for orderId ${docId} added successfully`);
    } catch (error) {
      console.error(`Error adding Firestore data for orderId ${data.orderId}:`, error);
    }
  }

  console.log("All dummy Firestore data added successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error adding dummy Firestore data:", error);
    process.exit(1);
  });