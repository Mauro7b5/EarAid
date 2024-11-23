// create audiocontext, gainNode activate and route at the first click

const audioContext = new AudioContext()
let gainNode = null
let analyserNode = null
const ANALYSERFFTSIZE = 4096
let pianoGainNode = null

window.addEventListener("click", initSetup)
window.addEventListener("touchstart", initSetup)
window.addEventListener("keydown", initSetup)

// aquire audioFile in audioFile global variable
// create dedicated source node and makes audioFile play from it
// initialize waveSurfer

const openIcon = document.getElementById("openIcon")
const fileInput = document.getElementById("fileInput")
const waveDiv = document.getElementById("waveform")
const uploadSpan = document.getElementById("uploadspan")
const helpIcon = document.getElementById("helpIcon")

let audioFile = null
let sourceNode = null

let waveSurfer = null
let spectrogram = null
let regions = null
let minimap = null
let minimapRegions = null
let cursor = null
const CURSOR_COLOR = "#BF55EC"

helpIcon.addEventListener("click", () => {
    window.open("/help", "_blank");
})

openIcon.addEventListener("click", () => {
    fileInput.click()
})

uploadSpan.addEventListener("click", () => {
    fileInput.click()
})

fileInput.addEventListener("change", async (event) => {
    
    audioFile = new Audio()
    audioFile.controls = false
    const file = event.target.files[0]
    console.log(file)
    
    if (file && file.type.startsWith("audio/")) {

        const audioFileURL = URL.createObjectURL(file)
        audioFile.src = audioFileURL

        if (waveSurfer) {
            waveSurfer.destroy()
            waveSurfer = null
        }
        
        audioFile.onloadedmetadata = async () => {

            if (sourceNode) {
                sourceNode.disconnect()
            }

            sourceNode = audioContext.createMediaElementSource(audioFile)

            if (!gainNode) {
                setupGainNode()
            }

            await Tone.getContext().addAudioWorkletModule("/js/dependencies/STWorkletStandalone.js", "soundtouch")
            pitchShifter = Tone.getContext().createAudioWorkletNode("soundtouch-processor")
            // console.log(pitchShifter.parameters.get("pitch").value)
            
            Tone.connect(sourceNode, pitchShifter)
            Tone.connect(pitchShifter, gainNode)
            Tone.connect(pitchShifter, analyserNode)

            const waveFormDiv = document.getElementById("waveform")
            waveFormDiv.innerHTML = ""
            let waveformDivHeight = parseFloat(waveFormDiv.clientHeight)

            regions = WaveSurfer.Regions.create()
            minimapRegions = WaveSurfer.Regions.create()

            waveSurfer = WaveSurfer.create({
                container: "#waveform",
                waveColor: "#1974d2",
                responsive: "true",
                height: waveformDivHeight*0.9,
                media: audioFile,
                hideScrollbar: true,
                sampleRate:12000,
                plugins: [
                    WaveSurfer.Timeline.create({
                        insertPosition: "beforebegin",
                        style: {
                            color: "#FFFFFF",
                            },
                        }
                    ),
                    minimap = WaveSurfer.Minimap.create({
                        height: waveformDivHeight*0.1,
                        waveColor: "#257829",
                        progressColor: '#999',
                        plugins: [minimapRegions],
                    }),
                    regions,
                ],
            })

            // to let only one selection exist
            regions.on("region-created", (event) => {
                const regionsArray = regions.getRegions()
                let regionsExcludingFlags = []
                regionsArray.forEach(region => {
                    if (region.start != region.end) {
                        regionsExcludingFlags.push(region)
                    }
                })
                if (regionsExcludingFlags.length > 1) {
                    activeRegion = regionsExcludingFlags[1]
                    regionsExcludingFlags[0].remove()
                }
                reloadMinimap()
            })

            // to loop region when play over it && if loop == true
            regions.on("region-out", (region)=>{
                const currentTime = waveSurfer.getCurrentTime()
                if (region.start != region.end && loop && (currentTime - region.end) < 0.1 && (currentTime - region.end) >= 0) {
                    waveSurfer.setTime(region.start)
                }
            })

            // turn on inputs
            zoomSlider.disabled = false
            zoomNumber.disabled = false
            speedSlider.disabled = false
            speedNumber.disabled = false
            pitchNumber.disabled = false
            pitchSlider.disabled = false
            
            //time indicator and cursor
            const timeSpan = document.getElementById("timeSpan")
            
            waveSurfer.on("ready", () => {
                
                setInterval(() => {
                    try {
                        const time = waveSurfer.getCurrentTime()
                        const minutes = Math.floor(time/60).toString().padStart(2, "0")
                        const seconds = Math.floor(time%60).toString().padStart(2, "0")
                        const cents = Math.floor((time%1)*100).toString().padStart(2, "0")
                        const timeString = `${minutes}:${seconds}.${cents}`
                        timeSpan.innerHTML = timeString
                    } catch (error) {
                        console.log("time updater waiting for Wavesurfer")
                    }
                    }, 10)
                resetCursor()
                placeCursor(0)
                // cursor placing
                waveSurfer.on("click", (event) => {
                    const playing = waveSurfer.isPlaying()
                    const time = waveSurfer.getCurrentTime()
                    placeCursor(time)
                    if (playing) {
                        waveSurfer.play()
                    }
                })
            }
            )

        }

    } else {

        console.error("invalid file format")

    }

})

