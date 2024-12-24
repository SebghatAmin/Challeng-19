const video = document.querySelector(".player");
const canvas = document.querySelector(".photo");
const ctx = canvas.getContext("2d");
const strip = document.querySelector(".strip");
const snap = document.querySelector(".snap");

function getVideo() {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then((localMediaStream) => {
      video.srcObject = localMediaStream; // Updated to srcObject
      video.play();
    })
    .catch((err) => {
      console.error("Error accessing the camera:", err);
    });
}

function paintToCanvas() {
  const width = video.videoWidth;
  const height = video.videoHeight;
  canvas.width = width;
  canvas.height = height;

  return setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height);
    let pixels = ctx.getImageData(0, 0, width, height);

    // Apply effects (uncomment the one you want)
    // pixels = redEffect(pixels);
    // pixels = rgbSplit(pixels);
    // pixels = greenScreen(pixels);

    ctx.putImageData(pixels, 0, 0);
  }, 16);
}

function takePhoto() {
  // Play the snap sound
  snap.currentTime = 0;
  snap.play();

  // Capture the photo
  const data = canvas.toDataURL("image/jpeg");
  const link = document.createElement("a");
  link.href = data;
  link.setAttribute("download", "handsome");
  link.innerHTML = `<img src="${data}" alt="Captured Photo"/>`;
  strip.insertBefore(link, strip.firstChild); // Fixed typo
}

function redEffect(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i + 0] += 100; // Red
    pixels.data[i + 1] -= 50; // Green
    pixels.data[i + 2] *= 0.5; // Blue
  }
  return pixels;
}

function rgbSplit(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i + 150] = pixels.data[i + 0]; // Red
    pixels.data[i + 100] = pixels.data[i + 1]; // Green
    pixels.data[i + 150] = pixels.data[i + 2]; // Blue
  }
  return pixels;
}

function greenScreen(pixels) {
  const levels = {};

  document.querySelectorAll(".rgb input").forEach((input) => {
    levels[input.name] = input.value;
  });

  for (let i = 0; i < pixels.data.length; i += 4) {
    const red = pixels.data[i + 0];
    const green = pixels.data[i + 1];
    const blue = pixels.data[i + 2];

    if (
      red >= levels.rmin &&
      green >= levels.gmin &&
      blue >= levels.bmin &&
      red <= levels.rmax &&
      green <= levels.gmax &&
      blue <= levels.bmax
    ) {
      pixels.data[i + 3] = 0; // Make pixel transparent
    }
  }

  return pixels;
}

// Start video stream
getVideo();

// Start painting to canvas when the video is ready
video.addEventListener("canplay", paintToCanvas);
