import * as posenet from '@tensorflow-models/posenet';
import * as tf from '@tensorflow/tfjs';
import { isMobile } from './demo_util';


var flipHorizontal = false;

//pose array

///test pose
var tpose1 = JSON.parse('{"score":0.9386816305272719,"keypoints":[{"score":0.9848313331604004,"part":"nose","position":{"x":295.5363318298577,"y":44.19707533543212}},{"score":0.9675074815750122,"part":"leftEye","position":{"x":298.9528011218119,"y":37.33239671877851}},{"score":0.9862160682678223,"part":"rightEye","position":{"x":305.3264459097895,"y":41.41201681292938}},{"score":0.7264397740364075,"part":"leftEar","position":{"x":283.0716873347063,"y":41.233262800520976}},{"score":0.8941794633865356,"part":"rightEar","position":{"x":317.2638561679231,"y":47.62448146834913}},{"score":0.9967418313026428,"part":"leftShoulder","position":{"x":279.58599301349324,"y":67.51481278118922}},{"score":0.9900349974632263,"part":"rightShoulder","position":{"x":328.2342748382212,"y":75.7140357763387}},{"score":0.9571598172187805,"part":"leftElbow","position":{"x":233.71010224457376,"y":94.00660702597773}},{"score":0.8799429535865784,"part":"rightElbow","position":{"x":348.4361723072334,"y":101.92427327196887}},{"score":0.9246518611907959,"part":"leftWrist","position":{"x":201.47079289655272,"y":93.31660476268962}},{"score":0.8142445087432861,"part":"rightWrist","position":{"x":374.0125369060828,"y":104.10652095334541}},{"score":0.9985536932945251,"part":"leftHip","position":{"x":277.02398895382413,"y":164.13964386580056}},{"score":0.9951326251029968,"part":"rightHip","position":{"x":317.4280515143843,"y":168.96295130391997}},{"score":0.9962886571884155,"part":"leftKnee","position":{"x":270.8712398068914,"y":233.98134681315742}},{"score":0.9847011566162109,"part":"rightKnee","position":{"x":317.7262543852691,"y":229.95566158072035}},{"score":0.9706465601921082,"part":"leftAnkle","position":{"x":264.74100663597017,"y":288.05512246454737}},{"score":0.8903149366378784,"part":"rightAnkle","position":{"x":320.1054187284833,"y":284.73499728547927}}]}');
var tpose2 = JSON.parse('{"score":0.9682077555095449,"keypoints":[{"score":0.9904782772064209,"part":"nose","position":{"x":300.77288414624877,"y":44.67594125948065}},{"score":0.9788007140159607,"part":"leftEye","position":{"x":296.76707434747004,"y":39.99226141903651}},{"score":0.9889763593673706,"part":"rightEye","position":{"x":308.551814869684,"y":40.441117936071265}},{"score":0.8285362720489502,"part":"leftEar","position":{"x":287.7389173099503,"y":41.66049541666351}},{"score":0.8408251404762268,"part":"rightEar","position":{"x":315.89737550015576,"y":43.83929968807948}},{"score":0.9949384927749634,"part":"leftShoulder","position":{"x":277.1646513586378,"y":73.31531714650907}},{"score":0.9964351654052734,"part":"rightShoulder","position":{"x":328.6787601871713,"y":77.78389983418387}},{"score":0.9920791983604431,"part":"leftElbow","position":{"x":249.43531698382782,"y":113.0469334821293}},{"score":0.9905784130096436,"part":"rightElbow","position":{"x":343.942343893682,"y":117.8282420236313}},{"score":0.9701544046401978,"part":"leftWrist","position":{"x":245.4500249127933,"y":147.3791937920834}},{"score":0.9830713868141174,"part":"rightWrist","position":{"x":349.34862242227393,"y":154.7525871662778}},{"score":0.9987179040908813,"part":"leftHip","position":{"x":279.21317697962894,"y":159.5396585130506}},{"score":0.9972078204154968,"part":"rightHip","position":{"x":320.5311704999278,"y":161.85923223829457}},{"score":0.997660756111145,"part":"leftKnee","position":{"x":270.2364748349913,"y":231.27871603167938}},{"score":0.9919655323028564,"part":"rightKnee","position":{"x":323.6832465680193,"y":231.1470814270732}},{"score":0.9832304120063782,"part":"leftAnkle","position":{"x":262.70607623979737,"y":287.69608007052534}},{"score":0.9358755946159363,"part":"rightAnkle","position":{"x":318.4647320105408,"y":287.8105511498359}}]}');

//
var currentpose = tpose1;
var currentposeno = 1;

var posematch = false;

