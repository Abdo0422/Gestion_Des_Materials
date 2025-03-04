const fs = require("fs");
const express = require("express");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const path = require("path");
const moment = require("moment");

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "../frontend")));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());

const usersFile = "./data/users.json";
const employeesFile = "./data/employees.json";
const materialsFile = "./data/materials.json";
const notesFile = "./data/notes.json";
const ipAddressesFile = "./data/ip_addresses.json";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });
app.use("/backend/images", express.static(path.join(__dirname, "images")));

function addCreationDate(data) {
  return { ...data, createdAt: new Date() };
}

function getNextId(data) {
  if (!data || data.length === 0) {
    return 1;
  }
  const lastId = data.reduce(
    (max, item) => Math.max(max, parseInt(item.id)),
    0
  );
  return lastId + 1;
}

function countEmployees() {
  try {
    const employees = JSON.parse(fs.readFileSync(employeesFile, "utf8"));
    return employees.length;
  } catch (error) {
    console.error("Erreur de lecture du fichier des employés:", error);
    return 0;
  }
}

function countManagers() {
  try {
    const users = JSON.parse(fs.readFileSync(usersFile, "utf8"));
    return users.filter((user) => user.role === "manager").length;
  } catch (error) {
    console.error("Error reading users file:", error);
    return 0;
  }
}

function countTotalMaterials() {
  try {
    const materials = JSON.parse(fs.readFileSync(materialsFile, "utf8"));
    return materials.length;
  } catch (error) {
    console.error("Error reading materials file:", error);
    return 0;
  }
}

function countMaterialsByName(searchTerm) {
  try {
    const materials = JSON.parse(fs.readFileSync(materialsFile, "utf8"));
    const lowerSearchTerm = searchTerm.toLowerCase();

    const count = materials.filter((material) => {
      const lowerMaterialName = material.name.toLowerCase();
      return lowerMaterialName.includes(lowerSearchTerm);
    }).length;

    return count;
  } catch (error) {
    console.error("Erreur de lecture du fichier des matériaux:", error);
    return 0;
  }
}

function countEmployeesLastMonth() {
  try {
    const employees = JSON.parse(fs.readFileSync(employeesFile, "utf8"));
    const lastMonthStart = moment().subtract(1, "month").startOf("month");
    const lastMonthEnd = moment().subtract(1, "month").endOf("month");

    const count = employees.filter((employee) => {
      console.log("Données de l'employé:", employee);
      if (!employee.createdAt) {
        console.warn("L'employé n'a pas de date de création:", employee);
        return false;
      }
      const createdAt = moment(employee.createdAt);
      return createdAt.isBetween(lastMonthStart, lastMonthEnd, null, "[]");
    }).length;

    console.log("Employés du mois dernier:", count);
    return count;
  } catch (error) {
    console.error("Erreur de lecture du fichier des employés:", error);
    return 0;
  }
}

function countMaterialsByNameLastMonth(searchTerm) {
  try {
    const materials = JSON.parse(fs.readFileSync(materialsFile, "utf8"));
    const lowerSearchTerm = searchTerm.toLowerCase();
    const lastMonthStart = moment().subtract(1, "month").startOf("month");
    const lastMonthEnd = moment().subtract(1, "month").endOf("month");

    const count = materials.filter((material) => {
      console.log("Données du matériel:", material);
      const lowerMaterialName = material.name.toLowerCase();
      if (!material.createdAt) {
        console.warn("Le matériel n'a pas de date de création:", material);
        return false;
      }
      const createdAt = moment(material.createdAt);
      return (
        lowerMaterialName.includes(lowerSearchTerm) &&
        createdAt.isBetween(lastMonthStart, lastMonthEnd, null, "[]")
      );
    }).length;

    console.log(`Matériels (${searchTerm}) du mois dernier:`, count);
    return count;
  } catch (error) {
    console.error("Erreur de lecture du fichier des matériaux:", error);
    return 0;
  }
}

