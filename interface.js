const inputSet = document.getElementById('dataSet');
const headerCheck = document.getElementById('header');
const loadButton = document.getElementById('load');
const manageRowsButton = document.getElementById('rows');
const rowsModal = document.getElementById('rowsModal');
const modalActiveArea = document.getElementById('activeArea');
const details = document.getElementById('details');
const detailsText = document.getElementById('detailsText');
const learnButton = document.getElementById('learn');
const batchModal = document.getElementById('batchModal');
const batchActiveArea = document.getElementById('activeBatchArea');
const inputBatch = document.getElementById('batch');
const headerBatch = document.getElementById('headerBatch');
const loadBatch = document.getElementById('loadBatch');
const classifyBatchButton = document.getElementById('classifyBatch');
const batchK = document.getElementById('batchK');
const testModal = document.getElementById('testModal');
const trainingNumber = document.getElementById('trainingNumber');
const runTest = document.getElementById('runTest');
const openTest = document.getElementById('openTest');
const testK = document.getElementById('testK');
const batchRows = document.getElementById('batchRows');
const activeBatchRows = document.getElementById('activeBatchRows');
const batchRowsButton = document.getElementById('batchRowsButton');
const testResult = document.getElementById('testResult');
const selectAlgorithm = document.getElementById('selectAlgorithm');

var downloader = document.createElement('a'); // Used to download files in case of batch classification
downloader.classList.add('hidden');
document.body.appendChild(downloader);

var rowsDiv;
var table = []; // This matrix is going to store the dataset
var batchTable = []; // Matrix to store the samples batch to be classified
var target; // Target value. If not defined by the user, is going to be the last row by default
var inputDiv; // Div that will contain the input elements for classification
var inputElements = []; // Array storing pointers to the input elements for classification

// Instantiate algorithm objects
algorithms = [new Algorithm('K nearest neighbours', knnLearn, knnClassify, numericalSet, numericalSetBatch)];

// Add every algorithm to the selector options
for(let i = 0; i < algorithms.length; i++) {
  let newOption = document.createElement('option');
  newOption.value = i;
  newOption.innerHTML = algorithms[i].name;
  selectAlgorithm.appendChild(newOption);
}

function removeRow(matrix, index) {
  for(let i = 0; i < matrix.length; i++) {
    matrix[i].splice(index, 1);
  }
}

//Functions to show and hide the text explaining the "header" checkbox
details.addEventListener('mouseenter', (e) => {
  detailsText.classList.add('show');
});

details.addEventListener('mouseleave', (e) => {
  detailsText.classList.remove('show');
});

load.addEventListener('click', (e) => {
  console.log(inputSet.files);
  var reader = new FileReader();
  reader.onload = () => {
    table = []; // Reset the matrix in case another dataset was already loaded
    reader.result.split(/\n|\r/).forEach((eachLine, i) => {
      // In many cases, lines of the CSV file will have both \n and \r, but we also have to consider the cases when it won't
      // This may lead to blank lines when the text is splitted, so we must verify the resulting string
      if(eachLine != '') {
        // If the line is not blank, split it in its commas and add the resulting strings to the table
        table.push(eachLine.split(','));
      }
    });

    target = table[0].length - 1; // By default, set the last row as the target. May be changed by the user

    console.log(table);
  };

  reader.readAsText(inputSet.files[0]);
});

loadBatch.addEventListener('click', (e) => {
  console.log(inputSet.files);
  var reader = new FileReader();
  batchTable = []; // Reset batchTable in case it is already set
  reader.onload = () => {
    reader.result.split(/\n|\r/).forEach((eachLine, i) => {
      // In many cases, lines of the CSV file will have both \n and \r, but we also have to consider the cases when it won't
      // This may lead to blank lines when the text is splitted, so we must verify the resulting string
      if(eachLine != '') {
        // If the line is not blank, split it in its commas and add the resulting strings to the table
        batchTable.push(eachLine.split(','));
      }
    });

  };
  reader.readAsText(inputBatch.files[0]);
});

