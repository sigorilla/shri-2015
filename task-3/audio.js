var Pleer = (function () {

    var context;
    var audioBuffer;
    var gainNode;
    var currSource;
    var startTime = 0;
    var startOffset = 0;

    var analyser;
    var bufferLength;
    var dataArray;

    var canvasDiv;
    var canvas;
    var canvasWidth;
    var canvasHeight;
    var drawVisual;

    var playBtn;
    var pauseBtn;
    var stopBtn;
    var level;

    var fileInput;
    var dropZone;

    var loading;
    var loadingFlag;

    var _init = function () {
        try {
            window.AudioContext = window.AudioContext || 
                window.webkitAudioContext;
            context = new AudioContext();
            analyser = context.createAnalyser();
            analyser.fftSize = 4096;
            bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);

            canvasDiv = document.getElementById('analyser');
            canvasWidth = document.querySelector('body').offsetWidth;
            canvasHeight = 200;
            canvas = canvasDiv.getContext('2d');
            canvas.clearRect(0, 0, canvasWidth, canvasHeight);
            drawVisual = null;

            if (!context.createGain) {
                context.createGain = context.createGainNode;
            }
            gainNode = context.createGain();
            gainNode.gain.value = 0.25;

            audioBuffer = null;
            loadingFlag = true;
            playBtn = document.getElementById('play');
            pauseBtn = document.getElementById('pause');
            stopBtn = document.getElementById('stop');
            level = document.getElementById('level');
            fileInput = document.getElementById('file');
            dropZone = document.getElementById('dragndrop');
            loading = document.getElementById('loading');

            _addListener();

        } catch (e) {
            console.log(e);
            alert('Web Audio API is not supported in this browser');
        }
    };

    var _addListener = function () {
        playBtn.addEventListener('click', _playAudio);
        pauseBtn.addEventListener('click', _pauseAudio);
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
                loadingFlag = true;
                document.getElementById('audioTitle').innerHTML = file.name;
                loading.classList.add('hidden');
                _playAudio();
            }, function (error) {
                console.log('Error decodeAudioData:', error);
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
        startTime = context.currentTime;
        var source = context.createBufferSource();
        source.onended = _endAudio;
        source.buffer = audioBuffer;
        source.connect(gainNode);
        source.connect(analyser);
        gainNode.connect(context.destination);
        source.start(0, startOffset % audioBuffer.duration);
        currSource = source;
        playBtn.disabled = true;
        pauseBtn.disabled = false;
        stopBtn.disabled = false;
        dropZone.classList.add('hidden');
        _drawBars();
    };

    var _pauseAudio = function () {
        currSource.stop();
        startOffset += context.currentTime - startTime;
        playBtn.disabled = false;
        dropZone.classList.remove('hidden');
        cancelAnimationFrame(drawVisual);
    };

    var _stopAudio = function () {
        currSource.stop(0);
        startOffset = 0;
        playBtn.disabled = false;
        pauseBtn.disabled = true;
        dropZone.classList.remove('hidden');
        cancelAnimationFrame(drawVisual);
    };

    var _endAudio = function () {
        playBtn.disabled = false;
        dropZone.classList.remove('hidden');
    }

    var _changeLevel = function (event) {
        var fraction = parseInt(this.value) / parseInt(this.max);
        gainNode.gain.value = fraction * fraction;
    };

    var _drawBars = function () {
        drawVisual = requestAnimationFrame(_drawBars);

        analyser.getByteFrequencyData(dataArray);

        canvas.fillStyle = 'rgb(255, 255, 255)';
        canvas.fillRect(0, 0, canvasWidth, canvasHeight);
        var barWidth = Math.round(canvasWidth / bufferLength);
        var barHeight;
        var x = 0;
        for (var i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i];

            canvas.fillStyle = 'rgb(' + (barHeight + 100) + ', 150, 50)';
            canvas.fillRect(
                x, 
                canvasHeight - barHeight / 2, 
                barWidth, 
                barHeight
            );

            x += barWidth + 1;
        }
    };

    return {
        init: _init,
    }

}());

window.onload = Pleer.init;
