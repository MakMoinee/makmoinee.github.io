const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const toggleAudioButton = document.getElementById('toggleAudioButton');
const recordedVideo = document.getElementById('recordedVideo');
let mediaRecorder;
let recordedChunks = [];
let screenStream;
let audioStream;

startButton.addEventListener('click', async () => {
    try {
        startButton.disabled = true;
        startCountdown(3); // Start a 3-second countdown before recording.
    } catch (error) {
        console.error('Error accessing screen sharing:', error);
    }
});

toggleAudioButton.addEventListener('click', async () => {
    if (audioStream) {
        // Disable audio (microphone and system audio).
        audioStream.getTracks().forEach(track => track.stop());
        audioStream = null;
        toggleAudioButton.innerText = 'Enable Audio';
    } else {
        // Enable audio (microphone and system audio).
        try {
            audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            toggleAudioButton.innerText = 'Disable Audio';
        } catch (error) {
            console.error('Error accessing audio:', error);
        }
    }
});

function startCountdown(seconds) {
    let counter = seconds;

    const countdownInterval = setInterval(() => {
        if (counter > 0) {
            console.log(`Recording will start in ${counter} seconds...`);
            counter--;
        } else {
            clearInterval(countdownInterval);
            startRecording();
        }
    }, 1000);
}

async function startRecording() {
    try {
        const screenOptions = { video: { mediaSource: 'screen' } };

        // Include audio streams if available.
        if (audioStream) {
            screenOptions.audio = {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: screenStream.id,
                },
            };
        }

        screenStream = await navigator.mediaDevices.getDisplayMedia(screenOptions);

        // Merge screen and audio streams into one stream.
        const recordedStream = new MediaStream();
        screenStream.getTracks().forEach(track => recordedStream.addTrack(track));
        if (audioStream) {
            audioStream.getTracks().forEach(track => recordedStream.addTrack(track));
        }

        mediaRecorder = new MediaRecorder(recordedStream);
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const videoURL = window.URL.createObjectURL(blob);
            recordedVideo.src = videoURL;

            // Create a download link.
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = videoURL;
            a.download = 'recorded-video.webm';
            document.body.appendChild(a);

            // Trigger the download.
            a.click();

            // Clean up.
            window.URL.revokeObjectURL(videoURL);
        };

        mediaRecorder.start();
        stopButton.disabled = false;
    } catch (error) {
        console.error('Error accessing screen sharing:', error);
    }
}

stopButton.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        startButton.disabled = false;
        stopButton.disabled = true;
    }
});
