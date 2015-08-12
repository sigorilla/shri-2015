var Pleer = (function () {

  var context,
  analyser,
  bufferLength,
  dataArray,
  canvas,
  gainNode,
  currSource,
  playBtn,
  stopBtn,
  fileInput,
  dropZone,
  audioBuffer,
  loading,
  level,
  loadingFlag;

  var WIDTH = 700,
      HEIGHT = 200;

  var _init = function () {
    // try {
      // Fix up for prefixing
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      context = new AudioContext();
      analyser = context.createAnalyser();
      analyser.fftSize = 256;
      bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);

      canvas = document.getElementById('analyser').getContext('2d');
      canvas.clearRect(0, 0, WIDTH, HEIGHT);

      gainNode = null;

      audioBuffer = null;
      loadingFlag = true;
      playBtn = document.getElementById('play');
      stopBtn = document.getElementById('stop');
      level = document.getElementById('level');
      fileInput = document.getElementById('file');
      dropZone = document.getElementById('dragndrop');
      loading = document.getElementById('loading');

      _addListener();

    // } catch (e) {
    //   alert('Web Audio API is not supported in this browser');
    // }
  };

  var _addListener = function () {
    playBtn.addEventListener('click', _playAudio);
    stopBtn.addEventListener('click', _stopAudio);
    dropZone.addEventListener('click', _openFileInput);
    fileInput.addEventListener('change', _handleFileInputSelect, false);
    level.addEventListener('change', _changeLevel);
    dropZone.addEventListener('dragover', _handleDragOver, false);
    dropZone.addEventListener('drop', _handleFileSelect, false);
  };

  var _openFileInput = function () {
    if (loadingFlag) {
      fileInput.click();
    }
  }

  var _handleFileInputSelect = function (event) {
    if (loadingFlag) {
      var file = event.target.files[0];
      _readFile(file);
    }
    loadingFlag = false;
  };

  var _handleFileSelect = function (event) {
    event.stopPropagation();
    event.preventDefault();
    if (loadingFlag) {
      var file = event.dataTransfer.files[0];
      _readFile(file);
    }
    loadingFlag = false;
  };

  var _readFile = function (file) {
    loading.classList.remove('hidden');
    var reader = new FileReader();

    reader.onload = function (event) {
      context.decodeAudioData(event.target.result, function (buffer) {
        audioBuffer = buffer;
        playBtn.disabled = false;
        stopBtn.disabled = false;
        loadingFlag = true;
        document.getElementById('audioTitle').innerHTML = file.name;
        loading.classList.add('hidden');
      }, function (error) {
        console.log("Error decodeAudioData: ", error);
      });
    };

    reader.readAsArrayBuffer(file);
  };

  var _handleDragOver = function (event) {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  var _playAudio = function () {
    if (!context.createGain) {
      context.createGain = context.createGainNode;
    }
    gainNode = context.createGain();
    gainNode.gain.value = 0.25;
    var source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(gainNode);
    source.connect(analyser);
    // analyser.connect(distortion);
    gainNode.connect(context.destination);
    // source.connect(context.destination);
    if (!source.start) {
      source.start = source.noteOn;
    }
    source.start(0);
    currSource = source;
    playBtn.disabled = true;
    dropZone.classList.add('hidden');
    _drawBars();
  };

  var _stopAudio = function () {
    if (!currSource.stop) {
      currSource.stop = source.noteOff;
    }
    currSource.stop(0);
    playBtn.disabled = false;
    dropZone.classList.remove('hidden');
  };

  var _changeLevel = function (event) {
    var element = this;
    var volume = element.value;
    var fraction = parseInt(element.value) / parseInt(element.max);
    gainNode.gain.value = fraction * fraction;
  };

  var _drawBars = function () {
    drawVisual = requestAnimationFrame(_drawBars);

    analyser.getByteFrequencyData(dataArray);

    canvas.fillStyle = 'rgb(0, 0, 0)';
    canvas.fillRect(0, 0, WIDTH, HEIGHT);
    var barWidth = (WIDTH / bufferLength) * 2.5;
    var barHeight;
    var x = 0;
    for (var i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i]/2;

      canvas.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
      canvas.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight);

      x += barWidth + 1;
    }
  };

  return {
    init: _init,
  }

}());

window.onload = Pleer.init;
