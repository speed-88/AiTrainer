import * as posenet from '@tensorflow-models/posenet';
import * as tf from '@tensorflow/tfjs';
import { isMobile } from './demo_util';

var flipHorizontal = false;
////find angle 
function findAngle(p1, p2, center) {

  var b = Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2),
    a = Math.pow(p2.x - center.x, 2) + Math.pow(p2.y - center.y, 2),
    c = Math.pow(center.x - p1.x, 2) + Math.pow(center.y - p1.y, 2);
  return Math.acos((a + b - c) / Math.sqrt(4 * a * b));
}
///compare segments
function compareSegment(Segment1, Segment2) {
//turn lines int angles
  var angle1 = findAngle(Segment1[0].position, Segment1[1].position, Segment1[2].position) - findAngle(Segment2[0].position, Segment2[1].position, Segment2[2].position);
  var angle2 = findAngle(Segment1[2].position, Segment1[1].position, Segment1[0].position) - findAngle(Segment2[0].position, Segment2[1].position, Segment2[2].position);

  return (angle1 + angle2);
}

///compare between poses
function comparePose(pose1, pose2) {

//generate lines from poses
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
  ///compare petween lines
  var headLeft = compareSegment(headLeftHand, headLeftHand2);
  var headRight = compareSegment(headRightHand, headRightHand2);

  var armLeft = compareSegment(leftArm, leftArm2);
  var armRight = compareSegment(rightArm, rightArm2);

  var legLeft = compareSegment(leftLeg, leftLeg2);
  var legRight = compareSegment(rightLeg, rightLeg2);
  //result into array
  var pose = { "HeadLeft": headLeft < 1, "HeadRight": headRight < 1, "LeftArm": armLeft < 1, "RightArm": armRight < 1, "LeftLeg": legLeft < 1, "RightLeg": legRight < 1 };
 //return result
  return pose;
}

var imageElement = document.getElementById('man-standing');
var textElement = document.getElementById('text');
var imageElement2 = document.getElementById('second');
var textElement2 = document.getElementById('text2');
var textElement3 = document.getElementById('title');

var tpose, pose1, pose2 = '{"score":0.9727624093785006,"keypoints":[{"score":0.999312162399292,"part":"nose","position":{"x":199.81909206405223,"y":57.96974033697106}},{"score":0.9980493783950806,"part":"leftEye","position":{"x":190.57564924663143,"y":49.039355808658826}},{"score":0.9977167844772339,"part":"rightEye","position":{"x":208.53491430616563,"y":49.074580456032365}},{"score":0.9424852728843689,"part":"leftEar","position":{"x":174.05241539506133,"y":52.4384922368981}},{"score":0.7549771070480347,"part":"rightEar","position":{"x":220.5380645336344,"y":52.645635790398146}},{"score":0.9970208406448364,"part":"leftShoulder","position":{"x":148.50685594610667,"y":109.89606864721395}},{"score":0.9988738894462585,"part":"rightShoulder","position":{"x":239.26034682455693,"y":117.39858219131885}},{"score":0.997319757938385,"part":"leftElbow","position":{"x":130.237892239938,"y":179.3170146719491}},{"score":0.9902004599571228,"part":"rightElbow","position":{"x":253.99424808962337,"y":188.1214183406607}},{"score":0.9820618629455566,"part":"leftWrist","position":{"x":149.7196295474754,"y":238.44207451965093}},{"score":0.9840139746665955,"part":"rightWrist","position":{"x":237.55748585504315,"y":241.15822506322007}},{"score":0.9939530491828918,"part":"leftHip","position":{"x":157.24752196078168,"y":247.65724894601547}},{"score":0.9943403005599976,"part":"rightHip","position":{"x":213.13432982923456,"y":248.28048364661547}},{"score":0.9923175573348999,"part":"leftKnee","position":{"x":147.59440915593842,"y":355.9776261622804}},{"score":0.9918895363807678,"part":"rightKnee","position":{"x":208.9780049008618,"y":355.66730068815355}},{"score":0.9728723168373108,"part":"leftAnkle","position":{"x":145.88237510117114,"y":454.6295409443777}},{"score":0.9495567083358765,"part":"rightAnkle","position":{"x":206.96353422528574,"y":461.79249744934793}}]}';
posenet.load().then(function (net) {
  const pose = net.estimateSinglePose(imageElement, {
    flipHorizontal: true,
    decodingMethod: 'single-person'
  });
  return pose;
}).then(function (pose) {
  let json = JSON.stringify(pose);
  textElement.textContent = json;
  pose1 = pose;
  console.log(pose);

});
posenet.load().then(function (net) {
  const pose = net.estimateSinglePose(imageElement2, {
    flipHorizontal: true,
    decodingMethod: 'single-person'
  });
  return pose;
}).then(function (pose) {
  let json = JSON.stringify(pose);
  textElement2.textContent = json;
  pose2 = pose;

  console.log(pose);
  alert(JSON.stringify(comparePose(pose1, pose2)));
  textElement3.textContent = JSON.stringify(comparePose(pose1, pose2));
})
  //var cPose=comparePose(pose1,pose2);


//alert(JSON.stringify(cPose));