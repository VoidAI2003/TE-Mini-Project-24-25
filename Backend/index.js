const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const { ethers } = require("ethers");
const { GoogleAuth } = require('google-auth-library'); // Added for Google Cloud authentication
const axios = require('axios'); // Added for HTTP requests to Vertex AI
require("dotenv").config();

// Initialize Firebase Admin SDK with Firestore
const serviceAccount = require("./publicAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore(); // Initialize Firestore

const app = express();
app.use(cors());
app.use(express.json());

// Connect to Hardhat Network for blockchain interaction
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const SupplyChainABI = [
  {
    "inputs": [
      {"internalType": "uint256", "name": "_orderId", "type": "uint256"},
      {"internalType": "string", "name": "_itemId", "type": "string"},
      {"internalType": "string", "name": "_itemName", "type": "string"},
      {"internalType": "uint256", "name": "_quantity", "type": "uint256"},
      {"internalType": "string", "name": "_category", "type": "string"}
    ],
    "name": "addTransaction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_orderId", "type": "uint256"},
      {"internalType": "uint8", "name": "_newStatus", "type": "uint8"}
    ],
    "name": "updateStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "orderId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "sender", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "receiver", "type": "address"}
    ],
    "name": "TransactionAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "orderId", "type": "uint256"},
      {"indexed": false, "internalType": "uint8", "name": "newStatus", "type": "uint8"}
    ],
    "name": "StatusUpdated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "getUserTransactions",
    "outputs": [
      {
        "internalType": "struct SupplyChain.Transaction[]",
        "name": "",
        "type": "tuple[]",
        "components": [
          {"internalType": "uint256", "name": "orderId", "type": "uint256"},
          {"internalType": "string", "name": "itemId", "type": "string"},
          {"internalType": "string", "name": "itemName", "type": "string"},
          {"internalType": "uint256", "name": "quantity", "type": "uint256"},
          {"internalType": "string", "name": "category", "type": "string"},
          {"internalType": "uint8", "name": "status", "type": "uint8"}
        ]
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
];
const supplyChain = new ethers.Contract(contractAddress, SupplyChainABI, wallet);

// Initialize GoogleAuth for Vertex AI
const auth = new GoogleAuth({
  keyFile: 'smartchain-predictor-key.json', // Ensure this file is in your project directory
  scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

// Vertex AI endpoint URLs
const DAILY_ENDPOINT = 'https://asia-south1-aiplatform.googleapis.com/v1/projects/smartchain-7219e/locations/asia-south1/endpoints/1226821880132927488:predict';
const WEEKLY_ENDPOINT = 'https://asia-south1-aiplatform.googleapis.com/v1/projects/smartchain-7219e/locations/asia-south1/endpoints/4272381128142225408:predict';

// Middleware to verify Firebase ID token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

// 🟣 Predict endpoint (POST) for Vertex AI
app.post('/api/predict', authenticateToken, async (req, res) => {
  try {
    const { instances, model_type } = req.body;

    if (!instances || !model_type) {
      return res.status(400).json({ message: "Missing required fields: instances and model_type" });
    }

    if (!Array.isArray(instances) || instances.length === 0) {
      return res.status(400).json({ message: "Instances must be a non-empty array" });
    }

    const endpoint = model_type === 'daily' ? DAILY_ENDPOINT : WEEKLY_ENDPOINT;
    if (model_type !== 'daily' && model_type !== 'weekly') {
      return res.status(400).json({ message: "model_type must be 'daily' or 'weekly'" });
    }

    // Validate instance shape (7 timesteps, 12 features)
    for (const instance of instances) {
      if (!Array.isArray(instance) || instance.length !== 7) {
        return res.status(400).json({ message: "Each instance must have 7 timesteps" });
      }
      for (const timestep of instance) {
        if (!Array.isArray(timestep) || timestep.length !== 12) {
          return res.status(400).json({ message: "Each timestep must have 12 features" });
        }
        if (!timestep.every(val => typeof val === 'number')) {
          return res.status(400).json({ message: "All features must be numbers" });
        }
      }
    }

    // Get access token for Vertex AI
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    // Send request to Vertex AI
    const response = await axios.post(
      endpoint,
      { instances },
      {
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error making prediction:", error.response ? error.response.data : error.message);
    res.status(500).json({ message: "Failed to make prediction", error: error.message });
  }
});

// Map user (create or update user data in Firestore and assign retailer ID)
app.post("/api/map-user", authenticateToken, async (req, res) => {
  const { uid, email, companyName, address, taxId } = req.body;
  if (!uid || !email) {
    return res.status(400).json({ message: "Missing uid or email" });
  }

  try {
    const userRef = db.collection("users").doc(uid);
    await userRef.set(
      {
        profile: {
          email,
          companyName: companyName || "",
          address: address || "",
          taxId: taxId || "",
        },
        notificationSettings: {
          emailNotifications: true,
          pushNotifications: true,
          weeklyReports: true,
          stockAlerts: true,
        },
      },
      { merge: true }
    );

    const retailerId = `RT-${String((await db.collection("user_details").where("typeOfUser", "==", "retailers").get()).size + 1).padStart(3, "0")}`;
    await db.collection("user_details").doc(retailerId).set({
      id: retailerId,
      typeOfUser: "retailers",
      companyName: companyName || email.split("@")[0],
      address: address || "",
      taxId: taxId || "",
    }, { merge: true });

    console.log("User data and retailer ID saved to Firestore:", { uid, email, companyName, address, taxId, retailerId });

    res.status(200).json({ message: "User mapped successfully", retailerId });
  } catch (error) {
    console.error("Error saving user data to Firestore:", error);
    res.status(500).json({ message: "Failed to save user data" });
  }
});

// Get user profile
app.get("/api/user-profile", authenticateToken, async (req, res) => {
  const uid = req.user.uid;

  try {
    const userRef = db.collection("users").doc(uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(200).json({
        email: req.user.email || "",
        companyName: "",
        address: "",
        taxId: "",
      });
    }

    const data = doc.data();

    res
      .status(200)
      .json(
        data.profile || {
          email: req.user.email,
          companyName: "",
          address: "",
          taxId: "",
        }
      );
  } catch (error) {
    console.error("Error fetching user profile from Firestore:", error);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
});

// Update user profile
app.put("/api/user-profile", authenticateToken, async (req, res) => {
  const uid = req.user.uid;
  const { email, companyName, address, taxId } = req.body;

  try {
    const userRef = db.collection("users").doc(uid);
    await userRef.set(
      {
        profile: {
          email: email || req.user.email || "",
          companyName: companyName || "",
          address: address || "",
          taxId: taxId || "",
        },
      },
      { merge: true }
    );

    const retailerSnapshot = await db.collection("user_details")
      .where("typeOfUser", "==", "retailers")
      .where("companyName", "==", companyName || "")
      .limit(1)
      .get();
    if (!retailerSnapshot.empty) {
      const retailerId = retailerSnapshot.docs[0].id;
      await db.collection("user_details").doc(retailerId).update({
        companyName: companyName || "",
        address: address || "",
        taxId: taxId || "",
      });
    }

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating user profile in Firestore:", error);
    res.status(500).json({ message: "Failed to update user profile" });
  }
});

// Get notification settings
app.get("/api/notification-settings", authenticateToken, async (req, res) => {
  const uid = req.user.uid;

  try {
    const userRef = db.collection("users").doc(uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(200).json({
        emailNotifications: true,
        pushNotifications: true,
        weeklyReports: true,
        stockAlerts: true,
      });
    }

    const data = doc.data();
    res.status(200).json(
      data.notificationSettings || {
        emailNotifications: true,
        pushNotifications: true,
        weeklyReports: true,
        stockAlerts: true,
      }
    );
  } catch (error) {
    console.error(
      "Error fetching notification settings from Firestore:",
      error
    );
    res.status(500).json({ message: "Failed to fetch notification settings" });
  }
});

// Update notification settings
app.put("/api/notification-settings", authenticateToken, async (req, res) => {
  const uid = req.user.uid;
  const { emailNotifications, pushNotifications, weeklyReports, stockAlerts } =
    req.body;

  try {
    const userRef = db.collection("users").doc(uid);
    await userRef.set(
      {
        notificationSettings: {
          emailNotifications: emailNotifications ?? true,
          pushNotifications: pushNotifications ?? true,
          weeklyReports: weeklyReports ?? true,
          stockAlerts: stockAlerts ?? true,
        },
      },
      { merge: true }
    );

    res
      .status(200)
      .json({ message: "Notification settings updated successfully" });
  } catch (error) {
    console.error("Error updating notification settings in Firestore:", error);
    res.status(500).json({ message: "Failed to update notification settings" });
  }
});

// Get all suppliers (global)
app.get("/api/suppliers", authenticateToken, async (req, res) => {
  try {
    const userDetailsRef = db.collection("user_details");
    const snapshot = await userDetailsRef.where("typeOfUser", "==", "suppliers").get();
    const suppliers = snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().companyName || "Unnamed Supplier",
    }));
    res.status(200).json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers from user_details:", error);
    res.status(500).json({ message: "Failed to fetch suppliers" });
  }
});

// Get all categories (global)
app.get("/api/categories", authenticateToken, async (req, res) => {
  try {
    const categoriesRef = db.collection("categories");
    const snapshot = await categoriesRef.get();
    const categories = snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name || "Unnamed Category",
    }));
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

// Get all inventory items (global)
app.get("/api/inventory-items", authenticateToken, async (req, res) => {
  try {
    const inventoryRef = db.collection("inventoryItems");
    const snapshot = await inventoryRef.get();
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      itemId: doc.data().itemId || doc.id,
      name: doc.data().name || "Unnamed Item",
      supplier: doc.data().supplier || "Unknown Supplier",
      quantity: doc.data().quantity || 0,
      reorderPoint: doc.data().reorderPoint || 0,
      category: doc.data().category || "Uncategorized",
    }));
    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    res.status(500).json({ message: "Failed to fetch inventory items" });
  }
});

