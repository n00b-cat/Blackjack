const historytable = document.getElementById("history")

async function history() {

    const res = await fetch("/history", {
        method: "POST",
        body: JSON.stringify({ username: user.Username }),
        headers: {
            "Content-Type": "application/json; charset=UTF-8"
        }
    });

    const result = await res.json();

    console.log(result)

    for (let i = 0; result.length > i; i++) {
        let color = "white"
        if (result[i].Balance > 0) {
            color = "#40a02b"
        }
        else if (result[i].Balance < 0) {
            color = "#d20f39"
        }
        else {
            color = "#df8e1d"
        }
        historytable.innerHTML += "<tr style='background-color:" + color + ";'><td>" + result[i].Result + "</td><td>" + result[i].Balance + "</td><td>" + result[i].Date + "</td></tr>";
        console.log(result[i].Username);
    }
}

history().then

//  Balance int,
//  Result varchar(255),
//  Date datetime DEFAULT current_timestamp(),