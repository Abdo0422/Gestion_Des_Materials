document
  .getElementById("login-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("https://7vsxlx-3001.csb.app/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", username);
      localStorage.setItem("isAuthenticated", "true");

      if (data.role === "admin") {
        localStorage.setItem("isAdmin", "true");
        window.location.href = "admin-dashboard.html";
      } else {
        localStorage.removeItem("isAdmin");
        window.location.href = "index.html";
      }
    } else {
      document.getElementById("error-message").classList.remove("hidden");
    }
  });