// Add a new inventory item (global)
app.post("/api/inventory-items", authenticateToken, async (req, res) => {
  const { name, supplier, quantity, reorderPoint, category } = req.body;

  if (!name || !supplier || !quantity || !reorderPoint || !category) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const inventoryRef = db.collection("inventoryItems");
    const snapshot = await inventoryRef.get();
    const itemCount = snapshot.size;
    const newItemId = `ITM-${String(itemCount + 1).padStart(3, "0")}`;

    const newItem = {
      itemId: newItemId,
      name,
      supplier,
      quantity: parseInt(quantity),
      reorderPoint: parseInt(reorderPoint),
      category,
    };
    await inventoryRef.doc(newItemId).set(newItem);
    res.status(201).json({ id: newItemId, ...newItem });
  } catch (error) {
    console.error("Error adding inventory item:", error);
    res.status(500).json({ message: "Failed to add inventory item" });
  }
});

// Get all sales reports with time period filtering
app.get("/api/sales-reports", authenticateToken, async (req, res) => {
  try {
    const { period = "week", startDate, endDate } = req.query;
    const currentDate = new Date("2025-04-11");
    let start, end;

    switch (period) {
      case "day":
        start = new Date(currentDate);
        start.setHours(0, 0, 0, 0);
        end = new Date(currentDate);
        end.setHours(23, 59, 59, 999);
        break;
      case "week":
        start = new Date(currentDate);
        start.setDate(currentDate.getDate() - currentDate.getDay());
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case "month":
        start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case "quarter":
        const quarter = Math.floor(currentDate.getMonth() / 3);
        start = new Date(currentDate.getFullYear(), quarter * 3, 1);
        end = new Date(currentDate.getFullYear(), (quarter + 1) * 3, 0, 23, 59, 59, 999);
        break;
      case "year":
        start = new Date(currentDate.getFullYear(), 0, 1);
        end = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      default:
        start = new Date(currentDate);
        start.setDate(currentDate.getDate() - currentDate.getDay());
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
    }

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    }

    const salesRef = db.collection("sales_report");
    const snapshot = await salesRef
      .where("date", ">=", start.toISOString())
      .where("date", "<=", end.toISOString())
      .get();

    const inventorySnapshot = await db.collection("inventoryItems").get();
    const inventoryMap = {};
    inventorySnapshot.forEach((doc) => {
      const data = doc.data();
      inventoryMap[data.itemId] = data.name;
    });

    const retailerSnapshot = await db.collection("user_details")
      .where("typeOfUser", "==", "retailers")
      .get();
    const retailerMap = {};
    retailerSnapshot.forEach((doc) => {
      retailerMap[doc.id] = doc.data().companyName || "Unknown Retailer";
    });

    const reports = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: data.reportId || doc.id,
        retailerId: data.retailerId,
        retailerName: retailerMap[data.retailerId] || "Unknown Retailer",
        product: inventoryMap[data.itemId] || "Unknown Product",
        quantity: data.noOfUnitsSold || 0,
        amount: data.sales || 0,
        dateTime: data.date,
      };
    });

    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching sales reports:", error);
    res.status(500).json({ message: "Failed to fetch sales reports" });
  }
});

