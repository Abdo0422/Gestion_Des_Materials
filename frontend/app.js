// Fetch Employees Data (without token)
async function fetchEmployees() {
    const response = await fetch('https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/employees');
    const employees = await response.json();
    renderEmployeesTable(employees);
}

// Fetch Materials Data (without token)
async function fetchMaterials() {
    const response = await fetch('https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/materials');
    const materials = await response.json();
    renderMaterialsTable(materials);
}

// Render Employees Table
function renderEmployeesTable(employees) {
    const tableBody = document.getElementById('employees-table');
    tableBody.innerHTML = '';

    employees.forEach(emp => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-4 py-2 border">${emp.name}</td>
            <td class="px-4 py-2 border">${emp.department}</td>
            <td class="px-4 py-2 border">${emp.materials.map(m => m.name).join(', ')}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Render Materials Table
function renderMaterialsTable(materials) {
    const tableBody = document.getElementById('materials-table');
    tableBody.innerHTML = '';

    materials.forEach(mat => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-4 py-2 border">${mat.name}</td>
            <td class="px-4 py-2 border">${mat.type}</td>
            <td class="px-4 py-2 border">${mat.serialNumber}</td>
            <td class="px-4 py-2 border">${mat.quantity}</td>
            <td class="px-4 py-2 border">${mat.status}</td>
            <td class="px-4 py-2 border"><img src="${mat.image}" class="w-12 h-12 object-cover rounded-md" alt="${mat.name}"></td>
        `;
        tableBody.appendChild(row);
    });
}

// Logout (if needed)
function logout() {
    sessionStorage.removeItem('token');
    window.location.href = 'login.html';
}

// Call functions to load data
fetchEmployees();
fetchMaterials();