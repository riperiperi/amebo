var gameboys = [];
var controlsArray = localStorage["gbControls"];
controlsArray = (typeof controlsArray == "undefined")?[]:JSON.parse(controlsArray)

function addGB(gameboyDiv) {
	var gbCanvas = document.createElement("canvas");
	gbCanvas.width = 320;
	gbCanvas.height = 288;
	gbCanvas.className = "gameboy";

	var gbContainer = document.createElement("div");
	gbContainer.style.position = "absolute";

	gbContainer.appendChild(gbCanvas);
	gbContainer.style.width = "320px";
	gbContainer.style.height = "288px";
	gameboyDiv.appendChild(gbContainer);
	gameboys.push(new gb('default.gbc', gbCanvas, {rootDir: "/"}));
	var thisGB = gameboys[gameboys.length-1];
	thisGB.GUI = {};
	thisGB.GUI.container = gbContainer

	var tools = document.createElement("div");;
	tools.style.position = "absolute";
	tools.style.left = "320px";
	tools.style.top = "34px";
	gbContainer.appendChild(tools);
	tools.id = "toolsBar"

	for (var i=0;i<5;i++) {
		var buttonctr = document.createElement("div");
		var button = document.createElement("img");
		buttonctr.style.width = "200px";
		buttonctr.style.height = "40px";
		buttonctr.style.paddingTop = "4px";
		buttonctr.className = "toolsButton"
		buttonctr.onclick = eval("(function() {toolFunctions["+i+"](gameboys["+(gameboys.length-1)+"])})");

		button.src = "images/t"+(i+1)+".png";
		button.style.width = "100px";
		button.style.height = "32px";
		buttonctr.appendChild(button);
		tools.appendChild(buttonctr);
	}

	//add controls menu

	var controls = document.getElementById("controltmp").cloneNode(true); //clone it from the template i made since it's complex
	gbContainer.appendChild(controls);
	controls.style.pointerEvents = "none";
	thisGB.GUI.controls = controls;
	thisGB.GUI.cHide = controls.childNodes[1];
	thisGB.GUI.activeMenu = -1;
	prepareControlsDialogs(thisGB, (gameboys.length-1), controls);

	//add options menu

	var options = document.getElementById("optionstmp").cloneNode(true);
	gbContainer.appendChild(options);
	options.style.pointerEvents = "none";
	thisGB.GUI.optionsM = options;
	thisGB.GUI.oHide = options.childNodes[1];

	//add tools menu

	var tools = document.getElementById("toolstmp").cloneNode(true);
	gbContainer.appendChild(tools);
	tools.style.pointerEvents = "none";
	thisGB.GUI.toolsM = tools;
	thisGB.GUI.tHide = tools.childNodes[1];

	//add file swapper
	var cart = document.getElementById("carttmp").cloneNode(true);
	gbContainer.appendChild(cart);

	var blk = document.getElementById("blkcover").cloneNode(true);
	gbContainer.appendChild(blk);
	thisGB.GUI.blkcover = blk;

	cart.onclick = eval("(function() {cartClicked(gameboys["+(gameboys.length-1)+"])})");
	thisGB.GUI.cart = cart;
	thisGB.GUI.cartS = 0;
	thisGB.GUI.romInput = getChildById("rominput", cart)
	thisGB.GUI.battInput = getChildById("battinput", cart)
	thisGB.GUI.romName = getChildById("romname", cart)
	thisGB.GUI.battName = getChildById("batteryname", cart)
	getChildById("romBut", cart).onclick = eval("(function() {gameboys["+(gameboys.length-1)+"].GUI.romInput.click();})");
	getChildById("battBut", cart).onclick = eval("(function() {gameboys["+(gameboys.length-1)+"].GUI.battInput.click();})");
	thisGB.GUI.romInput.onchange = eval("(function() {fileInHandler(gameboys["+(gameboys.length-1)+"], 'rom')})");
	thisGB.GUI.battInput.onchange = eval("(function() {fileInHandler(gameboys["+(gameboys.length-1)+"], 'batt')})");
	getChildById("cartCancel", cart).onclick = eval("(function() {processCartDialog(gameboys["+(gameboys.length-1)+"], false)})");
	getChildById("cartLoad", cart).onclick = eval("(function() {processCartDialog(gameboys["+(gameboys.length-1)+"], true)})");

	thisGB.GUI.zoom = 2;
	return thisGB;
}

