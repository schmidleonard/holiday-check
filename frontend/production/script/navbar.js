document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");

  const token = localStorage.getItem("jwtToken");

  if (token && loginBtn) {
    // show logout
    loginBtn.textContent = "Logout";
    loginBtn.classList.remove("btn-outline-success");
    loginBtn.classList.add("btn-outline-danger");
    loginBtn.href = "#";
    loginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      alert("Du wurdest ausgeloggt.");
      location.reload(); // reload
    });
  } else if (loginBtn) {
    // show login
    loginBtn.textContent = "Login";
    loginBtn.href = "login.html";
  }
});

const userName = localStorage.getItem("userName");
if (userName) {
  document.getElementById("navUser").textContent = `👤 ${userName}`;
}
