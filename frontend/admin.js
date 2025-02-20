async function fetchUsers() {
    const response = await fetch('https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/users');
    const users = await response.json();
    renderUsersTable(users);
}

document.getElementById('create-user-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/users', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    document.getElementById('user-message').textContent = data.message;
    fetchUsers();
});

function renderUsersTable(users) {
    const tableBody = document.getElementById('users-table');
    tableBody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.classList.add('hover:bg-gray-100');
        row.innerHTML = `
            <td class="px-6 py-4 text-sm font-medium text-gray-800">${user.username}</td>
            <td class="px-6 py-4 text-sm font-medium text-gray-600">${user.role}</td>
        `;
        tableBody.appendChild(row);
    });
}


function logout() {
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

fetchUsers();
