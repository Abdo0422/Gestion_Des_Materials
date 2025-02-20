const fs = require('fs');
const express = require('express');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');


const app = express();
app.use(express.json({ limit: '10mb' }));  
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

const usersFile = './data/users.json';
const employeesFile = './data/employees.json';
const materialsFile = './data/materials.json';
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });
app.use('/backend/images', express.static(path.join(__dirname, 'images')));

function addCreationDate(data) {
    return { ...data, createdAt: new Date() };
}

function generateId() { 
    return Math.random().toString(36).substring(2, 15);
}

function countEmployees() {
    try {
        const employees = JSON.parse(fs.readFileSync(employeesFile, 'utf8'));
        return employees.length;
    } catch (error) {
        console.error("Error reading employees file:", error);
        return 0; // Return 0 if there's an error
    }
}

function countMaterialsByName(searchTerm) {
    try {
        const materials = JSON.parse(fs.readFileSync(materialsFile, 'utf8'));
        const lowerSearchTerm = searchTerm.toLowerCase();

        const count = materials.filter(material => {
            const lowerMaterialName = material.name.toLowerCase();
            return lowerMaterialName.includes(lowerSearchTerm); // Fuzzy search
            // Or use a more sophisticated fuzzy search library if needed.
        }).length;

        return count;

    } catch (error) {
        console.error("Error reading materials file:", error);
        return 0;
    }
}


app.get('/api/counts', (req, res) => {
    const numEmployees = countEmployees();
    const numImprimantes = countMaterialsByName('imprimante'); 
    const numPCs = countMaterialsByName('pc'); 
    const numEcrans = countMaterialsByName('ecran'); 

    res.json({
        numEmployees: numEmployees,
        numImprimantes: numImprimantes,
        numPCs: numPCs,
        numEcrans: numEcrans
    });
});

// ✅ Login Route (No token authentication)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    console.log("Login request received for username:", username);
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));

    const user = users.find(u => u.username === username);
    if (!user) {
        console.log("User not found");
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
            console.error("Error comparing passwords:", err);
            return res.status(500).json({ error: 'Error comparing passwords' });
        }

        if (!isMatch) {
            console.log("Password mismatch");
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log("Login successful for user:", username);
        res.json({ message: 'Login successful', role: user.role });
    });
});

// ✅ Get All Users (No authentication)
app.get('/api/users', (req, res) => {
    console.log("Get all users request received");
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    res.json(users);
});

// ✅ Create Manager (No authentication)
app.post('/api/users', async (req, res) => {
    const { username, password } = req.body;
    console.log("Create manager request received with username:", username);
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));

    if (users.some(user => user.username === username)) {
        console.log("User already exists");
        return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { 
        username, 
        password: hashedPassword, 
        role: 'manager',
        createdAt: new Date() // Add creation date here
    };

    users.push(newUser);
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    console.log("Manager created successfully for username:", username);
    res.json({ message: 'Manager created successfully' });
});

// CRUD for Materials
app.get('/api/materials', (req, res) => {
    try {
        console.log("Get all materials request received");
        const materials = JSON.parse(fs.readFileSync(materialsFile, 'utf8'));
        res.json(materials);
    } catch (error) {
        console.error("Error getting materials:", error);
        res.status(500).json({ error: "Error retrieving materials" });
    }
});

app.get('/api/materials/:id', (req, res) => {  
    try {
        const materialId = req.params.id;
        const materials = JSON.parse(fs.readFileSync(materialsFile, 'utf8'));
        const material = materials.find(m => m.id === parseInt(materialId)); 

        if (!material) {
            return res.status(404).json({ error: "Material not found" });
        }

        res.json(material);
    } catch (error) {
        console.error("Error getting materials:", error);
        res.status(500).json({ error: "Error retrieving material" });
    }
});

app.post('/api/materials', upload.single('image'), (req, res) => {
    try {
        console.log("Create material request received:", req.body);

        const materials = JSON.parse(fs.readFileSync(materialsFile, 'utf8'));
        const newMaterial = addCreationDate(req.body); // Add creation date


        if (!newMaterial.name) {
            console.log("Material name is required");
            return res.status(400).json({ error: "Name is required" });
        }

        if (req.file) {
            newMaterial.image = `images/${req.file.filename}`;
        }

        newMaterial.id = generateId();
        materials.push(newMaterial);
        fs.writeFileSync(materialsFile, JSON.stringify(materials, null, 2));
        console.log("Material created successfully:", newMaterial);

        res.status(201).json(newMaterial);
    } catch (error) {
        console.error("Error creating material:", error);
        res.status(500).json({ error: "Error creating material" });
    }
});

