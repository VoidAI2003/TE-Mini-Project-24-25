// Script to update all items in Firestore from SKU to itemId
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyALh6y3svnXTv3j8qO0nMvkKKinaeNGla0",
  authDomain: "smartchain-cfffa.firebaseapp.com",
  projectId: "smartchain-cfffa",
  storageBucket: "smartchain-cfffa.firebasestorage.app",
  messagingSenderId: "989621610467",
  appId: "1:989621610467:web:519cfbcf2e78b9443062d6",
  measurementId: "G-1YLNHE8ZVZ",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateSkuToItemId() {
  try {
    console.log("Starting update process...");

    // Get all items from Firestore
    const itemsCollection = collection(db, "items");
    const querySnapshot = await getDocs(itemsCollection);

    console.log(`Found ${querySnapshot.size} items to update`);

    let updatedCount = 0;

    // Update each item
    for (const document of querySnapshot.docs) {
      const itemData = document.data();

      // Check if the item has a SKU field
      if (itemData.sku) {
        // Create a new object with itemId instead of sku
        const updatedData = {
          ...itemData,
          itemId: itemData.sku,
        };

        // Remove the sku field
        delete updatedData.sku;

        // Update the document
        await updateDoc(doc(db, "items", document.id), updatedData);

        updatedCount++;
        console.log(
          `Updated item ${document.id}: ${itemData.sku} -> ${updatedData.itemId}`
        );
      }
    }

    console.log(`Update complete. Updated ${updatedCount} items.`);
  } catch (error) {
    console.error("Error updating items:", error);
  }
}

// Run the update function
updateSkuToItemId();
