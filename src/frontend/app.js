// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, getDocs
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

// Members form + list
const memberForm = document.getElementById("memberForm");
const membersList = document.getElementById("membersList");

const searchBox = document.getElementById("searchBox");

// Column containers
const newTasksCol = document.getElementById("new-tasks");
const inProgressCol = document.getElementById("in-progress");
const doneCol = document.getElementById("done");


// ✅ Add new task
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

// ✅ Add new member
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

// ✅ Show members in realtime
onSnapshot(collection(db, "members"), (snapshot) => {
  membersList.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const member = docSnap.data();
    const memberDiv = document.createElement("div");
    memberDiv.textContent = `${member.name} — ${member.role}`;
    membersList.appendChild(memberDiv);
  });
});


// ✅ Helper: choose member dropdown modal
async function chooseMemberAndAssign(taskId) {
  const memberDropdown = document.createElement("select");
  memberDropdown.innerHTML = '<option value="">-- Select member --</option>';

  // Fetch members
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

  // Modal box
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
    document.body.removeChild(modal); // close modal
  };
}


// ✅ Render tasks in columns
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

    // Actions
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

// ✅ Realtime listener for tasks
onSnapshot(collection(db, "assignments"), (snapshot) => {
  renderTasks(snapshot);
});

// ✅ Search filter
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