// Add new sales report with generated report ID
app.post("/api/sales-reports", authenticateToken, async (req, res) => {
  const { retailerId, itemId, noOfUnitsSold, sales, date, categoryOfItem, season } = req.body;

  if (!retailerId || !itemId || !noOfUnitsSold || !sales || !date || !categoryOfItem || !season) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const salesRef = db.collection("sales_report");
    const snapshot = await salesRef.get();
    const reportCount = snapshot.size + 1;
    const reportId = `RE-${String(reportCount).padStart(3, "0")}`;

    const newReport = {
      reportId,
      retailerId,
      itemId,
      noOfUnitsSold: parseInt(noOfUnitsSold),
      sales: parseFloat(sales),
      date,
      categoryOfItem,
      season,
    };
    await salesRef.add(newReport);
    res.status(201).json({ message: "Sales report added successfully", id: reportId });
  } catch (error) {
    console.error("Error adding sales report:", error);
    res.status(500).json({ message: "Failed to add sales report" });
  }
});

// Get all restock requests with time period filtering
app.get("/api/restock-requests", authenticateToken, async (req, res) => {
  try {
    const { period = "week", startDate, endDate } = req.query;
    const currentDate = new Date("2025-04-11");
    let start, end;

    switch (period) {
      case "day":
        start = new Date(currentDate);
        start.setHours(0, 0, 0, 0);
        end = new Date(currentDate);
        end.setHours(23, 59, 59, 999);
        break;
      case "week":
        start = new Date(currentDate);
        start.setDate(currentDate.getDate() - currentDate.getDay());
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case "month":
        start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case "quarter":
        const quarter = Math.floor(currentDate.getMonth() / 3);
        start = new Date(currentDate.getFullYear(), quarter * 3, 1);
        end = new Date(currentDate.getFullYear(), (quarter + 1) * 3, 0, 23, 59, 59, 999);
        break;
      case "year":
        start = new Date(currentDate.getFullYear(), 0, 1);
        end = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      default:
        start = new Date(currentDate);
        start.setDate(currentDate.getDate() - currentDate.getDay());
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
    }

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    }

    const restockRef = db.collection("restock_requests");
    const snapshot = await restockRef
      .where("dateOfRequest", ">=", start.toISOString())
      .where("dateOfRequest", "<=", end.toISOString())
      .get();

    const inventorySnapshot = await db.collection("inventoryItems").get();
    const inventoryMap = {};
    inventorySnapshot.forEach((doc) => {
      const data = doc.data();
      inventoryMap[data.itemId] = data.name;
    });

    const retailerSnapshot = await db.collection("user_details")
      .where("typeOfUser", "==", "retailers")
      .get();
    const retailerMap = {};
    retailerSnapshot.forEach((doc) => {
      retailerMap[doc.id] = doc.data().companyName || "Unknown Retailer";
    });

    const requests = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        states: data.states || "Pending",
        dateOfRequest: data.dateOfRequest,
        productName: inventoryMap[data.productId] || data.productName || "Unknown Product",
        quantity: data.quantity || 0,
        urgency: data.urgency || "Normal",
        vendorSupplierId: data.vendorSupplierId || "Unknown Supplier",
        requestedBy: retailerMap[data.retailerId] || "Unknown",
        requested: data.requested,
        underReview: data.underReview,
        approved: data.approved,
      };
    });

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching restock requests:", error);
    res.status(500).json({ message: "Failed to fetch restock requests" });
  }
});