function countManagersLastMonth() {
  try {
    const users = JSON.parse(fs.readFileSync(usersFile, "utf8"));
    const lastMonthStart = moment().subtract(1, "month").startOf("month");
    const lastMonthEnd = moment().subtract(1, "month").endOf("month");

    const count = users.filter((user) => {
      if (user.role !== "manager" || !user.createdAt) return false; // Check role and createdAt
      const createdAt = moment(user.createdAt);
      return createdAt.isBetween(lastMonthStart, lastMonthEnd, null, "[]");
    }).length;

    return count;
  } catch (error) {
    console.error("Error reading users file:", error);
    return 0;
  }
}

function countTotalMaterialsLastMonth() {
  try {
    const materials = JSON.parse(fs.readFileSync(materialsFile, "utf8"));
    const lastMonthStart = moment().subtract(1, "month").startOf("month");
    const lastMonthEnd = moment().subtract(1, "month").endOf("month");

    const count = materials.filter((material) => {
      if (!material.createdAt) return false;
      const createdAt = moment(material.createdAt);
      return createdAt.isBetween(lastMonthStart, lastMonthEnd, null, "[]");
    }).length;

    return count;
  } catch (error) {
    console.error("Error reading materials file:", error);
    return 0;
  }
}

function calculatePercentageChange(previousValue, currentValue) {
  if (previousValue === 0) {
    return currentValue === 0 ? 0 : (currentValue * 100).toFixed(1) + "%";
  }
  const change = ((currentValue - previousValue) / previousValue) * 100;
  return change.toFixed(1) + "%";
}

function getIPAddresses() {
  try {
    const ipAddresses = JSON.parse(fs.readFileSync(ipAddressesFile, "utf8"));
    return ipAddresses;
  } catch (error) {
    console.error("Erreur de lecture des adresses IP:", error);
    return [];
  }
}

function isDuplicateIP(ipAddresses, newIPAddress) {
  return ipAddresses.some(
    (existingIP) =>
      existingIP.ipAddress === newIPAddress.ipAddress &&
      existingIP.materialName !== newIPAddress.materialName
  );
}

function saveIPAddresses(ipAddresses) {
  try {
    fs.writeFileSync(ipAddressesFile, JSON.stringify(ipAddresses, null, 2));
  } catch (error) {
    console.error("Erreur d'écriture des adresses IP:", error);
  }
}

app.get("/api/ip-addresses", (req, res) => {
  try {
    const ipAddresses = getIPAddresses();
    res.json(ipAddresses);
  } catch (error) {
    console.error("Erreur lors de la récupération des adresses IP:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des adresses IP" });
  }
});

app.post("/api/ip-addresses", (req, res) => {
  try {
    const newIPAddress = req.body;
    const ipAddresses = getIPAddresses();

    if (!newIPAddress.materialName || !newIPAddress.ipAddress) {
      return res
        .status(400)
        .json({ error: "Le nom du matériel et l'adresse IP sont requis" });
    }

    if (isDuplicateIP(ipAddresses, newIPAddress)) {
      return res.status(400).json({ error: "Adresse IP en double" });
    }

    newIPAddress.id = getNextId(ipAddresses);
    ipAddresses.push(newIPAddress);
    saveIPAddresses(ipAddresses);
    res
      .status(200)
      .json({ message: "Adresse IP ajoutée avec succès", id: newIPAddress.id });
  } catch (error) {
    console.error("Erreur du backend:", error);
    res
      .status(500)
      .json({ error: error.message || "Une erreur s'est produite" });
  }
});

app.put("/api/ip-addresses/:id", (req, res) => {
  try {
    const ipAddressId = req.params.id;
    const updatedIPAddress = req.body;

    const ipAddresses = getIPAddresses();
    const index = ipAddresses.findIndex(
      (ip) => String(ip.id) === String(ipAddressId)
    );

    if (index === -1) {
      return res.status(404).json({ error: "IP address not found" });
    }

    const otherIPs = ipAddresses.filter((ip, i) => i !== index);
    if (
      updatedIPAddress.ipAddress &&
      isDuplicateIP(otherIPs, updatedIPAddress)
    ) {
      return res.status(400).json({ error: "Duplicate IP address" });
    }

    ipAddresses[index] = { ...ipAddresses[index], ...updatedIPAddress };

    saveIPAddresses(ipAddresses);
    res.json(ipAddresses[index]);
  } catch (error) {
    console.error("Error updating IP address:", error);
    res.status(500).json({ error: "Error updating IP address" });
  }
});

