let video = document.getElementById('webcam');
let enableWebcamButton = document.getElementById('webcamButton');
let disableWebcamButton = document.getElementById('disableWebcamButton');
let reset = document.getElementById('reset');
let predict = document.getElementById('predict');
const classifier = knnClassifier.create();
let model = undefined;
var buttonNameArray = new Array();
var buttonNameIndex = 0;

mobilenet.load().then((loadedModel) => {
    model = loadedModel;
    document.querySelector("#status").innerHTML = "Model loaded.";
    document.getElementById('addBtn').addEventListener('click', (e) => addButton(e));
});


function getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia);
}

if (getUserMediaSupported()) {
    enableWebcamButton.addEventListener('click', enableCam);
    disableWebcamButton.addEventListener('click', disableCam);
    reset.addEventListener('click', clearExample);
    predict.addEventListener('click', predictCam);
} else {
    console.warn('getUserMedia() is not supported by your browser');
}

function enableCam(event) {
    event.target.disabled = true;
    disableWebcamButton.disabled = false;
    document.querySelector("#liveView").style.display = "block";
    const constraints = {
        video: true
    };
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        video.srcObject = stream;
    })
};

function disableCam(event) {
    enableWebcamButton.disabled = false;
    disableWebcamButton.disabled = true;
    video.srcObject.getTracks().forEach(track => {
        track.stop();
    })
    document.querySelector("#liveView").style.display = "block";
    video.srcObject = null;
}

function clearExample() {
    classifier.clearAllClasses();
    while (document.getElementById('buttonDiv').firstChild) {
        document.getElementById('buttonDiv').removeChild(document.getElementById('buttonDiv').firstChild);
    }
    document.querySelector("#result").innerHTML = "";
}

const classes = ['class A', 'class B', 'class C'];
function predictCam() {
    if (classifier.getNumClasses() > 0) {
        // Get the activation from mobilenet from the webcam.
        const activation = model.infer(video, true);
        // Get the most likely class and confidence from the classifier module.
        classifier.predictClass(activation).then((result) => {
            document.querySelector("#result").innerHTML =
                `prediction: ${classes[result.label]}, probability: ${result.confidences[result.label]}`;
        });
        console.log("predict\n");
    }
    window.requestAnimationFrame(predictCam);
}
function addButton(event) {
    var buttonName = prompt('Please enter new class name:');
    if (buttonName != null) {
        var newBtn = document.createElement('button');
        document.getElementById('buttonDiv').appendChild(newBtn);
        newBtn.innerHTML = buttonName;
        newBtn.className = 'button button2';
        newBtn.id = 'buttonName' + buttonNameIndex.toString();
        newBtn.addEventListener('click', (e) => addClass(e, tempIndex));
        buttonNameArray[buttonNameIndex] = newBtn.id;
        // button
        var newDiv = document.createElement('div');
        newDiv.id = 'div' + buttonNameIndex.toString();
        var tempIndex = buttonNameIndex;
        document.getElementById('buttonDiv').appendChild(newDiv);
        buttonNameIndex += 1;
        // div
        var newBtn = document.createElement('p');
        // useless shit
    } // if

    document.body.appendChild(newBtn);
}

function addClass(event, classId) {
    var canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 120;
    canvas.padding = 10;
    document.getElementById('div' + classId.toString()).appendChild(canvas);
    var ctx = canvas.getContext('2d');
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const embedding = model.infer(video, true);
    classifier.addExample(embedding, classId);
}