

var prescriptionSelection = document.createElement("select");

var oralPrescriptionSelection = document.createElement("select");
var oralDosageText = document.createElement("input");

var oralTableDiv = document.querySelector("#oralTable");
var depotTableDiv = document.querySelector("#depotTable");

var oralTable = document.createElement("table");
var depotTable = document.createElement("table");

var oralTimingSelection = document.createElement("select");
var timingsSelection = document.createElement("select");
var dosageText = document.createElement("input");

for (let i = 0; i < oralNames.length; ++i)
{
	let oral = oralNames[i];
	oralPrescriptionSelection.options.add(new Option(oral));
}

for (let i = 0; i < depotNames.length; i++)
{
	let depot = depotNames[i];
	prescriptionSelection.options.add(new Option(depot));
}

for (let i = 0; i < timings.length; ++i)
{
	let timing = timings[i];
	timingsSelection.options.add(new Option(timing));
}

// oral dosing timings
for (let i = 0; i < oralTimings.length; ++i)
{
	let timing = oralTimings[i];
	oralTimingSelection.options.add(new Option(timing));
}

var addDepotBtn = document.createElement("button");
addDepotBtn.appendChild(document.createTextNode("Add Depot"));
addEvent(addDepotBtn, 'click', addDepot);

var addOralBtn = document.createElement("button");
addOralBtn.appendChild(document.createTextNode("Add Oral"));
addEvent(addOralBtn, 'click', addOral);

document.getElementById("oral_name").appendChild(oralPrescriptionSelection);
document.getElementById("oral_dosage").appendChild(oralDosageText);
document.getElementById("oral_timing").appendChild(oralTimingSelection);
document.getElementById("oral_add").appendChild(addOralBtn);

document.getElementById("depot_name").appendChild(prescriptionSelection);
document.getElementById("depot_timing").appendChild(timingsSelection);
document.getElementById("depot_dosage").appendChild(dosageText);
document.getElementById("depot_add").appendChild(addDepotBtn);

depotTableDiv.appendChild(depotTable);
oralTableDiv.appendChild(oralTable);

var depots = [];
var orals = [];
var allPrescriptions = [];

function roundToTwo(num)
{
	return  + (Math.round(num + "e+2") + "e-2");
}

function addEvent(element, evnt, funct)
{
	if (element.attachEvent)
		return element.attachEvent('on' + evnt, funct);
	else
		return element.addEventListener(evnt, funct, false);
}

function generateTableHead(table, data)
{
	let thead = table.createTHead();

	let rowHeader = thead.insertRow();
	let h = document.createElement("th");
	h.className = "summary_header";
	h.colSpan = 5;
	let text = document.createTextNode("Prescription Summary");
	h.appendChild(text);
	rowHeader.appendChild(h);

	let row = thead.insertRow();
	for (var i = 0; i < data.length; ++i)
	{
		let key = data[i];
		let th = document.createElement("th");
		let text = document.createTextNode(key);
		th.appendChild(text);
		row.appendChild(th);
	}

	// add delete button for Prescription element
	let cell = row.insertCell();
	var deleteBtn = document.createElement("button");
	deleteBtn.appendChild(document.createTextNode("Clear"));
	addEvent(deleteBtn, 'click', onClearPrescriptions);

	cell.appendChild(deleteBtn);
}

function clearTable(table)
{
	while (table.hasChildNodes())
	{
		table.removeChild(table.firstChild);
	}
}

function deleteElement(data, prescription)
{
	for (let i = 0; i < data.length; ++i)
	{
		if (data[i] == prescription)
		{
			data.splice(i, 1);
			break;
		}
	}
}

function onClearPrescriptions()
{
	depots = [];
	orals = [];
	allPrescriptions = [];

	updateBnfTotals();
}

function onDeletePrescription(prescription)
{
	deleteElement(orals, prescription);
	deleteElement(depots, prescription);
	deleteElement(allPrescriptions, prescription);

	updateBnfTotals();
}

