document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const res = await fetch('http://localhost:3000/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Login fehlgeschlagen');

        // decode JWT
        const decoded = jwt_decode(data.token);

        // save jwt and user data
        localStorage.setItem('jwtToken', data.token);
        localStorage.setItem('userId', decoded.id);
        localStorage.setItem('userName', decoded.userName);
        localStorage.setItem('userRole', decoded.role); // <<< wichtig für Admin-Check

        alert("Erfolgreich eingeloggt!");
        location.href = "index.html"; // forwarding
    } catch (err) {
        alert("Fehler: " + err.message);
    }
});

document.getElementById("registerForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    try {
        const res = await fetch('http://localhost:3000/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Registrierung fehlgeschlagen');

        alert("Erfolgreich registriert! Bitte einloggen.");
    } catch (err) {
        alert("Fehler: " + err.message);
    }
});
