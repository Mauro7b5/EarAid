# EarAid

## Overview
EarAid is a web audio player designed for musicians who need a clean audio player with helpful tools for transcribing, learning, and playing along with musical pieces.

## Features
- Waveform Visualization: Upload an audio file to visualize it as a waveform.
- Markers: Add markers to specific points in the audio for easy navigation.
- Selection and Looping: Select and loop specific parts of the audio.
- Spectrogram View: Toggle spectrogram visualization for detailed frequency analysis.
- Granular Freeze: Freeze the spectrum of a small time window around the cursor.
- Download: Apply time stretch and pitch shift parameters to the audio file, crop the selection if active, and download the modified audio as a .wav file.
- Pitch Shift: Adjust the audio pitch to hear the piece in a different key.
- Speed Control: Slow down or speed up the playback without affecting pitch.
- Volume Control: Adjust the master volume.
- Piano and FFT: Use an HTML piano keyboard and activate an FFT note guessing visualization.

## Usage

### Local Usage
To use EarAid locally, follow these steps:

1. Clone the repository:
    ```sh
    git clone https://github.com/Mauro7b5/EarAid.git
    ```
2. Install the dependencies:
    ```sh
    npm install
    ```
3. Start the HTTP server:
    ```sh
    npm run http
    ```
4. Open your browser and navigate to `http://localhost`.

### Hosting
Since browsers block WebAudioWorklets for security reasons if HTTPS is not used, to host EarAid for clients outside the host machine, you'll need TLS certificate.crt and private.key in the HTTPS folder, in the repo you'll find a self signed certificate and a key to make it work out the box, substitute them for safety. 

To start the server, run:
```sh
npm start
```

## Contributing
Contributes are welcome, you'll find source code in EarAid/dev, JS scripts and dependencies are minified in one file with the command:
```sh
npm run build
```

## License
This project is licensed under the LGPL License. See the [LICENSE](LICENSE) file for more information.
