let simMode = false;
let wireMode = false;
let settingWire = false;
let wireStartElem = null;
let wireCount = 0;
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
        div.setAttribute("Inputs", chip['inputs']);
        div.setAttribute("Outputs", chip['outputs']);
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
        if (!wireMode) element.remove();
    } else {
        if (element.classList.contains("inputON")) {
            element.classList.remove("inputON");
        } else {
            element.classList.add("inputON");
        }
    }
}

function connectWire(elem){
    let board = document.querySelector(".board");
    if (wireStartElem == null && wireMode) {
        let svg;
        if (document.querySelector("svg") == null) svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        else svg = document.querySelector("svg");
        svg.addEventListener("click", (e) => {
            if (settingWire) {
                let wire = document.querySelector("#wire");
                let xVal = e.clientX - board.getBoundingClientRect().left;
                let yVal = e.clientY - board.getBoundingClientRect().top;
                wire.setAttribute("points", wire.getAttribute("points") + " " + xVal + "," + yVal);
            }
        });
        board.appendChild(svg);
        let line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        line.setAttribute("id", "wire");

        let boundingBox = elem.getBoundingClientRect();
        let xVal = (boundingBox.left + boundingBox.width / 2) - board.getBoundingClientRect().left;
        let yVal = (boundingBox.top + boundingBox.height / 2) - board.getBoundingClientRect().top;

        line.setAttribute("points", xVal + "," + yVal);
        line.setAttribute("stroke", "black");
        line.setAttribute("fill", "none");
        svg.appendChild(line);
        settingWire = true;
        wireStartElem = elem;
    }

    if (wireMode && wireStartElem != elem) {
        let wire = document.querySelector("#wire");
        wire.id = "set_wire_" + wireCount;
        wireCount++;
        let boundingBox = elem.getBoundingClientRect();
        let xVal = (boundingBox.left + boundingBox.width / 2) - board.getBoundingClientRect().left;
        let yVal = (boundingBox.top + boundingBox.height / 2) - board.getBoundingClientRect().top;

        wire.setAttribute("points", wire.getAttribute("points") + " " + xVal + "," + yVal);
        wireStartElem = null;
        settingWire = false;
    }
}

document.querySelector(".board").addEventListener("click", (e) => {
    if (e.offsetX < 10 && !simMode && !wireMode) { // Left Side
        let div = document.createElement("div");
        div.classList.add("board-input");
        div.id = document.querySelectorAll(".board-input").length;
        div.style.left = (e.target.getBoundingClientRect().left - 12.5) + "px";
        div.style.top = (e.clientY - 15) + "px";
        div.style.position = "absolute";
        div.addEventListener("click", (e) => toggleInput(e.target));
        div.addEventListener("click", (e) => connectWire(e.target));
        document.querySelector(".wrapper").appendChild(div);
    } else if (e.offsetX - e.target.getBoundingClientRect().width > -15 && !simMode && !wireMode) { // Right Side
        let div = document.createElement("div");
        div.classList.add("board-output");
        div.id = document.querySelectorAll(".board-output").length;
        div.style.left = (e.target.getBoundingClientRect().right - 15) + "px";
        div.style.top = (e.clientY - 15) + "px";
        div.style.position = "absolute";
        div.addEventListener("click", (e) => {if(!simMode && !wireMode) e.target.remove()});
        div.addEventListener("click", (e) => connectWire(e.target));
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
    let width = document.querySelector("#" + id).getBoundingClientRect().width;

    let input = document.createElement("div");
    input.classList.add("chip-input");
    input.style.left = -12.5 + "px";

    let output = document.createElement("div");
    output.classList.add("chip-output");
    output.style.left = (width - 7.5) + "px";

    let elem = document.querySelector("#" + id).cloneNode(true);

    elem.id = id + +new Date();
    elem.style.position = "absolute";
    elem.style.top = e.clientY + "px";
    elem.style.left = e.clientX + "px";
    elem.style.height = height + "px";

    for (let i = 0; i < inputs; i++) {
        let ielem = input.cloneNode(true);
        if (inputs > outputs) ielem.style.top = (25 + 30*i) + "px";
        else ielem.style.top = ((height/2 - (inputs-1)*15) + 30*i) + "px";
        elem.appendChild(ielem);
    }

    for (let i = 0; i < outputs; i++) {
        let oelem = output.cloneNode(true);
        if (outputs > inputs) oelem.style.top = (25 + 30*i) + "px";
        else oelem.style.top = ((height/2 - (outputs-1)*15) + 30*i) + "px";
        elem.appendChild(oelem);
    }

    elem.ondragstart = (e) => {
        e.dataTransfer.setData("ID", e.target.id);
        e.dataTransfer.setData("Inputs", inputs);
        e.dataTransfer.setData("Outputs", outputs);
        e.dataTransfer.setData("MoveChip", true);
    }

    elem.addEventListener("click", (e) => connectWire(e.target));

    document.querySelector(".board").appendChild(elem);
    if (e.dataTransfer.getData("MoveChip")) {
        document.querySelector("#" + id).remove();
    }
}