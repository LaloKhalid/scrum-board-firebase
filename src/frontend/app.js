// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase config (use your actual values)
const firebaseConfig = {
  apiKey: "AIzaSyCaMSuMtXh0vAgja4Y0IsR4Vtle1CqmGxc",
  authDomain: "scrum-board-firebase.firebaseapp.com",
  projectId: "scrum-board-firebase",
  storageBucket: "scrum-board-firebase.firebasestorage.app",
  messagingSenderId: "197952936908",
  appId: "1:197952936908:web:33ea4decefab1f46465b69"
};

// Init Firebase + Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Form elements
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");

// Add task to Firestore
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const category = document.getElementById("category").value;
  const status = document.getElementById("status").value;

  try {
    await addDoc(collection(db, "assignments"), { title, category, status });
    console.log("✅ Task added:", title);
    taskForm.reset();
  } catch (error) {
    console.error("❌ Error adding task:", error);
  }
});

// Listen for real-time updates
onSnapshot(collection(db, "assignments"), (snapshot) => {
  taskList.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const task = docSnap.data();

    // Create container
    const taskDiv = document.createElement("div");
    taskDiv.textContent = `${task.title} — ${task.category} — ${task.status} `;

    // Delete button
    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.onclick = async () => {
      await deleteDoc(doc(db, "assignments", docSnap.id));
      console.log("🗑 Deleted:", task.title);
    };

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.onclick = async () => {
      const newTitle = prompt("New title:", task.title);
      const newCategory = prompt("New category:", task.category);
      const newStatus = prompt("New status:", task.status);

      if (newTitle && newCategory && newStatus) {
        await updateDoc(doc(db, "assignments", docSnap.id), {
          title: newTitle,
          category: newCategory,
          status: newStatus
        });
        console.log("✏️ Updated:", newTitle);
      }
    };

    // Add buttons to taskDiv
    taskDiv.appendChild(editBtn);
    taskDiv.appendChild(delBtn);

    // Add taskDiv to list
    taskList.appendChild(taskDiv);
  });
});
