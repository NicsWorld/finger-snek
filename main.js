async function setupCamera() {
  const video = document.getElementById("video");
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

async function loadModel() {
  const model = await handpose.load();
  return model;
}

async function detectHands(model, video, canvas) {
  console.log("detecting hands");
  const ctx = canvas.getContext("2d");
  canvas.width = video.width;
  canvas.height = video.height;

  async function frameLandmarks() {
    console.log("frameLandmarks");
    const predictions = await model.estimateHands(video);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (predictions.length > 0) {
      for (let i = 0; i < predictions.length; i++) {
        const landmarks = predictions[i].landmarks;
        console.log(landmarks);
        // Draw landmarks
        for (let j = 0; j < landmarks.length; j++) {
          const [x, y, z] = landmarks[j];
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 3 * Math.PI);
          ctx.fillStyle = "aqua";
          ctx.fill();
        }
      }
    }
    requestAnimationFrame(frameLandmarks);
  }

  frameLandmarks();
}

async function main() {
  const video = await setupCamera();
  video.play();

  const model = await loadModel();
  const canvas = document.getElementById("canvas");

  detectHands(model, video, canvas);
}

main();
