import React from 'react';
import { BrowserRouter, Route, Link } from 'react-router-dom';
import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis'; // A set of utilities for in browser visualization with TensorFlow.js
import Status from '../status';
import TinyYoloV3View from '../tinyYoloV3';
import TinyYoloV3FromImage from '../tinyYoloV3FromImage';
import { getData, convertToTensor } from '../../services/data';
import { createModel, trainModel, testModel } from '../../services/model';
import '../../style/app/app.scss';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            status: ''
        }
        this.run = this.run.bind(this);
    }

    componentDidMount() {
        // document.addEventListener('DOMContentLoaded', this.run, { passive: true });
    }

    run() {
        let tensorData;

        getData()
        .then(async (data) => {
            const values = data.map(d => ({
                x: d.horsepower,
                y: d.mpg,
            }));
        
            // tfvis.render.scatterplot(
            //     { name: 'Horsepower vs MPG'},
            //     {values},
            //     {
            //         xLabel: 'Horsepower',
            //         yLabel: 'MPG',
            //         height: 300
            //     }
            // );

            // Convert the data to a form we can use for training.
            tensorData = convertToTensor(data);
            // Create the model
            const model = createModel();  
            tfvis.show.modelSummary({name: 'Model Summary'}, model);
            console.log('tensorData', tensorData);

            try {
                const { inputs, labels } = tensorData;
                await trainModel(model, inputs, labels);
                this.setState({ status: 'Done Training' });
            } catch (err) {
                console.error(err);
            }

            const predictionValues = testModel(model, data, tensorData);

            tfvis.render.scatterplot(
                { name: 'Model Predictions vs Original Data' },
                { values: predictionValues, series: ['original', 'predicted']},
                {
                    xLabel: 'Horsepower',
                    yLabel: 'MPG',
                    height: 300
                }
            )
        })
        .catch((err) => {
            console.error(err);
        });
    }

    render() {
        const { status } = this.state;
        // return (
        //     <div>
        //         <div>{ status }</div>
        //         <TinyYoloV3 />
        //     </div>
        // )
        return (
            <BrowserRouter>
                <nav>
                    <ul>
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        <li>
                            <Link to="/tiny-yolo-v3">Tiny Yolo V3</Link>
                        </li>
                        <li>
                            <Link to="/tiny-yolo-v3-from-image">Tiny Yolo V3 from image</Link>
                        </li>
                    </ul>
                </nav>
                <Route path="/tiny-yolo-v3" component={TinyYoloV3View} />
                <Route path="/tiny-yolo-v3-from-image" component={TinyYoloV3FromImage} />
                <Route path="/" exact render={() => (<Status status={status} />)} />
            </BrowserRouter>
        );
    }
}


export default App;