app.put('/api/materials/:id', upload.single('image'), (req, res) => {
    try {
        const materialId = req.params.id;
        const updatedMaterial = req.body;

        console.log("Received update for material ID:", materialId);
        console.log("Updated material:", updatedMaterial);

        const materials = JSON.parse(fs.readFileSync(materialsFile, 'utf8'));
        const index = materials.findIndex(m => String(m.id) === String(materialId));

        if (index === -1) {
            console.log("Material not found");
            return res.status(404).json({ error: "Material not found" });
        }

        if (req.file) {
            updatedMaterial.image = `images/${req.file.filename}`;
        }

        materials[index] = { ...materials[index], ...updatedMaterial, updatedAt: new Date() }; // Add/update date
        fs.writeFileSync(materialsFile, JSON.stringify(materials, null, 2));
        console.log("Material updated:", materials[index]);

        res.json(materials[index]);
    } catch (error) {
        console.error("Error updating material:", error);
        res.status(500).json({ error: "Error updating material" });
    }
});

app.delete('/api/materials/:id', (req, res) => {
    try {
        const materialId = req.params.id;
        console.log("Delete request received for material ID:", materialId);

        const materials = JSON.parse(fs.readFileSync(materialsFile, 'utf8'));
        const index = materials.findIndex(m => m.id === materialId);

        if (index === -1) {
            console.log("Material not found");
            return res.status(404).json({ error: "Material not found" });
        }

        materials.splice(index, 1);
        fs.writeFileSync(materialsFile, JSON.stringify(materials, null, 2));
        console.log("Material deleted successfully");

        res.status(204).end();
    } catch (error) {
        console.error("Error deleting material:", error);
        res.status(500).json({ error: "Error deleting material" });
    }
});

// CRUD for Employees
app.get('/api/employees', (req, res) => {
    try {
        console.log("Get all employees request received");
        const employees = JSON.parse(fs.readFileSync(employeesFile, 'utf8'));
        res.json(employees);
    } catch (error) {
        console.error("Error getting employees:", error);
        res.status(500).json({ error: "Error retrieving employees" });
    }
});

app.post('/api/employees', (req, res) => {
    try {
        console.log("Create employee request received:", req.body);
        const employees = JSON.parse(fs.readFileSync(employeesFile, 'utf8'));
        const newEmployee = addCreationDate(req.body); // Add creation date

        if (!newEmployee.name || !newEmployee.department) {
            console.log("Employee name and department are required");
            return res.status(400).json({ error: "Name and department are required" });
        }

        newEmployee.id = generateId();
        employees.push(newEmployee);
        fs.writeFileSync(employeesFile, JSON.stringify(employees, null, 2));
        console.log("Employee created successfully:", newEmployee);
        res.status(201).json(newEmployee);
    } catch (error) {
        console.error("Error creating employee:", error);
        res.status(500).json({ error: "Error creating employee" });
    }
});

app.put('/api/employees/:id', (req, res) => {
    try {
        const employeeId = req.params.id;
        const updatedEmployee = req.body;

        console.log("Received update for employee ID:", employeeId);
        console.log("Updated employee:", updatedEmployee);

        const employees = JSON.parse(fs.readFileSync(employeesFile, 'utf8'));
        const index = employees.findIndex(e => e.id === parseInt(employeeId));
        console.log("Index found:", index); 
        if (index === -1) {
            console.log("Employee not found");
            return res.status(404).json({ error: "Employee not found" });
        }

        employees[index] = { ...employees[index], ...updatedEmployee, updatedAt: new Date() }; // Add/Update date
        fs.writeFileSync(employeesFile, JSON.stringify(employees, null, 2));
        console.log("Employee updated:", employees[index]);

        res.json(employees[index]);
    } catch (error) {
        console.error("Error updating employee:", error);
        res.status(500).json({ error: "Error updating employee" });
    }
});

app.delete('/api/employees/:id', (req, res) => {
    try {
        const employeeId = req.params.id;
        console.log("Delete request received for employee ID:", employeeId);

        const employees = JSON.parse(fs.readFileSync(employeesFile, 'utf8'));
        const index = employees.findIndex(e => e.id === employeeId);

        if (index === -1) {
            console.log("Employee not found");
            return res.status(404).json({ error: "Employee not found" });
        }

        employees.splice(index, 1);
        fs.writeFileSync(employeesFile, JSON.stringify(employees, null, 2));
        console.log("Employee deleted successfully");

        res.status(204).end();
    } catch (error) {
        console.error("Error deleting employee:", error);
        res.status(500).json({ error: "Error deleting employee" });
    }
});


app.listen(3000, () => console.log('Server running on port 3000'));