function setZoom(gb) {
	var zoom = gb.GUI.zoom/2;
	var tran = "scale("+zoom+", "+zoom+")";
	var elem = gb.GUI.container.style;
	elem.webkitTransform = tran;
	elem.MozTransform = tran;
	elem.oTransform = tran;
	elem.msTransform = tran;
	elem.transform = tran;
	if (typeof gb.ctx.webkitImageSmoothingEnabled != "undefined") {
		gb.canvas.width = 320*zoom;
		gb.canvas.height = 288*zoom;
		gb.ctx.webkitImageSmoothingEnabled = false;
	} else if (typeof gb.ctx.imageSmoothingEnabled != "undefined") {
		gb.canvas.width = 320*zoom;
		gb.canvas.height = 288*zoom;
		gb.ctx.imageSmoothingEnabled = false;
	}
	//elem.marginLeft = (-160)*zoom;
	//elem.marginTop = (-144)*zoom;

}

function fileInHandler(gb, ftype) {
	
	if (ftype == "rom") {
		var filename = gb.GUI.romInput.value.split("\\").pop();
		if (filename == "") filename = "No File Selected"
		gb.GUI.romName.innerHTML = filename;
	} else {
		var filename = gb.GUI.battInput.value.split("\\").pop();
		if (filename == "") filename = "Last Saved Battery"
		gb.GUI.battName.innerHTML = filename;
	}
}

function getChildById(id, element) {
	for (var i=0; i<element.childNodes.length; i++) {
		if (element.childNodes[i].id==id) {return element.childNodes[i];}
	}
}

function cartClicked(gb) {
	if (gb.GUI.cartS == 0) {
		gb.GUI.cart.className = "cartCtr cartShow"
		gb.GUI.blkcover.style.opacity = 0.66;
		gb.GUI.blkcover.style.pointerEvents = "auto";
		setTimeout(function() {gb.GUI.cart.style.zIndex = 3;}, 333)
		gb.GUI.cartS = 1;
	}
}

function processCartDialog(gb, load) {
	if (gb.GUI.cartS != 1) return;
	if (load) {
		if (gb.GUI.romName.innerHTML == "No File Selected") {
			alert("No ROM File Selected!")
			return;
		}

		gb.GUI.readCount = 0;
		if (gb.GUI.battName.innerHTML == "Last Saved Battery") {
			gb.GUI.readTotal = 1;
			gb.GUI.battery = null;
		} else {
			gb.GUI.readTotal = 2;
			var bFile = gb.GUI.battInput.files[0];
			var bReader = new FileReader();
			bReader.gb = gb;
			bReader.onload = function(e) {
				var gb = e.target.gb;
				if (++gb.GUI.readCount == gb.GUI.readTotal) e.target.gb.loadROMBuffer(gb.GUI.rom, e.target.result);
				else gb.GUI.battery = e.target.result;
			};
			bReader.readAsArrayBuffer(bFile);
		}

		var file = gb.GUI.romInput.files[0];
		var reader = new FileReader();
		reader.gb = gb;
		reader.onload = function(e) {
			var gb = e.target.gb;
			if (++gb.GUI.readCount == gb.GUI.readTotal) e.target.gb.loadROMBuffer(e.target.result, gb.GUI.battery);
			else gb.GUI.rom = e.target.result
		};
		reader.readAsArrayBuffer(file);
	}
	gb.GUI.cartS = 2;
	setTimeout(function() { //reset dialog
		gb.GUI.cartS = 0;
		gb.GUI.romName.innerHTML == "No File Selected"
		gb.GUI.battName.innerHTML == "Last Saved Battery"
	}, 666)
	setTimeout(function() {gb.GUI.cart.style.zIndex = 0;}, 200)
	gb.GUI.blkcover.style.opacity = 0;
	gb.GUI.blkcover.style.pointerEvents = "none";
	gb.GUI.cart.className = "cartCtr cartHide cartHA"
}

numberToControl = [
	"UP",
	"LEFT",
	"DOWN",
	"RIGHT",
	"B",
	"A",
	"START",
	"SELECT"
]


function prepareControlsDialogs(gb, num, controls) {
	if (typeof controlsArray[num] == "undefined") {
		controlsArray[num] = {
	 		A: [88, "X"],
			B: [90, "Z"],
			SELECT: [32, "space"],
			START: [13, "enter"],
			UP: [38, "up arrow"],
			DOWN: [40, "down arrow"],
			LEFT: [37, "left arrow"],
			RIGHT: [39, "right arrow"]
		}
		localStorage["gbControls"] = JSON.stringify(controlsArray);
	}
	gb.GUI.ctrTxt = [];
	gb.GUI.ctrSel = [];
	for (var i=0;i<8;i++) {
		var text = getChildById(i+"t", gb.GUI.cHide)
		text.innerHTML = controlsArray[num][numberToControl[i]][1]
		gb.keyConfig[numberToControl[i]] = controlsArray[num][numberToControl[i]][0];
		var sel = getChildById(i+"s", gb.GUI.cHide)
		sel.onclick = eval("(function() {controlSet("+i+", gameboys["+(gameboys.length-1)+"])})");
		gb.GUI.ctrTxt.push(text);
		gb.GUI.ctrSel.push(sel);
	}
	gb.GUI.selCont = -1;

}

