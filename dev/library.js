// INITIAL SETUP

// sets up audiocontext, sets in in tonejs and sets up synth for piano
function initSetup() {
    if (audioContext.state === "suspended") {
        audioContext.resume().then(
            () => {
                if (gainNode === null) {
                    setupGainNode()
                    Tone.setContext(audioContext)
                    pianoGainNode = audioContext.createGain().connect(gainNode)
                    pianoCompressorNode = audioContext.createDynamicsCompressor().connect(pianoGainNode)
                    synth = new Tone.PolySynth().connect(pianoCompressorNode)
                    pianoGainNode.gain.value = 0.5
                }
            }
        ).catch(
            () => {console.error("audio context error")}
        )
    } else if (audioContext.state === "running") {
        //if browser already initialized audioContext
        if (gainNode === null) {
            setupGainNode()
            Tone.setContext(audioContext)
            pianoGainNode = audioContext.createGain().connect(gainNode)
            pianoCompressorNode = audioContext.createDynamicsCompressor().connect(pianoGainNode)
            synth = new Tone.PolySynth().connect(pianoCompressorNode)
            pianoGainNode.gain.value = 0.5
        }
    }
}

// sets up the master gain node in already initialized audioContext
// sets up analyser
function setupGainNode() {

    gainNode = audioContext.createGain()
    gainNode.gain.value = 1
    gainNode.connect(audioContext.destination)
    analyserNode = audioContext.createAnalyser()
    analyserNode.fftSize = analyserFFTSize

}

// ZOOM

//function used for keyboard
function setZoom(newZoom) {
    if (newZoom > 100) {
        newZoom = 100
    }
    if (newZoom < 0) {
        newZoom = 0
    }
        
    const zoomMax = parseFloat(zoomSlider.max)
    const minPxPerSec = newZoom / 100 * zoomMax
        
    waveSurfer.zoom(minPxPerSec)
    waveSurfer.setTime(waveSurfer.getCurrentTime())

    zoomNumber.value = newZoom
    zoomSlider.value = (newZoom / 100) * zoomMax
}

// MINIMAP

// Correctly reloads minimap,
// used when dimensions or regions change
function reloadMinimap() {
    minimap.destroy()
    const waveFormDiv = document.getElementById("waveform")
    const height = waveFormDiv.clientHeight
    minimap = WaveSurfer.Minimap.create({
        height: Math.floor(height*0.1),
        waveColor: "#257829",
        progressColor: '#999',
        plugins: [minimapRegions],
    })
    const existingRegions = regions.getRegions()
    existingRegions.forEach(region => {
        minimapRegions.addRegion({
            start: region.start,
            end: region.end,
            color: region.color,
            drag: region.drag,
        })
    })
    //to place cursor on click
    minimap.on("interaction", (event) => {
        const time = waveSurfer.getCurrentTime()
        placeCursor(time)
    })
    waveSurfer.registerPlugin(minimap)
    const time = waveSurfer.getCurrentTime()
    waveSurfer.setTime(time)
}

// CURSOR

// Create or place cursor
function resetCursor() {
    cursor = regions.addRegion({
        start: 0,
        color: CURSOR_COLOR,
        drag: false,    
        resize: false,        
    })
}

function placeCursor(time) {
    if (!cursor) {
        cursor = regions.addRegion({
            start: time,
            color: CURSOR_COLOR,
            drag: false,    
            resize: false,        
        })
        reloadMinimap()
    } else {
        if (cursor.start != time) {
            cursor.setOptions({start:time})
            reloadMinimap()
        }
    }
}

function semitonesToFrequencyFactor(semitoni) {
    return Math.pow(2, semitoni / 12);
}

// PIANO

