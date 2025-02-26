function dashboardData() {
  return {
    sidebarOpen: false,
    allMaterials: [],
    filteredMaterials: [],
    filteredMaterialNames: [],
    filteredMaterialMarques: [],
    materials: [],
    employeesPC: [],
    employeesPrinter: [],
    employeesScreen: [],
    selectedFile: null,
    imagePreview: null,
    notifications: [],
    notificationPopupOpen: false,
    isAddingNote: false,
    newNote: { title: "", content: "" },
    notes: [],

    async init() {
      try {
        const isAuthenticated = await this.checkAuth();
        if (!isAuthenticated) {
          window.location.href = "login.html";
          return;
        }
        const isAdmin = this.checkAdmin();
        if (!isAdmin) {
          window.location.href = "login.html";
          return;
        }
        await Promise.all([
          this.fetchAllMaterials(),
          this.fetchEmployees(),
          this.fetchCounts(),
          this.fetchNotes(),
        ]);
      } catch (error) {
        console.error("Erreur lors de l'initialisation :", error);
      }
    },
    checkAuth() {
      if (localStorage.getItem("isAuthenticated") !== "true") {
        window.location.href = "login.html";
        return false;
      }
      return true;
    },
    checkAdmin() {
      if (localStorage.getItem("isAdmin") !== "true") {
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
          throw new Error(`Erreur HTTP ! status: ${response.status}`);
        }
        this.allMaterials = await response.json();
        this.materials = [...this.allMaterials];
        this.filteredMaterials = [...this.allMaterials];
        return this.allMaterials;
      } catch (error) {
        console.error("Erreur lors de la récupération des matériaux :", error);
      }
    },

    async fetchEmployees() {
      try {
        const response = await fetch(
          "https://gestion-des-materials.onrender.com/api/employees"
        );
        if (!response.ok) {
          throw new Error(`Erreur HTTP ! status: ${response.status}`);
        }
        const employees = await response.json();
        this.processEmployees(employees);
      } catch (error) {
        console.error("Erreur lors de la récupération des employés :", error);
      }
    },

    processEmployees(employees) {
      if (!employees || !Array.isArray(employees)) {
        console.error("Données employés invalides :", employees);
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
    },

    logout() {
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("isAdmin");
      window.location.href = "login.html";
      console.log("Déconnexion effectuée");
    },

    async fetchCounts() {
      try {
        const response = await fetch(
          "https://gestion-des-materials.onrender.com/api/counts"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Data from API:", data);

        document.getElementById("employee-count").textContent =
          data.numEmployees;
        document.getElementById("manager-count").textContent = data.numManagers;
        document.getElementById("material-count").textContent =
          data.totalMaterials;

        this.updatePercentageDisplay("employee", data.employeeChange);
        this.updatePercentageDisplay("manager", data.managerChange);
        this.updatePercentageDisplay(
          "total-material",
          data.totalMaterialsChange
        );

        const checkChartLoaded = setInterval(() => {
          const ctx = document
            .getElementById("material-chart")
            ?.getContext("2d");
          if (ctx) {
            clearInterval(checkChartLoaded);
            this.createMaterialChart(
              data.numEmployees,
              data.numManagers,
              data.totalMaterials
            );
          }
        }, 100);
      } catch (error) {
        console.error("Error fetching counts or creating chart:", error);
        const countsContainer = document.getElementById("counts-container");
        if (countsContainer) {
          countsContainer.innerHTML =
            "<p>Error loading data. Please try again later.</p>";
        }
      }
    },

    updatePercentageDisplay(item, change) {
      const container = document.getElementById(`${item}-change-container`);

      if (!container) {
        console.error(`Conteneur non trouvé pour l'élément : ${item}`);
        return;
      }

      const element = container.querySelector("p");
      const icon = container.querySelector("i");

      if (
        change === Infinity ||
        change === "N/A" ||
        change === 0 ||
        !change ||
        change === null ||
        typeof change === "undefined"
      ) {
        if (element) {
          element.textContent = "N/A";
        }

        if (icon) {
          icon.className = "fas fa-minus mr-1";
          icon.style.color = "gray";
        }
        return;
      }

      if (element) {
        element.textContent = `${change}`;
        const color = change.toString().includes("-") ? "red" : "green";
        const arrowClass = change.toString().includes("-")
          ? "fa-arrow-down"
          : "fa-arrow-up";

        element.style.color = color;

        if (icon) {
          icon.className = `fas ${arrowClass} mr-1`;
          icon.style.color = color;
        }
      } else {
        console.error(
          `Élément (p) non trouvé dans le conteneur pour l'élément : ${item}`
        );
      }
    },
    myChart: null,
    createMaterialChart(numEmployees, numManagers, totalMaterials) {
      const ctx = document.getElementById("material-chart").getContext("2d");
      if (!ctx) {
        console.error("Canvas context not found!");
        return;
      }

      if (this.myChart) {
        this.myChart.destroy();
      }

      this.myChart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Employees", "Managers", "Total Materials"],
          datasets: [
            {
              data: [numEmployees, numManagers, totalMaterials],
              backgroundColor: [
                "rgba(54, 162, 235, 0.8)",
                "rgba(255, 99, 132, 0.8)",
                "rgba(255, 206, 86, 0.8)",
              ],
              borderColor: [
                "rgba(54, 162, 235, 1)",
                "rgba(255, 99, 132, 1)",
                "rgba(255, 206, 86, 1)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
            },
          },
        },
      });
    },

    fetchNotes() {
      fetch("https://gestion-des-materials.onrender.com/api/notes")
        .then((response) => {
          if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            this.notes = [];
            return Promise.reject(
              new Error(`HTTP error! status: ${response.status}`)
            );
          }
          return response.json();
        })
        .then((data) => {
          this.notes = data;
        })
        .catch((error) => {
          console.error("Error fetching notes:", error);
          this.notes = [];
        });
    },

    addNote() {
      const username = localStorage.getItem("username");
      if (!username) {
        console.error("Nom d'utilisateur non trouvé. Veuillez vous connecter.");
        this.addNotification(
          "Veuillez vous connecter pour ajouter une note.",
          "error"
        );
        return;
      }

      const noteWithUsername = { ...this.newNote, manager: username };

      fetch("https://gestion-des-materials.onrender.com/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(noteWithUsername),
      })
        .then((response) => response.json())
        .then((newNote) => {
          this.notes.push(newNote);
          this.newNote = { title: "", content: "" };
          this.isAddingNote = false;
          this.addNotification("Note ajoutée avec succès !", "success");
        })
        .catch((error) => {
          console.error("Erreur lors de l'ajout de la note :", error);
          this.addNotification(
            "Erreur lors de l'ajout de la note. Veuillez réessayer.",
            "error"
          ); // Error notification
        });
    },

    deleteNote(id) {
      const username = localStorage.getItem("username"); // Get current user

      // Find the note to check its manager
      const noteToDelete = this.notes.find((note) => note.id === id);

      if (!noteToDelete) {
        console.error("Note not found!");
        this.addNotification("Note non trouvée.", "error");
        return;
      }

      if (noteToDelete.manager !== username) {
        console.error("You are not authorized to delete this note.");
        this.addNotification(
          "Vous n'êtes pas autorisé à supprimer cette note.",
          "error"
        );
        return;
      }

      fetch(`https://gestion-des-materials.onrender.com/api/notes/${id}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.status === 204) {
            this.notes = this.notes.filter((note) => note.id !== id);
            this.addNotification("Note supprimée avec succès !", "success");
          } else {
            console.error(
              "Erreur lors de la suppression de la note :",
              response.status
            );
            this.addNotification(
              "Erreur lors de la suppression de la note. Veuillez réessayer.",
              "error"
            );
          }
        })
        .catch((error) => {
          console.error("Erreur lors de la suppression de la note :", error);
          this.addNotification(
            "Erreur lors de la suppression de la note. Veuillez réessayer.",
            "error"
          );
        });
    },
  };
}

document.addEventListener("DOMContentLoaded", function () {
  const app = dashboardData();
  app.init();

  const stats = [
    { id: "employee-count", percent: 75 },
    { id: "manager-count", percent: 60 },
    { id: "material-count", percent: 40 },
  ];

  stats.forEach((stat) => {
    const circle = document
      .querySelector(`#${stat.id}`)
      .parentNode.parentNode.querySelector("circle:last-of-type");
    if (circle) {
      let dashArray = 251.2;
      circle.style.strokeDashoffset = `calc(${dashArray} - (${dashArray} * ${stat.percent} / 100))`;
      circle.nextElementSibling.textContent = `${stat.percent}%`;
    }
  });
});
