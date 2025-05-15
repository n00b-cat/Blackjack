const textusername = localStorage.getItem("user")

if (!textusername) {
    window.addEventListener("load", () => {
        window.location = "login.html"
    });
}
else {
    document.getElementById("Usernametext").innerHTML += textusername
}

document.getElementById("Logout").addEventListener("click", () => {
    localStorage.clear();
    window.location = "login.html"
});