////find angle 
function findAngleorg(p1, p2, center) {

  var b = Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2),
    a = Math.pow(p2.x - center.x, 2) + Math.pow(p2.y - center.y, 2),
    c = Math.pow(center.x - p1.x, 2) + Math.pow(center.y - p1.y, 2);
  let ang = Math.acos((a + b - c) / Math.sqrt(4 * a * b));
  console.log("angle==:  " + ang);
  return ang;
}
function findAngle(p0, p1, c) {
  var p0c = Math.sqrt(Math.pow(c.x - p0.x, 2) +
    Math.pow(c.y - p0.y, 2)); // p0->c (b)   
  var p1c = Math.sqrt(Math.pow(c.x - p1.x, 2) +
    Math.pow(c.y - p1.y, 2)); // p1->c (a)
  var p0p1 = Math.sqrt(Math.pow(p1.x - p0.x, 2) +
    Math.pow(p1.y - p0.y, 2)); // p0->p1 (c)
  let ang = Math.cos((p1c * p1c + p0c * p0c - p0p1 * p0p1) / (2 * p1c * p0c)) * (180 / Math.PI);
  console.log("angle==:  " + ang);
  return ang;
}
//find angle 2.0
function findAngleOld(p1, p2, center) {
  var p1c = Math.sqrt(Math.pow(p1.x - center.x, 2) + Math.pow(p1.y - center.y, 2)),
    p2c = Math.sqrt(Math.pow(p2.x - center.x, 2) + Math.pow(p2.y - center.y, 2)),
    p1p2 = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  let ang = Math.acos((p1c * p1c + p2c * p2c - p1p2 * p1p2) / Math.sqrt(2 * p1c * p2c));
  console.log("angle==:  " + ang);
  return ang;
}

///compare segments
function compareSegment(Segment1, Segment2) {

  var angle1 = findAngle(Segment1[0].position, Segment1[1].position, Segment1[2].position) - findAngle(Segment2[0].position, Segment2[1].position, Segment2[2].position);
  //  var angle2 = findAngle(Segment1[2].position, Segment1[1].position, Segment1[0].position) - findAngle(Segment2[0].position, Segment2[1].position, Segment2[2].position);
  //
  console.log("compare==:  " + angle1);

  return (angle1);
}
//margin for erro in exerise 
var errorMargin = 3;
///compare between poses
function comparePose(pose1, pose2) {

  //convert pose to 3 point traingle
  var headLeftHand = [pose1.keypoints[5], pose1.keypoints[7], pose1.keypoints[0]];
  var headLeftHand2 = [pose2.keypoints[5], pose2.keypoints[7], pose2.keypoints[0]];
  var headRightHand = [pose1.keypoints[6], pose1.keypoints[8], pose1.keypoints[0]];
  var headRightHand2 = [pose1.keypoints[6], pose1.keypoints[8], pose1.keypoints[0]];
  var leftArm = [pose1.keypoints[5], pose1.keypoints[9], pose1.keypoints[7]];
  var leftArm2 = [pose2.keypoints[5], pose2.keypoints[9], pose1.keypoints[7]];
  var rightArm = [pose1.keypoints[6], pose1.keypoints[10], pose1.keypoints[8]];
  var rightArm2 = [pose2.keypoints[6], pose2.keypoints[10], pose2.keypoints[8]];
  var leftLeg = [pose1.keypoints[11], pose1.keypoints[15], pose1.keypoints[13]];
  var leftLeg2 = [pose2.keypoints[11], pose2.keypoints[15], pose2.keypoints[13]];
  var rightLeg = [pose1.keypoints[12], pose1.keypoints[16], pose1.keypoints[14]];
  var rightLeg2 = [pose2.keypoints[12], pose2.keypoints[16], pose2.keypoints[14]];
  //compare traingls
  var headLeft = compareSegment(headLeftHand, headLeftHand2);
  var headRight = compareSegment(headRightHand, headRightHand2);

  var armLeft = compareSegment(leftArm, leftArm2);
  var armRight = compareSegment(rightArm, rightArm2);

  var legLeft = compareSegment(leftLeg, leftLeg2);
  var legRight = compareSegment(rightLeg, rightLeg2);
  console.log("hl" + headLeft + "hr" + headRight + "armLeft" + armLeft + "armRight" + armRight + "legLeft" + legLeft + "legRight" + legRight);
  //test result to variable
  let hl = (-errorMargin < headLeft) && (headLeft < errorMargin);
  let hr = (-errorMargin < headRight) && (headRight < errorMargin);
  let al = (-errorMargin < armLeft) && (armLeft < errorMargin);
  let ar = (-errorMargin < armRight) && (armRight < errorMargin);
  let ll = (-errorMargin < legLeft) && (legLeft < errorMargin);
  let lr = (-errorMargin < legRight) && (legRight < errorMargin);
  let match = hl && hr && al && ar && ll && lr;
  //var pose = { "fullmatch":headLeft <1 && headRight <1&&armLeft <1&&armRight <1&&legLeft<1&&legRight<1,"HeadLeft": headLeft < 1, "HeadRight": headRight < 1, "LeftArm": armLeft < 1, "RightArm": armRight < 1, "LeftLeg": legLeft < 1, "RightLeg": legRight < 1 };
  console.log("match : " + match)
  var pose = { "fullmatch": match, "hl": hl, "hr": hr, "HeadRight": headRight, "HeadLeft": headLeft, "LeftArm": armLeft, "RightArm": armRight, "LeftLeg": legLeft, "RightLeg": legRight, "errorMargin": errorMargin };
  //return result
  return pose;
}



