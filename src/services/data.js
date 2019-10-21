import * as tf from '@tensorflow/tfjs';

export const getData = async () => {
    try {
        const carsDataReq = await fetch('https://storage.googleapis.com/tfjs-tutorials/carsData.json');
        try {
            const carsData = await carsDataReq.json();
            const cleaned = carsData.map(car => ({
                mpg: car.Miles_per_Gallon,
                horsepower: car.Horsepower,
            }))
            .filter(car => (car.mpg != null && car.horsepower != null));

            return cleaned;
        } catch (err) {
            console.error(err);
        }
    } catch (err) {
        console.error(err);
    }
}

/**
 * Convert the input data to tensors that we can use for machine 
 * learning. We will also do the important best practices of _shuffling_
 * the data and _normalizing_ the data
 * MPG on the y-axis.
 */
 export const convertToTensor = (data) => {
     // Wrapping these calculations in a tidy will dispose any intermediate tensors.
     // https://js.tensorflow.org/api/latest/#tidy
     return tf.tidy(() => {
         // Step 1. Shuffle the data
         // Shuffling is important because typically during training the dataset is broken up into smaller subsets, called batches, that the model is trained on. 
         tf.util.shuffle(data);

         // Step 2. Convert data to Tensor
         // Tensors are the core datastructure of TensorFlow.js They are a generalization of vectors and matrices to potentially higher dimensions.
         const inputs = data.map(d => d.horsepower);
         const labels = data.map(d => d.mpg);

         // https://js.tensorflow.org/api/latest/#tensor2d
         const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
         const labelTensor = tf.tensor2d(labels, [inputs.length, 1]);

         //Step 3. Normalize the data to the range 0 - 1 using min-max scaling
         const inputMax = inputTensor.max();
         const inputMin = inputTensor.min();
         const labelMax = labelTensor.max();
         const labelMin = labelTensor.min();

         // https://js.tensorflow.org/api/latest/#sub
         // https://js.tensorflow.org/api/latest/#div
         const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
         const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));

         const normalizedData = {
             inputs: normalizedInputs,
             labels: normalizedLabels,
             // Return the min/max bounds so we can use them later.
             inputMax,
             inputMin,
             labelMax,
             labelMin,
         }

         return normalizedData;
     });
 }
