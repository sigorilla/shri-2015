var Pleer = (function () {

  var context,
  dropZone,
  audioBuffer;

  var _init = function () {
    try {
      // Fix up for prefixing
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      context = new AudioContext();

      audioBuffer = null;
      dropZone = document.getElementById('dragndrop');

      _addListener();

    } catch (e) {
      alert('Web Audio API is not supported in this browser');
    }
  };

  var _addListener = function () {
    document.getElementById('play').addEventListener('click', _playAudio);
    dropZone.addEventListener('dragover', _handleDragOver, false);
    dropZone.addEventListener('drop', _handleFileSelect, false);
  };

  var _handleFileSelect = function (event) {
    event.stopPropagation();
    event.preventDefault();
    var file = event.dataTransfer.files[0];

    var reader = new FileReader();

    reader.onload = function (event) {
      context.decodeAudioData(event.target.result, function (buffer) {
        audioBuffer = buffer;
        document.getElementById('play').disabled = false;
        document.getElementById('stop').disabled = false;
        document.getElementById('audioTitle').innerHTML = file.name;
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
    var source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(context.destination);
    source.start(0);
  };

  return {
    init: _init,
  }

}());

window.onload = Pleer.init;