// Generates piano
function generatePiano() {
    
    while (keyCount < keys) {
        
        // generate white keys
        const key = document.createElement("div")
        key.className = "key"
        const whiteKeyNote = `${notes[(noteCount % 7)]}${Math.floor(((keyCount - 3) / 12)) + 1}`
        key.id = `pianoKey${whiteKeyNote}`
        keyCount += 1
        key.dataset.keyNumber = keyCount
        const noteLabel = document.createElement("span")
        noteLabel.innerHTML = whiteKeyNote
        noteLabel.className = "noteLabel"
        key.appendChild(noteLabel)
        pianoDiv.appendChild(key)
        
        addTouchAndMouseListeners(key)
        
        // generate black keys where necessary
        if (blackKeyPattern[noteCount % 7] && keyCount < keys - 1) {
            const blackKey = document.createElement("div")
            blackKey.className = "key black-key"
            const blackKeyNote = `${notes[(noteCount % 7)]}#${Math.floor(((keyCount - 3) / 12)) + 1}`
            blackKey.id = `pianoKey${blackKeyNote}`
            keyCount += 1
            blackKey.dataset.keyNumber = keyCount
            pianoDiv.appendChild(blackKey)
            
            addTouchAndMouseListeners(blackKey)
        }
        noteCount += 1
    }
    
}

function getNotesData () {
    const keyboardPanel = document.getElementById("pianokeyboard")
    let notesdata = {}
    for (let i = 0; i < keyboardPanel.children.length; i++) {
        const key = keyboardPanel.children[i]
        const note = key.id.slice(8)
        const keynumber = key.dataset.keyNumber
        notesdata[note] = {freq: getFrequency(keynumber), keynumber: keynumber, Xleft: key.getBoundingClientRect().x, Xcenter:(key.getBoundingClientRect().x + (key.getBoundingClientRect().width / 2)), rect: key.getBoundingClientRect()}
    }
    return notesdata
}

function setupGuessCanvas () {
    const pianoPanel = document.getElementById("pianopanel")
    const keyboardPanel = document.getElementById("pianokeyboard")
    const guessCanvas = document.getElementById("guesscanvas")
    guessCanvas.height = pianoPanel.offsetHeight - keyboardPanel.offsetHeight - 18
    guessCanvas.width = keyboardPanel.scrollWidth
}

function getAnalyserData () {
    const arrayLenght = analyserNode.frequencyBinCount
    let dataArray = new Uint8Array(arrayLenght)
    analyserNode.getByteFrequencyData(dataArray)

    return dataArray
}

function addFFTData(notesData) {
    let analyserData = getAnalyserData()

    const fftBinSize = audioContext.sampleRate / analyserNode.fftSize

    for (const note in notesData) {
        const noteData = notesData[note]
        const frequency = noteData.freq
        const binIndex = Math.round(frequency / fftBinSize)
        const intensity = analyserData[binIndex] / 255
        notesData[note].nearestFFTBin = intensity
        // console.log(note, intensity)
    }

    return notesData
}

function getColor (value) {
    const r = value <= 0.5 ? 255 : Math.floor(255 * (1 - (value - 0.5) * 2))
    const g = Math.floor(255 * value)
    const b = 0
    
    return `rgb(${r}, ${g}, ${b})`
}

function drawNoteGuesses() {
    const guessCanvas = document.getElementById("guesscanvas")
    const ctx = guessCanvas.getContext("2d")
    ctx.clearRect(0, 0, guessCanvas.width, guessCanvas.height)

    if(analyserNode && waveSurfer && fftDisplay) {

        if (waveSurfer.isPlaying() || freezeActive) {
            FFTData = addFFTData(notesConstantData)
        }
        
        for (const note in FFTData) {
            const noteData = FFTData[note]
            
            const Xcenter = noteData.Xcenter
            const intensity = FFTData[note].nearestFFTBin
            let Ypos = guessCanvas.height - (guessCanvas.height * intensity)
            const radius = 3
            if (Ypos < radius) {
                Ypos = radius
            } else if (Ypos > (guessCanvas.height - radius)) {
                Ypos = guessCanvas.height - radius
            }

            ctx.beginPath()
            ctx.arc(Xcenter, Ypos, radius, 0, 2 * Math.PI)
            ctx.fillStyle = getColor(intensity)
            ctx.fill()
        }
        
    }

    if (!fftDisplay) {
        ctx.clearRect(0, 0, guessCanvas.width, guessCanvas.height)
    }

    requestAnimationFrame(drawNoteGuesses)
}

