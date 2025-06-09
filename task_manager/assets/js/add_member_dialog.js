// Object to store selected member information - add "Add" prefix to prevent conflicts
const addMemberSelectedInfo = {
  name: "",
  email: "",
  photo: "/static/default-avatar.png", // Default photo path
};

// Array to store the list of added members
const addMemberlist = [];

function add_member_to_list(name, email, photo) {
  // Renamed from add_existing_member to avoid conflicts
  // Check if the member already exists in the list
  const existingMember = addMemberlist.find((member) => member.email === email);
  if (existingMember) {
    return; // Member already exists, do nothing
  }

  // Add the new member to the list
  addMemberlist.push({
    name: name,
    email: email,
    photo: photo || "/static/default-avatar.png", // Default photo path
  });

  // Debug log to verify member is added to the list
  console.log("Added member to addMemberlist:", name, email);

  // Update the members list UI
  updateAddMembersListUI();
}

// Helper function to get a valid photo URL
function getAddMemberPhotoUrl(photo) {
  return photo || "/static/default-avatar.png";
}

// Function to update the members list UI
function updateAddMembersListUI() {
  const membersList = document.getElementById("membersList");

  // Debug check if membersList element exists
  if (!membersList) {
    console.error("membersList element not found!");
    return;
  }

  console.log("Updating membersList UI with", addMemberlist.length, "members");

  membersList.innerHTML = ""; // Clear previous results

  if (addMemberlist.length === 0) {
    // Add a placeholder message when no members
    const emptyLi = document.createElement("li");
    emptyLi.textContent = "尚未新增成員";
    emptyLi.style.color = "var(--light-gray)";
    emptyLi.style.textAlign = "center";
    emptyLi.style.padding = "10px";
    membersList.appendChild(emptyLi);
    return;
  }

  addMemberlist.forEach((member, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="member-box">
        <div>
          <img src="${getAddMemberPhotoUrl(member.photo)}" class="user-photo">
          <span class="user-name">${member.name}</span>
          <span class="user-email">${member.email}</span>
        </div>
        <i class="fa-solid fa-xmark remove-member" data-index="${index}"></i>
      </div>
    `;
    membersList.appendChild(li);
  });

  // Add event listeners to remove buttons
  document.querySelectorAll(".remove-member").forEach((btn) => {
    btn.addEventListener("click", function () {
      const index = parseInt(this.getAttribute("data-index"), 10);
      addMemberlist.splice(index, 1);
      updateAddMembersListUI();
    });
  });
}

// Function to close the dialog with animation
function closeAddMemberDialogWithAnimation(dialog) {
  if (!dialog) return;

  dialog.setAttribute("closing", "");
  setTimeout(() => {
    dialog.removeAttribute("closing");
    dialog.close();
  }, 200); // Match CSS animation duration
}

// Function to clear the member list when switching contexts
function clearAddMemberList() {
  addMemberlist.length = 0;
  updateAddMembersListUI();
}

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("memberSearch");
  const resultsContainer = document.getElementById("memberResults");
  const dialog = document.getElementById("addMemberDialog");
  const closeMemberBtn = document.getElementById("closeMemberBtn");
  const membersList = document.getElementById("membersList");
  const openAddMemberBtn = document.getElementById("openAddMemberBtn");

  // Initialize members list if it exists
  if (membersList) {
    console.log("Initializing membersList UI element");
    updateAddMembersListUI(); // Use the function to initialize the list
  } else {
    console.error("membersList element not found on page load");
  }

  // Open the dialog when the add member button is clicked
  if (openAddMemberBtn) {
    openAddMemberBtn.addEventListener("click", function () {
      if (dialog) {
        // Check if we're in the member list page and set context accordingly
        const urlParts = window.location.pathname.split("/");
        if (urlParts.includes("member_list")) {
          // In the member list context, we're adding members to the project
          dialog.setAttribute("data-member-list-context", "add");
        } else {
          // In other contexts, we're creating new projects/tasks with members
          dialog.setAttribute("data-member-list-context", "create");
        }

        // Reset the member list when opening from the create project or create task view
        // Only if we're in a clean creation context, not editing
        if (
          document.getElementById("createProjectForm") ||
          document.getElementById("createTaskForm")
        ) {
          // Do not clear if we're in the middle of creating a project/task
          // This allows users to add multiple members in sequence
        }

        dialog.showModal();
      }
    });
  }

  // Close button functionality
  if (closeMemberBtn) {
    closeMemberBtn.addEventListener("click", function () {
      closeAddMemberDialogWithAnimation(dialog);
    });
  }

  // Event listener for the search input
  if (searchInput && resultsContainer) {
    searchInput.addEventListener("input", async function () {
      const query = searchInput.value.trim();

      // Reset selected member info
      addMemberSelectedInfo.name = "";
      addMemberSelectedInfo.email = "";
      addMemberSelectedInfo.photo = "";

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
        let is_member_list = false;

        // In the regular add member dialog on the member_list page,
        // we want to show users NOT in the project (is_member_list = false)
        const memberListContext = dialog
          ? dialog.getAttribute("data-member-list-context")
          : null;

        // Debug log to see what context we're in
        console.log("Member dialog context:", memberListContext);

        // For search functionality, we always want is_member_list = false
        // because we want to show users who aren't members yet
        is_member_list = false;

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
                <img src="${getAddMemberPhotoUrl(
                  user.photo
                )}" class="user-photo">
                <span class="user-name">${user.name}</span>
                <span class="user-email">${user.email}</span>
              </div>
            `;
            li.addEventListener("click", function () {
              // Update selected member info
              addMemberSelectedInfo.name = user.name;
              addMemberSelectedInfo.email = user.email;
              addMemberSelectedInfo.photo = getAddMemberPhotoUrl(user.photo);

              // Add the selected member to the list and update the UI
              add_member_to_list(
                addMemberSelectedInfo.name,
                addMemberSelectedInfo.email,
                addMemberSelectedInfo.photo
              );

              // Clear input and results
              searchInput.value = "";
              resultsContainer.innerHTML = "";

              // Ensure the membersList UI is updated
              updateAddMembersListUI();
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

  // Handle form submission for create project
  const createProjectForm = document.getElementById("createProjectForm");
  if (createProjectForm) {
    createProjectForm.addEventListener("submit", function (event) {
      // Create hidden input fields for member list
      addMemberlist.forEach((member, index) => {
        const nameInput = document.createElement("input");
        nameInput.type = "hidden";
        nameInput.name = `member_name_${index}`;
        nameInput.value = member.name;

        const emailInput = document.createElement("input");
        emailInput.type = "hidden";
        emailInput.name = `member_email_${index}`;
        emailInput.value = member.email;

        this.appendChild(nameInput);
        this.appendChild(emailInput);
      });

      // Add member count hidden field
      const countInput = document.createElement("input");
      countInput.type = "hidden";
      countInput.name = "member_count";
      countInput.value = addMemberlist.length;
      this.appendChild(countInput);
    });
  }

  // Handle task form submission
  const createTaskForm = document.getElementById("createTaskForm");
  if (createTaskForm) {
    createTaskForm.addEventListener("submit", function (event) {
      // 不阻止預設提交行為，讓表單自然提交

      // Create hidden input fields for member list
      addMemberlist.forEach((member, index) => {
        const nameInput = document.createElement("input");
        nameInput.type = "hidden";
        nameInput.name = `member_name_${index}`;
        nameInput.value = member.name;

        const emailInput = document.createElement("input");
        emailInput.type = "hidden";
        emailInput.name = `member_email_${index}`;
        emailInput.value = member.email;

        this.appendChild(nameInput);
        this.appendChild(emailInput);
      });

      // Add member count hidden field
      const countInput = document.createElement("input");
      countInput.type = "hidden";
      countInput.name = "member_count";
      countInput.value = addMemberlist.length;
      this.appendChild(countInput);
      // 直接提交表單，讓瀏覽器處理重定向和訊息顯示
      this.submit();
    });
  }

  const memberListForm = document.getElementById("memberListForm");
  if (memberListForm) {
    memberListForm.addEventListener("submit", function (event) {
      // Create hidden input fields for member list
      addMemberlist.forEach((member, index) => {
        const nameInput = document.createElement("input");
        nameInput.type = "hidden";
        nameInput.name = `member_name_${index}`;
        nameInput.value = member.name;

        const emailInput = document.createElement("input");
        emailInput.type = "hidden";
        emailInput.name = `member_email_${index}`;
        emailInput.value = member.email;

        this.appendChild(nameInput);
        this.appendChild(emailInput);
      });

      // Add member count hidden field
      const countInput = document.createElement("input");
      countInput.type = "hidden";
      countInput.name = "member_count";
      countInput.value = addMemberlist.length;
      this.appendChild(countInput);
    });
  }

  // Add a close and add button at the bottom of the dialog
  const addAndCloseBtn = document.getElementById("addAndCloseBtn");
  if (addAndCloseBtn) {
    addAndCloseBtn.addEventListener("click", function () {
      // Close the dialog when the user is done adding members
      closeAddMemberDialogWithAnimation(dialog);
    });
  }

  // Make clearMemberList function available globally for other scripts
  window.clearAddMemberList = clearAddMemberList;
});

// Add a global function to directly check and update the members list UI
window.debugAddMembersList = function () {
  console.log("Current addMemberlist:", addMemberlist);
  const membersList = document.getElementById("membersList");
  console.log("membersList element:", membersList);
  updateAddMembersListUI();
};

// For backwards compatibility with any existing code
function add_existing_member(name, email, photo) {
  // Check if this is being called from edit_member_dialog.js
  if (
    document.getElementById("editMemberDialog") &&
    document
      .getElementById("editMemberDialog")
      .getAttribute("data-referrer-dialog")
  ) {
    // This is being called from edit_member_dialog.js, don't process it here
    console.log(
      "add_existing_member called from edit context, ignoring in add context"
    );
    return;
  }

  add_member_to_list(name, email, photo);
}
