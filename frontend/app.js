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
        newNote: { title: '', content: '' },
        notes: [],

        async init() {
            try {
                await Promise.all([
                    this.fetchAllMaterials(),
                    this.fetchEmployees(),
                    this.fetchCounts(),
                    this.fetchNotes()
                ]);
            } catch (error) {
                console.error("Erreur lors de l'initialisation :", error);
            }
        },

        addNotification(message, type = 'info') {
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
        },

        toggleNotificationPopup() {
            this.notificationPopupOpen = !this.notificationPopupOpen;
        },

        removeNotification(id) {
            this.notifications = this.notifications.filter(notification => notification.id !== id);
        },

        async fetchAllMaterials() {
            try {
                const response = await fetch('https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/materials');
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
                const response = await fetch('https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/employees');
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

            this.employeesPC = employees.filter(emp =>
                emp.materials && emp.materials.some(mat =>
                    mat.name &&
                    (mat.name.toLowerCase().includes("pc") ||
                        mat.name.toLowerCase().includes("laptop") ||
                        mat.name.toLowerCase().includes("macbook"))
                )
            );

            this.employeesPrinter = employees.filter(emp =>
                emp.materials && emp.materials.some(mat =>
                    mat.name &&
                    (mat.name.toLowerCase().includes("imprimante") ||
                        mat.name.toLowerCase().includes("printer"))
                )
            );

            this.employeesScreen = employees.filter(emp =>
                emp.materials && emp.materials.some(mat =>
                    mat.name &&
                    (mat.name.toLowerCase().includes("ecran") ||
                        mat.name.toLowerCase().includes("screen") ||
                        mat.name.toLowerCase().includes("monitor"))
                )
            );
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
            const container = document.getElementById(`${item}-change-container`);

            if (!container) {
                console.error(`Conteneur non trouvé pour l'élément : ${item}`);
                return;
            }

            const element = container.querySelector('p');
            const icon = container.querySelector('i');

            if (change === Infinity || change === "N/A" || change === 0 || !change || change === null || typeof change === 'undefined') {
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
                const color = change.toString().includes('-') ? 'red' : 'green';
                const arrowClass = change.toString().includes('-') ? 'fa-arrow-down' : 'fa-arrow-up';

                element.style.color = color;

                if (icon) {
                    icon.className = `fas ${arrowClass} mr-1`;
                    icon.style.color = color;
                }
            } else {
                console.error(`Élément (p) non trouvé dans le conteneur pour l'élément : ${item}`);
            }
        },

        async fetchEmployeeCount() {
            try {
                const response = await fetch('https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/employees');
                if (!response.ok) {
                    throw new Error(`Erreur HTTP ! status: ${response.status}`);
                }
                const employees = await response.json();
                return employees.length;
            } catch (error) {
                console.error("Erreur lors de la récupération du nombre d'employés :", error);
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
        },

        fetchNotes() {
            fetch('https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/notes')
                .then(response => response.json())
                .then(data => {
                    this.notes = data;
                });
        },

        addNote() {
            const username = localStorage.getItem('username');
            if (!username) {
                console.error("Nom d'utilisateur non trouvé. Veuillez vous connecter.");
                this.addNotification("Veuillez vous connecter pour ajouter une note.", 'error'); 
                return;
            }

            const noteWithUsername = { ...this.newNote, manager: username };

            fetch('https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(noteWithUsername)
            })
                .then(response => response.json())
                .then(newNote => {
                    this.notes.push(newNote);
                    this.newNote = { title: '', content: '' };
                    this.isAddingNote = false;
                    this.addNotification("Note ajoutée avec succès !","success"); 
                })
                .catch(error => {
                    console.error("Erreur lors de l'ajout de la note :", error);
                    this.addNotification("Erreur lors de l'ajout de la note. Veuillez réessayer.", 'error'); // Error notification
                });
        },


        deleteNote(id) {
            fetch(`https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/notes/${id}`, {
                method: 'DELETE'
            })
                .then(response => {
                    if (response.status === 204) {
                        this.notes = this.notes.filter(note => note.id !== id);
                        this.addNotification("Note supprimée avec succès !","success"); 
                    } else {
                        console.error("Erreur lors de la suppression de la note :", response.status);
                        this.addNotification("Erreur lors de la suppression de la note. Veuillez réessayer.", 'error'); // Error notification
                    }
                })
                .catch(error => {
                    console.error("Erreur lors de la suppression de la note :", error);
                    this.addNotification("Erreur lors de la suppression de la note. Veuillez réessayer.", 'error'); // Error notification
                });
        },



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