// adds eventlistener to make piano playable

function addTouchAndMouseListeners(key) {
    // Mouse events
    key.addEventListener("mousedown", () => {
        activeKeys.add(key.dataset.keyNumber)
        playNote(key.dataset.keyNumber)
    })
    
    key.addEventListener("mouseup", () => {
        if (activeKeys.has(key.dataset.keyNumber)) {
            stopNote(key.dataset.keyNumber)
            activeKeys.delete(key.dataset.keyNumber)
        }
    })
    
    key.addEventListener("mouseleave", () => {
        if (activeKeys.has(key.dataset.keyNumber)) {
            stopNote(key.dataset.keyNumber)
            activeKeys.delete(key.dataset.keyNumber)
        }
    })

    // Touch events
    key.addEventListener("touchstart", (e) => {
        e.preventDefault()
        activeKeys.add(key.dataset.keyNumber)
        playNote(key.dataset.keyNumber)
    })
    
    key.addEventListener("touchend", (e) => {
        e.preventDefault()
        if (activeKeys.has(key.dataset.keyNumber)) {
            stopNote(key.dataset.keyNumber)
            activeKeys.delete(key.dataset.keyNumber)
        }
    })
    
    key.addEventListener("touchcancel", (e) => {
        e.preventDefault()
        if (activeKeys.has(key.dataset.keyNumber)) {
            stopNote(key.dataset.keyNumber)
            activeKeys.delete(key.dataset.keyNumber)
        }
    })
}

// input key number (1->88) obtain note frequency
function getFrequency(key) {
    return noteAFrequency * Math.pow(2, (key - 49) / 12)
}

// play the note at the right freq
function playNote(key) {
    // console.log(`playing key ${key}`)
    const freq = getFrequency(key)
    if (synth) {
        synth.triggerAttack(freq)
    }
    document.querySelector(`[data-key-number="${key}"]`).classList.add('active')
}

// stop the note
function stopNote(key) {
    const freq = getFrequency(key)
    if (synth) {
        synth.triggerRelease(freq)
    }
    document.querySelector(`[data-key-number="${key}"]`).classList.remove('active')
}

// lifts all notes, used for keyboard
function resetPianoKeys() {
    for (const key of activeKeys) {
        stopNote(key)
      }
    activeKeys.clear()
}

// VOLUME

// Function to convert linear 0->1 value to logarithmic volume factor
function getLogarithmicVolume(value) {
    if (value <= 0) return 0
    const volume = Math.pow(value, 2)
    return volume
}


// GRANULAR FREEZE

// Function to capture audio around cursor position
async function captureAudioWindowOnPlaybackTime() {
    const playbackTime = waveSurfer.getCurrentTime()

    if (!audioFile) return null;

    // Create a new AudioContext for processing
    const decodeCtx = new AudioContext();
    
    // Get the audio file as an ArrayBuffer
    const response = await fetch(audioFile.src);
    const arrayBuffer = await response.arrayBuffer();
    
    // Decode the original audio file
    const audioBuffer = await decodeCtx.decodeAudioData(arrayBuffer);
    
    if (!audioBuffer) return null
    
    // Calculate window boundaries
    const startTime = Math.max(0, playbackTime - FREEZE_WINDOW/2)
    const endTime = Math.min(audioBuffer.duration, playbackTime + FREEZE_WINDOW/2)
    const windowDuration = endTime - startTime
    
    // Create offline context for processing
    const offlineCtx = new OfflineAudioContext({
        numberOfChannels: audioBuffer.numberOfChannels,
        length: Math.ceil(windowDuration * audioBuffer.sampleRate),
        sampleRate: audioBuffer.sampleRate
    })
    
    // Create buffer source
    const sourceNode = offlineCtx.createBufferSource()
    sourceNode.buffer = audioBuffer
    sourceNode.connect(offlineCtx.destination)
    
    // Start playback at the window start position
    sourceNode.start(0, startTime, windowDuration)
    
    // Render and return the buffer
    return await offlineCtx.startRendering()
}

