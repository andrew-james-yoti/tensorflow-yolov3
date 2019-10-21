import React from 'react';
import TinyYoloV3 from 'tfjs-tiny-yolov3';
import { setupWebcam } from '../../services/webcam';

class TinyYoloV3FromImage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            snappedImage: null,
        }

        this.onSnapPhoto = this.onSnapPhoto.bind(this);
    }

    async componentDidMount() {
        await setupWebcam();
    }

    async detectAndBox() {
        const canvas = this.refs.canvas;
        const flipHorizontal = false;

        // this.getPerson([
        // {
        // "top": 46.28789138793945,
        // "left": 12.296125411987305,
        // "bottom": 118.87165832519531,
        // "right": 55.35480499267578,
        // "height": 72.58376693725586,
        // "width": 43.05867958068848,
        // "score": 0.6453304886817932,
        // "label": "person"
        // }
        // ]);
        
        this.setState({ model: new TinyYoloV3() }, async () => {
            await this.state.model.load();
            // await this.state.model.load('https://raw.githubusercontent.com/shaqian/tfjs-yolo-demo/master/dist/model/v3/model.json');
            // const features = await this.state.model.predict(canvas, flipHorizontal);
            // console.log('features', features);
            const boxes = await this.state.model.detectAndBox(canvas, flipHorizontal);
            console.log('boxes', JSON.stringify(boxes, null, 2));
            this.getPerson(boxes);
        });
    }

    getPerson(boxes) {
        console.log('get person')
        const person = boxes.find((box) => (box.label === "person"));
        if (person) {
            console.log('person', person);
            this.cropImage(person);
        } else {
            console.error('No Person found');
        }
        
    }

    cropImage(person) {
        console.log('Crop Image', person);
        const canvas = this.refs.canvas;
        const context = canvas.getContext('2d');
        context.beginPath();
        context.lineWidth = "4";
        context.strokeStyle = "green";
        context.rect(parseInt(person.left, 10), parseInt(person.top, 10), parseInt(person.width, 10), parseInt(person.height, 10));
        context.stroke();
    }

    convertCanvasToImage() {
        const canvas = this.refs.canvas;
        const video = this.refs.webcam;
        const context = canvas.getContext('2d');

        return new Promise((resolve) => {
            context.drawImage(video, 0, 0, 320, 240);
            const dataURL = canvas.toDataURL('image/png');
            console.log(dataURL);
            // const snappedImage = new Image();
            // snappedImage.src = this.canvas.toDataUrl();
            this.setState({ snappedImage: dataURL }, () => { resolve(); });
        });
    }

    async onSnapPhoto() {
        await this.convertCanvasToImage();
        this.detectAndBox();
    }

    render() {
        return (
            <div>
                <div>
                    <video autoPlay playsInline muted ref="webcam" className="webcam" id="webcam" width="320" height="240"></video>
                </div>
                <div>
                    <canvas ref="canvas" id="canvas" width="320" height="240"></canvas>
                </div>
                <button id="snap" onClick={this.onSnapPhoto}>Snap Photo</button>
                {/* <img src={testImage} width="320" height="240" ref="testImage" id="testImage" /> */}
            </div>
        )
    }
}

export default TinyYoloV3FromImage;
