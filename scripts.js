
var prescriptionSelection = document.createElement("select");

var oralPrescriptionSelection = document.createElement("select");
var oralDosageText = document.createElement("input");

var oralTableDiv = document.querySelector("#oralTable");
var depotTableDiv = document.querySelector("#depotTable");

var oralTable = document.createElement("table");
var depotTable = document.createElement("table");

var timingsSelection = document.createElement("select");
var dosageText = document.createElement("input");

for (let i = 0; i < oralNames.length; ++i)
{
	let oral = oralNames[i];
  oralPrescriptionSelection.options.add(new Option(oral));
}

for(let i = 0; i < depotNames.length; i++)
{
	let depot = depotNames[i];
  prescriptionSelection.options.add(new Option(depot));
}

for (let i = 0; i<timings.length; ++i)
{
	let timing = timings[i];
  timingsSelection.options.add(new Option(timing));
}

var addDepotBtn = document.createElement("button");
addDepotBtn.appendChild(document.createTextNode("Add Depot"));
addEvent(addDepotBtn,'click',addDepot);

var addOralBtn = document.createElement("button");
addOralBtn.appendChild(document.createTextNode("Add Oral"));
addEvent(addOralBtn,'click',addOral);

document.getElementById("oral_name").appendChild(oralPrescriptionSelection);
document.getElementById("oral_dosage").appendChild(oralDosageText);
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

function roundToTwo(num) {
    return +(Math.round(num + "e+2")  + "e-2");
}

function addEvent(element, evnt, funct)
{
  if (element.attachEvent)
   return element.attachEvent('on'+evnt, funct);
  else
   return element.addEventListener(evnt, funct, false);
}

function generateTableHead(table, data)
{
  let thead = table.createTHead();
  let row = thead.insertRow();
  for (let key of data)
  {
    let th = document.createElement("th");
    let text = document.createTextNode(key);
    th.appendChild(text);
    row.appendChild(th);
  }
}

function clearTable(table)
{
	while(table.hasChildNodes())
  {
     table.removeChild(table.firstChild);
  }
}

function generateTable(table, data)
{
  for (let element of data)
  {
    let row = table.insertRow();
    for (key in element)
    {
      let cell = row.insertCell();
      let text = document.createTextNode(element[key]);
      cell.appendChild(text);
    }
  }
}

function updateBnfTotals()
{
	let bnfTotalDepot = 0;
  for (let i =0; i<depots.length; ++i)
  {
  	bnfTotalDepot += depots[i].BNF;
	}

  let bnfTotalOral = 0;
  for (let i = 0; i<orals.length; ++i)
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
  else if (roundedTotal < 1.5)
        totals.className = "bnf_bad";
  else
        totals.className = "bnf_very_bad";

  clearTable(oralTable);
  generateTableHead(oralTable, Object.keys(allPrescriptions[0]));
  generateTable(oralTable, allPrescriptions);
}

function addOral()
{
	let dosage = parseInt(oralDosageText.value);
  if (Number.isInteger(dosage) == false || dosage <= 0)
  {
  	alert("Invalid dosage");
    return;
	}

  let index = oralPrescriptionSelection.selectedIndex;
  let maxDosage = maxOralDosages[index];

  let bnf = dosage / maxDosage;

 	let oralEntry = {
	  "Prescription Name": oralNames[index] + " [oral]",
    "Dosage (mg)": dosage,
    Timing: "1 Day",
    BNF: roundToTwo(bnf)
	};

  orals.push(oralEntry);
  allPrescriptions.push(oralEntry);

  updateBnfTotals();
}

function addDepot()
{
	let dosage = parseInt(dosageText.value);
  if (Number.isInteger(dosage) == false || dosage <= 0)
  {
  	alert("Invalid dosage");
    return;
	}

  let index = prescriptionSelection.selectedIndex;
  let maxDosage = maxDepotDosages[index];

  let maxTiming = depotMaxTimings[index] * 7;

  let weeksIndex = timingsSelection.selectedIndex;
  let weeks = depotTimingDivisor[weeksIndex] ;
  let days = weeks * 7;

  let bnf = (dosage / (days/maxTiming)) / maxDosage;

 	let depotEntry = {
		"Prescription Name": depotNames[index] + " [depot]",
    "Dosage (mg)": dosage,
    Timing: timings[weeksIndex],
    BNF: roundToTwo(bnf)
	};

  depots.push(depotEntry);
  allPrescriptions.push(depotEntry);

  updateBnfTotals();
}