// Setup granular player with the captured buffer
function setupGranularPlayer(buffer) {
    if (grainPlayer) {
        grainPlayer = null
    }

    freezeGain = audioContext.createGain()
    
    grainPlayer = new window.Granular({
        audioContext: audioContext,
        envelope: {
          attack: 0.2,
          release: 0.8
        },
        density: GRAIN_DENSITY,
        spread: GRAIN_SPREAD,
        pitch: 1
      })

    freezeReverb = new Tone.Reverb(FREEZE_REVERB_DECAY)
      
    freezeGain = audioContext.createGain()
    Tone.connect(freezeGain, freezeReverb)
    Tone.connect(freezeReverb, pitchShifter)
    
    grainPlayer.setBuffer(buffer)
    grainPlayer.disconnect()
    grainPlayer.connect(freezeGain)
}

// activates granular freeze
async function toggleFreeze() {
    if (!freezeActive && cursor && waveSurfer) {
        try {
            // Pause main playback
            waveSurfer.pause()
            // Capture audio window
            frozenBuffer = await captureAudioWindowOnPlaybackTime()
            if (frozenBuffer) {                
                // Setup and start granular playback
                setupGranularPlayer(frozenBuffer)
                // grainPlayer.start()
                for (let index = 0; index < VOICES_NUMBER; index++) {                    
                    grainVoices.push(grainPlayer.startVoice({
                        position: FREEZE_WINDOW / VOICES_NUMBER * index,
                        volume: 1/VOICES_NUMBER
                    }))
                }
                // freezeGain.gain.input.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.5)
                
                freezeActive = true
                freezeButton.src = "/icons/redFreeze.svg"
            }
        } catch (error) {
            console.error("Failed to freeze audio:", error)
        }
    } else if (freezeActive) {
        // Stop granular playback
        if (grainPlayer) {
            // grainPlayer.stop()
            grainVoices.forEach(voice => {
                grainPlayer.stopVoice(voice)
            })
            grainVoices = []
            // freezeGain.gain.input.linearRampToValueAtTime(0, audioContext.currentTime + 0.5)
            // grainPlayer.dispose()
            grainPlayer = null
        }
        
        freezeActive = false
        freezeButton.src = "/icons/freeze.svg"
    }
}

// DOWNLOAD

// if there's an active loop region cuts it
// then returns the buffer rendered
// will be implemented with pitchshifter/timestretch
async function createBufferForDownload() {
    if (!audioFile) return null

    // Create a new AudioContext for processing
    const decodeCtx = new AudioContext()
    
    // Get the audio file as an ArrayBuffer
    const response = await fetch(audioFile.src)
    const arrayBuffer = await response.arrayBuffer()
    
    // Decode the original audio file
    const audioBuffer = await decodeCtx.decodeAudioData(arrayBuffer)
    
    if (!audioBuffer) return null

    let startTime = 0
    let endTime = audioBuffer.duration

    if (activeRegion) {
        startTime = activeRegion.start
        endTime = activeRegion.end
    }
    
    const playRate = speedNumber.valueAsNumber / 100
    const pitchShift = pitchNumber.valueAsNumber
    const pitchCompensation = -12 * Math.log2(playRate)
    const pitchShiftValue = pitchShift + pitchCompensation
    // console.log(pitchCompensation)
    // console.log(pitchShift)
    // console.log(pitchShiftValue)

    // Calculate window boundaries
    const windowDuration = (endTime - startTime) * playRate
    
    // Create offline context for processing
    const offlineCtx = new Tone.OfflineContext({
        numberOfChannels: audioBuffer.numberOfChannels,
        length: Math.ceil(windowDuration * audioBuffer.sampleRate),
        sampleRate: audioBuffer.sampleRate
    })

    await offlineCtx.addAudioWorkletModule("/js/dependencies/STWorkletStandalone.js", "soundtouch")

    const pitchShifterNode = offlineCtx.createAudioWorkletNode("soundtouch-processor")
    pitchShifterNode.parameters.get("pitch").value = semitonesToFrequencyFactor(pitchShift + pitchCompensation)
    
    // Create buffer source
    const sourceNode = offlineCtx.createBufferSource()
    sourceNode.buffer = audioBuffer
    sourceNode.playbackRate.value = playRate
    Tone.connect(sourceNode, pitchShifterNode)
    Tone.connect(pitchShifterNode, offlineCtx.destination)
    
    // Start playback at the window start position
    sourceNode.start(0, startTime, windowDuration)
    
    // Render and return the buffer
    return await offlineCtx.render()
}

