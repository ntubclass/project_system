// Object to store selected member information for editing
const editMemberInfo = {
  name: "",
  email: "",
  photo: "/static/default-avatar.png", // Default photo path
};

// Create a namespaced object for task editing to avoid conflicts
window.taskEditing = window.taskEditing || {};

// Store current project ID for task editing
let editMemberCurrentProjectId = null; // Renamed to avoid conflicts

// Function to set project ID for task editing
function setProjectIdForTaskEdit(projectId) {
  editMemberCurrentProjectId = projectId;
}

// Function to add member to edit list (either for project or task)
function add_member_to_edit_list(name, email, photo) {
  // Determine which member list to use based on referrer dialog attribute
  const editMemberDialog = document.getElementById("editMemberDialog");
  const referrerValue = editMemberDialog
    ? editMemberDialog.getAttribute("data-referrer-dialog")
    : null;

  if (referrerValue === "editTask") {
    // Add to task editing member list (used by project_task.js)
    if (!window.editMemberlist) {
      window.editMemberlist = [];
    }

    // Check if member already exists
    const existingMember = window.editMemberlist.find(
      (member) => member.email === email
    );
    if (existingMember) return;

    // Add member and update task members UI
    window.editMemberlist.push({
      name: name,
      email: email,
      photo: photo || "/static/default-avatar.png",
    });

    // If the updateTaskMembersListUI function exists in project_task.js, call it
    if (typeof window.updateTaskMembersListUI === "function") {
      window.updateTaskMembersListUI();
    }
  } else if (referrerValue === "editProject") {
    // Use the project's add member function if available
    if (typeof window.addMemberToEditProject === "function") {
      window.addMemberToEditProject(name, email, photo);
      return;
    }

    // Fallback if addMemberToEditProject isn't available
    if (!window.projectEditing) {
      window.projectEditing = {};
    }

    if (!window.projectEditing.members) {
      window.projectEditing.members = [];
    }

    // Check if member already exists
    const existingMember = window.projectEditing.members.find(
      (member) => member.email === email
    );
    if (existingMember) return;

    // Add member to project members
    window.projectEditing.members.push({
      name: name,
      email: email,
      photo: photo || "/static/default-avatar.png",
    });

    // Update project members UI
    const editProjectMembersList = document.getElementById(
      "editProjectMembersList"
    );

    if (editProjectMembersList) {
      updateEditProjectMembersUI();
    } else {
      // Fallback to regular project members list
      updateProjectMembersListUI();
    }
  } else {
    // Default case - add to regular project editing list
    if (!window.taskEditing.projectMembers) {
      window.taskEditing.projectMembers = [];
    }

    // Check if member already exists
    const existingMember = window.taskEditing.projectMembers.find(
      (member) => member.email === email
    );
    if (existingMember) return;

    // Add member and update project members UI
    window.taskEditing.projectMembers.push({
      name: name,
      email: email,
      photo: photo || "/static/default-avatar.png",
    });

    // Update the project members list UI
    updateProjectMembersListUI();
  }
}

// Function to handle adding existing members in the edit member dialog
function add_edit_member(name, email, photo) {
  // Force the add_member_to_edit_list function to be called
  // even if add_existing_member is called
  add_member_to_edit_list(name, email, photo);

  // Debug log to verify member is added
  console.log("Added member to edit list:", name, email);
}

// Helper function to get a valid photo URL
function getEditMemberPhotoUrl(photo) {
  // Renamed to avoid conflicts
  return photo || "/static/default-avatar.png";
}