// generates table for added Prescriptions
function generateTable(table, data)
{
	for (var i = 0; i < data.length; ++i)
	{
		let element = data[i];

		// add textual elements for each Prescription - name, dosage etc
		let row = table.insertRow();
		for (key in element)
		{
			let cell = row.insertCell();

			cell.className = "summary_td"

				let text = document.createTextNode(element[key]);
			cell.appendChild(text);
		}

		// add delete button for Prescription element
		let cell = row.insertCell();
		var deleteBtn = document.createElement("button");
		deleteBtn.appendChild(document.createTextNode("x"));
		addEvent(deleteBtn, 'click',
			function (e)
		{
			onDeletePrescription(element);
		}
		);

		cell.appendChild(deleteBtn);
	}
}

// regenerate table / total based on depot/oral prescription
function updateBnfTotals()
{
	let bnfTotalDepot = 0;
	for (let i = 0; i < depots.length; ++i)
	{
		bnfTotalDepot += depots[i].BNF;
	}

	let bnfTotalOral = 0;
	for (let i = 0; i < orals.length; ++i)
	{
		bnfTotalOral += orals[i].BNF;
	}

	let total = bnfTotalDepot + bnfTotalOral;

	document.getElementById("total_depot_bnf").innerHTML = roundToTwo(bnfTotalDepot);
	document.getElementById("total_oral_bnf").innerHTML = roundToTwo(bnfTotalOral);
	let totals = document.getElementById("total_bnf");
	let roundedTotal = roundToTwo(total);
	totals.innerHTML = roundedTotal;

	if (roundedTotal <= 1)
		totals.className = "bnf_good";
	else if (roundedTotal < 1.999)
		totals.className = "bnf_bad";
	else
		totals.className = "bnf_very_bad";

	clearTable(oralTable);

	if (allPrescriptions.length > 0)
	{
		generateTableHead(oralTable, Object.keys(allPrescriptions[0]));
		generateTable(oralTable, allPrescriptions);
	}
}

function toNumber(str)
{
	str = String(str).trim();
	return !str ? NaN : Number(str);
}

function isNumber(str)
{
	return !isNaN(toNumber(str));
}

function addOral()
{
	let dosage = parseFloat(oralDosageText.value);
	if (isNumber(dosage) == false || dosage <= 0)
	{
		alert("Invalid dosage");
		return;
	}

	let index = oralPrescriptionSelection.selectedIndex;
	let maxDosage = maxOralDosages[index];
	let timingIndex = oralTimingSelection.selectedIndex;
	let dailyMultiplier = oralTimingsMultiplier[timingIndex];

	let bnf = (dosage * dailyMultiplier) / maxDosage;

	let dosageStr = "" + dailyMultiplier + " x " + dosage + "mg";
	let oralEntry =
	{
		"Prescription Name": oralNames[index] + " [oral]",
		"Interval": oralTimings[timingIndex],
		"Dosage (mg)": dosageStr,
		BNF: roundToTwo(bnf),
	};

	orals.push(oralEntry);
	allPrescriptions.push(oralEntry);

	updateBnfTotals();
}


function addDepot()
{
	let dosage = parseFloat(dosageText.value);
	if (isNumber(dosage) == false || dosage <= 0)
	{
		alert("Invalid dosage");
		return;
	}

	let index = prescriptionSelection.selectedIndex;
	let maxDosage = maxDepotDosages[index];

	let maxTiming = depotMaxTimings[index] * 7;

	let weeksIndex = timingsSelection.selectedIndex;
	let weeks = depotTimingDivisor[weeksIndex];
	let days = weeks * 7;

	let bnf = (dosage / (days / maxTiming)) / maxDosage;

	let depotEntry =
	{
		"Prescription Name": depotNames[index] + " [depot]",
		"Interval": timings[weeksIndex],
		"Dosage (mg)": dosage,
		BNF: roundToTwo(bnf)
	};

	depots.push(depotEntry);
	allPrescriptions.push(depotEntry);

	updateBnfTotals();
}
