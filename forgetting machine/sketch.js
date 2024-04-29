// Alan Ren NYU ITP
// Spring 2024
// Collaborate with Kyrie Yang

const RECORD_KEY = '1';
const STOP_KEY = '2';
const PLAY_KEY = '3';

let mic, recorder, soundFile;
let isRecording = false;
let isPlaying = false;
let recorded = false;
let played = false;
let fft;
let startTime = 0;
let statusText = '';
let segments = [];

function setup() {
	createCanvas(windowWidth, windowHeight);
	background(30, 255, 10);
	textAlign(CENTER, CENTER);

	mic = new p5.AudioIn();
	mic.start();

	fft = new p5.FFT(0.8, 256);
	fft.setInput(mic);

	recorder = new p5.SoundRecorder();
	recorder.setInput(mic);
	soundFile = new p5.SoundFile();

	window.addEventListener('keydown', handleKeyPress);
	updateStatus('Press button to record.');
}

function draw() {
	if (isRecording) {
		displayRecordingWaveform();
	}

	isPlaying = soundFile.isPlaying();

	if (isPlaying) {
		background(252, 171, 78);
		updateStatus('Playing...');
		played = true;
	} else if (!isPlaying && recorded && played) {
		background(252, 171, 78);
		updateStatus('Audio played. Press button to record again.');
	}

	displayStatusText();
}

function handleKeyPress(event) {
	if (event.key == RECORD_KEY) {
		toggleRecording(event.key);
	} else if (event.key === PLAY_KEY && segments.length > 0) {
		shuffleAndPlaySegments();
	} else {
		toggleRecording(event.key);
	}
}

function toggleRecording(key) {
	if (key == RECORD_KEY) {
		recorder.record(soundFile);
		isRecording = true;
		recorded = false;
		startTime = millis();
		textSize(16);
		fill(255);
		noStroke();
		updateStatus('Recording... Press button again to stop.');
	} else {
		recorder.stop();
		isRecording = false;
		recorded = true;
		background(255, 30, 30);
		textSize(16);
		fill(255);
		noStroke();
		updateStatus('Done! Press button to play.');
		setTimeout(() => createSegmentsFromPeaks(), 1000); // Delay to ensure soundFile is ready
	}
}

function createSegmentsFromPeaks() {
	let peaks = soundFile.getPeaks(10); // Analyzing a subset of frames
	let durationPerSegment = soundFile.duration() / peaks.length;
	for (let i = 0; i < peaks.length; i++) {
		segments.push({
			start: i * durationPerSegment,
			duration: durationPerSegment,
		});
	}
}

function shuffleAndPlaySegments() {
	shuffle(segments, true); // Shuffle segments array
	playSegmentsInOrder(0);
	console.log(segments);
}

function playSegmentsInOrder(index) {
	if (index >= segments.length) return;

	let segment = segments[index];
	soundFile.play(0, 1, 1, segment.start, segment.duration);
	soundFile.onended(() => {
		playSegmentsInOrder(index + 1);
	});
}

function displayRecordingWaveform() {
	let waveform = fft.waveform();
	background(255, 30, 30);

	noFill();
	beginShape();
	stroke(255);
	strokeWeight(1);
	for (let i = 0; i < waveform.length; i++) {
		let x = map(i, 0, waveform.length, 0, width);
		let y = map(waveform[i], -1, 1, height, 0);
		vertex(x, y);
	}
	endShape();

	let recordTime = (millis() - startTime) / 1000;
	textSize(16);
	fill(255);
	noStroke();
	text(`Recording Time: ${recordTime.toFixed(2)} s`, 10, 20);
}

function updateStatus(message) {
	console.log(message);
	statusText = message;
}

function displayStatusText() {
	textSize(16);
	noStroke();
	textAlign(CENTER, BOTTOM);
	text(statusText, width / 2, height - 10);
}
