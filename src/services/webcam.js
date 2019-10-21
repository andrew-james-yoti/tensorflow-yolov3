export const setupWebcam = () => {
    const webcamElement = document.getElementById('webcam');

    return new Promise((resolve, reject) => {
        const navigatorAny = navigator;
        navigator.getUserMedia = navigator.getUserMedia || navigatorAny.webkitGetUserMedia;
        if(navigator.getUserMedia) {
            navigator.getUserMedia({ video: true }, function(stream) {
                webcamElement.srcObject = stream;
                webcamElement.addEventListener('loadeddata', function() { resolve(); }, false);
                // this.setState({ webcamElement });
            }, function(error) { reject(error); })
        } else {
            reject();
        }
    });
}