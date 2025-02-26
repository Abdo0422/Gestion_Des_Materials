async function fetchUsers() {
    try {
        console.log("fetchUsers() called");

        const isAuthenticated = checkAuth();
        console.log("isAuthenticated:", isAuthenticated);
        if (!isAuthenticated) {
            console.log("Not authenticated, returning");
            return;
        }

        console.log("Authenticated, proceeding to fetch users");
        const response = await fetch('https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/users');
        if (!response.ok) {
            throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
        }
        const users = await response.json();
        const filteredUsers = users.filter(user => user.role !== 'admin');
        renderUsersTable(filteredUsers);
        return users;
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs :", error);
        addNotification(error.message || "Erreur lors du chargement des utilisateurs.", 'error');
        const tableBody = document.getElementById('users-table');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4">Erreur lors du chargement des utilisateurs.</td></tr>';
        }
        return [];
    }
}

function checkAuth() {
    console.log("checkAuth() called");
    if (localStorage.getItem('isAuthenticated') !== 'true') {
        console.log("isAuthenticated is false");
        window.location.href = 'login.html';
        return false;
    }
    console.log("isAuthenticated is true");
    return true;
}

function checkAdmin() {
    if (localStorage.getItem('isAdmin') !== 'true') {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}



document.addEventListener('DOMContentLoaded', async function () {
    console.log("DOMContentLoaded called");

    const isAuthenticated = checkAuth();
    console.log("isAuthenticated (DOMContentLoaded):", isAuthenticated);

    if (!isAuthenticated) {
        console.log("Not authenticated in DOMContentLoaded, returning");
        return;
    }

    const isAdmin = checkAdmin();
    if (!isAdmin) {
        window.location.href = 'login.html';
        return;
    }

    console.log("Authenticated in DOMContentLoaded, proceeding")
    const users = await fetchUsers();
    const searchInput = document.getElementById('user-search');
    const tableBody = document.getElementById('users-table');

    if (!searchInput || !tableBody) {
        console.error("Champ de recherche ou tableau non trouvé !");
        return;
    }

    searchInput.addEventListener('input', function (event) {
        const searchTerm = event.target.value.toLowerCase();

        const filteredUsers = users.filter(user => {
            return user.username.toLowerCase().includes(searchTerm) || user.role.toLowerCase().includes(searchTerm);
        });

        renderUsersTable(filteredUsers);
    });

    const form = document.getElementById('create-user-form');
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const messageDiv = document.getElementById('user-message');

            try {
                const response = await fetch('https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Erreur HTTP ! Statut : ${response.status}`);
                }

                const data = await response.json();
                messageDiv.textContent = data.message;
                messageDiv.classList.remove("hidden", "bg-red-50", "text-red-600");
                messageDiv.classList.add("bg-green-50", "text-green-600");
                form.reset();
                fetchUsers();

            } catch (error) {
                console.error("Erreur lors de la création de l'utilisateur :", error);
                messageDiv.textContent = error.message;
                messageDiv.classList.remove("hidden", "bg-green-50", "text-green-600");
                messageDiv.classList.add("bg-red-50", "text-red-600");
            }
        });
    }
});

function renderUsersTable(users) {
    const tableBody = document.getElementById('users-table');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    if (!users || users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4">Aucun utilisateur trouvé.</td></tr>';
        return;
    }
    users.forEach(user => {
        const row = tableBody.insertRow();
        row.className = "border-b border-gray-100 table-row hover:bg-gray-100";
        const cells = [
            { value: user.username, label: 'Nom d\'utilisateur' },
            { value: user.role || "N/A", label: 'Rôle' },
            { value: user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : "N/A", label: 'Date de création' },
            { value: "Actif", label: 'Statut' }
        ];
        cells.forEach(cellData => {
            const cell = row.insertCell();
            cell.className = "p-4";
            cell.setAttribute('data-label', cellData.label);
            cell.textContent = cellData.value;
        });
        const actionsCell = row.insertCell();
        actionsCell.className = "p-4 text-right";
        actionsCell.setAttribute('data-label', 'Actions');
        const actionsContainer = document.createElement('div');
        actionsContainer.className = "flex items-center justify-end space-x-2";
        const editButton = document.createElement('button');
        editButton.className = "p-2 rounded-lg bg-amber-50 text-moroccan-gold hover:bg-amber-100 transition-colors";
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
        editButton.addEventListener('click', () => openEditModal(user));
        const deleteButton = document.createElement('button');
        deleteButton.className = "p-2 rounded-lg bg-red-50 text-moroccan-red hover:bg-red-100 transition-colors";
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteButton.addEventListener('click', () => deleteUser(parseInt(user.id)));

        if (user.role === 'admin') {
            row.classList.add('opacity-50', 'pointer-events-none');
        }
        actionsContainer.appendChild(editButton);
        actionsContainer.appendChild(deleteButton);
        actionsCell.appendChild(actionsContainer);
    });
}


function logout() {
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('isAdmin');
    window.location.href = 'login.html';
}

let editModal = null;

