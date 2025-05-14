// Object to store selected member information
const selectedMemberInfo = {
    name: '',
    email: '',
    photo: '/static/default-avatar.png', // Default photo path
};

// Array to store the list of added members
const addMemberlist = [];

// Helper function to get a valid photo URL
function getPhotoUrl(photo) {
    return photo || '/static/default-avatar.png';
}

// Function to close the dialog with animation
function closeDialogWithAnimation(dialog) {
    dialog.setAttribute('closing', '');
    setTimeout(() => {
        dialog.removeAttribute('closing');
        dialog.close();
    }, 200); // Match CSS animation duration
}

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById('memberSearch');
    const resultsContainer = document.getElementById('memberResults');
    const addMemberBtn = document.getElementById('addMemberBtn');
    const dialog = document.getElementById('addMemberDialog');
    const membersList = document.getElementById('membersList');

    // Clear previous results in the members list
    membersList.innerHTML = '';

    // Event listener for the search input
    if (searchInput && resultsContainer) {
        searchInput.addEventListener('input', async function () {
            const query = searchInput.value.trim();

            // Reset selected member info
            selectedMemberInfo.name = "";
            selectedMemberInfo.email = "";
            selectedMemberInfo.photo = "";

            // Clear results if the query is empty
            if (query.length === 0) {
                resultsContainer.innerHTML = '';
                return;
            }

            try {
                const csrfTokenElement = document.querySelector('input[name="csrfmiddlewaretoken"]');
                if (!csrfTokenElement) {
                    throw new Error('CSRF token not found');
                }
                const csrfToken = csrfTokenElement.value;
                // use url search params to get project id
                const urlParts = window.location.pathname.split("/");
                let projectId = null; // Initialize projectId to null
                if (urlParts.length > 3) {
                    projectId = urlParts[urlParts.length - 2];
                }
                

                // Fetch search results from the server
                const response = await fetch(`/dynamic_search_member/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                    },
                    body: JSON.stringify({ search_query: query, project_id: projectId }),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch search results');
                }

                const data = await response.json(); // Parse the JSON response
                const users = data.user_data || []; // Extract user data

                // Clear previous results
                resultsContainer.innerHTML = '';

                // Display search results
                if (users.length > 0) {
                    users.forEach(user => {
                        const li = document.createElement('li');
                        li.innerHTML = `
                            <div>
                                <img src="${getPhotoUrl(user.photo)}" class="user-photo">
                                <span class="user-name">${user.name}</span>
                                <span class="user-email">${user.email}</span>
                            </div>
                        `;
                        li.addEventListener('click', () => {
                            // Set the input to the selected user
                            searchInput.value = user.name;

                            // Update selected member info
                            selectedMemberInfo.name = user.name;
                            selectedMemberInfo.email = user.email;
                            selectedMemberInfo.photo = getPhotoUrl(user.photo);

                            // Clear results and highlight the selected user
                            resultsContainer.innerHTML = '';
                            resultsContainer.appendChild(li);

                            // Do nothing if no member is selected
                            if (selectedMemberInfo.name === '') {
                                return;
                            }

                            // Add the selected member to the list, checking for duplicates
                            const existingMember = addMemberlist.find(member => member.email === selectedMemberInfo.email);
                            if (existingMember) {
                                return;
                            }

                            addMemberlist.push({
                                name: selectedMemberInfo.name,
                                email: selectedMemberInfo.email,
                                photo: getPhotoUrl(selectedMemberInfo.photo),
                            });

                            // Render the updated members list
                            membersList.innerHTML = ''; // Clear previous results
                            addMemberlist.forEach(member => {
                                const li = document.createElement('li');
                                li.innerHTML = `
                                    <div class="member-box">
                                        <div>
                                            <img src="${getPhotoUrl(member.photo)}" class="user-photo">
                                            <span class="user-name">${member.name}</span>
                                            <span class="user-email">${member.email}</span>
                                        </div>
                                        <i class="fa-solid fa-xmark"></i>
                                    </div>
                                `;
                                membersList.appendChild(li);
                            });

                            // Close the dialog
                            closeDialogWithAnimation(dialog);
                        });
                        resultsContainer.appendChild(li);
                    });
                } else {
                    // Display "No results found" message
                    const li = document.createElement('li');
                    li.textContent = 'No results found';
                    li.style.color = 'var(--light-gray)';
                    resultsContainer.appendChild(li);
                }
            } catch (error) {
                console.error('Error fetching search results:', error);

                // Display error message
                resultsContainer.innerHTML = '<li style="color: var(--light-gray);">Error fetching results</li>';
            }
        });
    }

    const createProjectForm = document.getElementById('createProjectForm');
    if (createProjectForm) {
        createProjectForm.addEventListener('submit', function(event) {
            // 創建隱藏輸入欄位來存儲成員列表
            addMemberlist.forEach((member, index) => {
                const nameInput = document.createElement('input');
                nameInput.type = 'hidden';
                nameInput.name = `member_name_${index}`;
                nameInput.value = member.name;
                
                const emailInput = document.createElement('input');
                emailInput.type = 'hidden';
                emailInput.name = `member_email_${index}`;
                emailInput.value = member.email;
                
                this.appendChild(nameInput);
                this.appendChild(emailInput);
            });
            
            // 添加成員數量的隱藏欄位
            const countInput = document.createElement('input');
            countInput.type = 'hidden';
            countInput.name = 'member_count';
            countInput.value = addMemberlist.length;
            this.appendChild(countInput);
        });
    }
    const createTaskForm = document.getElementById('createTaskForm');
    if (createTaskForm) {
        createTaskForm.addEventListener('submit', function(event) {
            // 創建隱藏輸入欄位來存儲成員列表
            addMemberlist.forEach((member, index) => {
                const nameInput = document.createElement('input');
                nameInput.type = 'hidden';
                nameInput.name = `member_name_${index}`;
                nameInput.value = member.name;

                const emailInput = document.createElement('input');
                emailInput.type = 'hidden';
                emailInput.name = `member_email_${index}`;
                emailInput.value = member.email;
                
                this.appendChild(nameInput);
                this.appendChild(emailInput);
            });

            // 添加成員數量的隱藏欄位
            const countInput = document.createElement('input');
            countInput.type = 'hidden';
            countInput.name = 'member_count';
            countInput.value = addMemberlist.length;
            this.appendChild(countInput);
    });
        }
});