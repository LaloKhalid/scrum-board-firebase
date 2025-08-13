import { db } from "./firebase.js";

import { collection, getDocs } from "firebase/firestore";

async function getAssignments() {
  try {
    const querySnapshot = await getDocs(collection(db, "assignments"));
    console.log("Tasks in Firestore:");
    querySnapshot.forEach((doc) => {
      console.log(doc.id, "=>", doc.data());
    });
  } catch (error) {
    console.error("Error fetching assignments:", error);
  }
}

getAssignments();
