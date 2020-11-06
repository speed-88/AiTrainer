import * as posenet from '@tensorflow-models/posenet';
import * as tf from '@tensorflow/tfjs';
import { isMobile } from './demo_util';


var flipHorizontal = false;

//pose array

///test pose
var tpose = JSON.parse('{"score":0.97213354882072,"keypoints":[{"score":0.9993090629577637,"part":"nose","position":{"x":193.77762796721106,"y":56.90047342025816}},{"score":0.99802565574646,"part":"leftEye","position":{"x":184.72327975262002,"y":47.992042066522146}},{"score":0.9976713061332703,"part":"rightEye","position":{"x":202.26343111862005,"y":47.977399269430556}},{"score":0.9319990873336792,"part":"leftEar","position":{"x":168.72797301771112,"y":51.74844645340619}},{"score":0.7573493719100952,"part":"rightEar","position":{"x":213.9524927399038,"y":51.71345365650459}},{"score":0.9971332550048828,"part":"leftShoulder","position":{"x":143.87734676613417,"y":107.1624087916274}},{"score":0.9989559650421143,"part":"rightShoulder","position":{"x":231.67268015345712,"y":114.46204723551115}},{"score":0.9971444010734558,"part":"leftElbow","position":{"x":126.69820448582277,"y":174.0456221168607}},{"score":0.9917954802513123,"part":"rightElbow","position":{"x":246.48250045479503,"y":183.79920929786297}},{"score":0.983135461807251,"part":"leftWrist","position":{"x":144.80948879375535,"y":229.98857312629195}},{"score":0.9847016334533691,"part":"rightWrist","position":{"x":226.34154581745312,"y":229.22740001158954}},{"score":0.993244469165802,"part":"leftHip","position":{"x":152.3417924814187,"y":240.27131967507447}},{"score":0.9938841462135315,"part":"rightHip","position":{"x":206.75127393076858,"y":241.49166656375394}},{"score":0.992429792881012,"part":"leftKnee","position":{"x":143.40989257575012,"y":345.4041833543592}},{"score":0.9924444556236267,"part":"rightKnee","position":{"x":203.08142389675987,"y":345.3902901378587}},{"score":0.9711503982543945,"part":"leftAnkle","position":{"x":141.60533795189764,"y":442.3333550241671}},{"score":0.9458963871002197,"part":"rightAnkle","position":{"x":200.75194632682354,"y":449.7338083467595}}]}');

//

////find angle 
function findAngle(p1, p2, center) {

  var b = Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2),
    a = Math.pow(p2.x - center.x, 2) + Math.pow(p2.y - center.y, 2),
    c = Math.pow(center.x - p1.x, 2) + Math.pow(center.y - p1.y, 2);
  return Math.acos((a + b - c) / Math.sqrt(4 * a * b));
}
///compare segments
function compareSegment(Segment1, Segment2) {

  var angle1 = findAngle(Segment1[0].position, Segment1[1].position, Segment1[2].position) - findAngle(Segment2[0].position, Segment2[1].position, Segment2[2].position);
  var angle2 = findAngle(Segment1[2].position, Segment1[1].position, Segment1[0].position) - findAngle(Segment2[0].position, Segment2[1].position, Segment2[2].position);

  return (angle1 + angle2);
}

///compare between poses
function comparePose(pose1, pose2) {

//convet pose to 3 point traingle
  var headLeftHand = [pose1.keypoints[0], pose1.keypoints[7], pose1.keypoints[9]];
  var headLeftHand2 = [pose2.keypoints[0], pose2.keypoints[7], pose2.keypoints[9]];
  var headRightHand = [pose1.keypoints[0], pose1.keypoints[8], pose1.keypoints[10]];
  var headRightHand2 = [pose2.keypoints[0], pose2.keypoints[8], pose2.keypoints[10]];
  var leftArm = [pose1.keypoints[5], pose1.keypoints[7], pose1.keypoints[9]];
  var leftArm2 = [pose2.keypoints[5], pose2.keypoints[7], pose2.keypoints[9]];
  var rightArm = [pose1.keypoints[6], pose1.keypoints[8], pose1.keypoints[10]];
  var rightArm2 = [pose2.keypoints[6], pose2.keypoints[8], pose2.keypoints[10]];
  var leftLeg = [pose1.keypoints[11], pose1.keypoints[13], pose1.keypoints[15]];
  var leftLeg2 = [pose2.keypoints[11], pose2.keypoints[13], pose2.keypoints[15]];
  var rightLeg = [pose1.keypoints[12], pose1.keypoints[14], pose1.keypoints[16]];
  var rightLeg2 = [pose2.keypoints[12], pose2.keypoints[14], pose2.keypoints[16]];
//compare traingls
  var headLeft = compareSegment(headLeftHand, headLeftHand2);
  var headRight = compareSegment(headRightHand, headRightHand2);

  var armLeft = compareSegment(leftArm, leftArm2);
  var armRight = compareSegment(rightArm, rightArm2);

  var legLeft = compareSegment(leftLeg, leftLeg2);
  var legRight = compareSegment(rightLeg, rightLeg2);

  //test result to variable
  var pose = { "HeadLeft": headLeft < 1, "HeadRight": headRight < 1, "LeftArm": armLeft < 1, "RightArm": armRight < 1, "LeftLeg": legLeft < 1, "RightLeg": legRight < 1 };
  //return result
  return pose;
}


var imageElement = document.getElementById('man-standing');
var textElement = document.getElementById('text');
var imageElement2 = document.getElementById('imgt');
var textElement2 = document.getElementById('text2');
var textElement3 = document.getElementById('title');
let img = document.createElement("img");

var image = new Array(20)
image[0] = new Image();
image[0].src='poses/1.svg';
image[1] = new Image();
img.onload = function() { start();};
img.src='/poses/1.svg';



function changeimage() {
  imageElement2.src=this.src;
  textElement3.textContent="shit";
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
    ctx.drawImage(imageElement2,0, 0,100,200 );
    ctx.scale(-1, 1);
    ctx.translate(-videoWidth, 0);

   
    //imgt.src='assets\man-standing2.jpg';
    if (pose[0].score>=0.15) {
      let s = JSON.stringify(comparePose(tpose, poses[0]));
      ctx.fillText(JSON.stringify(s), 10, 20,400);
    
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

// var ASSET_MANAGER= new AssetManager();
// ASSET_MANAGER.downloadAll(function() {
//   start();
// });


start();