// Function to update the members list UI for project edit dialog
function updateEditProjectMembersUI() {
  const membersList = document.getElementById("editProjectMembersList");
  if (!membersList) return;

  membersList.innerHTML = ""; // Clear previous results

  const members = window.projectEditing.members || [];

  members.forEach((member, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="member-box">
        <div>
          <img src="${getEditMemberPhotoUrl(member.photo)}" class="user-photo">
          <span class="user-name">${member.name}</span>
          <span class="user-email">${member.email}</span>
        </div>
        <i class="fa-solid fa-xmark remove-project-member" data-index="${index}"></i>
      </div>
    `;
    membersList.appendChild(li);
  });

  // Add event listeners to remove buttons
  document.querySelectorAll(".remove-project-member").forEach((btn) => {
    btn.addEventListener("click", function () {
      const index = parseInt(this.getAttribute("data-index"), 10);
      window.projectEditing.members.splice(index, 1);
      updateEditProjectMembersUI();
    });
  });
}

// Function to update the project members list UI
function updateProjectMembersListUI() {
  const membersList = document.getElementById("projectMembersList");
  if (!membersList) return;

  membersList.innerHTML = ""; // Clear previous results

  const members = window.taskEditing.projectMembers || [];

  members.forEach((member, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="member-box">
        <div>
          <img src="${getEditMemberPhotoUrl(member.photo)}" class="user-photo">
          <span class="user-name">${member.name}</span>
          <span class="user-email">${member.email}</span>
        </div>
        <i class="fa-solid fa-xmark remove-task-member" data-index="${index}"></i>
      </div>
    `;
    membersList.appendChild(li);
  });

  // Add event listeners to remove buttons
  document.querySelectorAll(".remove-task-member").forEach((btn) => {
    btn.addEventListener("click", function () {
      const index = parseInt(this.getAttribute("data-index"), 10);
      window.taskEditing.projectMembers.splice(index, 1);
      updateProjectMembersListUI();
    });
  });
}

