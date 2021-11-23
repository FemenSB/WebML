function entropy(group) { // Return the entropy of the given group's last row (target value)
  let classes = []; // List of all possible classifications
  let occurences = []; // occurences[i] counts how many times classes[i] appears in the group
  let last = group[0].length - 1; // Last row of the group, presumably the target value
  let total = group.length; // Total of occurences of all classes
  let entropySum = 0;
  let index;

  for(let i = 0; i < total; i++) {
    index = classes.indexOf(group[i][last]);
    if(index != -1) { // If this is not a new classification
      occurences[index]++;
    } else { // Add the new classification
      classes.push(group[i][last]);
      occurences.push(1);
    }
  }

  for(let i = 0; i < classes.length; i++) {
    entropySum -= (occurences[i]/total) * Math.log2(occurences[i]/total);
  }

  return entropySum;
}

function indexRemoved(array, index) { // Return a copy of the given array without the specified index
  let newArray = [...array];
  newArray.splice(index, 1);
  return newArray;
}

function tree(dataSet) {

  if(dataSet.length == 0) {
    return {test: function(sample) {return 'unclassifiable';}}
  }

  if(dataSet[0].length > 1) { // If this is not a leaf node

    let chosenCharacteristic; // Characteristic chosen to make a decision in this node
    let itsEntropy = Number.MAX_VALUE; // The pondered entropy of the groups this decision creates
    let itsSplittingValue; // The value compared in this decision making

    for(let i = 0; i < dataSet[0].length - 1; i++) { // For each characteristic (except the classification)
      let sorted = []; // dataSet sorted by the characteristic i in ascending order

      for(let j = 0; j < dataSet.length; j++) { // For each sample in dataSet
        // Insert dataSet[j] into sorted[] keeping it sorted
        let position;
        for(position = 0; position < sorted.length; position++)
          if(dataSet[j][i] > sorted[position][i])
            break;
        sorted.splice(position, 0, dataSet[j]);
      }

      console.log(sorted);

      let splittingValue;
      let smallestPonderedEntropy = Number.MAX_VALUE;
      let chosenSplittingValue;

      for(let j = 0; j < sorted.length - 1; j++) { // For each sample in sorted
        // Look for the value to split the dataSet
        // The value that minimizes entropy is known to be between two samples of different classes
        if(sorted[j][sorted[0].length - 1] != sorted[j + 1][sorted[0].length - 1]) {
          // If the value between this sample and the next is a candidate to split the dataset:
          let groups = [[], []];
          splittingValue = (sorted[j][i] + sorted[j + 1][i]) / 2;
          for(let k = 0; k < sorted.length; k++) { // Split the dataset
            groups[0 + (sorted[k][i] > splittingValue)].push(sorted[k]); // If > splittingValue, sample goes to groups[1]; else sample goes to groups[0];
          }

          if(groups[0].length != 0 && groups[1].length != 0) {

            let ponderedEntropy = ((entropy(groups[0]) * groups[0].length) + (entropy(groups[1]) * groups[1].length)) / sorted.length;
            console.log('ponderedEntropy: ' + ponderedEntropy);
            if(ponderedEntropy < smallestPonderedEntropy) { // This splittingValue is the current best
              smallestPonderedEntropy = ponderedEntropy;
              chosenSplittingValue = splittingValue;
            }

          }

        }
      }

      // With the best splittingValue and its resulting entropy defined for this characteristic, we should now compare it to the current best characteristic
      console.log(smallestPonderedEntropy);
      console.log(itsEntropy);
      if(smallestPonderedEntropy < itsEntropy) {
        chosenCharacteristic = i;
        itsEntropy = smallestPonderedEntropy;
        itsSplittingValue = splittingValue;
      }

    }

    // The test that creates the biggest amount of information is now defined (characteristic < splittingValue)
    // Now we should create two more nodes, one for each of the possible results of the test

    let newDataSet = [[], []]; // The two dataSets to be passed to the two new nodes
    for(let i = 0; i < dataSet.length; i++) {
      newDataSet[0 + (dataSet[i][chosenCharacteristic] > itsSplittingValue)].push(indexRemoved(dataSet[i], chosenCharacteristic));
      /* The line above is the branchless equivalent of:
      if(dataSet[i][chosenCharacteristic] < itsSplittingValue) {
        newDataSet[0].push(indexRemoved(dataSet[i]));
      } else {
        newDataSet[1].push(indexRemoved(dataSet[i]));
      }
       */
    }

    let thisNode = { // Definition of the node object that will compose the tree
      children: [tree(newDataSet[0]), tree(newDataSet[1])], // Reference to its children nodes
      testCharacteristic: chosenCharacteristic, // Characteristic that will used in this node's test
      splittingValue: itsSplittingValue, // Value that will be used in this node's test
      test: function(sample) {return this.children[0 + (sample[this.testCharacteristic] > this.splittingValue)].test(indexRemoved(sample, this.testCharacteristic));} // Test function that call a children's test function
    };

    /*console.log(thisNode);
    console.log(chosenCharacteristic);
    console.log(itsSplittingValue);
    console.log(itsEntropy);*/

    return thisNode;

  } else { // If there is no characteristic left, this is a leaf node
    // In this case, we just need to find out the most common classification in the given dataSet and and set the test to return it

    let classes = []; // List of all possible classifications
    let occurences = []; // occurences[i] counts how many times classes[i] appears in the group
    let index;

    for(let i = 0; i < dataSet.length; i++) {
      index = classes.indexOf(dataSet[i][dataSet[0].length - 1]);
      if(index != -1) { // If this is not a new classification
        occurences[index]++;
      } else { // Add the new classification
        classes.push(dataSet[i][dataSet[0].length - 1]);
        occurences.push(1);
      }
    }

    let chosenClass;
    let moreOccurencies = 0;
    for(let i = 0; i < occurences.length; i++) {
      if(occurences[i] > moreOccurencies) {
        moreOccurencies = occurences[i];
        chosenClass = classes[i];
      }
    }

    let thisNode = {
      foundClass: chosenClass,
      test: function(sample) {return this.foundClass;}
    };

    return thisNode;
  }

}

function dtLearn() { // Induce the tree and store its root node in this.model
  this.model = tree(this.convert(table));
}

function dtClassify(sample) {
  return this.model.test(sample);
}

function dtInterface() { // No special interface is required for the use of decision tree, so the interface returned is an empty div
  let container = document.createElement('div');
  let interface = {div: container};
  return interface;
}