var textElement = document.getElementById('text');
var imageElement1 = document.getElementById('1');
var imageElement2 = document.getElementById('2');
var textElement2 = document.getElementById('text2');
var textElement3 = document.getElementById('title');
let img = document.createElement("img");

var image = new Array(20)
image[0] = new Image();
image[0].src = 'poses/1.svg';
image[1] = new Image();
img.onload = function () { start(); };
img.src = '/poses/1.svg';



function changeimage() {
  imageElement2.src = this.src;
  textElement3.textContent = "newimage";
}

//img.src = '\poses\1.svg';
/**
 * Loads a the camera to be used in the demo
 *
 */

const videoWidth = 400;
const videoHeight = 234;
async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
      'Browser API navigator.mediaDevices.getUserMedia not available');
  }

  const video = document.getElementById('videoElement');
  video.width = videoWidth;
  video.height = videoHeight;

  const mobile = isMobile();
  const stream = await navigator.mediaDevices.getUserMedia({
    'audio': false,
    'video': {
      facingMode: 'user',
      width: mobile ? undefined : videoWidth,
      height: mobile ? undefined : videoHeight,
    },
  });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

async function loadVideo() {
  const video = await setupCamera();
  video.play();

  return video;
}
///detect pose 
function detectPoseInRealTime(video, net) {
  const flipPoseHorizontal = true;
  const canvas = document.getElementById('output');
  const ctx = canvas.getContext('2d');
  canvas.width = videoWidth;
  canvas.height = videoHeight;
  async function poseDetectionFrame() {
    let poses = [];
    let minPoseConfidence;
    let minPartConfidence;
    const pose = await net.estimatePoses(video, {
      flipHorizontal: flipPoseHorizontal,
      decodingMethod: 'single-person'
    });
    poses = poses.concat(pose);

    ctx.clearRect(0, 0, videoWidth, videoHeight);
    ctx.save();

    ctx.scale(-1, 1);
    ctx.translate(-videoWidth, 0);
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
    if (currentposeno == 1) { ctx.drawImage(imageElement1, 0, 0, 100, 200); }
    else if (currentposeno == 2) { ctx.drawImage(imageElement2, 0, 0, 100, 200); }

    ctx.scale(-1, 1);
    ctx.translate(-videoWidth, 0);


    //imgt.src='assets\man-standing2.jpg';
    if (pose[0].score >= 0.85) {
      let s = comparePose(currentpose, poses[0]);


      console.log(s);
      if (s.fullmatch) {
        console.log(s.fullmatch);


        if (currentposeno == 2) {
          currentpose = tpose1;
          currentposeno = 1;
          console.log("next pose 1");

        }
        else if (currentposeno == 1) {
          console.log("next pose 2");

          currentpose = tpose2;
          currentposeno = 2;
        }

        ctx.fillText("next pose", 10, 20, 400);

      }
      ctx.fillText(JSON.stringify(s), 10, 20, 400);

    }
    ctx.restore();
    //imageElement2.src=image[0].src;
    requestAnimationFrame(poseDetectionFrame);
  }

  poseDetectionFrame();
}

//start the demo initae posenet and the video feed
export async function start() {
  const net = await posenet.load({
    architecture: 'MobileNetV1',
    outputStride: 16,
    inputResolution: { width: videoHeight, height: videoHeight },
    multiplier: 0.75,

  });


  let video;

  try {
    video = await loadVideo();
  } catch (e) {
    let info = document.getElementById('info');
    info.textContent = 'this browser does not support video capture,' +
      'or this device does not have a camera';
    info.style.display = 'block';
    throw e;
  }
  detectPoseInRealTime(video, net);
}




start();
