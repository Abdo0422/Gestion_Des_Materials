const departments = [
  { id: 1, nomdepart: "Immobilier (العقار)" },
  { id: 2, nomdepart: "Saisie-arrêt (الحجز لدى الغير)" },
  { id: 3, nomdepart: "Caisse (الصندوق)" },
  { id: 4, nomdepart: "Remise de copies (تسليم النسخ)" },
  { id: 5, nomdepart: "Notification et exécution (التبليغ والتنفيذ)" },
  { id: 6, nomdepart: "Fond (الموضوع)" },
  { id: 7, nomdepart: "Référé (الاستعجالي)" },
  { id: 8, nomdepart: "Bureau administratif (المكتب الإداري)" },
  { id: 9, nomdepart: "Accueil (الاستقبال)" },
  { id: 10, nomdepart: "Juges (القضاة)" },
  { id: 11, nomdepart: "Président (الرئيس)" },
  { id: 12, nomdepart: "Bureau des invités (مكتب الضيف)" },
  { id: 13, nomdepart: "Informatique (informatique)" },
  { id: 14, nomdepart: "Recouvrement (التحصيل)" },
  { id: 15, nomdepart: "Divers (مختلف)" },
];
function dashboardData() {
  return {
    sidebarOpen: false,
    departments: departments,
    searchQueryPC: "",
    searchQueryScanner: "",
    searchQueryPrinter: "",
    searchQueryScreen: "",
    sortDropdownPC: false,
    sortDropdownPrinter: false,
    sortDropdownScreen: false,
    sortDropdownScanner: false,
    sortDropdownOpen: false,
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
    itemsPerPage: 5,
    currentPagePC: 1,
    currentPagePrinter: 1,
    currentPageScreen: 1,
    currentPageScanner: 1,
    filteredEmployeesPC: [],
    filteredEmployeesPrinter: [],
    filteredEmployeesScreen: [],
    filteredEmployeesScanner: [],

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
        const response = await fetch("/api/materials");
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
        const response = await fetch("/api/employees");
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
                mat.name.toLowerCase().includes("macbook") ||
                mat.name.toLowerCase().includes("desktop") ||
                mat.name.toLowerCase().includes("computer") ||
                mat.name.toLowerCase().includes("workstation") ||
                mat.name.toLowerCase().includes("notebook") ||
                mat.name.toLowerCase().includes("netbook") ||
                mat.name.toLowerCase().includes("chromebook") ||
                mat.name.toLowerCase().includes("tower") ||
                mat.name.toLowerCase().includes("unité centrale") ||
                mat.name.toLowerCase().includes("ordinateur"))
          )
      );

      this.employeesPrinter = employees.filter(
        (emp) =>
          emp.materials &&
          emp.materials.some(
            (mat) =>
              mat.name &&
              (mat.name.toLowerCase().includes("imprimante") ||
                mat.name.toLowerCase().includes("printer") ||
                mat.name.toLowerCase().includes("copier") ||
                mat.name.toLowerCase().includes("impression") ||
                mat.name.toLowerCase().includes("impressionante") ||
                mat.name.toLowerCase().includes("print"))
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
                mat.name.toLowerCase().includes("monitor") ||
                mat.name.toLowerCase().includes("display") ||
                mat.name.toLowerCase().includes("affichage") ||
                mat.name.toLowerCase().includes("visualiseur") ||
                mat.name.toLowerCase().includes("écrant") ||
                mat.name.toLowerCase().includes("video"))
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
                mat.name.toLowerCase().includes("balayage") ||
                mat.name.toLowerCase().includes("scan") ||
                mat.name.toLowerCase().includes("numérisation") ||
                mat.name.toLowerCase().includes("digitisateur") ||
                mat.name.toLowerCase().includes("scaneur") ||
                mat.name.toLowerCase().includes("imageur"))
          )
      );

      this.filteredEmployeesPC = [...this.employeesPC];
      this.filteredEmployeesPrinter = [...this.employeesPrinter];
      this.filteredEmployeesScreen = [...this.employeesScreen];
      this.filteredEmployeesScanner = [...this.employeesScanner];

      this.renderEmployeesTable(
        this.getPaginatedEmployees(
          this.filteredEmployeesPC,
          this.currentPagePC
        ),
        "employees-pc-table"
      );
      this.renderEmployeesTable(
        this.getPaginatedEmployees(
          this.filteredEmployeesScanner,
          this.currentPageScanner
        ),
        "employees-scanner-table"
      );
      this.renderEmployeesTable(
        this.getPaginatedEmployees(
          this.filteredEmployeesPrinter,
          this.currentPagePrinter
        ),
        "employees-printer-table"
      );
      this.renderEmployeesTable(
        this.getPaginatedEmployees(
          this.filteredEmployeesScreen,
          this.currentPageScreen
        ),
        "employees-screen-table"
      );
    },

    getPaginatedEmployees(employees, currentPage) {
      const startIndex = (currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return employees.slice(startIndex, endIndex);
    },

    nextPage(type) {
      if (
        type === "PC" &&
        this.currentPagePC * this.itemsPerPage < this.filteredEmployeesPC.length
      ) {
        this.currentPagePC++;
        this.renderEmployeesTable(
          this.getPaginatedEmployees(
            this.filteredEmployeesPC,
            this.currentPagePC
          ),
          "employees-pc-table"
        );
      } else if (
        type === "Printer" &&
        this.currentPagePrinter * this.itemsPerPage <
          this.filteredEmployeesPrinter.length
      ) {
        this.currentPagePrinter++;
        this.renderEmployeesTable(
          this.getPaginatedEmployees(
            this.filteredEmployeesPrinter,
            this.currentPagePrinter
          ),
          "employees-printer-table"
        );
      } else if (
        type === "Screen" &&
        this.currentPageScreen * this.itemsPerPage <
          this.filteredEmployeesScreen.length
      ) {
        this.currentPageScreen++;
        this.renderEmployeesTable(
          this.getPaginatedEmployees(
            this.filteredEmployeesScreen,
            this.currentPageScreen
          ),
          "employees-screen-table"
        );
      } else if (
        type === "Scanner" &&
        this.currentPageScanner * this.itemsPerPage <
          this.filteredEmployeesScanner.length
      ) {
        this.currentPageScanner++;
        this.renderEmployeesTable(
          this.getPaginatedEmployees(
            this.filteredEmployeesScanner,
            this.currentPageScanner
          ),
          "employees-scanner-table"
        );
      }
    },

    previousPage(type) {
      if (type === "PC" && this.currentPagePC > 1) {
        this.currentPagePC--;
        this.renderEmployeesTable(
          this.getPaginatedEmployees(
            this.filteredEmployeesPC,
            this.currentPagePC
          ),
          "employees-pc-table"
        );
      } else if (type === "Printer" && this.currentPagePrinter > 1) {
        this.currentPagePrinter--;
        this.renderEmployeesTable(
          this.getPaginatedEmployees(
            this.filteredEmployeesPrinter,
            this.currentPagePrinter
          ),
          "employees-printer-table"
        );
      } else if (type === "Screen" && this.currentPageScreen > 1) {
        this.currentPageScreen--;
        this.renderEmployeesTable(
          this.getPaginatedEmployees(
            this.filteredEmployeesScreen,
            this.currentPageScreen
          ),
          "employees-screen-table"
        );
      } else if (type === "Scanner" && this.currentPageScanner > 1) {
        this.currentPageScanner--;
        this.renderEmployeesTable(
          this.getPaginatedEmployees(
            this.filteredEmployeesScanner,
            this.currentPageScanner
          ),
          "employees-scanner-table"
        );
      }
    },

    toggleSortDropdown(type) {
      console.log(`Toggling dropdown for: ${type}`);
      this[`sortDropdown${type}`] = !this[`sortDropdown${type}`];
      console.log(`sortDropdown${type} is now: ${this[`sortDropdown${type}`]}`);
      // Close other dropdowns
      ["PC", "Printer", "Screen", "Scanner"].forEach((t) => {
        if (t !== type) {
          this[`sortDropdown${t}`] = false;
          console.log(`Closing dropdown for: ${t}`);
        }
      });
    },

    closeOtherSortDropdowns(currentType) {
      console.log(`Closing other dropdowns, current type: ${currentType}`);
      ["PC", "Printer", "Screen", "Scanner"].forEach((type) => {
        if (type !== currentType) {
          console.log(`Setting sortDropdown${type} to false`);
          this[`sortDropdown${type}`] = false;
        }
      });
      console.log(
        `Setting sortDropdown${currentType} to ${
          this[`sortDropdown${currentType}`]
        }`
      );
    },

    sortEmployeesByName(type, order) {
      let employees;
      let tableId;

      switch (type) {
        case "PC":
          employees = this.employeesPC;
          tableId = "employees-pc-table";
          break;
        case "Printer":
          employees = this.employeesPrinter;
          tableId = "employees-printer-table";
          break;
        case "Screen":
          employees = this.employeesScreen;
          tableId = "employees-screen-table";
          break;
        case "Scanner":
          employees = this.employeesScanner;
          tableId = "employees-scanner-table";
          break;
        default:
          return;
      }

      employees.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();

        if (order === "asc") {
          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;
          return 0;
        } else {
          if (nameA > nameB) return -1;
          if (nameA < nameB) return 1;
          return 0;
        }
      });

      this.renderEmployeesTable(
        this.getPaginatedEmployees(employees, this[`currentPage${type}`]),
        tableId
      );
      this[`sortDropdown${type}`] = false;
    },

    sortEmployeesByDepartment(type, order) {
      let employees;
      let tableId;

      switch (type) {
        case "PC":
          employees = this.employeesPC;
          tableId = "employees-pc-table";
          break;
        case "Printer":
          employees = this.employeesPrinter;
          tableId = "employees-printer-table";
          break;
        case "Screen":
          employees = this.employeesScreen;
          tableId = "employees-screen-table";
          break;
        case "Scanner":
          employees = this.employeesScanner;
          tableId = "employees-scanner-table";
          break;
        default:
          return;
      }

      employees.sort((a, b) => {
        const deptA = a.department ? a.department.toLowerCase() : "";
        const deptB = b.department ? b.department.toLowerCase() : "";

        if (order === "asc") {
          if (deptA < deptB) return -1;
          if (deptA > deptB) return 1;
          return 0;
        } else {
          if (deptA > deptB) return -1;
          if (deptA < deptB) return 1;
          return 0;
        }
      });

      this.renderEmployeesTable(
        this.getPaginatedEmployees(employees, this[`currentPage${type}`]),
        tableId
      );
      this[`sortDropdown${type}`] = false;
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

    filterEmployeesPC(query) {
      this.searchQueryPC = query;
      this.filteredEmployeesPC = this.employeesPC.filter((employee) => {
        const searchString = `${employee.name} ${
          employee.department
        } ${employee.materials
          .map((mat) => mat.name)
          .join(" ")} ${employee.materials
          .map((mat) => mat.serialNumber)
          .join(" ")}`.toLowerCase();
        return searchString.includes(query.toLowerCase());
      });
      this.currentPagePC = 1;
      this.renderEmployeesTable(
        this.getPaginatedEmployees(
          this.filteredEmployeesPC,
          this.currentPagePC
        ),
        "employees-pc-table"
      );
    },

    filterEmployeesPrinter(query) {
      this.searchQueryPrinter = query;
      this.filteredEmployeesPrinter = this.employeesPrinter.filter(
        (employee) => {
          const searchString = `${employee.name} ${
            employee.department
          } ${employee.materials
            .map((mat) => mat.name)
            .join(" ")} ${employee.materials
            .map((mat) => mat.serialNumber)
            .join(" ")}`.toLowerCase();
          return searchString.includes(query.toLowerCase());
        }
      );
      this.currentPagePrinter = 1;
      this.renderEmployeesTable(
        this.getPaginatedEmployees(
          this.filteredEmployeesPrinter,
          this.currentPagePrinter
        ),
        "employees-printer-table"
      );
    },

    filterEmployeesScreen(query) {
      this.searchQueryScreen = query;
      this.filteredEmployeesScreen = this.employeesScreen.filter((employee) => {
        const searchString = `${employee.name} ${
          employee.department
        } ${employee.materials
          .map((mat) => mat.name)
          .join(" ")} ${employee.materials
          .map((mat) => mat.serialNumber)
          .join(" ")}`.toLowerCase();
        return searchString.includes(query.toLowerCase());
      });
      this.currentPageScreen = 1;
      this.renderEmployeesTable(
        this.getPaginatedEmployees(
          this.filteredEmployeesScreen,
          this.currentPageScreen
        ),
        "employees-screen-table"
      );
    },

    filterEmployeesScanner(query) {
      this.searchQueryScanner = query;
      this.filteredEmployeesScanner = this.employeesScanner.filter(
        (employee) => {
          const searchString = `${employee.name} ${
            employee.department
          } ${employee.materials
            .map((mat) => mat.name)
            .join(" ")} ${employee.materials
            .map((mat) => mat.serialNumber)
            .join(" ")}`.toLowerCase();
          return searchString.includes(query.toLowerCase());
        }
      );
      this.currentPageScanner = 1;
      this.renderEmployeesTable(
        this.getPaginatedEmployees(
          this.filteredEmployeesScanner,
          this.currentPageScanner
        ),
        "employees-scanner-table"
      );
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
            mat.name.toLowerCase().includes("macbook") ||
            mat.name.toLowerCase().includes("desktop") ||
            mat.name.toLowerCase().includes("computer") ||
            mat.name.toLowerCase().includes("workstation") ||
            mat.name.toLowerCase().includes("notebook") ||
            mat.name.toLowerCase().includes("netbook") ||
            mat.name.toLowerCase().includes("chromebook") ||
            mat.name.toLowerCase().includes("tower") ||
            mat.name.toLowerCase().includes("unité centrale") ||
            mat.name.toLowerCase().includes("ordinateur")
          );
        } else if (
          this.employeesPrinter.find((emp) => emp.id === employee.id)
        ) {
          return (
            mat.name.toLowerCase().includes("imprimante") ||
            mat.name.toLowerCase().includes("printer") ||
            mat.name.toLowerCase().includes("copier") ||
            mat.name.toLowerCase().includes("impression") ||
            mat.name.toLowerCase().includes("impressionante") ||
            mat.name.toLowerCase().includes("print")
          );
        } else if (this.employeesScreen.find((emp) => emp.id === employee.id)) {
          return (
            mat.name.toLowerCase().includes("ecran") ||
            mat.name.toLowerCase().includes("screen") ||
            mat.name.toLowerCase().includes("monitor") ||
            mat.name.toLowerCase().includes("display") ||
            mat.name.toLowerCase().includes("affichage") ||
            mat.name.toLowerCase().includes("visualiseur") ||
            mat.name.toLowerCase().includes("écrant") ||
            mat.name.toLowerCase().includes("video")
          );
        } else if (
          this.employeesScanner.find((emp) => emp.id === employee.id)
        ) {
          return (
            mat.name.toLowerCase().includes("scanner") ||
            mat.name.toLowerCase().includes("numériseur") ||
            mat.name.toLowerCase().includes("balayage") ||
            mat.name.toLowerCase().includes("scan") ||
            mat.name.toLowerCase().includes("numérisation") ||
            mat.name.toLowerCase().includes("digitisateur") ||
            mat.name.toLowerCase().includes("scaneur") ||
            mat.name.toLowerCase().includes("imageur")
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
            mat.name.toLowerCase().includes("macbook") ||
            mat.name.toLowerCase().includes("desktop") ||
            mat.name.toLowerCase().includes("computer") ||
            mat.name.toLowerCase().includes("workstation") ||
            mat.name.toLowerCase().includes("notebook") ||
            mat.name.toLowerCase().includes("netbook") ||
            mat.name.toLowerCase().includes("chromebook") ||
            mat.name.toLowerCase().includes("tower") ||
            mat.name.toLowerCase().includes("unité centrale") ||
            mat.name.toLowerCase().includes("ordinateur")
          );
        } else if (type === "Printer") {
          return (
            mat.name.toLowerCase().includes("imprimante") ||
            mat.name.toLowerCase().includes("printer") ||
            mat.name.toLowerCase().includes("copier") ||
            mat.name.toLowerCase().includes("impression") ||
            mat.name.toLowerCase().includes("impressionante") ||
            mat.name.toLowerCase().includes("print")
          );
        } else if (type === "Screen") {
          return (
            mat.name.toLowerCase().includes("ecran") ||
            mat.name.toLowerCase().includes("screen") ||
            mat.name.toLowerCase().includes("monitor") ||
            mat.name.toLowerCase().includes("display") ||
            mat.name.toLowerCase().includes("affichage") ||
            mat.name.toLowerCase().includes("visualiseur") ||
            mat.name.toLowerCase().includes("écrant") ||
            mat.name.toLowerCase().includes("video")
          );
        } else if (type === "Scanner") {
          return (
            mat.name.toLowerCase().includes("scanner") ||
            mat.name.toLowerCase().includes("numériseur") ||
            mat.name.toLowerCase().includes("balayage") ||
            mat.name.toLowerCase().includes("scan") ||
            mat.name.toLowerCase().includes("numérisation") ||
            mat.name.toLowerCase().includes("digitisateur") ||
            mat.name.toLowerCase().includes("scaneur") ||
            mat.name.toLowerCase().includes("imageur")
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
            mat.name.toLowerCase().includes("macbook") ||
            mat.name.toLowerCase().includes("desktop") ||
            mat.name.toLowerCase().includes("computer") ||
            mat.name.toLowerCase().includes("workstation") ||
            mat.name.toLowerCase().includes("notebook") ||
            mat.name.toLowerCase().includes("netbook") ||
            mat.name.toLowerCase().includes("chromebook") ||
            mat.name.toLowerCase().includes("tower") ||
            mat.name.toLowerCase().includes("unité centrale") ||
            mat.name.toLowerCase().includes("ordinateur")
        );
      } else if (this.employeesPrinter.find((emp) => emp.id === employee.id)) {
        return this.materials.filter(
          (mat) =>
            mat.name.toLowerCase().includes("imprimante") ||
            mat.name.toLowerCase().includes("printer") ||
            mat.name.toLowerCase().includes("copier") ||
            mat.name.toLowerCase().includes("impression") ||
            mat.name.toLowerCase().includes("impressionante") ||
            mat.name.toLowerCase().includes("print")
        );
      } else if (this.employeesScreen.find((emp) => emp.id === employee.id)) {
        return this.materials.filter(
          (mat) =>
            mat.name.toLowerCase().includes("ecran") ||
            mat.name.toLowerCase().includes("screen") ||
            mat.name.toLowerCase().includes("monitor") ||
            mat.name.toLowerCase().includes("display") ||
            mat.name.toLowerCase().includes("affichage") ||
            mat.name.toLowerCase().includes("visualiseur") ||
            mat.name.toLowerCase().includes("écrant") ||
            mat.name.toLowerCase().includes("video")
        );
      } else if (this.employeesScanner.find((emp) => emp.id === employee.id)) {
        return this.materials.filter(
          (mat) =>
            mat.name.toLowerCase().includes("scanner") ||
            mat.name.toLowerCase().includes("numériseur") ||
            mat.name.toLowerCase().includes("balayage") ||
            mat.name.toLowerCase().includes("scan") ||
            mat.name.toLowerCase().includes("numérisation") ||
            mat.name.toLowerCase().includes("digitisateur") ||
            mat.name.toLowerCase().includes("scaneur") ||
            mat.name.toLowerCase().includes("imageur")
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
          ? `/api/employees/${this.editingEmployee.id}`
          : "api/employees";

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

        const response = await fetch(`/api/employees/${id}`, {
          method: "DELETE",
        });

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

      return `/backend/images/${imagePath.split("/").pop()}`;
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
