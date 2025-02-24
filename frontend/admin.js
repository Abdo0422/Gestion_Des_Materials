async function fetchUsers() {
    try {
        const response = await fetch('https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/users');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const users = await response.json();
        renderUsersTable(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        const tableBody = document.getElementById('users-table');
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4">Error loading users.</td></tr>';

    }
}

document.getElementById('create-user-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('user-message');

    try {
        const response = await fetch('https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const errorData = await response.json();  // Try to parse error response
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`); // Use parsed message or generic
        }

        const data = await response.json();
        messageDiv.textContent = data.message;
        messageDiv.classList.remove("hidden");
        messageDiv.classList.remove("bg-red-50", "text-red-600");
        messageDiv.classList.add("bg-green-50", "text-green-600");
        document.getElementById('create-user-form').reset(); //Clear the form
        fetchUsers(); // Refresh the user table

    } catch (error) {
        console.error("Error creating user:", error);
        messageDiv.textContent = error.message;  // Display the error message
        messageDiv.classList.remove("hidden");
        messageDiv.classList.remove("bg-green-50", "text-green-600");
        messageDiv.classList.add("bg-red-50", "text-red-600");
    }
});


function renderUsersTable(users) {
    const tableBody = document.getElementById('users-table');
    tableBody.innerHTML = ''; // Clear existing rows

    if (!users || users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4">No users found.</td></tr>';
        return; // Exit early if no users
    }

    users.forEach(user => {
        const row = document.createElement('tr');
        row.classList.add('hover:bg-gray-100');
        row.innerHTML = `
            <td class="px-6 py-4 text-sm font-medium text-gray-800">${user.username}</td>
            <td class="px-6 py-4 text-sm font-medium text-gray-600">${user.role || "N/A"}</td>  <td class="px-6 py-4 text-sm font-medium text-gray-600">${new Date(user.createdAt).toLocaleDateString()}</td>
            <td class="px-6 py-4 text-sm font-medium text-gray-600">Active</td>  <td class="px-6 py-4 text-sm font-medium text-gray-600 text-right">
                <button class="text-moroccan-teal hover:text-moroccan-blue mr-2">Edit</button>
                <button class="text-red-500 hover:text-red-700">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}


fetchUsers();


function logout() {
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    window.location.href = 'login.html'; 
}
