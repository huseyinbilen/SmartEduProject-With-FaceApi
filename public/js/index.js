let ratio = document.getElementById('ratio');

let modelLoaded = false
let minFaceSize = 200
let maxDistance = 0.6
let minConfidence = 0.9
let forwardTimes = []
let lessonTimer = 0;

const person = document.getElementById('person').value;

function onIncreaseMinFaceSize() {
  minFaceSize = Math.min(faceapi.round(minFaceSize + 50), 300)
  $('#minFaceSize').val(minFaceSize)
}

function onDecreaseMinFaceSize() {
  minFaceSize = Math.max(faceapi.round(minFaceSize - 50), 50)
  $('#minFaceSize').val(minFaceSize)
}

function updateTimeStats(timeInMs) {
  forwardTimes = [timeInMs].concat(forwardTimes).slice(0, 30)
  const avgTimeInMs = forwardTimes.reduce((total, t) => total + t) / forwardTimes.length
  $('#time').val(`${Math.round(avgTimeInMs)} ms`)
  $('#fps').val(`${faceapi.round(1000 / avgTimeInMs)}`)
}

let count = 0;
let count2 = 0;
let result = 100;
async function onPlay(videoEl) {
  if (videoEl.paused || videoEl.ended || !modelLoaded)
    return false

  const { width, height } = faceapi.getMediaDimensions(videoEl)
  const canvas = $('#overlay').get(0)
  canvas.width = width
  canvas.height = height

  const mtcnnParams = {
    minFaceSize
  }

  const ts = Date.now()
  const fullFaceDescriptions = (await faceapi.allFacesMtcnn(videoEl, mtcnnParams))
    .map(fd => fd.forSize(width, height))
  updateTimeStats(Date.now() - ts)

  try {
    let text = null
    fullFaceDescriptions.forEach(({ detection, landmarks, descriptor }) => {
      faceapi.drawDetection('overlay', [detection], { withScore: false })
      faceapi.drawLandmarks('overlay', landmarks.forSize(width, height), { lineWidth: 4, color: 'red' })
      const bestMatch = getBestMatch(trainDescriptorsByClass, descriptor)
      text = `${bestMatch.distance < maxDistance ? bestMatch.className : 'unkown'} (${bestMatch.distance})`

      const { x, y, height: boxHeight } = detection.getBox()
      faceapi.drawText(
        canvas.getContext('2d'),
        x,
        y + boxHeight,
        text,
        Object.assign(faceapi.getDefaultDrawOptions(), { color: 'red', fontSize: 16 })
      )
    })

    // console.log(text);

    if (text != null && !text.includes(person)) {
      console.log(text);
      count++;
    }
    else if (text != null && text.includes(person)) {
      count = 0;
    }
    else {
      count++;
    }

    if (count >= 30) {
      console.warn('Ogrenci Ekrana Bakmiyor');
      count2++;
      // count = 20;
    }
    console.log(count)

  } catch (err) {
    count++;
    if (count >= 30) {
      count2++;
      alert('Kişi Tanınamıyor');
    }
    console.log(err);
  }

  setTimeout(() => {
    lessonTimer++
    onPlay(videoEl); 
    console.log('------------', lessonTimer);
    stopVideo();
  }, 1000)
}

async function run() {
  await faceapi.loadMtcnnModel('https://hpssjellis.github.io/beginner-tensorflowjs-examples-in-javascript/advanced-keras/face/muehler/models')
  await faceapi.loadFaceRecognitionModel('https://hpssjellis.github.io/beginner-tensorflowjs-examples-in-javascript/advanced-keras/face/muehler/models')

  // init reference data, e.g. compute a face descriptor for each class
  trainDescriptorsByClass = await initTrainDescriptorsByClass(faceapi.recognitionNet)

  modelLoaded = true

  alert('Lütfen Kameranın Yüzünüzü Tanıyabileceği Açıda Derse Katılın!');
  // try to access users webcam and stream the images
  // to the video element
  const videoEl = $('#inputVideo').get(0)
  navigator.getUserMedia(
    { video: {} },
    stream => videoEl.srcObject = stream,
    err => console.error(err)
  )

  $('#loader').hide()
}

$(document).ready(function () {
  // renderNavBar('#navbar', 'mtcnn_face_recognition_webcam')
  run()
})

function stopVideo() {
  // count2 = parseInt((lessonTimer-count2)*100/lessonTimer, 10);
  result = (lessonTimer-count2)/lessonTimer;
  result = parseInt(result*100);
  // alert(`Katılım Oranı: % ${result}`);
  ratio.value = result;
}

setInterval(async () => {
  let data = $("#ratio").attr('value');
  // alert(data);
  let url = $("#EventConfirmRedirection").attr('class');
  await $.post(`/courses/ratio-update/${url}`,
  {
    count: (lessonTimer-count2),
    ratio: data
  },
  function(data, status){
    // alert("Data: " + data + "\nStatus: " + status);
    count2 = 0;
    lessonTimer = 0;
  });  
}, 100);