app.delete("/api/ip-addresses/:id", (req, res) => {
  try {
    const ipAddressId = req.params.id;
    const ipAddresses = getIPAddresses();
    const index = ipAddresses.findIndex(
      (ip) => String(ip.id) === String(ipAddressId)
    );

    if (index === -1) {
      return res.status(404).json({ error: "IP address not found" });
    }

    ipAddresses.splice(index, 1);
    saveIPAddresses(ipAddresses);
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting IP address:", error);
    res.status(500).json({ error: "Error deleting IP address" });
  }
});

app.get("/api/counts", (req, res) => {
  const numEmployees = countEmployees();
  const numImprimantes = countMaterialsByName("imprimante");
  const numPCs = countMaterialsByName("pc");
  const numEcrans = countMaterialsByName("ecran");
  const numManagers = countManagers();
  const totalMaterials = countTotalMaterials();
  const numScanners = countMaterialsByName("scanner");

  const numEmployeesLastMonth = countEmployeesLastMonth();
  const numImprimantesLastMonth = countMaterialsByNameLastMonth("imprimante");
  const numPCsLastMonth = countMaterialsByNameLastMonth("pc");
  const numEcransLastMonth = countMaterialsByNameLastMonth("ecran");
  const numManagersLastMonth = countManagersLastMonth();
  const totalMaterialsLastMonth = countTotalMaterialsLastMonth();
  const numScannersLastMonth = countMaterialsByNameLastMonth("scanner");

  console.log("Current Counts:", {
    numEmployees,
    numImprimantes,
    numPCs,
    numEcrans,
    numManagers,
    totalMaterials,
    numScanners,
  });

  console.log("Last Month Counts:", {
    numEmployeesLastMonth,
    numImprimantesLastMonth,
    numPCsLastMonth,
    numEcransLastMonth,
    numManagersLastMonth,
    totalMaterialsLastMonth,
    numScannersLastMonth,
  });

  const employeeChange = calculatePercentageChange(
    numEmployeesLastMonth,
    numEmployees
  );
  const imprimanteChange = calculatePercentageChange(
    numImprimantesLastMonth,
    numImprimantes
  );
  const pcChange = calculatePercentageChange(numPCsLastMonth, numPCs);
  const ecranChange = calculatePercentageChange(numEcransLastMonth, numEcrans);
  const managerChange = calculatePercentageChange(
    numManagersLastMonth,
    numManagers
  );
  const totalMaterialsChange = calculatePercentageChange(
    totalMaterialsLastMonth,
    totalMaterials
  );
  const scannerChange = calculatePercentageChange(
    numScannersLastMonth,
    numScanners
  );

  console.log("Percentage Changes:", {
    employeeChange,
    imprimanteChange,
    pcChange,
    ecranChange,
    managerChange,
    totalMaterialsChange,
    scannerChange,
  });

  res.json({
    numEmployees,
    numImprimantes,
    numPCs,
    numEcrans,
    employeeChange,
    imprimanteChange,
    pcChange,
    ecranChange,
    numManagers,
    totalMaterials,
    managerChange,
    totalMaterialsChange,
    numScanners,
    scannerChange,
  });
});

// ✅ Login Route (No token authentication)
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  console.log("Login request received for username:", username);
  const users = JSON.parse(fs.readFileSync(usersFile, "utf8"));

  const user = users.find((u) => u.username === username);
  if (!user) {
    console.log("User not found");
    return res.status(401).json({ error: "Invalid credentials" });
  }

  bcrypt.compare(password, user.password, (err, isMatch) => {
    if (err) {
      console.error("Error comparing passwords:", err);
      return res.status(500).json({ error: "Error comparing passwords" });
    }

    if (!isMatch) {
      console.log("Password mismatch");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log("Login successful for user:", username);
    res.json({ message: "Login successful", role: user.role });
  });
});

