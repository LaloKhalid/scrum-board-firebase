// ===============================
// Firebase SDK Imports
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ===============================
// Firebase Config + Init
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyCaMSuMtXh0vAgja4Y0IsR4Vtle1CqmGxc",
  authDomain: "scrum-board-firebase.firebaseapp.com",
  projectId: "scrum-board-firebase",
  storageBucket: "scrum-board-firebase.firebasestorage.app",
  messagingSenderId: "197952936908",
  appId: "1:197952936908:web:33ea4decefab1f46465b69"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();


// ===============================
// DOM Elements
// ===============================
const taskForm = document.getElementById("taskForm");
const memberForm = document.getElementById("memberForm");
const membersList = document.getElementById("membersList");
const searchBox = document.getElementById("searchBox");

const newTasksCol = document.getElementById("new-tasks");
const inProgressCol = document.getElementById("in-progress");
const doneCol = document.getElementById("done");

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");


// ===============================
// Authentication
// ===============================
loginBtn.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
    console.log("✅ Logged in");
  } catch (error) {
    console.error("❌ Login error:", error);
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    console.log("✅ Logged out");
  } catch (error) {
    console.error("❌ Logout error:", error);
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    userInfo.textContent = `Logged in as: ${user.displayName} (${user.email})`;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    taskForm.style.display = "block"; 
  } else {
    userInfo.textContent = "Not logged in";
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    taskForm.style.display = "none"; 
  }
});


// ===============================
// Add Task
// ===============================
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const category = document.getElementById("category").value;
  const assignedMember = document.getElementById("assignedMember").value;
  const status = document.getElementById("status").value;

  try {
    await addDoc(collection(db, "assignments"), {
      title,
      description,
      category,
      assignedMember: assignedMember || "",
      status,
      timestamp: new Date().toISOString()
    });
    console.log("✅ Task added:", title);
    taskForm.reset();
  } catch (error) {
    console.error("❌ Error adding task:", error);
  }
});


// ===============================
// Add Member
// ===============================
memberForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("memberName").value;
  const role = document.getElementById("memberRole").value;

  try {
    await addDoc(collection(db, "members"), {
      name,
      role
    });
    console.log("✅ Member added:", name);
    memberForm.reset();
  } catch (error) {
    console.error("❌ Error adding member:", error);
  }
});


// ===============================
// Show Members in Realtime
// ===============================
onSnapshot(collection(db, "members"), (snapshot) => {
  membersList.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const member = docSnap.data();
    const memberId = docSnap.id;

    const memberDiv = document.createElement("div");
    memberDiv.textContent = `${member.name} — ${member.role} `;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Remove";
    deleteBtn.onclick = async () => {
      if (confirm(`Remove ${member.name}?`)) {
        await deleteDoc(doc(db, "members", memberId));
        console.log(`🗑️ Removed member ${member.name}`);
      }
    };

    memberDiv.appendChild(deleteBtn);
    membersList.appendChild(memberDiv);
  });
});


// ===============================
// Assign Member to Task (modal)
// ===============================
async function chooseMemberAndAssign(taskId) {
  const memberDropdown = document.createElement("select");
  memberDropdown.innerHTML = '<option value="">-- Select member --</option>';

  const snapshot = await getDocs(collection(db, "members"));
  snapshot.forEach((docSnap) => {
    const member = docSnap.data();
    const option = document.createElement("option");
    option.value = member.name;
    option.textContent = `${member.name} (${member.role})`;
    memberDropdown.appendChild(option);
  });

  const confirmBtn = document.createElement("button");
  confirmBtn.textContent = "Assign";

  const modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.top = "50%";
  modal.style.left = "50%";
  modal.style.transform = "translate(-50%, -50%)";
  modal.style.background = "white";
  modal.style.padding = "20px";
  modal.style.boxShadow = "0px 4px 10px rgba(0,0,0,0.2)";
  modal.style.zIndex = "1000";
  modal.appendChild(memberDropdown);
  modal.appendChild(confirmBtn);

  document.body.appendChild(modal);

  confirmBtn.onclick = async () => {
    const chosen = memberDropdown.value;
    if (chosen) {
      await updateDoc(doc(db, "assignments", taskId), {
        assignedMember: chosen,
        status: "in-progress"
      });
    }
    document.body.removeChild(modal);
  };
}


// ===============================
// Render Tasks
// ===============================
function renderTasks(snapshot) {
  newTasksCol.innerHTML = '<h3>New Tasks</h3>';
  inProgressCol.innerHTML = '<h3>In Progress</h3>';
  doneCol.innerHTML = '<h3>Done</h3>';

  snapshot.forEach((docSnap) => {
    const task = docSnap.data();
    const taskId = docSnap.id;

    const taskDiv = document.createElement("div");
    taskDiv.classList.add("task-card");

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
      ${task.description ? `Description: ${task.description}<br>` : ""}
      Category: ${task.category}<br>
      Status: ${task.status}<br>
      Created: ${formattedDate}<br>
      ${task.assignedMember ? `Assigned: ${task.assignedMember}` : ""}
    `;
    taskDiv.appendChild(info);

    if (task.status === "new") {
      const assignBtn = document.createElement("button");
      assignBtn.textContent = "Assign to member";
      assignBtn.onclick = () => chooseMemberAndAssign(taskId);
      taskDiv.appendChild(assignBtn);
      newTasksCol.appendChild(taskDiv);

    } else if (task.status === "in-progress") {
      const doneBtn = document.createElement("button");
      doneBtn.textContent = "Mark as Done";
      doneBtn.onclick = async () => {
        await updateDoc(doc(db, "assignments", taskId), { status: "done" });
      };
      taskDiv.appendChild(doneBtn);

      const reassignBtn = document.createElement("button");
      reassignBtn.textContent = "Reassign";
      reassignBtn.onclick = async () => {
        const newMember = prompt("Reassign to which member?");
        if (newMember) {
          await updateDoc(doc(db, "assignments", taskId), {
            assignedMember: newMember
          });
          console.log(`🔄 Task reassigned to ${newMember}`);
        }
      };
      taskDiv.appendChild(reassignBtn);

      inProgressCol.appendChild(taskDiv);

    } else if (task.status === "done") {
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = async () => {
        if (confirm("Are you sure you want to delete this task?")) {
          await deleteDoc(doc(db, "assignments", taskId));
        }
      };
      taskDiv.appendChild(deleteBtn);
      doneCol.appendChild(taskDiv);
    }
  });
}


// ===============================
// Realtime Listener for Tasks
// ===============================
onSnapshot(collection(db, "assignments"), (snapshot) => {
  renderTasks(snapshot);
});


// ===============================
// Search Filter
// ===============================
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
