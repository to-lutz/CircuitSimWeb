let simMode = false;
let wireMode = false;
let settingWire = false;
let wireStartElem = null;
let wireCount = 0;
let curInputID = 0;
let curOutputID = 0;

let maxItrSim = 10; // Iteration cap for the sim

const enabledColor = "#c91c10";
const enabledSVG = "%23c91c10";
const disabledColor = "#000";
const disabledSVG = "black";

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
        div.id = chip['name'] + "_chip_" + chip['id'];
        div.innerHTML = chip['name'];
        div.style.backgroundColor = chip['bgColor'];
        div.draggable = "true";
        div.setAttribute("Inputs", chip['inputs']);
        div.setAttribute("Outputs", chip['outputs']);
        div.ondragstart = (e) => {
            e.dataTransfer.setData("ID", e.target.id);
            e.dataTransfer.setData("Inputs", chip['inputs']);
            e.dataTransfer.setData("Outputs", chip['outputs']);
            e.dataTransfer.setData("Chip", chip['name']);
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
            element.setAttribute("enabled", false);
        } else {
            element.classList.add("inputON");
            element.setAttribute("enabled", true)
        }
        updateSimulation();
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
        wire.classList.add("set_wire");
        wire.setAttribute("fromID", wireStartElem.id);
        wire.setAttribute("toID", elem.id);
        wireCount++;

        wireStartElem.setAttribute("wire", wire.id);

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
        div.id = "input_" + curInputID;
        curInputID++;
        div.style.left = (e.target.getBoundingClientRect().left - 12.5) + "px";
        div.style.top = (e.clientY - 15) + "px";
        div.style.position = "absolute";
        div.addEventListener("click", (e) => toggleInput(e.target));
        div.addEventListener("click", (e) => connectWire(e.target));
        document.querySelector(".wrapper").appendChild(div);
    } else if (e.offsetX - e.target.getBoundingClientRect().width > -15 && !simMode && !wireMode) { // Right Side
        let div = document.createElement("div");
        div.classList.add("board-output");
        div.id = "output_" + curOutputID;
        curOutputID++;
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
        updateSimulation();
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
    let chiptype = e.dataTransfer.getData("Chip");

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
    elem.style.top = (e.clientY - height/2) + "px";
    elem.style.left = e.clientX + "px";
    elem.style.height = height + "px";
    if (!e.dataTransfer.getData("MoveChip")) {
        for (let i = 0; i < inputs; i++) {
            let ielem = input.cloneNode(true);
            if (inputs > outputs) ielem.style.top = (25 + 30*i) + "px";
            else ielem.style.top = ((height/2 - (inputs-1)*15) + 30*i) + "px";
            ielem.id = "input_" + curInputID;
            curInputID++;
            ielem.setAttribute("Chip", chiptype);
            elem.appendChild(ielem);
        }

        for (let i = 0; i < outputs; i++) {
            let oelem = output.cloneNode(true);
            if (outputs > inputs) oelem.style.top = (25 + 30*i) + "px";
            else oelem.style.top = ((height/2 - (outputs-1)*15) + 30*i) + "px";
            oelem.id = "output_" + curOutputID;
            curOutputID++;
            oelem.setAttribute("Chip", chiptype);
            elem.appendChild(oelem);
        }
    }

    elem.ondragstart = (e) => {
        e.dataTransfer.setData("ID", e.target.id);
        e.dataTransfer.setData("Inputs", inputs);
        e.dataTransfer.setData("Outputs", outputs);
        e.dataTransfer.setData("MoveChip", true);
        e.dataTransfer.setData("Chip", chiptype);
    }

    elem.addEventListener("click", (e) => connectWire(e.target));

    document.querySelector(".board").appendChild(elem);
    if (e.dataTransfer.getData("MoveChip")) {
        document.querySelector("#" + id).remove();
    }
}

function updateSimulation() {
    // Start from Board Inputs
    let b_inputs = document.querySelectorAll(".board-input");
    for (let inp of b_inputs) {
        let curElem = inp;
        let wire = document.getElementById(curElem.getAttribute("wire"));
        let nextElem = document.getElementById(wire.getAttribute("toID"));
        for (let i = 0; i < maxItrSim; i++) {
            wire = document.getElementById(curElem.getAttribute("wire"));
            nextElem = document.getElementById(wire.getAttribute("toID"));
            let fromEnabled = curElem.getAttribute("enabled") == "true";

            if (curElem.getAttribute("Chip") == null) curElem = nextElem;
            if (curElem.getAttribute("Chip") == "NOT") {
                for (let child of nextElem.parentElement.children) {
                    if (child.id.startsWith("output")) {
                        child.setAttribute("enabled", !fromEnabled);
                        child.style.backgroundColor = !fromEnabled ? enabledColor : disabledColor;
                        curElem = child;
                    }
                }
            }

            // Color wires & to
            wire.style.stroke = fromEnabled ? enabledColor : disabledColor;
            nextElem.style.backgroundColor = fromEnabled ? enabledColor : disabledColor;
            nextElem.setAttribute("enabled", fromEnabled);

            if (nextElem.classList.contains("board-output")) break;
        }
    }
}