function getUser() {
    let user = localStorage.getItem("user");
    return user
        ? JSON.parse(user)
        : null;
}

function setUser(user) {
    localStorage.setItem("user", JSON.stringify(user));
}

const user = getUser()

if (window.location.pathname == "/signup.html" || window.location.pathname == "/login.html") {
    if (user) {
        window.addEventListener("load", () => {
            window.location = "/"
        });
    }
}
else {
    if (!user) {
        window.addEventListener("load", () => {
            window.location = "/login.html"
        });
    }
    else {
        document.getElementById("Usernametext").innerHTML += user.Username

        document.getElementById("Logout").addEventListener("click", () => {
            localStorage.clear();
            window.location = "login.html"
        });
    }
}
