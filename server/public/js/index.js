let simMode = false;
let wireMode = false;
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
        div.id = "chip_" + chip['id'];
        div.innerHTML = chip['name'];
        div.style.backgroundColor = chip['bgColor'];
        div.draggable = "true";
        div.ondragstart = (e) => {
            e.dataTransfer.setData("ID", e.target.id);
            e.dataTransfer.setData("Inputs", chip['inputs']);
            e.dataTransfer.setData("Outputs", chip['outputs']);
        }
        document.querySelector(".chips-wrapper").appendChild(div);
    }
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
    if (e.offsetX < 10 && !simMode) { // Left Side
        let div = document.createElement("div");
        div.classList.add("board-input");
        div.id = document.querySelectorAll(".board-input").length;
        div.style.left = (e.target.getBoundingClientRect().left - 12.5) + "px";
        div.style.top = e.clientY + "px";
        div.style.position = "absolute";
        div.addEventListener("click", (e) => toggleInput(e.target));
        document.querySelector(".wrapper").appendChild(div);
    } else if (e.offsetX - e.target.getBoundingClientRect().width > -15 && !simMode) { // Right Side
        let div = document.createElement("div");
        div.classList.add("board-output");
        div.id = document.querySelectorAll(".board-output").length;
        div.style.left = (e.target.getBoundingClientRect().right - 15) + "px";
        div.style.top = e.clientY + "px";
        div.style.position = "absolute";
        div.addEventListener("click", (e) => {if(!simMode) e.target.remove()});
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

document.querySelector(".wire-mode").addEventListener("click", (e) => {
    if (e.target.classList.contains("fa-grip-lines")) {
        e.target.classList.remove("fa-grip-lines");
        e.target.classList.add("fa-x");
        wireMode = true;
    } else {
        e.target.classList.remove("fa-x");
        e.target.classList.add("fa-grip-lines");
        wireMode = false;
    }
});

function allowDropChip(e) {
    e.preventDefault();
}

function dropChip(e) {
    let id = e.dataTransfer.getData("ID");
    let inputs = e.dataTransfer.getData("Inputs");
    let outputs = e.dataTransfer.getData("Outputs");

    let height = (10 + Math.max(inputs, outputs) * 30 + 10);

    let input = document.createElement("div");
    input.classList.add("chip-input");
    input.style.left = -12.5 + "px";

    let elem = document.querySelector("#" + id).cloneNode(true);

    elem.id = id + +new Date();
    elem.style.position = "absolute";
    elem.style.top = e.clientY + "px";
    elem.style.left = e.clientX + "px";
    elem.style.height = height + "px";

    for (let i = 0; i < inputs; i++) {
        let ielem = input.cloneNode(true);
        ielem.style.top = (25 + 30*i) + "px";
        elem.appendChild(ielem);
    }

    document.querySelector(".board").appendChild(elem);
}