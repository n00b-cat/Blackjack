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
        window.location = "/"
    }
}
else {
    if (!user) {
        window.location = "/login.html"
    }
    else {
        const dropBtn = document.getElementById("userDropdownBtn")
        const menu = document.getElementById('userDropdownMenu');

        dropBtn.innerHTML = '<div class="flex"><div>' + user.Username + '</div><img src="Icons/arrow_drop_down.svg"></div>'

        dropBtn.addEventListener("click", () => {
            const isOpen = menu.style.display === 'block';

            menu.style.display = isOpen ? 'none' : 'block';
            dropBtn.querySelector("div").querySelector("img").src = isOpen
                ? "Icons/arrow_drop_down.svg"
                : "Icons/arrow_drop_up.svg";
        });

        document.getElementById("Logout").addEventListener("click", () => {
            localStorage.clear();
            window.location = "login.html"
        });
    }
}
