document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById('memberSearch');
    const resultsContainer = document.getElementById('memberResults');

    if (searchInput && resultsContainer) {
        searchInput.addEventListener('input', async function () {
            const query = searchInput.value.trim();

            if (query.length === 0) {
                resultsContainer.innerHTML = ''; // Clear results if input is empty
                return;
            }

            try {
                // Fetch search results from the server
                const response = await fetch(`/dynamic_search_member`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ search_query: query }),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch search results');
                }

                const data = await response.json(); // Assuming the server returns a JSON object
                const users = data.users || []; // Extract users array from the response

                resultsContainer.innerHTML = ''; // Clear previous results

                if (users.length > 0) {
                    users.forEach(user => {
                        const li = document.createElement('li');
                        li.textContent = user.name; // Assuming each user has a 'name' property
                        li.addEventListener('click', () => {
                            console.log(`Selected: ${user.name}`);
                            searchInput.value = user.name; // Set the input to the selected user
                            resultsContainer.innerHTML = ''; // Clear results
                        });
                        resultsContainer.appendChild(li);
                    });
                } else {
                    const li = document.createElement('li');
                    li.textContent = 'No results found';
                    li.style.color = 'var(--light-gray)';
                    resultsContainer.appendChild(li);
                }
            } catch (error) {
                console.error('Error fetching search results:', error);
                resultsContainer.innerHTML = '<li style="color: var(--light-gray);">Error fetching results</li>';
            }
        });
    }

    setup_dialog('openCreateProjectBtn', 'createProjectDialog', 'cancelProjectBtn');
    setup_dialog('addMemberBtn', 'addMemberDialog', 'cancelMemberBtn');
});