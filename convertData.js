function numericalSet(rawSet) { // Return a formatted version of the dataset based on the user settings
  let newSet = [];

  for(let i = 0; i < rawSet.length; i++) { // Store in newSet the values converted to float
    let j;
    newSet.push([]);
    for(j = 0; j < rawSet[0].length; j++) {
      if(j != target)
        newSet[i][j] = parseFloat(rawSet[i][j]);
      else // The target row won't be converted because it's nominal
        newSet[i][j] = rawSet[i][j];
    }
  }

  if(headerCheck.checked) { // Remove the header
    newSet.splice(0, 1);
  }

  if(target != rawSet[0].length - 1) { // Move the target value to the last row for ease
      for(let i = 0; i < newSet.length; i++) {
        newSet[i].push(newSet[i][target]);
        newSet[i].splice(target, 1);
      }
      target = newSet[0].length - 1;
  }

  return newSet;
}

function numericalSetBatch(rawSet) {
  let newSet = [];

  for(let i = 0 + headerBatch.checked; i < rawSet.length; i++) { // Store in newSet the values converted to float
    let j;
    newSet.push([]);
    for(j = 0; j < rawSet[0].length; j++) {
      newSet[i - headerBatch.checked][j] = parseFloat(rawSet[i - headerBatch.checked][j]);
    }
  }
  return newSet;
}