// Get a specific restock request by ID
app.get("/api/restock-requests/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const restockRef = db.collection("restock_requests").doc(id);
    const doc = await restockRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Restock request not found" });
    }

    const data = doc.data();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching restock request:", error);
    res.status(500).json({ message: "Failed to fetch restock request" });
  }
});

// Add new restock request with generated ID "RR-001"
app.post("/api/restock-requests", authenticateToken, async (req, res) => {
  const { productName, quantity, urgency, shortNote, vendorSupplierId } = req.body;

  if (!productName || !quantity || !vendorSupplierId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const restockRef = db.collection("restock_requests");
    const snapshot = await restockRef.get();
    const requestCount = snapshot.size + 1;
    const requestId = `RR-${String(requestCount).padStart(3, "0")}`;

    const userProfile = (await db.collection("users").doc(req.user.uid).get()).data()?.profile || {};
    const retailerSnapshot = await db.collection("user_details")
      .where("typeOfUser", "==", "retailers")
      .where("companyName", "==", userProfile.companyName || req.user.email.split("@")[0])
      .limit(1)
      .get();
    const retailerId = retailerSnapshot.empty
      ? `RT-${String((await db.collection("user_details").where("typeOfUser", "==", "retailers").get()).size + 1).padStart(3, "0")}`
      : retailerSnapshot.docs[0].id;

    const productSnapshot = await db.collection("inventoryItems")
      .where("name", "==", productName)
      .limit(1)
      .get();
    const productData = productSnapshot.docs[0]?.data() || { itemId: requestId.replace("RR", "ITM"), category: "Unknown" };

    const newRequest = {
      id: requestId,
      states: "Pending",
      dateOfRequest: new Date().toISOString(),
      productId: productData.itemId,
      productName,
      vendorSupplierId,
      quantity: parseInt(quantity),
      urgency,
      shortNote: shortNote || "",
      stockCategory: productData.category,
      description: shortNote || "",
      retailerId,
      requested: { date: new Date().toISOString(), user: req.user.email?.split("@")[0] || req.user.name || req.user.uid || "Unknown User" },
      underReview: null,
      approved: null,
    };
    await restockRef.doc(requestId).set(newRequest);
    res.status(201).json({ message: "Restock request added successfully", id: requestId });
  } catch (error) {
    console.error("Error adding restock request:", error);
    res.status(500).json({ message: "Failed to add restock request" });
  }
});

