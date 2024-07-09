// CONTRIBUTION FROM HANNAH - SNIC

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
  // canvas.width = video.width;
  // canvas.height = video.height;
  const history = [];

  async function frameLandmarks() {
    const predictions = await model.estimateHands(video);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (predictions.length > 0) {
      for (let i = 0; i < predictions.length; i++) {
        const landmarks = predictions[i].landmarks;
        history.push(landmarks[8]);

        if (history.length > 20) {
          history.shift();
        }
        // Draw the tail
        // Start the path for the tail
        ctx.beginPath();

        // Check if history has points
        if (history.length > 0) {
          // Move to the first point in the history
          ctx.moveTo(history[0][0], history[0][1]);

          for (let j = 1; j < history.length; j++) {
            const [x, y, z] = history[j];
            // Draw a line to the next point
            ctx.lineTo(x, y);
          }

          // Set the style of the tail
          ctx.strokeStyle = "rgba(0, 255, 255, 0.5)"; // Semi-transparent cyan
          ctx.lineWidth = 15; // Adjust as needed
          ctx.stroke(); // Apply the line drawing
        }
        // Draw only the tip of the pointer finger
        const [x, y, z] = landmarks[8]; // Index 8 for the tip of the pointer finger
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, 3 * Math.PI);
        ctx.fillStyle = "aqua";
        ctx.fill();
      }
    }
    // full hand
    // if (predictions.length > 0) {
    //   for (let i = 0; i < predictions.length; i++) {
    //     const landmarks = predictions[i].landmarks;

    //     // Draw landmarks
    //     for (let j = 0; j < landmarks.length; j++) {
    //       const [x, y, z] = landmarks[j];
    //       ctx.beginPath();
    //       ctx.arc(x, y, 5, 0, 3 * Math.PI);
    //       ctx.fillStyle = "aqua";
    //       ctx.fill();
    //     }
    //   }
    // }
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
