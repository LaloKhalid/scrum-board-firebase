import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

async function testConnection() {
  try {
    const querySnapshot = await getDocs(collection(db, "test"));
    console.log("✅ Firebase connection successful!");
    querySnapshot.forEach((doc) => {
      console.log(doc.id, " => ", doc.data());
    });
  } catch (error) {
    console.error("❌ Firebase connection failed:", error);
  }
}

testConnection();