// Update restock request state
app.put("/api/restock-requests/:id/state", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { state, user: requestUser } = req.body;

  try {
    const restockRef = db.collection("restock_requests").doc(id);
    const doc = await restockRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Restock request not found" });
    }

    const data = doc.data();
    const updates = {};
    const username = requestUser || req.user.email?.split("@")[0] || req.user.name || req.user.uid || "Unknown User";

    switch (state) {
      case "underReview":
        if (!data.underReview) {
          updates.underReview = { date: new Date().toISOString(), user: username };
          updates.states = "Under Review";
        }
        break;
      case "approved":
        if (!data.approved) {
          updates.approved = { date: new Date().toISOString(), user: username };
          updates.states = "Approved";
        }
        break;
      default:
        return res.status(400).json({ message: "Invalid state" });
    }

    if (Object.keys(updates).length > 0) {
      await restockRef.update(updates);
      res.status(200).json({ message: `Request marked as ${state} successfully` });
    } else {
      res.status(400).json({ message: `Request already ${state}` });
    }
  } catch (error) {
    console.error("Error updating restock request state:", error);
    res.status(500).json({ message: "Failed to update restock request state" });
  }
});

// Transaction routes integrated directly into index.js
const transactionsRef = db.collection("transactions");

// 🟢 Create a new transaction (POST)
app.post("/api/transactions", authenticateToken, async (req, res) => {
  try {
    const { receiverId, itemId, itemName, quantity, category, status } = req.body;
    const txs = await supplyChain.getUserTransactions();
    const maxOrderId = txs.length > 0 ? Math.max(...txs.map(tx => Number(tx.orderId))) : 0;
    const orderId = maxOrderId + 1;
    const senderId = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";
    const receiverIdFixed = "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65";
    const transactionId = `T-${String(orderId).padStart(3, '0')}`;
    const transactionDate = new Date().toISOString();
    const statusMap = { "Confirmed": 0, "Accepted by All": 1, "In Transit": 2, "Delivered": 3 };
    const statusIndex = statusMap[status] ?? 0;
    const tx = await supplyChain.addTransaction(orderId, itemId, itemName, quantity, category);
    await tx.wait();
    if (statusIndex > 0) {
      const updateTx = await supplyChain.updateStatus(orderId, statusIndex);
      await updateTx.wait();
    }
    res.status(201).json({ transactionId, orderId, itemId, itemName, quantity, category, status, senderId, receiverId: receiverIdFixed, transactionDate, txHash: tx.hash });
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({ error: error.message });
  }
});

