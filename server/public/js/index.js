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
    if (element.classList.contains("inputON")) {
        element.classList.remove("inputON");
    } else {
        element.classList.add("inputON");
    }
}

document.querySelector(".board").addEventListener("click", (e) => {
    if (e.offsetX < 10) {
        let div = document.createElement("div");
        div.classList.add("board-input");
        div.id = document.querySelectorAll(".board-input").length;
        div.style.left = (e.target.getBoundingClientRect().left - 12.5) + "px";
        div.style.top = e.clientY + "px";
        div.style.position = "absolute";
        div.addEventListener("click", (e) => toggleInput(e.target));
        document.querySelector(".wrapper").appendChild(div);
    }
});