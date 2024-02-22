let simMode = false;
// Fetch basic chips from API
let chips;
async function loadChips() {
    await fetch("/api/chips")
    .then((res) => res.json())
    .then((data) => chips=data);
    loadChipsToDom()
}

function loadChipsToDom() {
    for (let chip of chips) {
        let div = document.createElement("div");
        div.classList.add("chips-item");
        div.id = chip['id'];
        div.innerHTML = chip['name'];
        div.style.backgroundColor = chip['bgColor'];
        document.querySelector(".chips-wrapper").appendChild(div);
    }
    $(".chips-item").draggable({
        "scroll": false,
        "containment": ".wrapper"
    })
}

loadChips();

function toggleInput(element) {
    if (!simMode) {
        element.remove();
    } else {
        if (element.classList.contains("inputON")) {
            element.classList.remove("inputON");
        } else {
            element.classList.add("inputON");
        }
    }
}

document.querySelector(".board").addEventListener("click", (e) => {
    if (e.offsetX < 10) { // Left Side
        let div = document.createElement("div");
        div.classList.add("board-input");
        div.id = document.querySelectorAll(".board-input").length;
        div.style.left = (e.target.getBoundingClientRect().left - 12.5) + "px";
        div.style.top = e.clientY + "px";
        div.style.position = "absolute";
        div.addEventListener("click", (e) => toggleInput(e.target));
        document.querySelector(".wrapper").appendChild(div);
    } else if (e.offsetX - e.target.getBoundingClientRect().width > -15) { // Right Side
        let div = document.createElement("div");
        div.classList.add("board-output");
        div.id = document.querySelectorAll(".board-output").length;
        div.style.left = (e.target.getBoundingClientRect().width + 20) + "px";
        div.style.top = e.clientY + "px";
        div.style.position = "absolute";
        document.querySelector(".wrapper").appendChild(div);
    }
});

document.querySelector(".simulation-mode").addEventListener("click", (e) => {
    if (e.target.classList.contains("fa-play")) {
        e.target.classList.remove("fa-play");
        e.target.classList.add("fa-stop");
        simMode = true;
    } else {
        e.target.classList.remove("fa-stop");
        e.target.classList.add("fa-play");
        simMode = false;
    }
});