classifyBatchButton.addEventListener('click', (e) => {
  var newTable = numericalSetBatch(batchTable);

  for(let i = 0 + headerBatch.checked; i < newTable.length; i++) {
    newTable[i].push(algorithms[selectAlgorithm.value].classify(newTable[i], parseInt(batchK.value)));
  }

  let csvContent = "data:text/csv;charset=utf-8,";

  newTable.forEach(function(rowArray) {
    let row = rowArray.join(',');
    csvContent = csvContent + row + '\r\n';
  });
  let encodedUri = encodeURI(csvContent);
  downloader.setAttribute('href', encodedUri);
  downloader.setAttribute('download', 'KNN_classification.csv');
  downloader.click();
});

manageRowsButton.addEventListener('click', (e) => { // Create the DOM elements representing each row and set the modal visible
  rowsDiv = document.createElement('div');
  // Reference to the DOM elements must be kept so they can later be removed without the need to fully refresh the modal
  let newText = [];
  let newButton = [];
  let newParagraph = [];
  let textDiv = [];
  let targetButton = [];

  let refIndexes = []; // This array is needed to keep the indexes inside the button events updated

  for(let i = 0; i < table[0].length; i++) {
    refIndexes.push(i);

    if(headerCheck.checked)
      newText.push(document.createTextNode(table[0][i])); // table[0] is the header, so its values are the names of the characteristics
    else
      newText.push(document.createTextNode(i)); // there is no header specifying names, so numbers will represent each row

    rowsDiv.appendChild(newText[i]);
    newButton.push(document.createElement('button'));
    newButton[i].textContent = 'remove';
    newButton[i].addEventListener('click', (e) => {
      // Remove specified row and it's DOM elements
      removeRow(table, refIndexes[i]);
      newText[refIndexes[i]].remove();
      newText.splice(refIndexes[i], 1);
      newButton[refIndexes[i]].remove();
      newButton.splice(refIndexes[i], 1);
      newParagraph[refIndexes[i]].remove();
      newParagraph.splice(refIndexes[i], 1);
      textDiv[refIndexes[i]].remove();
      textDiv.splice(refIndexes[i], 1);
      targetButton[refIndexes[i]].remove();
      targetButton.splice(refIndexes[i], 1);
      // If target >= i, the removal of row i must change the value o target
      if(target > refIndexes[i]) { // The target row is still the same, but its index changed
        target--;
      } else if (target == refIndexes[i]) { // The target row is the removed row.
        // In this case, it was decided to set the last row as the new target, but different solutions could be adopted
        target = table[0].length - 1;
        // UI also must be updated in this case
        targetButton[target].style.display = 'none';
        textDiv[target].style.display = 'flex';
      }
      // When a button i is removed, all buttons j > i must have their indexes updated
      for (let j = i; j < refIndexes.length; j++) refIndexes[j]--;
    });
    rowsDiv.appendChild(newButton[i]);

    // Code for target setting:
    targetButton[refIndexes[i]] = document.createElement('button');
    targetButton[refIndexes[i]].textContent = 'set target';
    targetButton[refIndexes[i]].style.display = 'flex';
    targetButton[refIndexes[i]].addEventListener('click', (e) => {
      textDiv[target].style.display = 'none';
      targetButton[target].style.display = 'flex';
      targetButton[refIndexes[i]].style.display = 'none';
      textDiv[refIndexes[i]].style.display = 'flex';
      target = refIndexes[i];
    });
    textDiv.push(document.createElement('div'));
    textDiv[refIndexes[i]].appendChild(document.createTextNode(' <- target'));
    if(refIndexes[i] != target) {
      targetButton[refIndexes[i]].style.display = 'flex';
      textDiv[refIndexes[i]].style.display = 'none';
    } else {
      targetButton[refIndexes[i]].style.display = 'none';
      textDiv[refIndexes[i]].style.display = 'flex';
    }
    rowsDiv.appendChild(targetButton[refIndexes[i]]);
    rowsDiv.appendChild(textDiv[refIndexes[i]]);

    newParagraph[refIndexes[i]] = rowsDiv.appendChild(document.createElement('p'));
  }

  modalActiveArea.appendChild(rowsDiv);
  rowsModal.classList.add('show'); // Set the modal visible
});