// encodes audio buffer to wav blob
function bufferToWave(abuffer, len) {
    // Calculate total samples (per channel)
    const totalSamples = Math.ceil(abuffer.length)
    
    // Calculate final buffer length (includes headers)
    const numOfChan = abuffer.numberOfChannels
    const length = totalSamples * numOfChan * 2 + 44
    
    // Create the buffer
    const buffer = new ArrayBuffer(length)
    const view = new DataView(buffer)
    
    // Initialize channels array
    const channels = []
    let pos = 0
    
    // Write WAVE header
    // "RIFF"
    view.setUint32(pos, 0x46464952, true); pos += 4
    // file length minus RIFF header
    view.setUint32(pos, length - 8, true); pos += 4
    // "WAVE"
    view.setUint32(pos, 0x45564157, true); pos += 4
    
    // Write fmt chunk
    // "fmt "
    view.setUint32(pos, 0x20746d66, true); pos += 4
    // chunk length
    view.setUint32(pos, 16, true); pos += 4
    // sample format (raw)
    view.setUint16(pos, 1, true); pos += 2
    // channel count
    view.setUint16(pos, numOfChan, true); pos += 2
    // sample rate
    view.setUint32(pos, abuffer.sampleRate, true); pos += 4
    // byte rate (sample rate * block align)
    view.setUint32(pos, abuffer.sampleRate * numOfChan * 2, true); pos += 4
    // block align (channel count * bytes per sample)
    view.setUint16(pos, numOfChan * 2, true); pos += 2
    // bits per sample
    view.setUint16(pos, 16, true); pos += 2
    
    // Write data chunk
    // "data"
    view.setUint32(pos, 0x61746164, true); pos += 4
    // chunk length
    view.setUint32(pos, length - pos - 4, true); pos += 4
    
    // Write interleaved audio data
    for (let i = 0; i < numOfChan; i++) {
        channels.push(abuffer.getChannelData(i))
    }
    
    for (let i = 0; i < totalSamples; i++) {
        for (let channel = 0; channel < numOfChan; channel++) {
            let sample = Math.max(-1, Math.min(1, channels[channel][i]))
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0
            view.setInt16(pos, sample, true)
            pos += 2
        }
    }
    
    return new Blob([buffer], { type: "audio/wav" })
}

// generates a name for the audiofile to download
function generateFileName() {
    const originName = fileInput.files[0].name
    const pos = originName.lastIndexOf('.')
    const noExt = originName.slice(0, pos)
    const speed = speedNumber.value
    if (speed != 100) {
        return `${noExt}.${speed}%.wav`
    }
    return `${noExt}.processed.wav`
}

// process and download the audiofile
function make_download(abuffer, total_samples) {
    try {
        const new_file = URL.createObjectURL(bufferToWave(abuffer, total_samples))
        const download_link = document.getElementById("download_link")
        if (download_link) {
            download_link.href = new_file
            const name = generateFileName()
            download_link.download = name
            download_link.click()
        } else {
            console.error("Download link element not found")
        }
    } catch (error) {
        console.error("Error creating download:", error)
    }
}