function controlSet(num, gb) {
	if (gb.GUI.selCont == -1) {
		gb.GUI.selCont = num
		gb.GUI.ctrSel[num].style.opacity = 1;
	}
}

function fitGB() {
	height = document.body.clientHeight;
	var ratio = Math.max(1, Math.floor(height/(144+35*2)));
	for (var i=0; i<gameboys.length; i++) {
		gameboys[i].GUI.zoom = ratio;
		setZoom(gameboys[i]);
	}
}

document.addEventListener("keydown", controlChoose, false);
window.addEventListener("resize", fitGB, false);

function controlChoose(evt) {
	for (var i=0; i<gameboys.length; i++) {
		var gui = gameboys[i].GUI
		if (gui.selCont != -1) {
			evt.preventDefault();
			if (evt.keyCode != 27) {
				var entry = controlsArray[i][numberToControl[gui.selCont]]
				entry[0] = evt.keyCode
				entry[1] = (keyNames[evt.keyCode])?keyNames[evt.keyCode]:String.fromCharCode(evt.keyCode);
				gameboys[i].keyConfig[numberToControl[gui.selCont]] = evt.keyCode;
				gui.ctrTxt[gui.selCont].innerHTML = entry[1];
				localStorage["gbControls"] = JSON.stringify(controlsArray);
			}
			gui.ctrSel[gui.selCont].style.opacity = 0;
			gui.selCont = -1;
		}
	}
}

var keyNames = 
{
	8: "backspace", 9: "tab", 13: "enter", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause/break", 20: "caps lock", 
	27: "escape", 32: "space", 33: "page up", 34: "page down", 35: "end", 36: "home", 37: "left arrow", 38: "up arrow", 
	39: "right arrow", 40: "down arrow", 45: "insert", 46: "delete", 91: "windows left", 92: "windows right", 
	93: "select", 96: "numpad 0", 97: "numpad 1", 98: "numpad 2", 99: "numpad 3", 100: "numpad 4", 101: "numpad 5", 
	102: "numpad 6", 103: "numpad 7", 104: "numpad 8", 105: "numpad 9", 106: "multiply", 107: "add", 109: "subtract", 
	110: "decimal point", 111: "divide", 112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 
	119: "f8", 120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "num lock", 145: "scroll lock",
}

var toolFunctions = new Array(5);

toolFunctions[0] = function(gb) {
	gb.paused = !(gb.paused)
	if (gb.paused) gb.canvas.className = "gameboy paused";
	else gb.canvas.className = "gameboy";
}

toolFunctions[1] = function(gb) {
	gb.reset(false); //reset without reloading battery
}

toolFunctions[2] = function(gb) {
	if (gb.GUI.activeMenu == 1) {
		gb.GUI.activeMenu = -1;
		gb.GUI.oHide.style.left = "320px";
		gb.GUI.optionsM.style.pointerEvents = "none";
	} else {
		gb.GUI.activeMenu = 1;
		gb.GUI.oHide.style.left = 0;
		gb.GUI.optionsM.style.pointerEvents = "auto";
		gb.GUI.cHide.style.left = "320px";
		gb.GUI.controls.style.pointerEvents = "none";
		gb.GUI.tHide.style.left = "320px";
		gb.GUI.toolsM.style.pointerEvents = "none";
	}
}

toolFunctions[3] = function(gb) { //
	if (gb.GUI.activeMenu == 2) {
		gb.GUI.activeMenu = -1;
		gb.GUI.cHide.style.left = "320px";
		gb.GUI.controls.style.pointerEvents = "none";
	} else {
		gb.GUI.activeMenu = 2;
		gb.GUI.cHide.style.left = 0;
		gb.GUI.controls.style.pointerEvents = "auto";
		gb.GUI.oHide.style.left = "320px";
		gb.GUI.optionsM.style.pointerEvents = "none";
		gb.GUI.tHide.style.left = "320px";
		gb.GUI.toolsM.style.pointerEvents = "none";
	}
}

toolFunctions[4] = function(gb) {
	if (gb.GUI.activeMenu == 3) {
		gb.GUI.activeMenu = -1;
		gb.GUI.tHide.style.left = "320px";
		gb.GUI.toolsM.style.pointerEvents = "none";
	} else {
		gb.GUI.activeMenu = 3;
		gb.GUI.tHide.style.left = 0;
		gb.GUI.toolsM.style.pointerEvents = "auto";
		gb.GUI.cHide.style.left = "320px";
		gb.GUI.controls.style.pointerEvents = "none";
		gb.GUI.oHide.style.left = "320px";
		gb.GUI.optionsM.style.pointerEvents = "none";
	}
}
