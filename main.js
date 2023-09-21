const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const recordedVideo = document.getElementById('recordedVideo');
let mediaRecorder;
let recordedChunks = [];

startButton.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: { mediaSource: 'screen' } });

        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const videoURL = window.URL.createObjectURL(blob);
            recordedVideo.src = videoURL;

            // Create a download link
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = videoURL;
            a.download = 'recorded-video.webm';
            document.body.appendChild(a);

            // Trigger the download
            a.click();

            // Clean up
            window.URL.revokeObjectURL(videoURL);
        };

        mediaRecorder.start();
        startButton.disabled = true;
        stopButton.disabled = false;
    } catch (error) {
        console.error('Error accessing screen sharing:', error);
    }
});

stopButton.addEventListener('click', () => {
    if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        startButton.disabled = false;
        stopButton.disabled = true;
    }
});