// Function to close the dialog with animation
function closeEditMemberDialogWithAnimation(dialog) {
  // Renamed to avoid conflicts
  if (!dialog) return;

  dialog.setAttribute("closing", "");
  setTimeout(() => {
    dialog.removeAttribute("closing");
    dialog.close();
  }, 200); // Match CSS animation duration
}

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("editMemberSearch");
  const resultsContainer = document.getElementById("editMemberResults");
  const dialog = document.getElementById("editMemberDialog");
  const openAddMemberBtn = document.getElementById("openEditMemberBtn");
  const closeEditMemberBtn = document.getElementById("closeEditMemberBtn");

  // Initialize project members array if not already created
  if (!window.taskEditing.projectMembers) {
    window.taskEditing.projectMembers = [];
  }

  // Open the edit member dialog when the button is clicked
  if (openAddMemberBtn) {
    openAddMemberBtn.addEventListener("click", function () {
      // Set referrer to project by default when opened from project view
      dialog.setAttribute("data-referrer-dialog", "editProject");

      // Set the context to edit member list
      dialog.setAttribute("data-member-list-context", "edit");

      dialog.showModal();
    });
  }

  // Close button functionality
  if (closeEditMemberBtn) {
    closeEditMemberBtn.addEventListener("click", function () {
      closeEditMemberDialogWithAnimation(dialog);
    });
  }

  if (searchInput && resultsContainer) {
    searchInput.addEventListener("input", async function () {
      const query = searchInput.value.trim();

      // Reset selected member info
      editMemberInfo.name = "";
      editMemberInfo.email = "";
      editMemberInfo.photo = "";

      // Clear results if the query is empty
      if (query.length === 0) {
        resultsContainer.innerHTML = "";
        return;
      }

      try {
        const csrfTokenElement = document.querySelector(
          'input[name="csrfmiddlewaretoken"]'
        );
        if (!csrfTokenElement) {
          throw new Error("CSRF token not found");
        }
        const csrfToken = csrfTokenElement.value;

        // Get project ID from hidden input (member_list 頁面)
        let projectId = null;
        const projectIdInput = document.getElementById("currentProjectId");
        if (projectIdInput) {
          projectId = projectIdInput.value;
        } else {
          // fallback: Get project ID from URL query parameter
          const urlParams = new URLSearchParams(window.location.search);
          projectId = urlParams.get("project");
        }

        console.log("Using project ID:", projectId);

        // For edit member dialog, is_member_list should always be FALSE
        // because we want to show users NOT in the project for adding
        let is_member_list = false;

        // Check URL path for debug purposes
        const urlPath = window.location.pathname;
        if (urlPath.includes("member_list")) {
          console.log("Note: We're on a member_list page, but still using is_member_list=false for edit dialog");
        }

        // The edit member dialog always needs to show users who are not members yet
        console.log("Using is_member_list:", is_member_list);

        // Fetch search results from the server
        const response = await fetch(`/dynamic_search_member/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({
            search_query: query,
            project_id: projectId,
            is_member_list: is_member_list,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch search results");
        }

        const data = await response.json();
        const users = data.user_data || [];

        // Clear previous results
        resultsContainer.innerHTML = "";

        // Display search results
        if (users.length > 0) {
          users.forEach((user) => {
            const li = document.createElement("li");
            li.innerHTML = `
              <div>
                <img src="${getEditMemberPhotoUrl(
                  user.photo
                )}" class="user-photo">
                <span class="user-name">${user.name}</span>
                <span class="user-email">${user.email}</span>
              </div>
            `;
            li.addEventListener("click", function () {
              // Update selected member info
              editMemberInfo.name = user.name;
              editMemberInfo.email = user.email;
              editMemberInfo.photo = getEditMemberPhotoUrl(user.photo);

              // IMPORTANT: Use our own function directly, not the shared one
              add_edit_member(
                editMemberInfo.name,
                editMemberInfo.email,
                editMemberInfo.photo
              );

              // Clear input and results
              searchInput.value = "";
              resultsContainer.innerHTML = "";

              // Don't close the dialog - allow adding multiple members at once
            });
            resultsContainer.appendChild(li);
          });
        } else {
          // Display "No results found" message
          const li = document.createElement("li");
          li.textContent = "沒有符合成員";
          li.style.color = "var(--light-gray)";
          resultsContainer.appendChild(li);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
        resultsContainer.innerHTML =
          '<li style="color: var(--light-gray);">Error fetching results</li>';
      }
    });
  }

  window.loadExistingMembers = function (members) {
    // Clear existing members first
    window.taskEditing.projectMembers = [];

    // Add each member to the list
    if (Array.isArray(members)) {
      members.forEach((member) => {
        window.taskEditing.projectMembers.push({
          name: member.name,
          email: member.email,
          photo: member.photo || "/static/default-avatar.png",
        });
      });
    }

    // Update UI
    updateProjectMembersListUI();
  };

  // Add event listener for task edit buttons
  const editButtons = document.getElementsByClassName("btn-edit");
  Array.from(editButtons).forEach((editBtn) => {
    editBtn.addEventListener("click", function (e) {
      let projectId = editBtn.getAttribute("data-project-id");

      // If project ID is not on the button, get it from the parent row
      if (!projectId) {
        const row = editBtn.closest("tr");
        projectId = row ? row.getAttribute("data-project-id") : null;
      }

      // Set the project ID for this editing session
      if (projectId) {
        setProjectIdForTaskEdit(projectId);
      }

      // Set referrer to task editing
      if (dialog) {
        dialog.setAttribute("data-referrer-dialog", "editTask");
      }
    });
  });

  // Add a close and add button at the bottom of the dialog
  const editAndCloseBtn = document.getElementById("editAndCloseBtn");
  if (editAndCloseBtn) {
    editAndCloseBtn.addEventListener("click", function () {
      // Close the dialog when the user is done adding members
      closeEditMemberDialogWithAnimation(dialog);
    });
  }
});

// Replace the add_existing_member function to ensure it correctly routes to our function
function add_existing_member(name, email, photo) {
  // If we're in the edit member dialog context, use our own function
  if (
    document.getElementById("editMemberDialog") &&
    document
      .getElementById("editMemberDialog")
      .getAttribute("data-referrer-dialog")
  ) {
    console.log("Routing to add_edit_member from add_existing_member");
    add_edit_member(name, email, photo);
  }
}
