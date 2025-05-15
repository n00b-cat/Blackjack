const username = localStorage.getItem("user")
if (!username) {
    window.addEventListener("load", () => {
        window.location = "login.html"
    });
}

console.log(localStorage.getItem("user"))
const leaderboardtable = document.getElementById("Leaderboard")

async function leaderboard() {

    const res = await fetch("/leaderboard");

    const result = await res.json();

    for (let i = 0; result.length > i; i++) {
        leaderboardtable.innerHTML +="<tr><td>" + result[i].Username + "</td><td>" + result[i].Chips + "</td></tr>";
        console.log(result[i].Username);
    }
}

leaderboard().then