rowsModal.addEventListener('click', (e) => { // Event to close the row management modal
  if(e.target.id == 'rowsModal') {
    rowsModal.classList.remove('show');
    rowsDiv.remove();
  }
});

batchModal.addEventListener('click', (e) => { // Event to close the batch classification modal
  if(e.target.id == 'batchModal') {
    batchModal.classList.remove('show');
  }
});

testModal.addEventListener('click', (e) => { // Event to close the dataset test modal
  if(e.target.id == 'testModal') {
    testModal.classList.remove('show');
  }
});

batchRowsButton.addEventListener('click', (e) => { // Create the DOM elements representing each row and set the modal visible
  rowsDiv = document.createElement('div');
  // Reference to the DOM elements must be kept so they can later be removed without the need to fully refresh the modal
  let newText = [];
  let newButton = [];
  let newParagraph = [];
  let textDiv = [];

  let refIndexes = []; // This array is needed to keep the indexes inside the button events updated

  for(let i = 0; i < batchTable[0].length; i++) {
    refIndexes.push(i);

    if(headerBatch.checked)
      newText.push(document.createTextNode(batchTable[0][i])); // batchTable[0] is the header, so its values are the names of the characteristics
    else
      newText.push(document.createTextNode(i)); // there is no header specifying names, so numbers will represent each row

    rowsDiv.appendChild(newText[i]);
    newButton.push(document.createElement('button'));
    newButton[i].textContent = 'remove';
    newButton[i].addEventListener('click', (e) => {
      // Remove specified row and it's DOM elements
      console.log(batchTable);
      removeRow(batchTable, refIndexes[i]);
      newText[refIndexes[i]].remove();
      newText.splice(refIndexes[i], 1);
      newButton[refIndexes[i]].remove();
      newButton.splice(refIndexes[i], 1);
      newParagraph[refIndexes[i]].remove();
      newParagraph.splice(refIndexes[i], 1);
      textDiv.splice(refIndexes[i], 1);

      // When a button i is removed, all buttons j > i must have their indexes updated
      for (let j = i; j < refIndexes.length; j++) refIndexes[j]--;
    });
    rowsDiv.appendChild(newButton[i]);

    newParagraph[refIndexes[i]] = rowsDiv.appendChild(document.createElement('p'));
  }

  activeBatchRows.appendChild(rowsDiv);
  batchRows.classList.add('show'); // Set the modal visible
});

batchRows.addEventListener('click', (e) => { // Event to close the row management modal
  if(e.target.id == 'batchRows') {
    batchRows.classList.remove('show');
    rowsDiv.remove();
  }
});