// correctly resize waveform spectrum and minimap height when window dimension changes
let resizeDebounceTimeout

function debounce(func, delay) {
    let timeoutId
    return function (...args) {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        func.apply(this, args)
      }, delay)
    }
}

const resizeDebounce = debounce(() => {
    if (waveSurfer) {
        
        const playing = waveSurfer.isPlaying()
        const waveFormDiv = document.getElementById("waveform")
        const height = waveFormDiv.clientHeight
        
        if(spectrogramPresence) {
            waveSurfer.setOptions({
                height: Math.floor(height*0.45)
            })
            spectrogram.destroy()
            spectrogram = WaveSurfer.Spectrogram.create({
            fftSamples:1024,
            height: Math.floor(height*0.45),
            })
            waveSurfer.registerPlugin(spectrogram)
            reloadMinimap()
            waveSurfer.zoom(zoomLevel)
        } else {
            waveSurfer.setOptions({
                height: Math.floor(height*0.9)
            })
            reloadMinimap()
        }
        if (playing) {
            waveSurfer.play()
        }
    }
}, 100)

window.addEventListener("resize", resizeDebounce)

// Player buttons

//  Play
const playButton = document.getElementById("playIcon")
playButton.addEventListener("click", () => {
    try {
        if (freezeActive) {
            toggleFreeze()
        }
        const cursorTime = cursor.start
        waveSurfer.setTime(cursorTime)
        waveSurfer.play()
    } catch (error) {
        console.log("load a file first")
    }
})

//  Pause
const pauseButton = document.getElementById("pauseIcon")
pauseButton.addEventListener("click", () => {
    try {
        if (freezeActive) {
            toggleFreeze()
        }
        waveSurfer.pause()
    } catch (error) {
        console.log("load a file first")
    }
})

//  Rewind
const rewindButton = document.getElementById("toStartIcon")
rewindButton.addEventListener("click", () => {
    try {
        if (freezeActive) {
            toggleFreeze()
        }
        if (waveSurfer.isPlaying()) {
            waveSurfer.pause()
        }
        placeCursor(0)
        waveSurfer.seekTo(0)
    } catch (error) {
        console.log("load a file first")
    }
})

//  toEnd
const toEndButton = document.getElementById("toEndIcon")
toEndButton.addEventListener("click", () => {
    try {
        if (freezeActive) {
            toggleFreeze()
        }
        waveSurfer.seekTo(1)
    } catch (error) {
        console.log("load a file first")
    }
})

//  -5s
const fiveBwdButton = document.getElementById("seekBackIcon")
// to prevent multi cursor bug
let lastSeekTime = 0
fiveBwdButton.addEventListener("click", () => {
    const actualTime = audioContext.currentTime
    if (freezeActive) {
        toggleFreeze()
    }
    if (actualTime > lastSeekTime + 0.5) {
        try {
            const currentTime = waveSurfer.getCurrentTime()
            if (currentTime <= 10) {
                waveSurfer.seekTo(0)
            } else {
                waveSurfer.setTime(currentTime - 5)
            }
            placeCursor(waveSurfer.getCurrentTime())
            lastSeekTime = actualTime
        } catch (err) {
            console.log(err)
        }
    }
})

