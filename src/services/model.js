/**
 * ML Models are algorithms that take an inout and produce an output
 * https://codelabs.developers.google.com/codelabs/tfjs-training-regression/index.html#3
 **/
import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';

export const createModel = () => {
    // Create a squential model
    // This model is sequential because its inputs flow straight down to its output.
    // https://js.tensorflow.org/api/latest/#Models
    const model = tf.sequential();

    // Layers are the primary building block for constructing a Model.
    // https://js.tensorflow.org/api/latest/#Layers
    // Add a single hidden layer
    // A dense layer is a type of layer that multiplies its inputs by a matrix (called weights) and then adds a number (called the bias) to the result.
    // The inputShape is [1] because we have 1 number as our input (the horsepower of a given car).
    // units (number) Positive integer, dimensionality of the output space.
    model.add(tf.layers.dense({ inputShape: [1], units: 20, useBias: true }));
    
    model.add(tf.layers.dense({units: 20, activation: 'sigmoid'}));

    model.add(tf.layers.dense({units: 20, activation: 'sigmoid'}));

    model.add(tf.layers.dense({units: 20, activation: 'sigmoid'}));

    model.add(tf.layers.dense({units: 20, activation: 'sigmoid'}));

    model.add(tf.layers.dense({units: 20, activation: 'sigmoid'}));

    // Add an output layer
    model.add(tf.layers.dense({ units: 1, useBias: true }));

    return model;
}

export const trainModel = async (model, inputs, labels) => {
    // Prepare the model for training.
    // https://developers.google.com/machine-learning/glossary/#optimizer
    model.compile({
        optimizer: tf.train.adam(),
        loss: tf.losses.meanSquaredError,
        metrics: ['mse'],
    });

    // https://developers.google.com/machine-learning/glossary/#batch_size
    const batchSize = 32;
    // https://developers.google.com/machine-learning/glossary/#epoch
    const epochs = 50;

    try {
        const result = await model.fit(inputs, labels, {
            batchSize,
            epochs,
            shuffle: true,
            callbacks: tfvis.show.fitCallbacks(
                {
                    name: 'Training Performance'
                },
                [ 'loss', 'mse' ],
                {
                    height: 200,
                    callbacks: [ 'onEpochEnd' ]
                }
            ),
        });

        return result;
    } catch (err) {
        console.error(err);
    }
}

export const testModel = (model, inputData, normalizationData) => {
    const { inputMax, inputMin, labelMax, labelMin } = normalizationData;

    // Generate predictions for a uniform range of numbers between 0 and 1;
    // We un-normalize the data by doing the inverse of the min-max scaling 
    // that we did earlier.
    const [xs, preds] = tf.tidy(() => {
        const xs = tf.linspace(0, 1, 100);
        const preds = model.predict(xs.reshape([100, 1]));
        const unNormXs = xs
            .mul(inputMax.sub(inputMin))
            .add(inputMin);

        const unNormPreds = preds
            .mul(labelMax.sub(labelMin))
            .add(labelMin);

        // Un-normalise the data
        return [unNormXs.dataSync(), unNormPreds.dataSync()];
    });

    const predictedPoints = Array.from(xs).map((val, i) => ({ x: val, y: preds[i]}));

    const originalPoints = inputData.map(d => ({
        x: d.horsepower, y: d.mpg,
    }));

    return [originalPoints, predictedPoints];
}

