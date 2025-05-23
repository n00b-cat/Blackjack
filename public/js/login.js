async function OnLogin(e) {
    e.preventDefault();

    const data = {
        username: e.target.username.value,
        password: e.target.password.value
    };

    const res = await fetch("/login", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json; charset=UTF-8"
        }
    });

    const result = await res.json();
    if (result.success) {
        setUser(result.user);
        window.location = "/"
    }
    else {
        document.getElementById("LoginMsg").innerHTML = result.message
    }
}

async function OnSignup(e) {
    e.preventDefault();

    const data = {
        username: e.target.username.value,
        password: e.target.password.value,
        password2: e.target.password2.value
    };

    const res = await fetch("/signup", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json; charset=UTF-8"
        }
    });

    const result = await res.json();
    if (result.success) {
        setUser(result.user);
        window.location = "/"
    }
    else {
        document.getElementById("SingupMsg").innerHTML = result.message
    }
}

