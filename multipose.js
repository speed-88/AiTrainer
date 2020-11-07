import * as posenet from '@tensorflow-models/posenet';
import * as tf from '@tensorflow/tfjs';
import { isMobile } from './demo_util';


var flipHorizontal = false;

//pose array

///test pose
var tpose1 = JSON.parse('{"score":0.9318080614594852,"keypoints":[{"score":0.992267906665802,"part":"nose","position":{"x":296.32710289862365,"y":43.008438763451494}},{"score":0.9845361113548279,"part":"leftEye","position":{"x":293.12815720376335,"y":37.08043902207905}},{"score":0.9858882427215576,"part":"rightEye","position":{"x":303.4111963116241,"y":40.74850918068498}},{"score":0.8445159196853638,"part":"leftEar","position":{"x":280.6887049099814,"y":39.81106312080118}},{"score":0.8684641718864441,"part":"rightEar","position":{"x":313.0609512922829,"y":41.71525098748708}},{"score":0.9980620741844177,"part":"leftShoulder","position":{"x":270.58484801058637,"y":72.29985019668996}},{"score":0.9981661438941956,"part":"rightShoulder","position":{"x":329.93653258089887,"y":78.57520614802144}},{"score":0.9847804307937622,"part":"leftElbow","position":{"x":245.14946696359357,"y":116.85452418939613}},{"score":0.9716399908065796,"part":"rightElbow","position":{"x":349.5871811506813,"y":116.06887363181505}},{"score":0.7453163266181946,"part":"leftWrist","position":{"x":196.74097493093763,"y":95.34505869349618}},{"score":0.7180130481719971,"part":"rightWrist","position":{"x":368.3799210782181,"y":123.26665309802104}},{"score":0.9996036291122437,"part":"leftHip","position":{"x":278.99008683379054,"y":173.70846979163503}},{"score":0.9987923502922058,"part":"rightHip","position":{"x":315.1328314398977,"y":173.84866831738663}},{"score":0.9979863166809082,"part":"leftKnee","position":{"x":268.2820096145808,"y":254.941936329645}},{"score":0.9956484436988831,"part":"rightKnee","position":{"x":316.7260419199903,"y":255.30658095541634}},{"score":0.8795462250709534,"part":"leftAnkle","position":{"x":265.8295880625684,"y":300.6411605419352}},{"score":0.8775097131729126,"part":"rightAnkle","position":{"x":327.9534317491583,"y":308.5908344432074}}]}');
var tpose2 = JSON.parse('{"score":0.9663131096783806,"keypoints":[{"score":0.9926441311836243,"part":"nose","position":{"x":299.4824082786471,"y":46.4631959195267}},{"score":0.9867580533027649,"part":"leftEye","position":{"x":294.7039186945221,"y":40.284005666057425}},{"score":0.988735020160675,"part":"rightEye","position":{"x":300.84717616218535,"y":40.335549766451464}},{"score":0.8914805054664612,"part":"leftEar","position":{"x":282.7686672581773,"y":42.73184195195657}},{"score":0.8008067607879639,"part":"rightEar","position":{"x":312.2041131401804,"y":44.720901845494154}},{"score":0.9981275200843811,"part":"leftShoulder","position":{"x":271.3707305076985,"y":80.99226584230416}},{"score":0.9981665015220642,"part":"rightShoulder","position":{"x":326.5236851139291,"y":81.48804551061491}},{"score":0.9942821264266968,"part":"leftElbow","position":{"x":255.11480243846137,"y":126.77525590829816}},{"score":0.9932594895362854,"part":"rightElbow","position":{"x":342.73076314963254,"y":124.95891959936239}},{"score":0.9602786302566528,"part":"leftWrist","position":{"x":250.9882056685273,"y":162.14808616192892}},{"score":0.9529159069061279,"part":"rightWrist","position":{"x":344.94159291783194,"y":161.35597698048394}},{"score":0.9993507266044617,"part":"leftHip","position":{"x":280.93188458750683,"y":174.73774606430112}},{"score":0.998979926109314,"part":"rightHip","position":{"x":316.42648309492415,"y":175.09939331767163}},{"score":0.998621940612793,"part":"leftKnee","position":{"x":265.5761316796685,"y":241.41154753094986}},{"score":0.9938617944717407,"part":"rightKnee","position":{"x":320.5119373603553,"y":241.78889530642027}},{"score":0.9271617531776428,"part":"leftAnkle","position":{"x":262.7514650218681,"y":294.7576753490166}},{"score":0.951892077922821,"part":"rightAnkle","position":{"x":328.855355377791,"y":299.975815234945}}]}');

//
var currentpose=tpose1;
var currentposeno=1;

var posematch=false;