function openEditModal(user) {
    if (!editModal) {
        editModal = document.createElement('div');
        editModal.className = "fixed inset-0 flex items-center justify-center z-50 hidden bg-black bg-opacity-50";

        editModal.innerHTML = `
        <div class="bg-white rounded-lg p-8 shadow-md w-full max-w-md transition-transform duration-300 ease-in-out">
            <h2 class="text-2xl font-bold mb-4 text-gray-800">Modifier l'utilisateur</h2>
            <form id="edit-user-form">
                <input type="hidden" id="edit-user-id">
                <div class="mb-4">
                    <label for="edit-username" class="block text-gray-700 font-bold mb-2">Nom d'utilisateur</label>
                    <input type="text" id="edit-username" class="border border-gray-300 rounded w-full px-3 py-2 focus:ring-2 focus:ring-blue-500" required>
                </div>
                <div class="mb-4">
                    <label for="edit-password" class="block text-gray-700 font-bold mb-2">Mot de passe (laisser vide pour conserver l'actuel)</label>
                    <input type="password" id="edit-password" class="border border-gray-300 rounded w-full px-3 py-2 focus:ring-2 focus:ring-blue-500">
                </div>
                <div class="mb-4">
                    <label for="edit-role" class="block text-gray-700 font-bold mb-2">Rôle</label>
                    <select id="edit-role" class="border border-gray-300 rounded w-full px-3 py-2 focus:ring-2 focus:ring-blue-500">
                        <option value="manager" selected>Manager</option>
                    </select>
                </div>
                <div class="mb-4 hidden text-red-500" id="edit-user-message"></div>
                <div class="flex justify-end">
                    <button type="submit" class="bg-moroccan-blue hover:bg-moroccan-blue-700 text-white font-bold py-2 px-4 rounded mr-2 focus:outline-none focus>        <div class="bg-white rounded-lg p-8 shadow-md w-full max-w-md transition-transform duration-300 ease-in-out">
            <h2 class="text-2xl font-bold mb-4 text-gray-800">Modifier l'utilisateur</h2>
            <form id="edit-user-form">
                <input type="hidden" id="edit-user-id">
                <div class="mb-4">
                    <label for="edit-username" class="block text-gray-700 font-bold mb-2">Nom d'utilisateur</label>
                    <input type="text" id="edit-username" class="border border-gray-300 rounded w-full px-3 py-2 focus:ring-2 focus:ring-blue-500" required>
                </div>
                <div class="mb-4">
                    <label for="edit-password" class="block text-gray-700 font-bold mb-2">Mot de passe (laisser vide pour conserver l'actuel)</label>
                    <input type="password" id="edit-password" class="border border-gray-300 rounded w-full px-3 py-2 focus:ring-2 focus:ring-blue-500">
                </div>
                <div class="mb-4">
                    <label for="edit-role" class="block text-gray-700 font-bold mb-2">Rôle</label>
                    <select id="edit-role" class="border border-gray-300 rounded w-full px-3 py-2 focus:ring-2 focus:ring-blue-500">
                        <option value="manager" selected>Manager</option>
                    </select>
                </div>
                <div class="mb-4 hidden text-red-500" id="edit-user-message"></div>
                <div class="flex justify-end">
                    <button type="submit" class="bg-moroccan-blue hover:bg-moroccan-blue-700 text-white font-bold py-2 px-4 rounded mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500">Enregistrer</button>
                    <button type="button" id="close-edit-modal" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-300">Annuler</button>
                </div>
            </form>
        </div>
        `;

        document.body.appendChild(editModal);

        const closeButton = editModal.querySelector('#close-edit-modal');
        closeButton.addEventListener('click', () => {
            editModal.classList.add('hidden');
        });

        editModal.querySelector('#edit-user-form').addEventListener('submit', handleEditFormSubmit);

    }

    editModal.classList.remove('hidden');
    editModal.querySelector('#edit-user-id').value = user.id;
    editModal.querySelector('#edit-username').value = user.username;
    editModal.querySelector('#edit-role').value = user.role;
}

async function handleEditFormSubmit(e) {
    e.preventDefault();
    const userId = document.getElementById('edit-user-id').value;
    const username = document.getElementById('edit-username').value;
    const password = document.getElementById('edit-password').value;
    const role = document.getElementById('edit-role').value;
    const messageDiv = document.getElementById('edit-user-message');
    try {
        const response = await fetch(`https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erreur HTTP ! Statut : ${response.status}`);
        }

        const data = await response.json();
        addNotification(data.message, 'success');
        editModal.classList.add('hidden');
        fetchUsers();
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
        addNotification(error.message, 'error');
        messageDiv.textContent = error.message;
        messageDiv.classList.remove('hidden');
        messageDiv.classList.add('text-red-500'); // Ensure error message is red
    }
}


async function deleteUser(id) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
        try {
            const response = await fetch(`https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/users/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erreur HTTP ! Statut : ${response.status}`);
            }
            addNotification("Utilisateur supprimé avec succès !", 'success');
            fetchUsers();
        } catch (error) {
            console.error("Erreur lors de la suppression de l'utilisateur :", error);
            addNotification(error.message || "Erreur lors de la suppression de l'utilisateur. Veuillez réessayer.", 'error');
        }
    }
}


if (!this.notifications) {
    this.notifications = [];
    this.notificationPopupOpen = false;
}

function addNotification(message, type = 'info') {
    const notification = {
        id: Date.now(),
        message: message,
        type: type,
        timestamp: new Date().toLocaleTimeString('fr-FR')
    };
    this.notifications.push(notification);

    setTimeout(() => {
        this.removeNotification(notification.id);
    }, 5000);
}

function toggleNotificationPopup() {
    this.notificationPopupOpen = !this.notificationPopupOpen;
}

function removeNotification(id) {
    this.notifications = this.notifications.filter(notification => notification.id !== id);
}