//  +5s
const fiveFwdButton = document.getElementById("seekForwardIcon")
fiveFwdButton.addEventListener("click", () => {
    const actualTime = audioContext.currentTime
    if (freezeActive) {
        toggleFreeze()
    }
    if (actualTime > lastSeekTime + 0.5) {
        try {
            const currentTime = waveSurfer.getCurrentTime()
            const duration = waveSurfer.getDuration()
            if ((currentTime+10) >= duration) {
                waveSurfer.seekTo(1)
            } else {
                waveSurfer.setTime(currentTime + 5)
            }
            placeCursor(waveSurfer.getCurrentTime())
            lastSeekTime = actualTime
        } catch (err) {
            console.log(err)
        }
    }
})

// volume slider
const volumeSlider = document.getElementById("volumeSlider")
const volumeNumber = document.getElementById("volumeNumber")

volumeSlider.addEventListener("input", () => {
    const currentTime = audioContext.currentTime    
    if (!gainNode) {  
        setupGainNode()
    }
    volumeNumber.valueAsNumber = Math.round(volumeSlider.valueAsNumber * 100)
    const volume = volumeSlider.valueAsNumber
    gainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.1)
})

volumeNumber.addEventListener("change", () => {
    const currentTime = audioContext.currentTime
    if (!gainNode) {  
        setupGainNode()
    }
    if (volumeNumber.valueAsNumber > volumeNumber.max) {
        volumeNumber.valueAsNumber = volumeNumber.max
    } 
    if (volumeNumber.valueAsNumber < volumeNumber.min) {
        volumeNumber.valueAsNumber = volumeNumber.min        
    }
    volumeSlider.valueAsNumber = volumeNumber.valueAsNumber / 100
    const volume = volumeSlider.valueAsNumber
    gainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.1)
})

// mute button
let muted = false
let volume = volumeSlider.value
const muteButton = document.getElementById("muteIcon")
muteButton.addEventListener("click", () => { 

    if (!gainNode) {  
        setupGainNode()
    }

    if (muted) {
        const currentTime = audioContext.currentTime
        muted = false
        muteButton.src = "/icons/volume.svg"
        volumeSlider.disabled = false
        gainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.1)
    } else if (!muted){
        const currentTime = audioContext.currentTime
        muted = true
        muteButton.src = "/icons/volumeMuted.svg"
        volume = volumeSlider.value
        volumeSlider.disabled = true
        gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.1)
    }

})

// zoom
const zoomSlider = document.getElementById("zoomSlider")
const zoomNumber = document.getElementById("zoomNumber")
const zoomButton = document.getElementById("zoomIcon")
let zoomLevel = 0 // needed as global for spectrum

zoomSlider.addEventListener("change", (e) => {
    const minPxPerSec = e.target.valueAsNumber
    zoomLevel = minPxPerSec
    waveSurfer.zoom(minPxPerSec)
    //to debug timeline
    waveSurfer.setTime(waveSurfer.getCurrentTime())
    const zoomPerc = (zoomLevel / parseFloat(zoomSlider.max)) * 100
    zoomNumber.value = Math.round(zoomPerc)
})

zoomNumber.addEventListener("change", () => {
    const zoomPerc = zoomNumber.valueAsNumber
    const zoomMax = parseFloat(zoomSlider.max)
    const minPxPerSec = zoomPerc / 100 * zoomMax
    waveSurfer.zoom(minPxPerSec)
    waveSurfer.setTime(waveSurfer.getCurrentTime())
    zoomSlider.value = minPxPerSec
})

// speed rate
const speedButton = document.getElementById("speedIcon")
const speedSlider = document.getElementById("speedSlider")
const speedNumber = document.getElementById("speedNumber")

speedSlider.disabled = true //enabled when wavesurver is init

speedSlider.addEventListener("input", (e) => {
    const sliderValue = e.target.valueAsNumber
    const playRate = sliderValue / 100
    speedNumber.value = sliderValue
    waveSurfer.setPlaybackRate(playRate, true)
    if (playRate != 1) {
        speedButton.src = "/icons/redSpeed.svg"
    } else {
        speedButton.src = "/icons/speed.svg"
    }
})

