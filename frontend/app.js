function dashboardData() {
    return {
        sidebarOpen: false,
        showMaterialForm: false,
        showEmployeeForm: false,
        searchQuery: '',
        showMaterialModal: false,
        showMaterialModal2: false,
        editingMaterial: { name: '', serialNumber: '', marque: '', status: '', image: '' },
        editingEmployee: { name: '', department: '', materials: [], createdAt: '' },
        allMaterials: [],
        filteredMaterials: [],
        employeeModalOpen: false,
        employeeModalOpen2: false,
        materials: [],
        employeesPC: [],
        employeesPrinter: [],
        selectedFile: null,
        imagePreview: null,

        async init() {
            try {
                await Promise.all([
                    this.fetchAllMaterials(), // Fetch all materials ONCE
                    this.fetchEmployees(),
                    this.fetchCounts()
                ]);
            } catch (error) {
                console.error("Error during initialization:", error);
            }
        },

        async fetchAllMaterials() {
            try {
                const response = await fetch('https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/materials');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                this.allMaterials = await response.json();
                this.materials = [...this.allMaterials];
                this.filteredMaterials = [...this.allMaterials];
                this.renderMaterialsTable(this.materials);
                return this.allMaterials;
            } catch (error) {
                console.error("Error fetching materials:", error);
            }
        },


        async fetchEmployees() {
            try {
                const response = await fetch('https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/employees');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const employees = await response.json();
                this.processEmployees(employees);
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        },

        processEmployees(employees) {
            this.employeesPC = employees.filter(emp =>
                emp.materials && emp.materials.some(mat =>
                    mat.name.toLowerCase().includes("pc") ||
                    mat.name.toLowerCase().includes("laptop") ||
                    mat.name.toLowerCase().includes("macbook")
                )
            );

            this.employeesPrinter = employees.filter(emp =>
                emp.materials && emp.materials.some(mat =>
                    mat.name.toLowerCase().includes("imprimante") ||
                    mat.name.toLowerCase().includes("printer")
                )
            );

            this.renderEmployeesTable(this.employeesPC, 'employees-pc-table');
            if (document.getElementById('employees-printer-table')) {
                this.renderEmployeesTable(this.employeesPrinter, 'employees-printer-table');
            }
        },

        renderEmployeesTable(employees, tableId) {
            const tableBody = document.getElementById(tableId);
            if (!tableBody) return;
            tableBody.innerHTML = '';

            if (!employees || employees.length === 0) {
                const row = tableBody.insertRow();
                const cell = row.insertCell();
                cell.colSpan = 6;
                cell.textContent = "Aucun employé disponible.";
                cell.className = "p-4 text-center text-gray-500 italic";
                return;
            }

            employees.forEach(emp => {
                const row = document.createElement('tr');
                row.className = "border-b border-gray-100 table-row";

                const material = emp.materials && emp.materials[0];

                // Create cells with appropriate data-label attributes for responsive design
                const nameCell = document.createElement('td');
                nameCell.className = "p-4";
                nameCell.setAttribute('data-label', 'Nom');
                nameCell.textContent = emp.name;

                const deptCell = document.createElement('td');
                deptCell.className = "p-4";
                deptCell.setAttribute('data-label', 'Département');
                deptCell.textContent = emp.department;

                const matCell = document.createElement('td');
                matCell.className = "p-4";
                matCell.setAttribute('data-label', 'Matériel');
                matCell.textContent = material ? material.name : "N/A";

                const serialCell = document.createElement('td');
                serialCell.className = "p-4";
                serialCell.setAttribute('data-label', 'Numéro de Série');
                serialCell.textContent = material ? material.serialNumber : "N/A";

                const imgCell = document.createElement('td');
                imgCell.className = "p-4";
                imgCell.setAttribute('data-label', 'Image');

                if (material && material.image) {
                    const imgContainer = document.createElement('div');
                    imgContainer.className = "w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden";

                    const img = document.createElement('img');
                    img.src = this.getImageUrl(material.image);
                    img.alt = material.name;
                    img.className = "object-cover w-full h-full";

                    imgContainer.appendChild(img);
                    imgCell.appendChild(imgContainer);
                } else {
                    const placeholder = document.createElement('div');
                    placeholder.className = "w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400";
                    placeholder.innerHTML = '<i class="fas fa-image"></i>';
                    imgCell.appendChild(placeholder);
                }

                const actionsCell = document.createElement('td');
                actionsCell.className = "p-4 text-right";
                actionsCell.setAttribute('data-label', 'Actions');

                const actionsContainer = document.createElement('div');
                actionsContainer.className = "flex items-center justify-end space-x-2";

                const viewBtn = document.createElement('button');
                viewBtn.className = "p-2 rounded-lg bg-blue-50 text-moroccan-blue hover:bg-blue-100 transition-colors";
                viewBtn.innerHTML = '<i class="fas fa-eye"></i>';
                viewBtn.addEventListener('click', () => this.viewEmployeeDetails(emp.id));

                const editBtn = document.createElement('button');
                editBtn.className = "p-2 rounded-lg bg-amber-50 text-moroccan-gold hover:bg-amber-100 transition-colors";
                editBtn.innerHTML = '<i class="fas fa-edit"></i>';
                editBtn.addEventListener('click', () => this.editEmployee(emp.id));

                const deleteBtn = document.createElement('button');
                deleteBtn.className = "p-2 rounded-lg bg-red-50 text-moroccan-red hover:bg-red-100 transition-colors";
                deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
                deleteBtn.addEventListener('click', () => this.deleteEmployee(emp.id));

                actionsContainer.appendChild(viewBtn);
                actionsContainer.appendChild(editBtn);
                actionsContainer.appendChild(deleteBtn);
                actionsCell.appendChild(actionsContainer);

                row.appendChild(nameCell);
                row.appendChild(deptCell);
                row.appendChild(matCell);
                row.appendChild(serialCell);
                row.appendChild(imgCell);
                row.appendChild(actionsCell);

                tableBody.appendChild(row);
            });
        },

        renderMaterialsTable(materials) {
            const tableBody = document.getElementById('materials-table');
            if (!tableBody) return;

            tableBody.innerHTML = '';

            if (!materials || materials.length === 0) {
                const row = tableBody.insertRow();
                const cell = row.insertCell();
                cell.colSpan = 6;
                cell.textContent = "Aucun matériel disponible.";
                cell.className = "p-4 text-center text-gray-500 italic";
                return;
            }

            materials.forEach(mat => {
                const row = document.createElement('tr');
                row.className = "border-b border-gray-100 table-row";

                const cells = [
                    { value: mat.name, label: 'Nom' },
                    { value: mat.marque, label: 'Marque' },
                    { value: mat.serialNumber, label: 'Numéro de Série' },
                    { value: mat.status, label: 'Statut', isStatus: true }
                ];

                cells.forEach(cellData => {
                    const cell = document.createElement('td');
                    cell.className = "p-4";
                    cell.setAttribute('data-label', cellData.label);

                    if (cellData.isStatus) {
                        const statusSpan = document.createElement('span');
                        let statusClass = '';

                        switch (cellData.value.toLowerCase()) {
                            case 'actif':
                            case 'active':
                                statusClass = 'bg-green-50 text-green-600';
                                break;
                            case 'maintenance':
                                statusClass = 'bg-yellow-50 text-yellow-600';
                                break;
                            case 'défectueux':
                            case 'defectueux':
                            case 'broken':
                                statusClass = 'bg-red-50 text-red-600';
                                break;
                            default:
                                statusClass = 'bg-gray-50 text-gray-600';
                        }

                        statusSpan.className = `px-2 py-1 rounded-full ${statusClass} text-xs`;
                        statusSpan.textContent = cellData.value;
                        cell.appendChild(statusSpan);
                    } else {
                        cell.textContent = cellData.value;
                    }

                    row.appendChild(cell);
                });

                // Image cell
                const imgCell = document.createElement('td');
                imgCell.className = "p-4";
                imgCell.setAttribute('data-label', 'Image');

                if (mat.image) {
                    const imgContainer = document.createElement('div');
                    imgContainer.className = "w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden";

                    const img = document.createElement('img');
                    img.src = this.getImageUrl(mat.image);
                    img.alt = mat.name;
                    img.className = "object-cover w-full h-full";

                    imgContainer.appendChild(img);
                    imgCell.appendChild(imgContainer);
                } else {
                    const placeholder = document.createElement('div');
                    placeholder.className = "w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400";
                    placeholder.innerHTML = '<i class="fas fa-image"></i>';
                    imgCell.appendChild(placeholder);
                }

                row.appendChild(imgCell);

                // Actions cell
                const actionsCell = document.createElement('td');
                actionsCell.className = "p-4 text-right";
                actionsCell.setAttribute('data-label', 'Actions');

                const actionsContainer = document.createElement('div');
                actionsContainer.className = "flex items-center justify-end space-x-2";

                const viewBtn = document.createElement('button');
                viewBtn.className = "p-2 rounded-lg bg-blue-50 text-moroccan-blue hover:bg-blue-100 transition-colors";
                viewBtn.innerHTML = '<i class="fas fa-eye"></i>';
                viewBtn.addEventListener('click', () => this.viewMaterialDetails(mat.id));

                const editBtn = document.createElement('button');
                editBtn.className = "p-2 rounded-lg bg-amber-50 text-moroccan-gold hover:bg-amber-100 transition-colors";
                editBtn.innerHTML = '<i class="fas fa-edit"></i>';
                editBtn.addEventListener('click', () => this.editMaterial(mat.id));

                const deleteBtn = document.createElement('button');
                deleteBtn.className = "p-2 rounded-lg bg-red-50 text-moroccan-red hover:bg-red-100 transition-colors";
                deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
                deleteBtn.addEventListener('click', () => this.deleteMaterial(mat.id));

                actionsContainer.appendChild(viewBtn);
                actionsContainer.appendChild(editBtn);
                actionsContainer.appendChild(deleteBtn);
                actionsCell.appendChild(actionsContainer);

                row.appendChild(actionsCell);

                tableBody.appendChild(row);
            });
        },

        // Search and filter functionality
        filterEmployees(searchTerm) {
            this.searchQuery = searchTerm;
            if (!searchTerm) {
                this.renderEmployeesTable(this.employeesPC, 'employees-pc-table');
                if (document.getElementById('employees-printer-table')) {
                    this.renderEmployeesTable(this.employeesPrinter, 'employees-printer-table');
                }
                return;
            }

            const term = searchTerm.toLowerCase();

            const filteredPC = this.employeesPC.filter(emp =>
                emp.name.toLowerCase().includes(term) ||
                emp.department.toLowerCase().includes(term) ||
                (emp.materials && emp.materials.some(mat =>
                    mat.name.toLowerCase().includes(term) ||
                    mat.serialNumber.toLowerCase().includes(term)
                ))
            );

            this.renderEmployeesTable(filteredPC, 'employees-pc-table');

            if (document.getElementById('employees-printer-table')) {
                const filteredPrinter = this.employeesPrinter.filter(emp =>
                    emp.name.toLowerCase().includes(term) ||
                    emp.department.toLowerCase().includes(term) ||
                    (emp.materials && emp.materials.some(mat =>
                        mat.name.toLowerCase().includes(term) ||
                        mat.serialNumber.toLowerCase().includes(term)
                    ))
                );
                this.renderEmployeesTable(filteredPrinter, 'employees-printer-table');
            }
        },

        // CRUD operations
        viewMaterialDetails(id) {
            const material = this.materials.find(m => m.id === id);
            if (!material) return;

            console.log("Viewing material details:", material);
            this.editingMaterial = { ...material };
            this.showMaterialModal2 = true;
        },

        viewEmployeeDetails(id) {
            const employee = [...this.employeesPC, ...this.employeesPrinter].find(e => e.id === id);
            if (!employee) return;

            console.log("Viewing employee details:", employee);

            this.editingEmployee = { ...employee };
            this.employeeModalOpen2 = true;
        },


        editMaterial(id) {
            const material = this.allMaterials.find(m => m.id === id); // Use allMaterials for consistency
            if (!material) return;

            this.editingMaterial = { ...material };
            this.showMaterialModal = true; // Open the modal
        },

        closeMaterialModal() {
            this.showMaterialModal = false;
            this.editingMaterial = { name: '', serialNumber: '', marque: '', status: '', image: '' }; // Reset the form
            this.selectedFile = null; 
            this.imagePreview = null; e
        },

        closeMaterialDetailsModal() {
            this.showMaterialModal2 = false;
            this.editingMaterial = { name: '', serialNumber: '', marque: '', status: '', image: '' }; // Reset the form
        },

        editEmployee(id) {
            const employee = [...this.employeesPC, ...this.employeesPrinter].find(e => e.id === parseInt(id));
            if (!employee) return;

            this.editingEmployee = { ...employee };

            if (!this.editingEmployee.id || !this.editingEmployee.createdAt) {
                this.editingEmployee.createdAt = this.getCurrentDateForInput();
            }

            this.employeeModalOpen = true;
            this.filteredMaterials = this.getFilteredMaterials(employee);

            this.editingEmployee.materials = employee.materials.map(matId => {
                const foundMaterial = this.allMaterials.find(m => m.id === parseInt(matId));
                return foundMaterial ? foundMaterial : { id: matId, name: "Material not found" }; // Handle cases where material might be deleted
            });

            queueMicrotask(() => {
                this.selectMaterialsInDropdown();
            });
        },

        selectMaterialsInDropdown() {
            const select = document.querySelector('#employeeModalSelect');
            if (select) {
                const options = Array.from(select.options);
                options.forEach(option => {
                    option.selected = this.editingEmployee.materials.some(mat => mat.id === parseInt(option.value));
                    console.log("option selected:", option.selected, option.value, this.editingEmployee.materials);
                });
            }
        },

        getFilteredMaterials(employee) {
            if (this.employeesPC.find(emp => emp.id === employee.id)) {
                return this.materials.filter(mat =>
                    mat.name.toLowerCase().includes("pc") ||
                    mat.name.toLowerCase().includes("laptop") ||
                    mat.name.toLowerCase().includes("macbook")
                );
            } else if (this.employeesPrinter.find(emp => emp.id === employee.id)) {
                return this.materials.filter(mat =>
                    mat.name.toLowerCase().includes("imprimante") ||
                    mat.name.toLowerCase().includes("printer")
                );
            } else {
                return this.materials;
            }
        },


        closeEmployeeEditModal() {
            this.employeeModalOpen = false;
            this.editingEmployee = { name: '', department: '', materials: [], createdAt: '' }; // Reset editingEmployee, including createdAt
            this.filteredMaterials = this.materials;
        },

        closeEmployeeDetailsModal() {
            this.employeeModalOpen2 = false;
            this.editingEmployee = { name: '', department: '', materials: [], createdAt: '' }; // Reset editingEmployee, including createdAt
        },



        async saveMaterial() {
            try {
                const method = this.editingMaterial.id ? 'PUT' : 'POST';
                const url = this.editingMaterial.id
                    ? `https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/materials/${this.editingMaterial.id}`
                    : 'https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/materials';

                const formData = new FormData();
                formData.append('name', this.editingMaterial.name);
                formData.append('marque', this.editingMaterial.marque);
                formData.append('serialNumber', this.editingMaterial.serialNumber);
                formData.append('status', this.editingMaterial.status);

                if (this.selectedFile) {
                    formData.append('image', this.selectedFile);
                } else if (this.editingMaterial.image && !this.imagePreview) {
                    //If no new file is selected but an image exists, keep the image
                    formData.append('image', this.editingMaterial.image);
                }

                const response = await fetch(url, {
                    method: method,
                    body: formData
                });

                if (!response.ok) {
                    const errorText = await response.text(); // Get error details from the server
                    throw new Error(`HTTP error! status: ${response.status} ${response.statusText}. Details: ${errorText}`);
                }

                // Success message
                alert(this.editingMaterial.id ? 'Matériel mis à jour avec succès!' : 'Nouveau matériel ajouté avec succès!');

                // Reset form and refresh data
                this.closeMaterialModal(); // Close the modal instead of showMaterialForm = false;
                await this.fetchAllMaterials();// Refresh all the materials

            } catch (error) {
                console.error("Error saving material:", error);
                alert("Une erreur s'est produite lors de l'enregistrement du matériel. Vérifiez les détails dans la console."); // More informative message
            }
        },

        formatDateForAPI(dateString) {
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                return dateString;
            }

            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },

        formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR');
        },

        getCurrentDateForInput() {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },

        async saveEmployee() {
            try {
                const method = this.editingEmployee.id ? 'PUT' : 'POST';
                const url = parseInt(this.editingEmployee.id)
                    ? `https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/employees/${this.editingEmployee.id}`
                    : 'https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/employees';

                const formattedDate = this.formatDateForAPI(this.editingEmployee.createdAt);

                const selectedMaterialObjects = Array.from(document.querySelectorAll('#employeeModalSelect option:checked'))
                    .map(option => {
                        const materialId = parseInt(option.value);
                        const material = this.allMaterials.find(m => m.id === materialId);
                        if (!material) {
                            console.warn(`Material with ID ${materialId} not found. Skipping.`);
                            return null; // or handle the missing material as needed
                        }
                        return {
                            name: material.name,
                            serialNumber: material.serialNumber,
                            image: material.image // Include other properties as needed
                        };
                    })
                    .filter(material => material !== null);


                const employeeData = {
                    ...this.editingEmployee,
                    createdAt: formattedDate,
                    materials: selectedMaterialObjects
                };
                console.log("employee updated:", employeeData);

                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(employeeData)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status} ${response.statusText}. Details: ${errorText}`);
                }

                alert(this.editingEmployee.id ? 'Employé mis à jour avec succès!' : 'Nouvel employé ajouté avec succès!');

                this.closeEmployeeEditModal();
                await this.fetchEmployees();

            } catch (error) {
                console.error("Error saving employee:", error);
                alert("Une erreur s'est produite lors de l'enregistrement de l'employé.");
            }
        },


        async deleteMaterial(id) {
            try {
                if (!confirm('Êtes-vous sûr de vouloir supprimer ce matériel?')) return;

                const response = await fetch(`https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/materials/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Success message
                alert('Matériel supprimé avec succès!');

                // Refresh data
                await this.fetchMaterials();
            } catch (error) {
                console.error("Error deleting material:", error);
                alert("Une erreur s'est produite lors de la suppression du matériel.");
            }
        },

        async deleteEmployee(id) {
            try {
                if (!confirm('Êtes-vous sûr de vouloir supprimer cet employé?')) return;

                const response = await fetch(`https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/employees/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Success message
                alert('Employé supprimé avec succès!');

                // Refresh data
                await this.fetchEmployees();
            } catch (error) {
                console.error("Error deleting employee:", error);
                alert("Une erreur s'est produite lors de la suppression de l'employé.");
            }
        },


        handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            this.selectedFile = file;

            const reader = new FileReader();
            reader.onload = (e) => {
                this.imagePreview = e.target.result;
            };
            reader.readAsDataURL(file);
        },

        // Helper methods
        getImageUrl(imagePath) {
            if (!imagePath) return '/api/placeholder/100/100';

            if (imagePath.startsWith('http')) {
                return imagePath;
            }

            return `https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/backend/images/${imagePath.split('/').pop()}`;
        },

        formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR');
        },

        logout() {
            localStorage.removeItem('role');
            localStorage.removeItem('username');
            window.location.href = 'login.html';
            console.log('Déconnexion effectuée');
        },




        async fetchCounts() {
            const countsContainer = document.getElementById('counts-container');
            const employeeCount = document.getElementById('employee-count');
            const imprimanteCount = document.getElementById('imprimante-count');
            const pcCount = document.getElementById('pc-count');
            const ecranCount = document.getElementById('ecran-count');

            if (!countsContainer || !employeeCount || !imprimanteCount || !pcCount || !ecranCount) {
                console.error("One or more count elements are missing in the HTML.");
                return;
            }

            try {
                const response = await fetch('https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/counts');

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status} ${response.statusText}. Details: ${errorText}`);
                }

                const counts = await response.json();

                employeeCount.textContent = counts.numEmployees;
                imprimanteCount.textContent = counts.numImprimantes;
                pcCount.textContent = counts.numPCs;
                ecranCount.textContent = counts.numEcrans;

            } catch (error) {
                console.error("Error fetching counts:", error);
                countsContainer.innerHTML = `<p>Error loading counts: ${error.message}</p>`;
            }
        }


    };
}


document.addEventListener('DOMContentLoaded', function () {
    const app = dashboardData();
    app.init();
});