////find angle 
function findAngleorg(p1, p2, center) {

  var b = Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2),
    a = Math.pow(p2.x - center.x, 2) + Math.pow(p2.y - center.y, 2),
    c = Math.pow(center.x - p1.x, 2) + Math.pow(center.y - p1.y, 2);
    let ang=Math.acos((a + b - c) / Math.sqrt(4 * a * b));
    console.log("angle==:  "+ang);
  return ang;
}
function findAngle(p0,p1,c) {
  var p0c = Math.sqrt(Math.pow(c.x-p0.x,2)+
                      Math.pow(c.y-p0.y,2)); // p0->c (b)   
  var p1c = Math.sqrt(Math.pow(c.x-p1.x,2)+
                      Math.pow(c.y-p1.y,2)); // p1->c (a)
  var p0p1 = Math.sqrt(Math.pow(p1.x-p0.x,2)+
                       Math.pow(p1.y-p0.y,2)); // p0->p1 (c)
                       let ang=Math.cos((p1c*p1c+p0c*p0c-p0p1*p0p1)/(2*p1c*p0c)) * (180 / Math.PI);
                       console.log("angle==:  "+ang);
                       return ang;
}
//find angle 2.0
function findAngleOld(p1, p2, center)
{
  var p1c = Math.sqrt(Math.pow(p1.x - center.x, 2) + Math.pow(p1.y - center.y, 2)),
  p2c = Math.sqrt(Math.pow(p2.x - center.x, 2) + Math.pow(p2.y - center.y, 2)),
  p1p2 =Math.sqrt( Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  let ang=Math.acos((p1c*p1c + p2c*p2c - p1p2*p1p2) / Math.sqrt(2 * p1c * p2c));
 console.log("angle==:  "+ang );
return ang;
}

///compare segments
function compareSegment(Segment1, Segment2) {

   var angle1 = findAngle(Segment1[0].position, Segment1[1].position, Segment1[2].position) - findAngle(Segment2[0].position, Segment2[1].position, Segment2[2].position);
  //  var angle2 = findAngle(Segment1[2].position, Segment1[1].position, Segment1[0].position) - findAngle(Segment2[0].position, Segment2[1].position, Segment2[2].position);
  //
   console.log("compare==:  "+angle1 );

  return (angle1);
}
//margin for erro in exerise 
var errorMargin=3;
///compare between poses
function comparePose(pose1, pose2) {

//convert pose to 3 point traingle
  var headLeftHand = [ pose1.keypoints[5], pose1.keypoints[7],pose1.keypoints[0]];
  var headLeftHand2 = [ pose2.keypoints[5], pose2.keypoints[7],pose2.keypoints[0]];
  var headRightHand = [ pose1.keypoints[6], pose1.keypoints[8],pose1.keypoints[0]];
  var headRightHand2 = [ pose1.keypoints[6], pose1.keypoints[8],pose1.keypoints[0]];
  var leftArm = [pose1.keypoints[5], pose1.keypoints[9], pose1.keypoints[7]];
  var leftArm2 = [pose2.keypoints[5],  pose2.keypoints[9], pose1.keypoints[7]];
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
console.log("hl"+headLeft+"hr"+headRight+"armLeft"+armLeft+"armRight"+armRight+"legLeft"+legLeft+"legRight"+legRight);
  //test result to variable
let hl=(-errorMargin<headLeft)&&( headLeft<errorMargin);
let hr=(-errorMargin<headRight)&& (headRight <errorMargin);
let al=(-errorMargin<armLeft)&&(armLeft<errorMargin);
let ar=(-errorMargin<armRight)&&(armRight<errorMargin);
let ll=(-errorMargin<legLeft)&&(legLeft  <errorMargin);
let lr=(-errorMargin<legRight)&& (legRight <errorMargin);
let t=false;
  //var pose = { "fullmatch":headLeft <1 && headRight <1&&armLeft <1&&armRight <1&&legLeft<1&&legRight<1,"HeadLeft": headLeft < 1, "HeadRight": headRight < 1, "LeftArm": armLeft < 1, "RightArm": armRight < 1, "LeftLeg": legLeft < 1, "RightLeg": legRight < 1 };
  var pose = { "fullmatch":hl==hr==al==ar==ll==lr ,"hl":hl ,"HeadRight": headRight ,"HeadLeft": headLeft , "LeftArm": armLeft , "RightArm": armRight , "LeftLeg": legLeft , "RightLeg": legRight ,"errorMargin":errorMargin };
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
      let s = comparePose(currentpose, poses[0]);


      console.log(s);
      if (s.fullmatch){
        console.log(s.fullmatch);  
        

        if(currentposeno==2)
        {currentpose=tpose1;
        currentposeno=1;
        console.log("next pose 1");  
      
      }
        else if(currentposeno==1)
        
          {
        console.log("next pose 2");  

            currentpose=tpose2;
            currentposeno=2;}
        
      ctx.fillText("next pose", 10, 20,400);

      }
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
