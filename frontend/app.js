function dashboardData() {
    return {
        sidebarOpen: false,
        showMaterialForm: false,
        showEmployeeForm: false,
        searchQueryPC: '',
        searchQueryPrinter: '',
        searchQueryScreen:'',
        showMaterialModal: false,
        showMaterialModal2: false,
        editingMaterial: { name: '', serialNumber: '', marque: '', status: '', image: '' },
        editingEmployee: { name: '', department: '', materials: [], createdAt: '' },
        allMaterials: [],
        filteredMaterials: [],
        filteredMaterialNames: [], 
        filteredMaterialMarques: [], 
        employeeModalOpen: false,
        employeeModalOpen2: false,
        materials: [],
        searchQueryMaterials: '',
        employeesPC: [],
        employeesPrinter: [],
        employeesScreen:[],
        selectedFile: null,
        imagePreview: null,

        async init() {
            try {
                await Promise.all([
                    this.fetchAllMaterials(), 
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

            this.employeesScreen = employees.filter(emp => 
                emp.materials && emp.materials.some(mat =>
                    mat.name.toLowerCase().includes("ecran") ||
                    mat.name.toLowerCase().includes("screen") ||
                    mat.name.toLowerCase().includes("monitor")
                )
            );

            this.renderEmployeesTable(this.employeesPC, 'employees-pc-table');
            this.renderEmployeesTable(this.employeesPrinter, 'employees-printer-table');
            this.renderEmployeesTable(this.employeesScreen, 'employees-screen-table'); 
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
                            case 'disponible':  
                                statusClass = 'bg-green-50 text-green-600';
                                break;
                            case 'maintenance':
                            case 'en utilisation':  
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

        filterMaterials(searchTerm) {
            const term = searchTerm.toLowerCase();
            const filteredMaterials = this.materials.filter(mat =>
                mat.name.toLowerCase().includes(term) ||
                mat.marque.toLowerCase().includes(term) ||
                mat.serialNumber.toLowerCase().includes(term) ||
                mat.status.toLowerCase().includes(term)
            );

            this.renderMaterialsTable(filteredMaterials, 'materials-table');
        },

        filterEmployeesPC(searchTerm) {
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
        },

        filterEmployeesPrinter(searchTerm) {
            const term = searchTerm.toLowerCase();
            const filteredPrinter = this.employeesPrinter.filter(emp =>
                emp.name.toLowerCase().includes(term) ||
                emp.department.toLowerCase().includes(term) ||
                (emp.materials && emp.materials.some(mat =>
                    mat.name.toLowerCase().includes(term) ||
                    mat.serialNumber.toLowerCase().includes(term)
                ))
            );
            this.renderEmployeesTable(filteredPrinter, 'employees-printer-table');
        },

        filterEmployeesScreen(searchTerm) {
            const term = searchTerm.toLowerCase();
            const filteredEcrans = this.employeesScreen.filter(emp =>
                emp.name.toLowerCase().includes(term) ||
                emp.department.toLowerCase().includes(term) ||
                (emp.materials && emp.materials.some(mat =>
                    mat.name.toLowerCase().includes(term) ||
                    mat.serialNumber.toLowerCase().includes(term)
                ))
            );
            this.renderEmployeesTable(filteredEcrans, 'employees-screen-table');
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
            const employee = [...this.employeesPC, ...this.employeesPrinter, ...this.employeesScreen].find(e => e.id === id);
            if (!employee) return;

            console.log("Viewing employee details:", employee);

            this.editingEmployee = { ...employee };
            this.employeeModalOpen2 = true;
        },


        editMaterial(id) {
            const material = this.allMaterials.find(m => m.id === id); 
            if (!material) return;

            this.editingMaterial = { ...material };
            this.showMaterialModal = true;
        },

        closeMaterialModal() {
            this.showMaterialModal = false;
            this.editingMaterial = { name: '', serialNumber: '', marque: '', status: '', image: '' }; // Reset the form
            this.selectedFile = null;
            this.imagePreview = null; 
        },

        closeMaterialDetailsModal() {
            this.showMaterialModal2 = false;
            this.editingMaterial = { name: '', serialNumber: '', marque: '', status: '', image: '' }; // Reset the form
        },

        editEmployee(id) {
            const employee = [...this.employeesPC, ...this.employeesPrinter, ...this.employeesScreen].find(e => e.id === parseInt(id));
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

        openAddEmployeeModal(type) {
            this.editingEmployee = { name: '', department: '', materials: [], createdAt: this.getCurrentDateForInput() };
            this.employeeModalOpen = true;
            this.filteredMaterials = this.materials.filter(mat => {
                if (type === 'PC') {
                    return mat.name.toLowerCase().includes("pc") ||
                        mat.name.toLowerCase().includes("laptop") ||
                        mat.name.toLowerCase().includes("macbook");
                } else if (type === 'Printer') {
                    return mat.name.toLowerCase().includes("imprimante") ||
                        mat.name.toLowerCase().includes("printer");
                }
                else if (type === 'Screen') {
                    return mat.name.toLowerCase().includes("ecran") ||
                        mat.name.toLowerCase().includes("screen")||
                        mat.name.toLowerCase().includes("monitor");
                }
                return true;
            });
            this.selectMaterialsInDropdown();
        },

        openAddMaterialModal() {
            this.editingMaterial = {
                name: '',
                marque: '',
                serialNumber: '',
                status: 'Disponible',
                image: null,
                createdAt: this.getCurrentDateForInput()
            };
            this.imagePreview = null;
            this.showMaterialModal = true;
            this.filteredMaterialNames = [];
            this.filteredMaterialMarques = []; 
        },

        autocompleteMaterialName() {
            this.filteredMaterialNames = this.materials.filter(material =>
                material.name.toLowerCase().includes(this.editingMaterial.name.toLowerCase())
            );
        },

        autocompleteMaterialMarque() {
            this.filteredMaterialMarques = this.materials.filter(material =>
                material.marque.toLowerCase().includes(this.editingMaterial.marque.toLowerCase())
            );
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
            } else if (this.employeesScreen.find(emp => emp.id === employee.id)) {
                return this.materials.filter(mat =>
                    mat.name.toLowerCase().includes("ecran") ||
                    mat.name.toLowerCase().includes("screen") ||
                    mat.name.toLowerCase().includes("monitor")
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
                    formData.append('image', this.editingMaterial.image);
                }

                const response = await fetch(url, {
                    method: method,
                    body: formData
                });

                if (!response.ok) {
                    const errorText = await response.text(); 
                    throw new Error(`HTTP error! status: ${response.status} ${response.statusText}. Details: ${errorText}`);
                }

                alert(this.editingMaterial.id ? 'Matériel mis à jour avec succès!' : 'Nouveau matériel ajouté avec succès!');

                this.closeMaterialModal(); 
                await this.fetchAllMaterials();

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
                            return null; 
                        }
                        return {
                            name: material.name,
                            serialNumber: material.serialNumber,
                            image: material.image 
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

                alert('Matériel supprimé avec succès!');

                await this.fetchAllMaterials();
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

                alert('Employé supprimé avec succès!');

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
            try {
                const materials = await this.fetchAllMaterials();
                this.materials = materials;
                const employeeCount = await this.fetchEmployeeCount();
        
                const pcCount = this.materials.filter(mat => mat.name.toLowerCase().includes("pc") || mat.name.toLowerCase().includes("laptop") || mat.name.toLowerCase().includes("macbook")).length;
                const imprimanteCount = this.materials.filter(mat => mat.name.toLowerCase().includes("imprimante") || mat.name.toLowerCase().includes("printer")).length;
                const ecranCount = this.materials.filter(mat => mat.name.toLowerCase().includes("ecran")).length;
        
                const employeeCountElement = document.getElementById('employee-count');
                if (employeeCountElement) {
                    employeeCountElement.textContent = employeeCount;
                } else {
                    console.error("Element with ID 'employee-count' not found!");
                }
        
                const pcCountElement = document.getElementById('pc-count');
                if (pcCountElement) {
                    pcCountElement.textContent = pcCount;
                } else {
                    console.error("Element with ID 'pc-count' not found!");
                }
        
                const imprimanteCountElement = document.getElementById('imprimante-count');
                if (imprimanteCountElement) {
                    imprimanteCountElement.textContent = imprimanteCount;
                } else {
                    console.error("Element with ID 'imprimante-count' not found!");
                }
        
                const ecranCountElement = document.getElementById('ecran-count');
                if (ecranCountElement) {
                    ecranCountElement.textContent = ecranCount;
                } else {
                    console.error("Element with ID 'ecran-count' not found!");
                }
        
                this.createMaterialChart();
        
                const response = await fetch('https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/counts');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log("Data from API:", data);
        
                this.updatePercentageDisplay('employee', data.employeeChange);
                this.updatePercentageDisplay('pc', data.pcChange);
                this.updatePercentageDisplay('imprimante', data.imprimanteChange);
                this.updatePercentageDisplay('ecran', data.ecranChange);
        
            } catch (error) {
                console.error("Error fetching counts or creating chart:", error);
                const countsContainer = document.getElementById('counts-container');
                if (countsContainer) {
                    countsContainer.innerHTML = "<p>Error loading data. Please try again later.</p>";
                }
            }
        },
                
        updatePercentageDisplay(item, change) {
            console.log("updatePercentageDisplay called for:", item, "with change:", change);
        
            const container = document.getElementById(`${item}-change-container`);
            console.log("container", container);
        
            if (!container) {
                console.error(`Container not found for item: ${item}`);
                return;
            }
        
            const element = container.querySelector('p'); // Select the <p> element
            const icon = container.querySelector('i'); // Select the <i> element (icon)
        
            if (change === Infinity || change === "N/A" || change === 0 || !change || change === null || typeof change === 'undefined') {
                if (element) {
                    element.textContent = "N/A";
                } else {
                    console.error(`Element (p) not found within container for item: ${item}`);
                }
        
                if (icon) {
                    icon.className = "fas fa-minus mr-1"; // Set the minus icon class
                    icon.style.color = "gray";
                } else {
                    console.error(`Icon (i) not found within container for item: ${item}`);
                }
                console.log("Change is N/A or invalid, setting display to N/A");
                return;
            }
        
            if (element) {
                element.textContent = `${change}`;
                const color = change.toString().includes('-') ? 'red' : 'green';
                const arrowClass = change.toString().includes('-') ? 'fa-arrow-down' : 'fa-arrow-up'; // Correct class names
        
                console.log('arrowClass', arrowClass); // Log the arrow class
        
                element.style.color = color;
        
                if (icon) {
                    icon.className = `fas ${arrowClass} mr-1`; 
                    
                    icon.style.color = color;
                } else {
                    console.error(`Icon (i) not found within container for item: ${item}`);
                }
        
                console.log("Updated display for:", item, "with color:", color, "and arrowClass:", arrowClass);
            } else {
                console.error(`Element (p) not found within container for item: ${item}`);
            }
        },

        async fetchEmployeeCount() {
            try {
                const response = await fetch('https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/employees');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const employees = await response.json();
                return employees.length;
            } catch (error) {
                console.error("Error fetching employee count:", error);
                return 0; 
            }
        },

        myChart: null, 
        createMaterialChart() {
            const pcCount = this.materials.filter(mat => mat.name.toLowerCase().includes("pc") || mat.name.toLowerCase().includes("laptop") || mat.name.toLowerCase().includes("macbook")).length;
            const imprimanteCount = this.materials.filter(mat => mat.name.toLowerCase().includes("imprimante") || mat.name.toLowerCase().includes("printer")).length;
            const ecranCount = this.materials.filter(mat => mat.name.toLowerCase().includes("ecran")).length;
            const otherCount = this.materials.length - pcCount - imprimanteCount - ecranCount;
        
            const ctx = document.getElementById('material-chart').getContext('2d');
        
            Chart.getChart('material-chart')?.destroy(); 
        
            this.myChart = new Chart(ctx, { 
                type: 'doughnut',
                data: {
                    labels: ['PC', 'Imprimante', 'Ecran', 'Autre'],
                    datasets: [{
                        data: [pcCount, imprimanteCount, ecranCount, otherCount],
                        backgroundColor: [
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(255, 206, 86, 0.8)',
                            'rgba(75, 192, 192, 0.8)'
                        ],
                        borderColor: [
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 99, 132, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }



    };
}


document.addEventListener('DOMContentLoaded', function () {
    const app = dashboardData();
    app.init();

    const stats = [
        { id: "employee-count", percent: 75 },
        { id: "pc-count", percent: 60 },
        { id: "imprimante-count", percent: 40 },
        { id: "ecran-count", percent: 50 }
    ];

    stats.forEach(stat => {
        const circle = document.querySelector(`#${stat.id}`).parentNode.parentNode.querySelector("circle:last-of-type");
        if (circle) {
            let dashArray = 251.2;
            circle.style.strokeDashoffset = `calc(${dashArray} - (${dashArray} * ${stat.percent} / 100))`;
            circle.nextElementSibling.textContent = `${stat.percent}%`;
        }
    });


    const links = document.querySelectorAll('nav a');
    const currentPath = window.location.pathname;

    links.forEach(link => {
        const linkPath = new URL(link.href, window.location.origin).pathname;
        console.log("Link Path:", linkPath, "Current Path:", currentPath); 

        if (linkPath === currentPath) {
            link.classList.add('text-white', 'bg-gradient-to-r', 'from-moroccan-blue', 'to-moroccan-teal');
            console.log("Added active classes to:", link.href); 
        } else {
            link.classList.add('text-gray-600', 'hover:bg-gray-50', 'hover:text-moroccan-teal', 'transition-all', 'duration-200');
            console.log("Added inactive and hover classes to:", link.href); 

            link.addEventListener('mouseover', () => {
                link.classList.add('hover:bg-gray-50', 'hover:text-moroccan-teal', 'transition-all', 'duration-200');
                console.log("Mouseover on:", link.href);
            });

            link.addEventListener('mouseout', () => {
                link.classList.remove('hover:bg-gray-50', 'hover:text-moroccan-teal', 'transition-all', 'duration-200');
                console.log("Mouseout on:", link.href); 
            });
        }

        console.log("Link classes after processing:", link.href, link.classList); 
    });
});