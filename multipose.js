import * as posenet from '@tensorflow-models/posenet';
import * as tf from '@tensorflow/tfjs';
import { isMobile } from './demo_util';


var flipHorizontal = false;

//pose array

///test pose
var tpose1 = JSON.parse('{"score":0.42879462768049803,"keypoints":[{"score":0.4836989641189575,"part":"nose","position":{"x":377.4606114250213,"y":269.7538015165218}},{"score":0.42900940775871277,"part":"leftEye","position":{"x":370.72835413120134,"y":257.218310285635}},{"score":0.24493327736854553,"part":"rightEye","position":{"x":377.61290245204583,"y":260.6596386386263}},{"score":0.4664199650287628,"part":"leftEar","position":{"x":366.44435944909713,"y":253.54676599168593}},{"score":0.16566136479377747,"part":"rightEar","position":{"x":379.9308199752629,"y":263.284126014561}},{"score":0.7365760207176208,"part":"leftShoulder","position":{"x":323.3535011380563,"y":259.6972395010032}},{"score":0.4822319447994232,"part":"rightShoulder","position":{"x":333.0085759144349,"y":274.5031334546754}},{"score":0.5717718005180359,"part":"leftElbow","position":{"x":298.95982901131595,"y":181.58268316246657}},{"score":0.5321432948112488,"part":"rightElbow","position":{"x":295.26393418367735,"y":183.1999337162953}},{"score":0.5274068117141724,"part":"leftWrist","position":{"x":345.3929784158788,"y":175.91359357425677}},{"score":0.6557647585868835,"part":"rightWrist","position":{"x":351.0246044114406,"y":174.0669606724602}},{"score":0.3133663833141327,"part":"leftHip","position":{"x":202.87488339197773,"y":225.4041055760959}},{"score":0.18704721331596375,"part":"rightHip","position":{"x":225.17509893870073,"y":251.62571888489484}},{"score":0.3828336000442505,"part":"leftKnee","position":{"x":291.47220822345423,"y":309.668349922863}},{"score":0.41506779193878174,"part":"rightKnee","position":{"x":313.68548963969783,"y":298.9574494714403}},{"score":0.2907807230949402,"part":"leftAnkle","position":{"x":184.20730578945768,"y":226.45940224020399}},{"score":0.4047953486442566,"part":"rightAnkle","position":{"x":232.75194623776446,"y":242.31285006155764}}]}');
var tpose2 = JSON.parse('{"score":0.2522931502145879,"keypoints":[{"score":0.31941163539886475,"part":"nose","position":{"x":375.7242692880593,"y":270.40935828064204}},{"score":0.5990493893623352,"part":"leftEye","position":{"x":377.82639844129983,"y":264.9706128784655}},{"score":0.24411547183990479,"part":"rightEye","position":{"x":384.7566981927894,"y":266.7760310191589}},{"score":0.3872949779033661,"part":"leftEar","position":{"x":365.4891580663302,"y":249.73102614109618}},{"score":0.10343419760465622,"part":"rightEar","position":{"x":394.52826758952455,"y":274.06924830336516}},{"score":0.10926605015993118,"part":"leftShoulder","position":{"x":342.12872445073106,"y":250.83253912424763}},{"score":0.1563098430633545,"part":"rightShoulder","position":{"x":351.1694251628237,"y":276.12123363212856}},{"score":0.2138778120279312,"part":"leftElbow","position":{"x":185.65099266438165,"y":230.74352516738358}},{"score":0.2954263985157013,"part":"rightElbow","position":{"x":44.222740321771596,"y":182.7049878784655}},{"score":0.3656275272369385,"part":"leftWrist","position":{"x":251.1035600357946,"y":243.75655296711608}},{"score":0.37998703122138977,"part":"rightWrist","position":{"x":478.9812886872644,"y":205.50531112730272}},{"score":0.15081241726875305,"part":"leftHip","position":{"x":234.26834807043406,"y":336.9463339482764}},{"score":0.07317455112934113,"part":"rightHip","position":{"x":345.8011343989391,"y":319.67829485347767}},{"score":0.24901287257671356,"part":"leftKnee","position":{"x":227.36138892266536,"y":229.03599008048093}},{"score":0.2265343815088272,"part":"rightKnee","position":{"x":222.74956776659775,"y":234.45141090957108}},{"score":0.2662019729614258,"part":"leftAnkle","position":{"x":339.5104248996838,"y":262.85299813237174}},{"score":0.1494470238685608,"part":"rightAnkle","position":{"x":347.3034292733159,"y":261.2160940207396}}]}');

//
var currentpose=tpose1;
var currentposeno=1;

var posematch=false;

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

//convert pose to 3 point traingle
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
console.log("hl"+headLeft+"hr"+headRight+"armLeft"+armLeft+"armRight"+armRight+"legLeft"+legLeft+"legRight"+legRight);
  //test result to variable
  var pose = { "fullmatch":headLeft < 1 && headRight < 1&&armLeft < 1&&armRight < 1&&legLeft<1&&legRight<1,"HeadLeft": headLeft < 1, "HeadRight": headRight < 1, "LeftArm": armLeft < 1, "RightArm": armRight < 1, "LeftLeg": legLeft < 1, "RightLeg": legRight < 1 };
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
    if (pose[0].score>=0.75) {
      let s = JSON.stringify(comparePose(currentpose, poses[0]));
      console.log(s);
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
