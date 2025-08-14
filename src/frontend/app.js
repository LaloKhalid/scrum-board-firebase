// Import Firebase SDKs from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCaMSuMtXh0vAgja4Y0IsR4Vtle1CqmGxc",
  authDomain: "scrum-board-firebase.firebaseapp.com",
  projectId: "scrum-board-firebase",
  storageBucket: "scrum-board-firebase.firebasestorage.app",
  messagingSenderId: "197952936908",
  appId: "1:197952936908:web:33ea4decefab1f46465b69"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Handle form submit
document.getElementById("taskForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const category = document.getElementById("category").value;
  const status = document.getElementById("status").value;

  try {
    await addDoc(collection(db, "assignments"), { title, category, status });
    alert("Task added!");
    document.getElementById("taskForm").reset();
    loadTasks();
  } catch (err) {
    console.error("Error adding task: ", err);
  }
});

// Load tasks from Firestore
async function loadTasks() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "assignments"));
  querySnapshot.forEach((doc) => {
    const li = document.createElement("li");
    li.textContent = `${doc.data().title} (${doc.data().category}) - ${doc.data().status}`;
    taskList.appendChild(li);
  });
}

// Load tasks on page load
loadTasks();