learnButton.addEventListener('click', (e) => {
  algorithms[selectAlgorithm.value].learn(); // Create the model

  // Handling the rendering of the input interface
  if(inputDiv != undefined) inputDiv.remove(); // If there is already a inputDiv, remove it
  inputDiv = document.createElement('div'); // Create a new inputDiv

  inputDiv.appendChild(document.createElement('br'));
  inputDiv.appendChild(document.createElement('br'));
  // Button that opens the modal for batch classification
  var batchClassify = document.createElement('button');
  batchClassify.addEventListener('click', (e) => {
    batchModal.classList.add('show');
  });
  batchClassify.textContent = 'Batch classification';
  inputDiv.appendChild(batchClassify);

  inputDiv.appendChild(document.createElement('br'));
  inputDiv.appendChild(document.createElement('br'));

  // Input to classify a single sample:
  inputDiv.appendChild(document.createTextNode('Single sample classification:'));
  inputDiv.appendChild(document.createElement('br'));
  inputDiv.appendChild(document.createElement('br'));
  inputDiv.appendChild(document.createTextNode('Input data'));
  inputDiv.appendChild(document.createElement('br'));
  inputDiv.appendChild(document.createElement('br'));
  inputElements = []; // Reset array to discard old elements

  for(let i = 0; i < table[0].length - 1; i++) { // Create text areas to get the input
    inputElements.push(document.createElement('textarea'));
    inputDiv.appendChild(inputElements[i]);

    if(headerCheck.checked)
      inputDiv.appendChild(document.createTextNode('\xa0\xa0\xa0\xa0' + table[0][i])); // table[0] is the header, so its values are the names of the characteristics
    else
      inputDiv.appendChild(document.createTextNode('\xa0\xa0\xa0\xa0' + i)); // there is no header specifying names, so numbers will represent each row

    inputDiv.appendChild(document.createElement('br'));
    inputDiv.appendChild(document.createElement('br'));
  }

  inputDiv.appendChild(document.createTextNode('K:'));
  var kInput = document.createElement('textarea');
  kInput.id = 'kInput';
  inputDiv.appendChild(kInput);
  var classifyButton = document.createElement('button');
  classifyButton.textContent = 'Classify';
  var classificationText;
  classifyButton.addEventListener('click', (e) => {
    let inputSample = [];
    for(let i = 0; i < inputElements.length; i++) {
      inputSample.push(parseFloat(inputElements[i].value));
    }
    if(classificationText != undefined) classificationText.remove();
    classificationText = document.createTextNode(algorithms[selectAlgorithm.value].classify(inputSample, parseInt(kInput.value)));
    inputDiv.appendChild(classificationText);
  });
  inputDiv.appendChild(classifyButton);
  inputDiv.appendChild(document.createElement('br'));
  inputDiv.appendChild(document.createElement('br'));
  inputDiv.appendChild(document.createTextNode('Classified as: '));
  document.body.appendChild(inputDiv);
});

// Opens the modal for dataset testing
openTest.addEventListener('click', (e) => {
  testModal.classList.add('show');
});

runTest.addEventListener('click', (e) => {
  var oldTable = JSON.parse(JSON.stringify(table)); // Clone the original table to allow it to be restored later
  if(headerCheck.checked) table.splice(0, 1);
  var trainingSet = [];
  var setQuant = parseInt(trainingNumber.value);
  if(setQuant > table.length) setQuant = table.length;
  var choiceProb = setQuant / table.length;
  var i = 0;
  console.log(setQuant);
  while(trainingSet.length < setQuant) { // Randomly choose the samples to train the model
    if(Math.random() <= choiceProb) {
      trainingSet.push(table[i]);
      table.splice(i, 1);
      i = i * (i < table.length) // If the removed sample was the last, return to zero
    } else {
      i = (i + 1) % table.length;
    }
  }
  var testingSet = table; // The remaining samples will be classified
  console.log(trainingSet);
  table = trainingSet;
  console.log(table);
  algorithms[selectAlgorithm.value].learn(); // Train the model

  var correct = 0; // Number of correct classifications
  for(i = 0; i < testingSet.length; i++) { // Classify the samples in testingSet
    let sampleClass = testingSet[i].splice(testingSet[i].length - 1, 1);
    sampleClass = sampleClass[0];
    let sampleTest = testingSet[i];
    for(let j = 0; j < testingSet[i].length; j++) {
      sampleTest[j] = parseFloat(sampleTest[j]);
    }
    if(algorithms[selectAlgorithm.value].classify(sampleTest, parseInt(testK.value)) === sampleClass) {
      correct++;
    }
  }

  testResult.innerHTML = 'Correct: ' + correct + '<br>Wrong: ' + (testingSet.length - correct) + '<br>Accuracy: ' + (correct / testingSet.length);
  console.log('Correct: ' + correct + ' wrong: ' + (testingSet.length - correct));

  table = oldTable; // Restore the original table to allow following use
});
