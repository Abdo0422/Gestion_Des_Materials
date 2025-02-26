function ipAddressesData() {
    return {
        adressesIP: [],
        materiels: [],
        adressesIPFiltrees: [],
        recherche: '',
        afficherModal: false,
        adresseIPEnCoursEdition: {},
        materielSelectionne: null,
        materielsDisponibles: [],
        notifications: [],
        notificationPopupOpen: false,

        async init() {
            const isAuthenticated = await this.checkAuth();
            if (!isAuthenticated) {
                window.location.href = 'login.html';
                return;
            }
            await this.chargerAdressesIP();
            await this.chargerMateriels();
            this.adressesIPFiltrees = [...this.adressesIP];
            this.renderTable();
        },
        checkAuth() {
            if (localStorage.getItem('isAuthenticated') !== 'true') {
                window.location.href = 'login.html';
                return false;
            }
            return true;
        },
        logout() {
            localStorage.removeItem('role');
            localStorage.removeItem('username');
            localStorage.removeItem('isAuthenticated')
            window.location.href = 'login.html';
            console.log('Déconnexion effectuée');
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

        async exportToExcel() {
            const table = document.getElementById("ipTable");
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Adresses IP");

            const titleStyle = {
                font: { name: 'Arial', size: 20, bold: true, color: { argb: '1D4E89' } },
                alignment: { horizontal: 'center' }
            };

            const dateStyle = {
                font: { name: 'Arial', size: 14, color: { argb: '7B7B7B' } },
                alignment: { horizontal: 'center' }
            };

            const headerStyle = {
                font: { name: 'Arial', size: 14, bold: true, color: { argb: "FFFFFF" } },
                fill: { type: "pattern", pattern: "solid", fgColor: { argb: "0073E6" } },
                alignment: { horizontal: "center", vertical: "middle" },
                border: {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" }
                }
            };

            const rowStyle = {
                font: { name: "Arial", size: 12, color: { argb: '000000' } },
                alignment: { horizontal: "left", vertical: "middle" },
                border: {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" }
                }
            };


            const titleRow = worksheet.addRow(["Liste des Adresses IP"]);
            titleRow.getCell(1).style = titleStyle;
            worksheet.mergeCells('A1:D1');

            const dateRow = worksheet.addRow([`Exporté le : ${new Date().toLocaleString("fr-FR")}`]);
            dateRow.getCell(1).style = dateStyle;
            worksheet.mergeCells('A2:D2');

            const headers = ["Nom du matériel", "Marque", "Numéro de Série", "Adresse IP"];
            const headerRow = worksheet.addRow(headers);
            headerRow.eachCell(cell => cell.style = headerStyle);


            const dataRows = [];
            for (let i = 1; i < table.rows.length; i++) {
                const row = table.rows[i];
                const rowData = [];
                for (let j = 0; j < row.cells.length - 1; j++) {
                    rowData.push(row.cells[j].innerText);
                }
                dataRows.push(rowData);
            }

            dataRows.forEach(rowData => {
                const excelRow = worksheet.addRow(rowData);
                excelRow.eachCell(cell => cell.style = rowStyle);

                if (worksheet.rowCount % 2 === 0) {
                    excelRow.eachCell(cell => {
                        cell.fill = {
                            type: "pattern",
                            pattern: "solid",
                            fgColor: { argb: "F2F2F2" }
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
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            saveAs(blob, "adresses_ip.xlsx");
        },

        async chargerAdressesIP() {
            try {
                const reponse = await fetch('https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/ip-addresses');
                if (!reponse.ok) throw new Error(`Erreur HTTP ! Statut : ${reponse.status}`);
                this.adressesIP = await reponse.json();
            } catch (erreur) {
                console.error("Erreur lors de la récupération des adresses IP :", erreur);
            }
        },

        filtrerAdressesIP() {
            const query = this.recherche.toLowerCase();
            this.adressesIPFiltrees = this.adressesIP.filter(item => {
                return (
                    item.materialName && item.materialName.toLowerCase().includes(query) ||
                    item.marque && item.marque.toLowerCase().includes(query) ||
                    item.serialNumber && item.serialNumber.toLowerCase().includes(query) ||
                    item.ipAddress && item.ipAddress.toLowerCase().includes(query)
                );
            });
            this.renderTable();
        },

        async chargerMateriels() {
            try {
                const reponse = await fetch('https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/materials');
                if (!reponse.ok) throw new Error(`Erreur HTTP ! Statut : ${reponse.status}`);
                const allMateriels = await reponse.json();

                this.materiels = allMateriels.filter(materiel => materiel.status === "En Utilisation");
                this.updateAvailableMaterials();

            } catch (erreur) {
                console.error("Erreur lors de la récupération des matériels :", erreur);
            }
        },

        updateAvailableMaterials() {
            const usedMaterialNames = this.adressesIP.map(ip => ip.materialName);
            this.materielsDisponibles = this.materiels.filter(materiel => !usedMaterialNames.includes(materiel.name));
        },

        ouvrirModalAjouter() {
            this.adresseIPEnCoursEdition = {};
            this.materielSelectionne = null;
            this.afficherModal = true;
            this.updateAvailableMaterials();
        },
        ouvrirModalModifier(adresseIP) {
            this.adresseIPEnCoursEdition = { ...adresseIP };
            this.materielSelectionne = this.materiels.find(m => m.name === adresseIP.materialName);
            this.afficherModal = true;
            this.updateAvailableMaterials();
        },
        gererChangementMateriel(event) {
            const nomMaterielSelectionne = event.target.value;
            this.materielSelectionne = this.materiels.find(m => m.name === nomMaterielSelectionne);
            this.adresseIPEnCoursEdition.marque = this.materielSelectionne ? this.materielSelectionne.marque : '';
            this.adresseIPEnCoursEdition.serialNumber = this.materielSelectionne ? this.materielSelectionne.serialNumber : '';
        },
        fermerModal() {
            this.afficherModal = false;
        },
        async enregistrerAdresseIP() {
            Alpine.store('errorMessages', { materialName: '', ipAddress: '' })
            try {
                const methode = this.adresseIPEnCoursEdition.id ? 'PUT' : 'POST';
                const url = this.adresseIPEnCoursEdition.id ? `https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/ip-addresses/${this.adresseIPEnCoursEdition.id}` : 'https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/ip-addresses';
                const reponse = await fetch(url, {
                    method: methode,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.adresseIPEnCoursEdition)
                });

                if (reponse.ok) {
                    this.fermerModal();
                    await this.chargerAdressesIP();
                    await this.chargerMateriels();
                    this.adressesIPFiltrees = [...this.adressesIP];
                    this.renderTable();
                    this.addNotification("Adresse IP enregistrée avec succès !", 'success');
                }

                if (!reponse.ok) {
                    const donneesErreur = await reponse.json();

                    if (donneesErreur.error && donneesErreur.error.includes("Material name")) {
                        Alpine.store('errorMessages', { materialName: donneesErreur.error, ipAddress: '' });
                    } else if (donneesErreur.error && donneesErreur.error.includes("IP address")) {
                        Alpine.store('errorMessages', { materialName: '', ipAddress: donneesErreur.error });
                    }
                    else if (donneesErreur.error) {
                        Alpine.store('errorMessages', { materialName: donneesErreur.error, ipAddress: donneesErreur.error });
                    }
                    else {
                        throw new Error(donneesErreur.message || 'Échec de l\'enregistrement de l\'adresse IP');
                    }
                    return;
                }

            } catch (erreur) {
                console.error("Erreur lors de l'enregistrement de l'adresse IP :", erreur);
                this.addNotification(erreur.message, 'error');
            }
        },
        async supprimerAdresseIP(id) {
            if (confirm("Êtes-vous sûr de vouloir supprimer cette adresse IP ?")) {
                try {
                    const reponse = await fetch(`https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/ip-addresses/${id}`, { method: 'DELETE' });
                    if (!reponse.ok) throw new Error('Échec de la suppression de l\'adresse IP');
                    await this.chargerAdressesIP();
                    this.adressesIPFiltrees = [...this.adressesIP];
                    this.renderTable();
                    this.addNotification("Adresse IP supprimée avec succès !", 'success');
                } catch (erreur) {
                    console.error("Erreur lors de la suppression de l'adresse IP :", erreur);
                    this.addNotification(erreur.message || "Erreur lors de la suppression", 'error');
                }
            }
        },
        getNomMateriel(idMateriel) {
            const materiel = this.materiels.find(m => m.id === idMateriel);
            return materiel ? materiel.name : '';
        },
        renderTable() {
            const corpsTable = document.getElementById('ip-addresses-table');
            if (!corpsTable) return;
            corpsTable.innerHTML = '';
            if (!this.adressesIPFiltrees || this.adressesIPFiltrees.length === 0) {
                const ligne = corpsTable.insertRow();
                const cellule = ligne.insertCell();
                cellule.colSpan = 5;
                cellule.textContent = "Aucun matériel disponible.";
                cellule.className = "p-4 text-center text-gray-500 italic";
                return;
            }
            this.adressesIPFiltrees.forEach(item => {
                const ligne = document.createElement('tr');
                ligne.className = "border-b border-gray-100 table-row";
                const cellules = [
                    { value: item.materialName, label: 'Nom' },
                    { value: item.marque, label: 'Marque' },
                    { value: item.serialNumber, label: 'Numéro de Série' },
                    { value: item.ipAddress, label: 'Adresse IP' }
                ];
                cellules.forEach(donneesCellule => {
                    const cellule = document.createElement('td');
                    cellule.className = "p-4";
                    cellule.setAttribute('data-label', donneesCellule.label);
                    cellule.textContent = donneesCellule.value;
                    ligne.appendChild(cellule);
                });
                const celluleActions = document.createElement('td');
                celluleActions.className = "p-4 text-right";
                celluleActions.setAttribute('data-label', 'Actions');
                const conteneurActions = document.createElement('div');
                conteneurActions.className = "flex items-center justify-end space-x-2";
                const boutonModifier = document.createElement('button');
                boutonModifier.className = "p-2 rounded-lg bg-amber-50 text-moroccan-gold hover:bg-amber-100 transition-colors";
                boutonModifier.innerHTML = '<i class="fas fa-edit"></i>';
                boutonModifier.addEventListener('click', () => this.ouvrirModalModifier(item));
                const boutonSupprimer = document.createElement('button');
                boutonSupprimer.className = "p-2 rounded-lg bg-red-50 text-moroccan-red hover:bg-red-100 transition-colors";
                boutonSupprimer.innerHTML = '<i class="fas fa-trash-alt"></i>';
                boutonSupprimer.addEventListener('click', () => this.supprimerAdresseIP(parseInt(item.id)));
                conteneurActions.appendChild(boutonModifier);
                conteneurActions.appendChild(boutonSupprimer);
                celluleActions.appendChild(conteneurActions);
                ligne.appendChild(celluleActions);
                corpsTable.appendChild(ligne);
            });
        }
    };
}

document.addEventListener('alpine:init', () => {
    Alpine.data('ipAddressesData', ipAddressesData);
    Alpine.store('errorMessages', {
        materialName: '',
        ipAddress: ''
    });

});