const CAMERA_ROLL_PARAMETER=['CameraRoll','画面旋转',-180,180,1,0];
const wrapAngle=a=>((a+Math.PI)%TAU+TAU)%TAU-Math.PI;
