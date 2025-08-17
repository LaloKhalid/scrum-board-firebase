// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase config
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

// Form + Search
const taskForm = document.getElementById("taskForm");
const searchBox = document.getElementById("searchBox");

// Column containers
const newTasksCol = document.getElementById("new-tasks");
const inProgressCol = document.getElementById("in-progress");
const doneCol = document.getElementById("done");

// Add task with timestamp
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const category = document.getElementById("category").value;
  const status = document.getElementById("status").value;
  const description = document.getElementById("description").value;

  try {
    await addDoc(collection(db, "assignments"), {
      title,
      description, // <-- Add description here
      category,
      status,
      timestamp: new Date().toISOString()  // <-- Add timestamp here
    });
    console.log("✅ Task added:", title);
    taskForm.reset();
  } catch (error) {
    console.error("❌ Error adding task:", error);
  }
});

// Render tasks
function renderTasks(snapshot) {
  // Clear columns, add headers
  newTasksCol.innerHTML = '<h3>New Tasks</h3>';
  inProgressCol.innerHTML = '<h3>In Progress</h3>';
  doneCol.innerHTML = '<h3>Done</h3>';

  snapshot.forEach((docSnap) => {
    const task = docSnap.data();
    const taskId = docSnap.id;

    const taskDiv = document.createElement("div");

    // Defensive timestamp parsing
    const createdDate = task.timestamp ? new Date(task.timestamp) : null;
    const formattedDate = createdDate && !isNaN(createdDate)
      ? createdDate.toLocaleString("sv-SE", {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : "Unknown date";

    const info = document.createElement("div");
    info.innerHTML = `
  <strong>${task.title}</strong><br>
  ${task.description ? "Description: " + task.description + "<br>" : ""}
  Category: ${task.category}<br>
  Status: ${task.status}<br>
  Created: ${formattedDate}
`;
    taskDiv.appendChild(info);

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-btn";
    editBtn.onclick = async () => {
      const newTitle = prompt("Enter new title:", task.title);
      const newCategory = prompt("Enter new category:", task.category);
      const newStatus = prompt("Enter new status (new, in-progress, done):", task.status);
      if (newTitle && newCategory && newStatus) {
        await updateDoc(doc(db, "assignments", taskId), {
          title: newTitle,
          category: newCategory,
          status: newStatus
        });
        console.log(`✏️ Task updated: ${taskId}`);
      }
    };

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.onclick = async () => {
      if (confirm("Are you sure you want to delete this task?")) {
        await deleteDoc(doc(db, "assignments", taskId));
        console.log(`🗑️ Task deleted: ${taskId}`);
      }
    };

    taskDiv.appendChild(editBtn);
    taskDiv.appendChild(deleteBtn);

    // Append task to correct column
    if (task.status === "new") {
      newTasksCol.appendChild(taskDiv);
    } else if (task.status === "in-progress") {
      inProgressCol.appendChild(taskDiv);
    } else if (task.status === "done") {
      doneCol.appendChild(taskDiv);
    }
  });
}

// Real-time listener
onSnapshot(collection(db, "assignments"), (snapshot) => {
  renderTasks(snapshot);
});

// Search filter
searchBox.addEventListener("input", () => {
  const searchTerm = searchBox.value.toLowerCase();
  const allColumns = [newTasksCol, inProgressCol, doneCol];

  allColumns.forEach((col) => {
    Array.from(col.children).forEach((child, index) => {
      if (index === 0) return; // skip header
      const isVisible = child.textContent.toLowerCase().includes(searchTerm);
      child.style.display = isVisible ? "flex" : "none";
    });
  });
});