// 🟠 Update transaction status (PUT)
app.put("/api/transactions/:id", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({ message: "Missing status field" });
    }

    const docRef = transactionsRef.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const transactionData = doc.data();
    const orderId = parseInt(id);
    const currentStatusIndex = ["Confirmed", "Accepted by All", "In Transit", "Delivered"].indexOf(transactionData.status || "Confirmed");

    const statusMap = {
      "Accepted by All": 1,
      "In Transit": 2,
      "Delivered": 3,
    };
    const newStatusIndex = statusMap[status];
    if (newStatusIndex === undefined || newStatusIndex <= currentStatusIndex) {
      return res.status(400).json({ message: "Invalid or non-sequential status transition" });
    }

    const isAdmin = (await supplyChain.admin()).toLowerCase() === wallet.address.toLowerCase();
    if (newStatusIndex === 3 && transactionData.receiverId.toLowerCase() !== wallet.address.toLowerCase()) {
      return res.status(403).json({ message: "Only receiver can mark as Delivered" });
    } else if (newStatusIndex < 3 && !isAdmin) {
      return res.status(403).json({ message: "Only admin can update status" });
    }

    const updates = { status };
    const currentDate = new Date().toISOString();
    if (status === "Accepted by All" && !transactionData.confirmedByAllDate) {
      updates.confirmedByAllDate = currentDate;
    } else if (status === "In Transit" && !transactionData.inTransitDate) {
      updates.inTransitDate = currentDate;
    } else if (status === "Delivered" && !transactionData.deliveredDate) {
      updates.deliveredDate = currentDate;
    }

    const tx = await supplyChain.updateStatus(orderId, newStatusIndex);
    await tx.wait();

    await docRef.update(updates);
    res.status(200).json({ message: "Transaction updated successfully", txHash: tx.hash });
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ error: error.message });
  }
});

// 🟡 Get user transactions (GET)
app.get("/api/user-transactions", authenticateToken, async (req, res) => {
  try {
    const txs = await supplyChain.getUserTransactions();
    const transactions = txs.map((tx, idx) => ({
      transactionId: `T-${String(idx + 1).padStart(3, '0')}`,
      orderId: tx.orderId.toString(),
      itemId: tx.itemId,
      itemName: tx.itemName,
      quantity: tx.quantity.toString(),
      category: tx.category,
      status: ["Confirmed", "Accepted by All", "In Transit", "Delivered"][tx.status],
      senderId: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      receiverId: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
      transactionDate: new Date().toISOString(),
    }));
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific transaction by ID
app.get("/api/transactions/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const txs = await supplyChain.getUserTransactions();
    const idx = Number(id.replace('T-', '')) - 1;
    const tx = txs[idx];
    if (!tx) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json({
      transactionId: `T-${String(idx + 1).padStart(3, '0')}`,
      orderId: tx.orderId.toString(),
      itemId: tx.itemId,
      itemName: tx.itemName,
      quantity: tx.quantity.toString(),
      category: tx.category,
      status: ["Confirmed", "Accepted by All", "In Transit", "Delivered"][tx.status],
      senderId: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      receiverId: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
      transactionDate: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});