// ✅ Get All Users (No authentication)
app.get("/api/users", (req, res) => {
  console.log("Get all users request received");
  const users = JSON.parse(fs.readFileSync(usersFile, "utf8"));
  res.json(users);
});

// ✅ Create Manager (No authentication)
app.post("/api/users", async (req, res) => {
  const { username, password } = req.body;
  console.log("Create manager request received with username:", username);
  const users = JSON.parse(fs.readFileSync(usersFile, "utf8"));

  if (users.some((user) => user.username === username)) {
    console.log("User already exists");
    return res.status(400).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newId = getNextId(users);

  const newUser = {
    id: newId,
    username,
    password: hashedPassword,
    role: "manager",
    createdAt: new Date(),
  };

  users.push(newUser);
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

  console.log("Manager created successfully for username:", username);
  res.json({ message: "Manager created successfully" });
});

// ✅ Update User (No authentication)
app.put("/api/users/:id", async (req, res) => {
  const userId = parseInt(req.params.id);
  const { username, password, role } = req.body;

  try {
    const users = JSON.parse(fs.readFileSync(usersFile, "utf8"));
    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = { ...users[userIndex] };

    if (username) updatedUser.username = username;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedUser.password = hashedPassword;
    }
    if (role) updatedUser.role = role;

    users[userIndex] = updatedUser;
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// ✅ Delete User (No authentication)
app.delete("/api/users/:id", (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const users = JSON.parse(fs.readFileSync(usersFile, "utf8"));
    const updatedUsers = users.filter((user) => user.id !== userId);

    if (updatedUsers.length === users.length) {
      return res.status(404).json({ error: "User not found" });
    }

    fs.writeFileSync(usersFile, JSON.stringify(updatedUsers, null, 2));
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

app.get("/api/notes", (req, res) => {
  try {
    const notes = JSON.parse(fs.readFileSync(notesFile, "utf8"));
    res.json(notes);
  } catch (error) {
    console.error("Error reading notes file:", error);
    res.status(500).json({ error: "Error retrieving notes" });
  }
});

app.post("/api/notes", (req, res) => {
  try {
    const notes = JSON.parse(fs.readFileSync(notesFile, "utf8"));
    const newNote = {
      id: getNextId(notes),
      title: req.body.title,
      content: req.body.content,
      createdAt: new Date(),
      manager: req.body.manager,
    };
    notes.push(newNote);
    fs.writeFileSync(notesFile, JSON.stringify(notes, null, 2));
    res.status(201).json(newNote);
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ error: "Error creating note" });
  }
});

app.delete("/api/notes/:id", (req, res) => {
  try {
    const noteId = req.params.id;
    const notes = JSON.parse(fs.readFileSync(notesFile, "utf8"));
    const index = notes.findIndex((note) => note.id === parseInt(noteId));
    if (index === -1) {
      return res.status(404).json({ error: "Note not found" });
    }
    notes.splice(index, 1);
    fs.writeFileSync(notesFile, JSON.stringify(notes, null, 2));
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Error deleting note" });
  }
});

// CRUD for Materials
app.get("/api/materials", (req, res) => {
  try {
    console.log("Get all materials request received");
    const materials = JSON.parse(fs.readFileSync(materialsFile, "utf8"));
    res.json(materials);
  } catch (error) {
    console.error("Error getting materials:", error);
    res.status(500).json({ error: "Error retrieving materials" });
  }
});

app.get("/api/materials/:id", (req, res) => {
  try {
    const materialId = req.params.id;
    const materials = JSON.parse(fs.readFileSync(materialsFile, "utf8"));
    const material = materials.find((m) => m.id === parseInt(materialId));

    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }

    res.json(material);
  } catch (error) {
    console.error("Error getting materials:", error);
    res.status(500).json({ error: "Error retrieving material" });
  }
});

app.post("/api/materials", upload.single("image"), (req, res) => {
  try {
    console.log("Create material request received:", req.body);

    const materials = JSON.parse(fs.readFileSync(materialsFile, "utf8"));
    const newMaterial = addCreationDate(req.body);

    if (!newMaterial.name) {
      console.log("Material name is required");
      return res.status(400).json({ error: "Name is required" });
    }

    if (req.file) {
      newMaterial.image = `images/${req.file.filename}`;
    }

    newMaterial.id = getNextId(materials);
    materials.push(newMaterial);
    fs.writeFileSync(materialsFile, JSON.stringify(materials, null, 2));
    console.log("Material created successfully:", newMaterial);

    res.status(201).json(newMaterial);
  } catch (error) {
    console.error("Error creating material:", error);
    res.status(500).json({ error: "Error creating material" });
  }
});

app.put("/api/materials/:id", upload.single("image"), (req, res) => {
  try {
    const materialId = req.params.id;
    const updatedMaterial = req.body;

    const materials = JSON.parse(fs.readFileSync(materialsFile, "utf8"));
    const employees = JSON.parse(fs.readFileSync(employeesFile, "utf8"));

    const materialIndex = materials.findIndex(
      (m) => String(m.id) === String(materialId)
    );

    if (materialIndex === -1) {
      return res.status(404).json({ error: "Material not found" });
    }

    if (req.file) {
      updatedMaterial.image = `images/${req.file.filename}`;
    }

    materials[materialIndex] = {
      ...materials[materialIndex],
      ...updatedMaterial,
      updatedAt: new Date(),
    };

    console.log("Updated Material:", materials[materialIndex]);

    employees.forEach((employee) => {
      if (employee.materials) {
        console.log("Employee Materials (Before Update):", employee.materials);

        employee.materials = employee.materials.map((empMat) => {
          if (empMat.serialNumber === materials[materialIndex].serialNumber) {
            const updatedEmpMat = {
              ...materials[materialIndex],
              name: materials[materialIndex].name,
              serialNumber: materials[materialIndex].serialNumber,
              image: materials[materialIndex].image,
            };
            console.log("Updated Employee Material:", updatedEmpMat);
            return updatedEmpMat;
          } else {
            return empMat;
          }
        });

        console.log("Employee Materials (After Update):", employee.materials);
        employee.updatedAt = new Date();
      }
    });

    fs.writeFileSync(materialsFile, JSON.stringify(materials, null, 2));
    fs.writeFileSync(employeesFile, JSON.stringify(employees, null, 2));

    console.log("Employees (After Material Update):", employees);

    res.json(materials[materialIndex]);
  } catch (error) {
    console.error("Error updating material:", error);
    res.status(500).json({ error: "Error updating material" });
  }
});

app.delete("/api/materials/:id", (req, res) => {
  try {
    const materialId = req.params.id;
    const materials = JSON.parse(fs.readFileSync(materialsFile, "utf8"));
    const employees = JSON.parse(fs.readFileSync(employeesFile, "utf8"));
    const materialIndex = materials.findIndex(
      (m) => String(m.id) === String(materialId)
    );

    if (materialIndex === -1) {
      return res.status(404).json({ error: "Material not found" });
    }

    employees.forEach((employee) => {
      if (employee.materials) {
        const employeeMaterialIndex = employee.materials.findIndex(
          (empMat) =>
            empMat.serialNumber === materials[materialIndex].serialNumber
        );
        if (employeeMaterialIndex !== -1) {
          employee.materials.splice(employeeMaterialIndex, 1);
          employee.updatedAt = new Date();
        }
      }
    });

    materials.splice(materialIndex, 1);

    fs.writeFileSync(materialsFile, JSON.stringify(materials, null, 2));
    fs.writeFileSync(employeesFile, JSON.stringify(employees, null, 2));

    res.status(204).end();
  } catch (error) {
    console.error("Error deleting material:", error);
    res.status(500).json({ error: "Error deleting material" });
  }
});

// CRUD for Employees
app.get("/api/employees", (req, res) => {
  try {
    console.log("Get all employees request received");
    const employees = JSON.parse(fs.readFileSync(employeesFile, "utf8"));
    res.json(employees);
  } catch (error) {
    console.error("Error getting employees:", error);
    res.status(500).json({ error: "Error retrieving employees" });
  }
});

app.post("/api/employees", (req, res) => {
  try {
    console.log("Create employee request received:", req.body);
    const employees = JSON.parse(fs.readFileSync(employeesFile, "utf8"));
    const materials = JSON.parse(fs.readFileSync(materialsFile, "utf8"));

    const newEmployee = addCreationDate(req.body);

    if (!newEmployee.name || !newEmployee.department) {
      console.log("Employee name and department are required");
      return res
        .status(400)
        .json({ error: "Name and department are required" });
    }

    newEmployee.id = getNextId(employees);

    if (newEmployee.materials && newEmployee.materials.length > 0) {
      newEmployee.materials.forEach((material) => {
        const materialIndex = materials.findIndex(
          (m) => m.serialNumber === material.serialNumber
        );
        if (materialIndex !== -1) {
          materials[materialIndex].status = "En Utilisation";
          materials[materialIndex].updatedAt = new Date();
        }
      });
    }

    fs.writeFileSync(materialsFile, JSON.stringify(materials, null, 2));

    employees.push(newEmployee);
    fs.writeFileSync(employeesFile, JSON.stringify(employees, null, 2));

    console.log("Employee created successfully:", newEmployee);
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({ error: "Error creating employee" });
  }
});

app.put("/api/employees/:id", (req, res) => {
  try {
    const employeeId = req.params.id;
    const updatedEmployee = req.body;

    const employees = JSON.parse(fs.readFileSync(employeesFile, "utf8"));
    const materials = JSON.parse(fs.readFileSync(materialsFile, "utf8"));

    const employeeIndex = employees.findIndex(
      (e) => String(e.id) === String(employeeId)
    );
    if (employeeIndex === -1) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const currentMaterials = employees[employeeIndex].materials || [];

    currentMaterials.forEach((material) => {
      const materialIndex = materials.findIndex(
        (m) => m.serialNumber === material.serialNumber
      );
      if (materialIndex !== -1) {
        materials[materialIndex].status = "Disponible";
        materials[materialIndex].updatedAt = new Date();
      }
    });

    if (updatedEmployee.materials && updatedEmployee.materials.length > 0) {
      updatedEmployee.materials.forEach((material) => {
        const materialIndex = materials.findIndex(
          (m) => m.serialNumber === material.serialNumber
        );
        if (materialIndex !== -1) {
          materials[materialIndex].status = "En Utilisation";
          materials[materialIndex].updatedAt = new Date();
        }
      });
    }

    employees[employeeIndex] = {
      ...employees[employeeIndex],
      ...updatedEmployee,
      updatedAt: new Date(),
    };

    fs.writeFileSync(materialsFile, JSON.stringify(materials, null, 2));
    fs.writeFileSync(employeesFile, JSON.stringify(employees, null, 2));

    res.json(employees[employeeIndex]);
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ error: "Error updating employee" });
  }
});

app.delete("/api/employees/:id", (req, res) => {
  try {
    const employeeId = req.params.id;
    const employees = JSON.parse(fs.readFileSync(employeesFile, "utf8"));
    const materials = JSON.parse(fs.readFileSync(materialsFile, "utf8"));

    const employeeIndex = employees.findIndex(
      (e) => String(e.id) === String(employeeId)
    );

    if (employeeIndex === -1) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const employeeMaterials = employees[employeeIndex].materials || [];

    employeeMaterials.forEach((material) => {
      const materialIndex = materials.findIndex(
        (m) => m.serialNumber === material.serialNumber
      );
      if (materialIndex !== -1) {
        materials[materialIndex].status = "Disponible";
        materials[materialIndex].updatedAt = new Date();
      }
    });

    employees.splice(employeeIndex, 1);

    fs.writeFileSync(materialsFile, JSON.stringify(materials, null, 2));
    fs.writeFileSync(employeesFile, JSON.stringify(employees, null, 2));

    res.status(204).end();
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ error: "Error deleting employee" });
  }
});

app.listen(3001, () => console.log("Server running on port 3001"));
