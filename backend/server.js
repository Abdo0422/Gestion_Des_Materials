const fs = require('fs');
const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const usersFile = './data/users.json';
const employeesFile = './data/employees.json';
const materialsFile = './data/materials.json';

// ✅ Login Route (No token authentication)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));

    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare entered password with hashed password
    bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
            return res.status(500).json({ error: 'Error comparing passwords' });
        }

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.json({ message: 'Login successful', role: user.role });
    });
});




// ✅ Get All Users (No authentication)
app.get('/api/users', (req, res) => {
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    res.json(users);
});

// ✅ Create Manager (No authentication)
app.post('/api/users', async (req, res) => {
    const { username, password } = req.body;
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));

    if (users.some(user => user.username === username)) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword, role: 'manager' });
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    res.json({ message: 'Manager created successfully' });
});

// ✅ CRUD for Materials (No authentication)
app.get('/api/materials', (req, res) => {
    const materials = JSON.parse(fs.readFileSync(materialsFile, 'utf8'));
    res.json(materials);
});

// ✅ Get Employees (No authentication)
app.get('/api/employees', (req, res) => {
    const employees = JSON.parse(fs.readFileSync(employeesFile, 'utf8'));
    res.json(employees);
});

app.listen(3000, () => console.log('Server running on port 3000'));
