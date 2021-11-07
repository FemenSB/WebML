// For the KNN, the training stage will be just format the given dataset
function knnLearn() {this.model = numericalSet(table);}

function knnClassify(sample, k) { // Receive a sample and return its classification based on the k nearest neighbours
  let distances = [];
  let distanceAux;
  for(let i = 0; i < this.model.length; i++) { // For every sample in the dataset
    distanceAux = 0;
    for(let j = 0; j < this.model[0].length - 1; j++) {
      // Calculate the euclidian distance between the sample to be classified and the sample from the dataset
      distanceAux += (sample[j] - this.model[i][j]) * (sample[j] - this.model[i][j]);
    }
    distances.push(Math.sqrt(distanceAux));
  }

  // Initialize array sized k to find the k nearest neighbours
  let nearest = [];
  // This array will initially have the first k values of the distances array to make sure it have values equal or bigger than the smallest values in the distances
  for(let i = 0; i < k; i++) nearest.push([distances[i], i]); // Note that we also store the index of each element to later access its classification in the last row

  for(let i = k; i < distances.length; i++) { // The first k values are already in the array, so we can skip those
    for(let j = 0; j < k; j++) {
      if(distances[i] < nearest[j][0]) { // If a smaller distance is found
        nearest[j][0] = distances[i]; // Store the distance
        nearest[j][1] = i; // Store the index
        break; // Exit the inner loop
      }
    }
  }
  console.log(nearest);
  // Count the ocurrence of every classification (called here label) in the nearest neighbours
  let labels = [];
  let ocurrencies = []; // ocurrencies[i] will store the number of ocurrencies of the classification labels[i]
  let foundIndex; // Auxiliary variable
  for(let i = 0; i < k; i++) {
    foundIndex = labels.indexOf(this.model[nearest[i][1]][this.model[0].length - 1]);
    if(foundIndex == -1) { // If the classification isn't already in the labels array
      labels.push(this.model[nearest[i][1]][this.model[0].length - 1]); // Add it to labels[]
      ocurrencies.push(1); // Set its current ocurrence to 1
    } else { // If the classification is already in labels[]
      ocurrencies[foundIndex]++; // Increment its ocurrencies
    }
  }

  // Identify and return the most frequent label
  let mostFreq = [0, 0]; // mostFreq[0] <- current greatest found frequency in ocurrencies[]
  // mostFreq[1] <- index of the label with greatest frequency in labels[], which is the same index of its ocurrencies[] counterpart
  for(let i = 0; i < ocurrencies.length; i++) {
    if(ocurrencies[i] > mostFreq[0]) {
      mostFreq[0] = ocurrencies[i];
      mostFreq[1] = i;
    }
  }

  return labels[mostFreq[1]];
}
