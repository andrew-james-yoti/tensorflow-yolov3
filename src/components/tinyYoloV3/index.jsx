import React, { Component } from 'react';
import TinyYoloV3 from 'tfjs-tiny-yolov3';
import { setupWebcam } from '../../services/webcam';
import './tinyYoloV3.scss';

class TinyYoloV3View extends Component {
    constructor(props) {
        super(props);
        this.state = {
            model: null,
            webcamElement: null,
            person: null,
        }
    }

    async componentDidMount() {
        await setupWebcam();
        this.loadTinyYoloV3();
    }

    loadTinyYoloV3() {
        const webcamElement = document.getElementById('webcam');
        this.setState({ model: new TinyYoloV3() }, async () => {
            await this.state.model.load();
            this.run(webcamElement);
        });
    }

    async run(webcamElement) {
        const boxes = await this.state.model.detectAndBox(webcamElement, true);
        const person = this.getPerson(boxes);
        this.setState({ person }, () => {
            this.run(webcamElement);
        });
        // setTimeout(() => this.run(webcamElement));
    }

    getPerson(boxes) {
        const person = boxes.find((box) => (box.label === "person"));
        if (person) {
            console.log('person', person.left, person.top, person.width, person.height);
            return person;
            // this.cropImage(person);
        } else {
            console.error('No Person found');
            return null;
        }
        
    }

    render() {
        const { person } = this.state;
        return (
            <div>
                <h1>Tiny-YOLOv3 using TensorFlow.js</h1>
                <div>https://www.npmjs.com/package/tfjs-tiny-yolov3</div>
                <video autoPlay playsInline muted className="webcam" id="webcam" width="224" height="224"></video>
                {
                    person ? (
                        <div>
                            <span>{person.left}&nbsp;</span>
                            <span>{person.top}&nbsp;</span>
                            <span>{person.width}&nbsp;</span>
                            <span>{person.height}&nbsp;</span>
                        </div>
                    ) : (
                        <div>Loading...</div>
                    )
                }
            </div>
        )
    }
}

export default TinyYoloV3View;
