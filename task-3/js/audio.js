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
    var stopBtn;
    var volumeRange;
    var presetSelect;

    var fileInput;
    var dropZone;

    var loading;

    var loadingFlag;
    var pauseFlag = false;

    var filters;
    var frequencies = [31, 63, 87, 125, 175, 250, 350, 500, 700, 1000, 1400, 2000, 2800, 4000, 5600, 8000, 11200, 16000];
    var presets = {
      'normal': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      'classic': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -3, -6, -6, -6, -8.4],
      'rock': [5.4, 4.5, 3.6, -3.9, -6.3, -6.9, -3.6, -2.7, -0.3, 2.1, 4.5, 6, 6.9, 7.5, 7.8, 7.8, 7.8, 8.1],
      'jazz': [3, 6, 5.1, 3.6, 1.8, -3.9, -5.1, -5.1, -2.1, 1.2, 4.5, 9, 3, -1.8, -4.5, -2.4, -0.6, 2.4],
      'pop': [-1.8, 0.6, 3.9, 5.4, 5.4, 4.5, 2.1, 0.9, -0.6, -1.5, -1.5, -1.8, -2.1, -2.1, -2.7, -2.1, -2.1, -0.3],
      'reggae': [0, 0, 0, 0, 0, -0.3, -1.2, -2.7, -2.7, 0, 0.9, 2.1, 3.9, 4.2, 4.2, 2.7, 0.6, 0],
      'vocal': [-4.8, -4.5, -3.9, -2.1, -0.3, 1.2, 1.8, 3.6, 6.6, 9, 6.9, 4.5, 2.4, 0.3, -0.9, -2.1, -2.7, -3],
    }

    var _init = function () {
        try {
            window.AudioContext = window.AudioContext || 
                window.webkitAudioContext;
            context = new AudioContext();
        } catch (e) {
            console.log(e);
            alert('Web Audio API is not supported in this browser');
        }
        analyser = context.createAnalyser();
        analyser.fftSize = 512;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        canvasDiv = document.getElementById('analyser');
        canvasWidth = canvasDiv.offsetWidth;
        canvasHeight = canvasDiv.offsetHeight;
        canvas = canvasDiv.getContext('2d');
        canvas.clearRect(0, 0, canvasWidth, canvasHeight);
        drawVisual = null;

        if (!context.createGain) {
            context.createGain = context.createGainNode;
        }
        gainNode = context.createGain();
        gainNode.gain.value = 0.16;

        filters = _createFilters();

        audioBuffer = null;
        loadingFlag = true;
        playBtn = document.getElementById('play');
        stopBtn = document.getElementById('stop');
        volumeRange = document.getElementById('volume');
        presetSelect = document.getElementById('equalaizer');
        fileInput = document.getElementById('file');
        dropZone = document.getElementById('dragndrop');
        loading = document.getElementById('loading');

        Object.keys(presets).forEach(function (item, i) {
            var choise = document.createElement('input');
            var label_choise = document.createElement('label');
            choise.setAttribute('type', 'radio');
            choise.setAttribute('id', item);
            choise.setAttribute('value', item);
            choise.setAttribute('name', 'eq_choise');
            if (i == 0) {
                choise.checked = true;
            }
            choise.onchange = _changePreset;
            label_choise.innerHTML = item.charAt(0).toUpperCase() + item.slice(1);
            label_choise.setAttribute('for', item);
            presetSelect.appendChild(choise);
            presetSelect.appendChild(label_choise);
        });

        _addListener();
    };

    var _addListener = function () {
        playBtn.addEventListener('click', _playAudio);
        stopBtn.addEventListener('click', _stopAudio);
        dropZone.addEventListener('click', _openFileInput);
        fileInput.addEventListener('change', _handleFileInputSelect, false);
        volumeRange.addEventListener('change', _changeLevel);
        dropZone.addEventListener('dragenter', _handleDragEnter, false);
        dropZone.addEventListener('dragleave', _handleDragLeave, false);
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
            if (/audio\/(.*)/g.test(file.type)) {
                _readFile(file);
                loadingFlag = false;
            } else {
                loadingFlag = true;
                console.log('It\'s not audio file.');
            }
        }
    };

    var _handleFileSelect = function (event) {
        event.stopPropagation();
        event.preventDefault();
        if (loadingFlag) {
            var file = event.dataTransfer.files[0];
            if (/audio\/(.*)/g.test(file.type)) {
                _readFile(file);
                loadingFlag = false;
            } else {
                loadingFlag = true;
                console.log('It\'s not audio file.');
            }
        }
    };

    var _readFile = function (file) {
        loading.classList.remove('hidden');
        var reader = new FileReader();

        reader.onload = function (event) {
            context.decodeAudioData(event.target.result, function (buffer) {
                audioBuffer = buffer;
                playBtn.disabled = false;
                loadingFlag = true;
                var filename = file.name.substr(0, file.name.lastIndexOf('.'));
                document.getElementById('audioTitle').innerHTML = filename;
                loading.classList.add('hidden');
                _playAudio();
            }, function (error) {
                console.log('Error decodeAudioData:', error);
            });
        };

        reader.readAsArrayBuffer(file);
    };

    var _handleDragEnter = function (event) {
        dropZone.classList.add('drag-in');
    };

    var _handleDragLeave = function (event) {
        dropZone.classList.remove('drag-in');
    };

    var _handleDragOver = function (event) {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    };

    var _playAudio = function () {
        if (!pauseFlag) {
            startTime = context.currentTime;
            var source = context.createBufferSource();

            source.onended = _endAudio;
            source.buffer = audioBuffer;
            source.connect(gainNode);
            source.connect(analyser);
            source.connect(filters[0]);
            filters[filters.length - 1].connect(gainNode);
            gainNode.connect(context.destination);
            source.start(0, startOffset % audioBuffer.duration);
            currSource = source;
            stopBtn.disabled = false;
            dropZone.classList.add('invisible');
            _playToPause();
            _drawCircles();
            // _drawBars();
        } else {
            currSource.stop();
            startOffset += context.currentTime - startTime;
            dropZone.classList.remove('invisible');
            _playToPause(true);
            cancelAnimationFrame(drawVisual);
        }
        pauseFlag = !pauseFlag;
    };

    var _stopAudio = function () {
        currSource.stop(0);
        startOffset = 0;
        _playToPause(true);
        pauseFlag = false;
        dropZone.classList.remove('invisible');
        cancelAnimationFrame(drawVisual);
    };

    var _playToPause = function (reversed) {
        reversed = reversed || false;
        if (reversed) {
            playBtn.querySelector('.fa').classList.add('fa-play');
            playBtn.querySelector('.fa').classList.remove('fa-pause');
        } else {
            playBtn.querySelector('.fa').classList.remove('fa-play');
            playBtn.querySelector('.fa').classList.add('fa-pause');
        }
    };

    var _endAudio = function () {
        _playToPause(true);
        pauseFlag = false;
        dropZone.classList.remove('invisible');
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

    var _drawCircles = function () {
        drawVisual = requestAnimationFrame(_drawCircles);

        analyser.getByteFrequencyData(dataArray);

        canvas.fillStyle = 'rgb(255, 255, 255)';
        canvas.fillRect(0, 0, canvasWidth, canvasHeight);
        var circleStep = Math.ceil(canvasWidth / bufferLength);
        for (var i = 0; i < bufferLength; i++) {
            var lineWidth = (circleStep * i) % 6;
            var circleRadius = Math.abs(dataArray[i] % (canvasHeight / 2) - lineWidth);
            var circleX = circleStep * i;

            if (circleX + circleRadius > (canvasWidth) || 
                circleX - circleRadius < 0) {
                continue;
            }

            var randomVar = Math.floor(Math.random() * 255);

            canvas.beginPath();
            canvas.arc(circleX, canvasHeight / 2, circleRadius, 0, 2 * Math.PI, false);
            canvas.lineWidth = lineWidth;
            canvas.strokeStyle = 'rgba(255, ' + dataArray[i] % 255 + ', ' + 
                (circleRadius + randomVar) % 255 + ', 0.6)';
            canvas.stroke();
            canvas.closePath();
        }
    };

    var _changePreset = function (event) {
      presets[event.target.value].forEach(function (item, i) {
        filters[i].gain.value = item;
      }, false);
    };

    var _createFilter = function (frequency) {
        var filter = context.createBiquadFilter();

        filter.type = 'peaking';
        filter.frequency.value = frequency;
        filter.Q.value = 1;
        filter.gain.value = 0;

        return filter;
    };

    var _createFilters = function () {
        var filters = frequencies.map(_createFilter);

        filters.reduce(function (prev, curr) {
            prev.connect(curr);
            return curr;
        });

        return filters;
    };

    return {
        init: _init,
    }

}());

window.onload = Pleer.init;
