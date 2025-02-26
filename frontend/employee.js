const departments = [
  { id: 1, nomdepart: "Section de l'Immobilier (قسم العقار)" },
  {
    id: 2,
    nomdepart: "Section des Difficultés des Entreprises (قسم صعوبة المقاولة)",
  },
  { id: 3, nomdepart: "Section des Référés (قسم الاستعجال)" },
  { id: 4, nomdepart: "Section de la Saisie-arrêt (قسم الحجز لدى الغير)" },
  { id: 5, nomdepart: "Section du Fond (قسم الموضوع)" },
  { id: 6, nomdepart: "Section des Litiges Maritimes (قسم المنازعات البحرية)" },
  {
    id: 7,
    nomdepart: "Section de la Propriété Intellectuelle (قسم الملكية الفكرية)",
  },
];
function dashboardData() {
  return {
    sidebarOpen: false,
    departments: departments,
    searchQueryPC: "",
    searchQueryScanner: "",
    searchQueryPrinter: "",
    searchQueryScreen: "",
    editingEmployee: {
      name: "",
      department: null,
      materials: [],
      createdAt: "",
    },
    allMaterials: [],
    filteredMaterials: [],
    employeeModalOpen: false,
    employeeModalOpen2: false,
    materials: [],
    searchQueryMaterials: "",
    employeesPC: [],
    employeesScanner: [],
    employeesPrinter: [],
    employeesScreen: [],
    selectedFile: null,
    imagePreview: null,
    notifications: [],
    notificationPopupOpen: false,

    async init() {
      try {
        const isAuthenticated = await this.checkAuth();
        if (!isAuthenticated) {
          window.location.href = "login.html";
          return;
        }
        const isAdmin = localStorage.getItem("isAdmin") === "true";
        if (isAdmin) {
          window.location.href = "admin-dashboard.html";
          return;
        }
        await Promise.all([this.fetchAllMaterials(), this.fetchEmployees()]);
      } catch (error) {
        console.error("Error during initialization:", error);
      }
    },
    checkAuth() {
      if (localStorage.getItem("isAuthenticated") !== "true") {
        window.location.href = "login.html";
        return false;
      }
      return true;
    },

    addNotification(message, type = "info") {
      const notification = {
        id: Date.now(),
        message: message,
        type: type,
        timestamp: new Date().toLocaleTimeString("fr-FR"),
      };
      this.notifications.push(notification);

      setTimeout(() => {
        this.removeNotification(notification.id);
      }, 5000);
    },

    toggleNotificationPopup() {
      this.notificationPopupOpen = !this.notificationPopupOpen;
    },

    removeNotification(id) {
      this.notifications = this.notifications.filter(
        (notification) => notification.id !== id
      );
    },

    async fetchAllMaterials() {
      try {
        const response = await fetch(
          "https://gestion-des-materials.onrender.com/api/materials"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        this.allMaterials = await response.json();
        this.materials = [...this.allMaterials];
        this.filteredMaterials = [...this.allMaterials];
        return this.allMaterials;
      } catch (error) {
        console.error("Error fetching materials:", error);
      }
    },

    async fetchEmployees() {
      try {
        const response = await fetch(
          "https://gestion-des-materials.onrender.com/api/employees"
        );
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
      if (!employees || !Array.isArray(employees)) {
        console.error("Invalid employees data:", employees);
        return;
      }

      this.employeesPC = employees.filter(
        (emp) =>
          emp.materials &&
          emp.materials.some(
            (mat) =>
              mat.name &&
              (mat.name.toLowerCase().includes("pc") ||
                mat.name.toLowerCase().includes("laptop") ||
                mat.name.toLowerCase().includes("macbook"))
          )
      );

      this.employeesPrinter = employees.filter(
        (emp) =>
          emp.materials &&
          emp.materials.some(
            (mat) =>
              mat.name &&
              (mat.name.toLowerCase().includes("imprimante") ||
                mat.name.toLowerCase().includes("printer"))
          )
      );

      this.employeesScreen = employees.filter(
        (emp) =>
          emp.materials &&
          emp.materials.some(
            (mat) =>
              mat.name &&
              (mat.name.toLowerCase().includes("ecran") ||
                mat.name.toLowerCase().includes("screen") ||
                mat.name.toLowerCase().includes("monitor"))
          )
      );

      this.employeesScanner = employees.filter(
        (emp) =>
          emp.materials &&
          emp.materials.some(
            (mat) =>
              mat.name &&
              (mat.name.toLowerCase().includes("scanner") ||
                mat.name.toLowerCase().includes("numériseur") ||
                mat.name.toLowerCase().includes("balayage"))
          )
      );

      this.renderEmployeesTable(this.employeesPC, "employees-pc-table");
      this.renderEmployeesTable(
        this.employeesScanner,
        "employees-scanner-table"
      );
      this.renderEmployeesTable(
        this.employeesPrinter,
        "employees-printer-table"
      );
      this.renderEmployeesTable(this.employeesScreen, "employees-screen-table");
    },

    renderEmployeesTable(employees, tableId) {
      const tableBody = document.getElementById(tableId);
      if (!tableBody) return;
      tableBody.innerHTML = "";

      if (!employees || employees.length === 0) {
        const row = tableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 6;
        cell.textContent = "Aucun employé disponible.";
        cell.className = "p-4 text-center text-gray-500 italic";
        return;
      }

      employees.forEach((emp) => {
        const row = document.createElement("tr");
        row.className = "border-b border-gray-100 table-row";

        const material = emp.materials && emp.materials[0];

        // Create cells with appropriate data-label attributes for responsive design
        const nameCell = document.createElement("td");
        nameCell.className = "p-4";
        nameCell.setAttribute("data-label", "Nom");
        nameCell.textContent = emp.name;

        const deptCell = document.createElement("td");
        deptCell.className = "p-4";
        deptCell.setAttribute("data-label", "Département");
        deptCell.textContent = emp.department;

        const matCell = document.createElement("td");
        matCell.className = "p-4";
        matCell.setAttribute("data-label", "Matériel");
        matCell.textContent = material ? material.name : "N/A";

        const serialCell = document.createElement("td");
        serialCell.className = "p-4";
        serialCell.setAttribute("data-label", "Numéro de Série");
        serialCell.textContent = material ? material.serialNumber : "N/A";

        const imgCell = document.createElement("td");
        imgCell.className = "p-4";
        imgCell.setAttribute("data-label", "Image");

        if (material && material.image) {
          const imgContainer = document.createElement("div");
          imgContainer.className =
            "w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden";

          const img = document.createElement("img");
          img.src = this.getImageUrl(material.image);
          img.alt = material.name;
          img.className = "object-cover w-full h-full";

          imgContainer.appendChild(img);
          imgCell.appendChild(imgContainer);
        } else {
          const placeholder = document.createElement("div");
          placeholder.className =
            "w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400";
          placeholder.innerHTML = '<i class="fas fa-image"></i>';
          imgCell.appendChild(placeholder);
        }

        const actionsCell = document.createElement("td");
        actionsCell.className = "p-4 text-right";
        actionsCell.setAttribute("data-label", "Actions");

        const actionsContainer = document.createElement("div");
        actionsContainer.className = "flex items-center justify-end space-x-2";

        const viewBtn = document.createElement("button");
        viewBtn.className =
          "p-2 rounded-lg bg-blue-50 text-moroccan-blue hover:bg-blue-100 transition-colors";
        viewBtn.innerHTML = '<i class="fas fa-eye"></i>';
        viewBtn.addEventListener("click", () =>
          this.viewEmployeeDetails(emp.id)
        );

        const editBtn = document.createElement("button");
        editBtn.className =
          "p-2 rounded-lg bg-amber-50 text-moroccan-gold hover:bg-amber-100 transition-colors";
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.addEventListener("click", () => this.editEmployee(emp.id));

        const deleteBtn = document.createElement("button");
        deleteBtn.className =
          "p-2 rounded-lg bg-red-50 text-moroccan-red hover:bg-red-100 transition-colors";
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.addEventListener("click", () => this.deleteEmployee(emp.id));

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

    filterEmployeesPC(searchTerm) {
      const term = searchTerm.toLowerCase();
      const filteredPC = this.employeesPC.filter(
        (emp) =>
          emp.name.toLowerCase().includes(term) ||
          emp.department.toLowerCase().includes(term) ||
          (emp.materials &&
            emp.materials.some(
              (mat) =>
                mat.name.toLowerCase().includes(term) ||
                mat.serialNumber.toLowerCase().includes(term)
            ))
      );
      this.renderEmployeesTable(filteredPC, "employees-pc-table");
    },

    filterEmployeesScanner(searchTerm) {
      const term = searchTerm.toLowerCase();
      const filteredScanner = this.employeesScanner.filter(
        (emp) =>
          emp.name.toLowerCase().includes(term) ||
          emp.department.toLowerCase().includes(term) ||
          (emp.materials &&
            emp.materials.some(
              (mat) =>
                mat.name.toLowerCase().includes(term) ||
                mat.serialNumber.toLowerCase().includes(term)
            ))
      );
      this.renderEmployeesTable(filteredScanner, "employees-scanner-table");
    },

    filterEmployeesPrinter(searchTerm) {
      const term = searchTerm.toLowerCase();
      const filteredPrinter = this.employeesPrinter.filter(
        (emp) =>
          emp.name.toLowerCase().includes(term) ||
          emp.department.toLowerCase().includes(term) ||
          (emp.materials &&
            emp.materials.some(
              (mat) =>
                mat.name.toLowerCase().includes(term) ||
                mat.serialNumber.toLowerCase().includes(term)
            ))
      );
      this.renderEmployeesTable(filteredPrinter, "employees-printer-table");
    },

    filterEmployeesScreen(searchTerm) {
      const term = searchTerm.toLowerCase();
      const filteredEcrans = this.employeesScreen.filter(
        (emp) =>
          emp.name.toLowerCase().includes(term) ||
          emp.department.toLowerCase().includes(term) ||
          (emp.materials &&
            emp.materials.some(
              (mat) =>
                mat.name.toLowerCase().includes(term) ||
                mat.serialNumber.toLowerCase().includes(term)
            ))
      );
      this.renderEmployeesTable(filteredEcrans, "employees-screen-table");
    },

    viewEmployeeDetails(id) {
      const employee = [
        ...this.employeesPC,
        ...this.employeesScanner,
        ...this.employeesPrinter,
        ...this.employeesScreen,
      ].find((e) => e.id === id);
      if (!employee) return;

      console.log("Viewing employee details:", employee);

      this.editingEmployee = { ...employee };
      this.employeeModalOpen2 = true;
    },

    editEmployee(id) {
      const employee = [
        ...this.employeesPC,
        ...this.employeesScanner,
        ...this.employeesPrinter,
        ...this.employeesScreen,
      ].find((e) => e.id === parseInt(id));
      if (!employee) return;

      this.editingEmployee = JSON.parse(JSON.stringify(employee)); // Deep copy to avoid modifying original employee data

      if (
        typeof this.editingEmployee.department === "object" &&
        this.editingEmployee.department !== null
      ) {
        this.editingEmployee.department =
          this.editingEmployee.department.nomdepart;
      }

      if (!this.editingEmployee.id || !this.editingEmployee.createdAt) {
        this.editingEmployee.createdAt = this.getCurrentDateForInput();
      }

      this.employeeModalOpen = true;
      this.filterMaterialsForEdit(employee); // Call the new filtering function

      queueMicrotask(() => {
        this.selectDepartmentInDropdown(); // Select department in dropdown
        this.selectMaterialsInDropdown();
      });
    },

    filterMaterialsForEdit(employee) {
      this.filteredMaterials = this.allMaterials.filter((mat) => {
        if (employee.materials.some((empMat) => empMat.id === mat.id)) {
          return true;
        }

        if (mat.status !== "Disponible") {
          return false;
        }

        if (this.employeesPC.find((emp) => emp.id === employee.id)) {
          return (
            mat.name.toLowerCase().includes("pc") ||
            mat.name.toLowerCase().includes("laptop") ||
            mat.name.toLowerCase().includes("macbook")
          );
        } else if (
          this.employeesPrinter.find((emp) => emp.id === employee.id)
        ) {
          return (
            mat.name.toLowerCase().includes("imprimante") ||
            mat.name.toLowerCase().includes("printer")
          );
        } else if (this.employeesScreen.find((emp) => emp.id === employee.id)) {
          return (
            mat.name.toLowerCase().includes("ecran") ||
            mat.name.toLowerCase().includes("screen") ||
            mat.name.toLowerCase().includes("monitor")
          );
        } else if (
          this.employeesScanner.find((emp) => emp.id === employee.id)
        ) {
          return (
            mat.name.toLowerCase().includes("scanner") ||
            mat.name.toLowerCase().includes("numériseur") ||
            mat.name.toLowerCase().includes("balayage")
          );
        } else {
          return true;
        }
      });
    },
    selectDepartmentInDropdown() {
      const select = document.getElementById("employeeModalDepartment");
      if (select) {
        const options = Array.from(select.options);
        options.forEach((option) => {
          option.selected =
            this.editingEmployee.department !== null &&
            option.value === String(this.editingEmployee.department);
        });
      }
    },
    async openAddEmployeeModal(type) {
      this.editingEmployee = {
        name: "",
        department: null,
        materials: [],
        createdAt: this.getCurrentDateForInput(),
      };
      this.employeeModalOpen = true;

      try {
        await this.fetchAllMaterials();
      } catch (error) {
        console.error("Error fetching materials:", error);
        this.message = "Error fetching materials. Please try again.";
        return;
      }

      this.filteredMaterials = this.allMaterials.filter((mat) => {
        if (mat.status !== "Disponible") {
          return false;
        }

        if (type === "PC") {
          return (
            mat.name.toLowerCase().includes("pc") ||
            mat.name.toLowerCase().includes("laptop") ||
            mat.name.toLowerCase().includes("macbook")
          );
        } else if (type === "Printer") {
          return (
            mat.name.toLowerCase().includes("imprimante") ||
            mat.name.toLowerCase().includes("printer")
          );
        } else if (type === "Screen") {
          return (
            mat.name.toLowerCase().includes("ecran") ||
            mat.name.toLowerCase().includes("screen") ||
            mat.name.toLowerCase().includes("monitor")
          );
        } else if (type === "Scanner") {
          return (
            mat.name.toLowerCase().includes("scanner") ||
            mat.name.toLowerCase().includes("numériseur") ||
            mat.name.toLowerCase().includes("balayage")
          );
        } else {
          return true;
        }
      });

      if (this.filteredMaterials.length === 0) {
        this.message = "Aucun matériel disponible trouvé pour ce type.";
      } else {
        this.message = "";
      }

      this.selectMaterialsInDropdown();
    },

    selectMaterialsInDropdown() {
      const select = document.querySelector("#employeeModalSelect");
      if (select) {
        const options = Array.from(select.options);

        options.forEach((option) => {
          const materialId = parseInt(option.value);
          option.selected = this.editingEmployee.materials.some(
            (mat) => mat.id === materialId
          );
        });
      }
    },

    getFilteredMaterials(employee) {
      if (this.employeesPC.find((emp) => emp.id === employee.id)) {
        return this.materials.filter(
          (mat) =>
            mat.name.toLowerCase().includes("pc") ||
            mat.name.toLowerCase().includes("laptop") ||
            mat.name.toLowerCase().includes("macbook")
        );
      } else if (this.employeesPrinter.find((emp) => emp.id === employee.id)) {
        return this.materials.filter(
          (mat) =>
            mat.name.toLowerCase().includes("imprimante") ||
            mat.name.toLowerCase().includes("printer")
        );
      } else if (this.employeesScreen.find((emp) => emp.id === employee.id)) {
        return this.materials.filter(
          (mat) =>
            mat.name.toLowerCase().includes("ecran") ||
            mat.name.toLowerCase().includes("screen") ||
            mat.name.toLowerCase().includes("monitor")
        );
      } else if (this.employeesScanner.find((emp) => emp.id === employee.id)) {
        return this.materials.filter(
          (mat) =>
            mat.name.toLowerCase().includes("scanner") ||
            mat.name.toLowerCase().includes("numériseur") ||
            mat.name.toLowerCase().includes("balayage")
        );
      } else {
        return this.materials;
      }
    },

    closeEmployeeEditModal() {
      this.employeeModalOpen = false;
      this.editingEmployee = {
        name: "",
        department: null,
        materials: [],
        createdAt: "",
      }; // Reset department to null
      this.filteredMaterials = this.materials;
    },

    closeEmployeeDetailsModal() {
      this.employeeModalOpen2 = false;
      this.editingEmployee = {
        name: "",
        department: null,
        materials: [],
        createdAt: "",
      }; // Reset editingEmployee, including createdAt
    },

    formatDateForAPI(dateString) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }

      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR");
    },

    getCurrentDateForInput() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    async saveEmployee() {
      try {
        // Determine the method and URL based on whether we're editing or creating a new employee
        const method = this.editingEmployee.id ? "PUT" : "POST";
        const url = this.editingEmployee.id
          ? `https://gestion-des-materials.onrender.com/api/employees/${this.editingEmployee.id}`
          : "https://gestion-des-materials.onrender.com/api/employees";

        // Format the creation date for the API
        const formattedDate = this.formatDateForAPI(
          this.editingEmployee.createdAt
        );

        // Get selected materials and map them to the required format
        const selectedMaterialObjects = Array.from(
          document.querySelectorAll("#employeeModalSelect option:checked")
        )
          .map((option) => {
            const materialId = parseInt(option.value);
            const material = this.allMaterials.find((m) => m.id === materialId);
            if (!material) {
              console.warn(
                `Material with ID ${materialId} not found. Skipping.`
              );
              return null;
            }
            return {
              id: material.id, // Send the ID, not the whole object
              name: material.name,
              serialNumber: material.serialNumber,
              image: material.image,
            };
          })
          .filter((material) => material !== null);

        const selectedDepartmentName = document.getElementById(
          "employeeModalDepartment"
        ).value;
        console.log(selectedDepartmentName);

        const employeeData = {
          ...this.editingEmployee,
          createdAt: formattedDate,
          materials: selectedMaterialObjects,
          department: selectedDepartmentName,
        };
        console.log("Employee data to be saved:", employeeData);

        // Send the request to the backend
        const response = await fetch(url, {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(employeeData),
        });

        // Handle non-OK responses
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Erreur HTTP! Statut: ${response.status} ${response.statusText}. Détails: ${errorText}`
          );
        }

        // Show success message to the user
        this.addNotification(
          this.editingEmployee.id
            ? "Employé mis à jour avec succès!"
            : "Nouvel employé ajouté avec succès!",
          "success"
        );

        // Close the modal and refresh the employee list
        this.closeEmployeeEditModal();
        setTimeout(async () => {
          await this.fetchEmployees();
        }, 200);
      } catch (error) {
        console.error("Error saving employee:", error);

        // Provide specific error messages to the user
        if (
          error.message.includes("Veuillez sélectionner au moins un matériel")
        ) {
          this.addNotification(error.message, "error");
        } else if (error.message.includes("Erreur HTTP")) {
          this.addNotification(
            "Une erreur s'est produite lors de la communication avec le serveur. Veuillez réessayer.",
            "error"
          );
        } else {
          this.addNotification(
            "Une erreur s'est produite lors de l'enregistrement de l'employé.",
            "error"
          );
        }
      }
    },

    async deleteEmployee(id) {
      try {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet employé?")) return;

        const response = await fetch(
          `https://gestion-des-materials.onrender.com/api/employees/${id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        this.addNotification("Employé supprimé avec succès!", "success");

        await this.fetchEmployees();
      } catch (error) {
        console.error("Error deleting employee:", error);
        this.addNotification(
          "Une erreur s'est produite lors de la suppression de l'employé.",
          "error"
        );
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
      if (!imagePath) return "/api/placeholder/100/100";

      if (imagePath.startsWith("http")) {
        return imagePath;
      }

      return `https://gestion-des-materials.onrender.com/backend/images/${imagePath
        .split("/")
        .pop()}`;
    },

    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR");
    },

    logout() {
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      localStorage.removeItem("isAuthenticated");
      window.location.href = "login.html";
      console.log("Déconnexion effectuée");
    },

    async exportToExcelEmployeesPC() {
      await this.exportToExcel(
        "employees-pc-table",
        "Employés PC",
        "employees_pc_export.xlsx",
        "#2196F3",
        "#FFFFFF"
      ); // Blue theme
    },

    async exportToExcelEmployeesScanner() {
      await this.exportToExcel(
        "employees-scanner-table",
        "Employés Scanners",
        "employees_scanner_export.xlsx",
        "#4CAF50",
        "#FFFFFF"
      );
    },

    async exportToExcelEmployeesPrinter() {
      await this.exportToExcel(
        "employees-printer-table",
        "Employés Imprimantes",
        "employees_printer_export.xlsx",
        "#FF9800",
        "#FFFFFF"
      ); // Orange theme
    },

    async exportToExcelEmployeesScreen() {
      await this.exportToExcel(
        "employees-screen-table",
        "Employés Écrans",
        "employees_screen_export.xlsx",
        "#9C27B0",
        "#FFFFFF"
      ); // Purple theme
    },

    async exportToExcel(
      tableId,
      title,
      filename,
      headerColor,
      headerTextColor
    ) {
      const table = document.getElementById(tableId);
      if (!table) {
        console.error("Table not found:", tableId);
        this.addNotification(`Tableau non trouvé: ${tableId}`, "error");
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(title);

      const titleStyle = {
        font: {
          name: "Arial",
          size: 20,
          bold: true,
          color: { argb: "1D4E89" },
        },
        alignment: { horizontal: "center" },
      };

      const dateStyle = {
        font: { name: "Arial", size: 14, color: { argb: "7B7B7B" } },
        alignment: { horizontal: "center" },
      };

      const headerStyle = {
        font: {
          name: "Arial",
          size: 14,
          bold: true,
          color: { argb: headerTextColor },
        },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: headerColor.replace("#", "") },
        },
        alignment: { horizontal: "center", vertical: "middle" },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        },
      };

      const rowStyle = {
        font: { name: "Arial", size: 12, color: { argb: "000000" } },
        alignment: { horizontal: "left", vertical: "middle" },
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        },
      };

      const titleRow = worksheet.addRow([title]);
      titleRow.getCell(1).style = titleStyle;
      worksheet.mergeCells(`A1:D1`);

      const dateRow = worksheet.addRow([
        `Exporté le : ${new Date().toLocaleString("fr-FR")}`,
      ]);
      dateRow.getCell(1).style = dateStyle;
      worksheet.mergeCells(`A2:D2`);

      const headers = [];
      const headerRowElements = table.querySelectorAll("thead tr th");
      if (headerRowElements.length > 0) {
        for (let i = 0; i < headerRowElements.length - 2; i++) {
          headers.push(headerRowElements[i].innerText);
        }
      } else {
        const firstRowCells = table.querySelectorAll("tbody tr:first-child td");
        for (let i = 0; i < firstRowCells.length - 2; i++) {
          headers.push(firstRowCells[i].getAttribute("data-label") || "");
        }
      }
      const excelHeaderRow = worksheet.addRow(headers);
      excelHeaderRow.eachCell((cell) => (cell.style = headerStyle));

      const dataRows = [];
      const rows = table.querySelectorAll("tbody tr");
      rows.forEach((row) => {
        const rowData = [];
        const cells = row.querySelectorAll("td");
        for (let i = 0; i < cells.length - 2; i++) {
          rowData.push(cells[i].innerText);
        }
        dataRows.push(rowData);
      });

      dataRows.forEach((rowData) => {
        const excelRow = worksheet.addRow(rowData);
        excelRow.eachCell((cell) => (cell.style = rowStyle));

        if (worksheet.rowCount % 2 === 0) {
          excelRow.eachCell((cell) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "F2F2F2" },
            };
          });
        }
      });

      worksheet.columns.forEach((column, index) => {
        const widths = [];
        for (let i = 0; i < worksheet.rowCount; i++) {
          const row = worksheet.getRow(i + 1);
          const cell = row.getCell(index + 1);
          const cellValue = cell.value ? cell.value.toString() : "";
          widths.push(cellValue.length);
        }
        const maxWidth = Math.max(...widths);
        column.width = maxWidth + 5;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, filename);

      this.addNotification(`${title} exporté avec succès!`, "success");
    },
  };
}

document.addEventListener("DOMContentLoaded", function () {
  const app = dashboardData();
  app.init();
});
