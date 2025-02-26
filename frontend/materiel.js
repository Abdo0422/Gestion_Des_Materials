function dashboardData() {
  return {
    sidebarOpen: false,
    showMaterialForm: false,
    showMaterialModal: false,
    showMaterialModal2: false,
    editingMaterial: {
      name: "",
      serialNumber: "",
      marque: "",
      status: "",
      image: "",
    },
    allMaterials: [],
    filteredMaterials: [],
    filteredMaterialNames: [],
    filteredMaterialMarques: [],
    employeeModalOpen: false,
    employeeModalOpen2: false,
    materials: [],
    searchQueryMaterials: "",
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
        await Promise.all([this.fetchAllMaterials()]);
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
        this.renderMaterialsTable(this.materials);
        return this.allMaterials;
      } catch (error) {
        console.error("Error fetching materials:", error);
      }
    },

    renderMaterialsTable(materials) {
      const tableBody = document.getElementById("materials-table");
      if (!tableBody) return;

      tableBody.innerHTML = "";

      if (!materials || materials.length === 0) {
        const row = tableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 6;
        cell.textContent = "Aucun matériel disponible.";
        cell.className = "p-4 text-center text-gray-500 italic";
        return;
      }

      materials.forEach((mat) => {
        const row = document.createElement("tr");
        row.className = "border-b border-gray-100 table-row";

        const cells = [
          { value: mat.name, label: "Nom" },
          { value: mat.marque, label: "Marque" },
          { value: mat.serialNumber, label: "Numéro de Série" },
          { value: mat.status, label: "Statut", isStatus: true },
        ];

        cells.forEach((cellData) => {
          const cell = document.createElement("td");
          cell.className = "p-4";
          cell.setAttribute("data-label", cellData.label);

          if (cellData.isStatus) {
            const statusSpan = document.createElement("span");
            let statusClass = "";

            switch (cellData.value.toLowerCase()) {
              case "actif":
              case "active":
              case "disponible":
                statusClass = "bg-green-50 text-green-600";
                break;
              case "maintenance":
              case "en utilisation":
                statusClass = "bg-yellow-50 text-yellow-600";
                break;
              case "défectueux":
              case "defectueux":
              case "broken":
                statusClass = "bg-red-50 text-red-600";
                break;
              default:
                statusClass = "bg-gray-50 text-gray-600";
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
        const imgCell = document.createElement("td");
        imgCell.className = "p-4";
        imgCell.setAttribute("data-label", "Image");

        if (mat.image) {
          const imgContainer = document.createElement("div");
          imgContainer.className =
            "w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden";

          const img = document.createElement("img");
          img.src = this.getImageUrl(mat.image);
          img.alt = mat.name;
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

        row.appendChild(imgCell);

        // Actions cell
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
          this.viewMaterialDetails(mat.id)
        );

        const editBtn = document.createElement("button");
        editBtn.className =
          "p-2 rounded-lg bg-amber-50 text-moroccan-gold hover:bg-amber-100 transition-colors";
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.addEventListener("click", () => this.editMaterial(mat.id));

        const deleteBtn = document.createElement("button");
        deleteBtn.className =
          "p-2 rounded-lg bg-red-50 text-moroccan-red hover:bg-red-100 transition-colors";
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.addEventListener("click", () => this.deleteMaterial(mat.id));

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
      const filteredMaterials = this.materials.filter(
        (mat) =>
          mat.name.toLowerCase().includes(term) ||
          mat.marque.toLowerCase().includes(term) ||
          mat.serialNumber.toLowerCase().includes(term) ||
          mat.status.toLowerCase().includes(term)
      );

      this.renderMaterialsTable(filteredMaterials, "materials-table");
    },

    viewMaterialDetails(id) {
      const material = this.materials.find((m) => m.id === id);
      if (!material) return;

      console.log("Viewing material details:", material);
      this.editingMaterial = { ...material };
      this.showMaterialModal2 = true;
    },

    editMaterial(id) {
      const material = this.allMaterials.find((m) => m.id === id);
      if (!material) return;

      this.editingMaterial = { ...material };
      this.showMaterialModal = true;
    },

    closeMaterialModal() {
      this.showMaterialModal = false;
      this.editingMaterial = {
        name: "",
        serialNumber: "",
        marque: "",
        status: "",
        image: "",
      }; // Reset the form
      this.selectedFile = null;
      this.imagePreview = null;
    },

    closeMaterialDetailsModal() {
      this.showMaterialModal2 = false;
      this.editingMaterial = {
        name: "",
        serialNumber: "",
        marque: "",
        status: "",
        image: "",
      }; // Reset the form
    },

    openAddMaterialModal() {
      this.editingMaterial = {
        name: "",
        marque: "",
        serialNumber: "",
        status: "Disponible",
        image: null,
        createdAt: this.getCurrentDateForInput(),
      };
      this.imagePreview = null;
      this.showMaterialModal = true;
      this.filteredMaterialNames = [];
      this.filteredMaterialMarques = [];
    },
    getCurrentDateForInput() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    autocompleteMaterialName() {
      this.filteredMaterialNames = this.materials.filter((material) =>
        material.name
          .toLowerCase()
          .includes(this.editingMaterial.name.toLowerCase())
      );
    },

    autocompleteMaterialMarque() {
      this.filteredMaterialMarques = this.materials.filter((material) =>
        material.marque
          .toLowerCase()
          .includes(this.editingMaterial.marque.toLowerCase())
      );
    },

    async saveMaterial() {
      try {
        const method = this.editingMaterial.id ? "PUT" : "POST";
        const url = this.editingMaterial.id
          ? `https://gestion-des-materials.onrender.com/api/materials/${this.editingMaterial.id}`
          : "https://gestion-des-materials.onrender.com/api/materials";

        const formData = new FormData();
        formData.append("name", this.editingMaterial.name);
        formData.append("marque", this.editingMaterial.marque);
        formData.append("serialNumber", this.editingMaterial.serialNumber);
        formData.append("status", this.editingMaterial.status);

        if (this.selectedFile) {
          formData.append("image", this.selectedFile);
        } else if (this.editingMaterial.image && !this.imagePreview) {
          formData.append("image", this.editingMaterial.image);
        }

        const response = await fetch(url, {
          method: method,
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP error! status: ${response.status} ${response.statusText}. Details: ${errorText}`
          );
        }

        this.addNotification(
          this.editingMaterial.id
            ? "Matériel mis à jour avec succès!"
            : "Nouveau matériel ajouté avec succès!",
          "success"
        );

        this.closeMaterialModal();
        await this.fetchAllMaterials();
      } catch (error) {
        console.error("Error saving material:", error);
        this.addNotification(
          "Une erreur s'est produite lors de l'enregistrement du matériel. Vérifiez les détails dans la console.",
          "error"
        ); // More informative message
      }
    },

    async deleteMaterial(id) {
      try {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce matériel?")) return;

        const response = await fetch(
          `https://gestion-des-materials.onrender.com/api/materials/${id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        this.addNotification("Matériel supprimé avec succès!", "success");

        await this.fetchAllMaterials();
      } catch (error) {
        console.error("Error deleting material:", error);
        this.addNotification(
          "Une erreur s'est produite lors de la suppression du matériel.",
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

    async exportToExcelMaterials() {
      await this.exportToExcel(
        "materials-table",
        "Matériels",
        "materials_export.xlsx",
        "#4CAF50",
        "#FFFFFF"
      ); // Green theme
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