speedNumber.addEventListener("change", () => {
    if (speedNumber.valueAsNumber > speedSlider.max) {
        speedNumber.valueAsNumber = speedSlider.max
    } else if (speedNumber.valueAsNumber < speedSlider.min) {
        speedNumber.valueAsNumber = speedSlider.min        
    }
    speedSlider.value = speedNumber.value
    const playRate = speedNumber.valueAsNumber / 100
    waveSurfer.setPlaybackRate(playRate, true)
    if (playRate != 1) {
        speedButton.src = "/icons/redSpeed.svg"
    } else {
        speedButton.src = "/icons/speed.svg"
    }
})

speedButton.addEventListener("click", () => {
    if (waveSurfer) {
        speedSlider.valueAsNumber = 100
        speedNumber.valueAsNumber = 100
        waveSurfer.setPlaybackRate(1, true)
        speedButton.src = "/icons/speed.svg"
    }
})

// flags

const flagButton = document.getElementById("flagIcon")
const undoFlagButton = document.getElementById("undoFlagIcon")
let flags = []

flagButton.addEventListener("click", () => {
    if (waveSurfer != null) {
        
        const currentTime = waveSurfer.getCurrentTime()
        let markerName = prompt("Insert marker name:")

        const newRegion = regions.addRegion({
            start: currentTime,
            content: markerName,
            drag: false,
            resize: false,
            color: "red"
        })

        flags.push(newRegion)

        const newMinimapRegion = minimapRegions.addRegion({
            start: currentTime,
            drag: false,
            resize: false,
            color: "red"
        })

        //double click to remove
        newRegion.on("dblclick", ()=>{
            newRegion.remove()
            reloadMinimap()
        })
    }
})

undoFlagButton.addEventListener("click", () => {
    if (waveSurfer != null) {
        
        if (flags.length > 0) {            
            flags[flags.length-1].remove()
            flags.pop()
            reloadMinimap()
        }

    }
})

// selection and loop

let loop = false
let activeRegion = null
let activeMinimapRegion = null

const loopButton = document.getElementById("loopIcon")
loopButton.addEventListener("click", () => {
    loop = !loop
    if (loop) {
        loopButton.src = "/icons/redLoop.svg"
    } else {
        loopButton.src = "/icons/loop.svg"
    }
})

let selectionStartButton = document.getElementById("selectionStartIcon")
let selectionEndButton = document.getElementById("selectionEndIcon")
let clearSelectionButton = document.getElementById("clearSelectionIcon")

selectionStartButton.addEventListener("click", () => {
    const currentTime = waveSurfer.getCurrentTime()
    if (!activeRegion) {
        activeRegion = regions.addRegion({
            start: currentTime,
            color: "rgba(255, 255, 0, 0.7)",
            drag: false,
            resize: false,
        })
        reloadMinimap()
    } else if (activeRegion) {
        if (activeRegion.end < currentTime) {            
            activeRegion.remove()
            activeRegion = regions.addRegion({
                start: currentTime,
                color: "rgba(255, 255, 0, 0.7)",
                drag: false,
                resize: false,
            })           
            reloadMinimap()
        } else {
            const endRegionTime = activeRegion.end
            activeRegion.remove()
            activeRegion = regions.addRegion({
                start: currentTime,
                end: endRegionTime,
                color: "rgba(255, 255, 0, 0.1)",
                drag: false,
                resize: false,
            })
            reloadMinimap()
        }
    }
})

selectionEndButton.addEventListener("click", () => {
    const currentTime = waveSurfer.getCurrentTime()
    if (activeRegion) {
        if (activeRegion.start < currentTime) {            
            const startRegionTime = activeRegion.start
            activeRegion.remove()
            activeRegion = regions.addRegion({
                start: startRegionTime,
                end: currentTime,
                color: "rgba(255, 255, 0, 0.1)",
                drag: false,
                resize: false,
            })
            reloadMinimap()
        } else {
            alert("Select a point after the selection starting point.")
        }
    } else {
        alert("select a starting point first.")
    }
})

clearSelectionButton.addEventListener("click", () => {
    if (activeRegion) {
        activeRegion.remove()
        activeRegion = null
    }

    reloadMinimap()
    
})

// spectrogram

