document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('https://supreme-xylophone-j646jr764grc5j94-3000.app.github.dev/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
        // Save role to localStorage
        localStorage.setItem('role', data.role);
        localStorage.setItem('username', username); // Optionally save username as well
        
        window.location.href = data.role === 'admin' ? 'admin-dashboard.html' : 'index.html';
    } else {
        document.getElementById('error-message').classList.remove('hidden');
    }
});
