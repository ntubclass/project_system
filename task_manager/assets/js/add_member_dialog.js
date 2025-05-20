// Object to store selected member information
const selectedMemberInfo = {
  name: "",
  email: "",
  photo: "/static/default-avatar.png", // Default photo path
};

// Array to store the list of added members
const addMemberlist = [];

function add_existing_member(name, email, photo) {
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

  // Update the members list UI
  updateMembersListUI();
}

// Helper function to get a valid photo URL
function getPhotoUrl(photo) {
  return photo || "/static/default-avatar.png";
}

// Function to update the members list UI
function updateMembersListUI() {
  const membersList = document.getElementById("membersList");
  if (!membersList) return;

  membersList.innerHTML = ""; // Clear previous results

  addMemberlist.forEach((member, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="member-box">
        <div>
          <img src="${getPhotoUrl(member.photo)}" class="user-photo">
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
      updateMembersListUI();
    });
  });
}

// Function to close the dialog with animation
function closeDialogWithAnimation(dialog) {
  dialog.setAttribute("closing", "");
  setTimeout(() => {
    dialog.removeAttribute("closing");
    dialog.close();
  }, 200); // Match CSS animation duration
}

// Function to clear the member list when switching contexts
function clearMemberList() {
  addMemberlist.length = 0;
  updateMembersListUI();
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
    membersList.innerHTML = "";
  }

  // Open the dialog when the add member button is clicked
  if (openAddMemberBtn) {
    openAddMemberBtn.addEventListener("click", function () {
      if (dialog) {
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
      closeDialogWithAnimation(dialog);
    });
  }

  // Event listener for the search input
  if (searchInput && resultsContainer) {
    searchInput.addEventListener("input", async function () {
      const query = searchInput.value.trim();

      // Reset selected member info
      selectedMemberInfo.name = "";
      selectedMemberInfo.email = "";
      selectedMemberInfo.photo = "";

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

         const urlParts = window.location.pathname.split("/");
        let projectId = null;

        // If the URL contains 'member_list', ignore projectId
        if (urlParts.includes("member_list")) {
          projectId = null;
        } else {
          // Try to find a numeric segment as projectId (for /project/ID/ and similar)
          for (let i = 0; i < urlParts.length; i++) {
            if (/^\d+$/.test(urlParts[i])) {
              projectId = urlParts[i];
              break;
            }
          }
        }

        // Fetch search results from the server
        const response = await fetch(`/dynamic_search_member/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({ search_query: query, project_id: projectId }),
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
                <img src="${getPhotoUrl(user.photo)}" class="user-photo">
                <span class="user-name">${user.name}</span>
                <span class="user-email">${user.email}</span>
              </div>
            `;
            li.addEventListener("click", () => {
              // Update selected member info
              selectedMemberInfo.name = user.name;
              selectedMemberInfo.email = user.email;
              selectedMemberInfo.photo = getPhotoUrl(user.photo);

              // Add the selected member
              add_existing_member(
                selectedMemberInfo.name,
                selectedMemberInfo.email,
                selectedMemberInfo.photo
              );

              // Clear input and results
              searchInput.value = "";
              resultsContainer.innerHTML = "";

              // Close the dialog
              closeDialogWithAnimation(dialog);
            });
            resultsContainer.appendChild(li);
          });
        } else {
          // Display "No results found" message
          const li = document.createElement("li");
          li.textContent = "No results found";
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

  // Make clearMemberList function available globally for other scripts
  window.clearAddMemberList = clearMemberList;
});