let spectrogramPresence = false
const spectrogramButton = document.getElementById("spectrogramIcon")

spectrogramButton.addEventListener("click", () => {
    if (waveSurfer) {
        spectrogramPresence = !spectrogramPresence
        // console.log("spectrogram", spectrogramPresence)
        const waveFormDiv = document.getElementById("waveform")
        let waveformDivHeight = waveFormDiv.clientHeight
        // console.log(waveformDivHeight)
        if(spectrogramPresence) {
            spectrogramButton.src = "/icons/redSpectrogram.svg"
            spectrogram = WaveSurfer.Spectrogram.create({
                fftSamples:2048,
                height: Math.floor(waveformDivHeight*0.45),
            })
            waveSurfer.setOptions({
                height: Math.floor(waveformDivHeight*0.45)
            })
            waveSurfer.registerPlugin(spectrogram)
            // without zooming spectrum doesn't appear
            waveSurfer.zoom(zoomLevel)
        } else {
            spectrogram.destroy()
            spectrogramButton.src = "/icons/spectrogram.svg"
            waveSurfer.setOptions({
                height: Math.floor(waveformDivHeight*0.9)
            })
        }
    }
})

// PIANO

const pianoDiv = document.getElementById("pianokeyboard")

const keys = 88
const blackKeyPattern = [1,0,1,1,0,1,1]
const noteAFrequency = 440
const notes = ["A", "B", "C", "D", "E", "F", "G"]
let synth = null // ititialized with audiocontext
let keyCount = 0 
let noteCount = 0
let guessCanvas = null
let FFTData = null

const activeKeys = new Set()

generatePiano()
setupGuessCanvas()
let notesConstantData = getNotesData()
const noteGuessAnimation = requestAnimationFrame(drawNoteGuesses)

// PITCHSHIFTER

let pitchShifter = null
const naturalIcon = document.getElementById("naturalIcon")
const pitchSlider = document.getElementById("pitchRange")
const pitchNumber = document.getElementById("pitchNumber")

naturalIcon.addEventListener("click", () => {
    if (pitchShifter) {
        pitchSlider.value = 0
        pitchNumber.value = 0
        pitchShifter.parameters.get("pitch").value = 1
        naturalIcon.src = "/icons/bequadro.svg"
    }
})

pitchSlider.addEventListener("input", () => {
    pitchNumber.value = pitchSlider.value
    if (pitchShifter) {
        pitchShifter.parameters.get("pitch").value = semitonesToFrequencyFactor(pitchNumber.value)
        if (pitchNumber.value != 0) {
            naturalIcon.src = "/icons/redBequadro.svg"
        } else {
            naturalIcon.src = "/icons/bequadro.svg"
        }
    } else {
        pitchNumber.value = 0
        pitchSlider.value = 0
    }
})

pitchNumber.addEventListener("change", () => {
    if (pitchNumber.value > 12) {
        pitchNumber.value = 12
    } else if (pitchNumber.value < -12) {
        pitchNumber.value = -12
    }
    pitchSlider.value = pitchNumber.value
    if (pitchShifter) {
        pitchShifter.parameters.get("pitch").value = semitonesToFrequencyFactor(pitchNumber.valueAsNumber)
        if (pitchNumber.value != 0) {
            naturalIcon.src = "/icons/redBequadro.svg"
        } else {
            naturalIcon.src = "/icons/bequadro.svg"
        }
    } else {
        pitchNumber.value = 0
        pitchSlider.value = 0
    }
})

// GRANULAR FREEZE

const freezeButton = document.getElementById("freezeIcon")

let freezeActive = false
let grainPlayer = null
let frozenBuffer = null
let freezeGain = null
let grainVoices = []
let grainPlayerContext = null
const VOICES_NUMBER = 5
const FREEZE_WINDOW = 0.1
const GRAIN_DENSITY = 5
const GRAIN_SPREAD = 0
const FREEZE_REVERB_DECAY = 1

freezeButton.addEventListener("click", toggleFreeze)

// DOWNLOAD

const downloadButton = document.getElementById("downloadIcon")

downloadButton.addEventListener("click", async () => {
    const buffer = await createBufferForDownload().catch((err) => {console.error(err)})
    console.log(buffer)
    const samples = buffer.lenght
    make_download(buffer, samples)
})