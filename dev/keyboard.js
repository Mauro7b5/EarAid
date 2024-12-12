let pianoOnKeyboard = false
let pianoOctave = 4

document.addEventListener("keydown", (event) => {

    // console.log(`keydown ${event.key}`)

    if (event.key === " ") {
        if (waveSurfer) {            
            if (waveSurfer.isPlaying()) {
                pauseButton.click()
            } else {
                playButton.click()
            }
        }
    }

    if (event.key === "p") {
        pianoOnKeyboard = !pianoOnKeyboard
    }

    if (event.key === "c") {
        placeCursor(waveSurfer.getCurrentTime())
    }

    if (event.key === "r") {
        waveSurfer.play()
    }

    if (event.key === "Delete") {
        clearSelectionButton.click()
    }

    if (event.key === "Backspace") {
        undoFlagButton.click()
    }    

    if (event.key === "ArrowLeft") {
        fiveBwdButton.click()
    }

    if (event.key === "ArrowRight") {
        fiveFwdButton.click()
    }

    if (event.key === "+") {
        if (waveSurfer) {
            const startingZoomValue = zoomNumber.valueAsNumber
            setZoom(startingZoomValue + 10)
        }
    }

    if (event.key === "-") {
        if (waveSurfer) {
            const startingZoomValue = zoomNumber.valueAsNumber
            setZoom(startingZoomValue - 10)
        }
    }

    if (!pianoOnKeyboard) {        
        if (event.key === "f") {
            flagButton.click()
        }
        if (event.key === "s") {
            selectionStartButton.click()
        }
        if (event.key === "e") {
            selectionEndButton.click()
        }
        if (event.key === "l") {
            loopButton.click()
        }
        if (event.key === "w") {
            rewindButton.click()
        }
    }

    if (pianoOnKeyboard) {
        if (event.key === "1") {
            resetPianoKeys()
            pianoOctave = 1
        }
        if (event.key === "2") {
            resetPianoKeys()
            pianoOctave = 2
        }
        if (event.key === "3") {
            resetPianoKeys()
            pianoOctave = 3
        }
        if (event.key === "4") {
            resetPianoKeys()
            pianoOctave = 4
        }
        if (event.key === "5") {
            resetPianoKeys()
            pianoOctave = 5
        }
        if (event.key === "6") {
            resetPianoKeys()
            pianoOctave = 6
        }
        if (event.key === "7") {
            resetPianoKeys()
            pianoOctave = 7
        }

        if (event.key === "a") {
            const pianoKey = document.getElementById(`pianoKeyC${pianoOctave}`)
            const keyNumber = pianoKey.dataset.keyNumber
            if (!activeKeys.has(keyNumber)) {
                activeKeys.add(keyNumber)
                playNote(keyNumber)
            }
        }
        if (event.key === "w") {
            const pianoKey = document.getElementById(`pianoKeyC#${pianoOctave}`)
            const keyNumber = pianoKey.dataset.keyNumber
            if (!activeKeys.has(keyNumber)) {
                activeKeys.add(keyNumber)
                playNote(keyNumber)
            }
        }
        if (event.key === "s") {
            const pianoKey = document.getElementById(`pianoKeyD${pianoOctave}`)
            const keyNumber = pianoKey.dataset.keyNumber
            if (!activeKeys.has(keyNumber)) {
                activeKeys.add(keyNumber)
                playNote(keyNumber)
            }
        }
        if (event.key === "e") {
            const pianoKey = document.getElementById(`pianoKeyD#${pianoOctave}`)
            const keyNumber = pianoKey.dataset.keyNumber
            if (!activeKeys.has(keyNumber)) {
                activeKeys.add(keyNumber)
                playNote(keyNumber)
            }
        }
        if (event.key === "d") {
            const pianoKey = document.getElementById(`pianoKeyE${pianoOctave}`)
            const keyNumber = pianoKey.dataset.keyNumber
            if (!activeKeys.has(keyNumber)) {
                activeKeys.add(keyNumber)
                playNote(keyNumber)
            }
        }
        if (event.key === "f") {
            const pianoKey = document.getElementById(`pianoKeyF${pianoOctave}`)
            const keyNumber = pianoKey.dataset.keyNumber
            if (!activeKeys.has(keyNumber)) {
                activeKeys.add(keyNumber)
                playNote(keyNumber)
            }
        }
        if (event.key === "t") {
            const pianoKey = document.getElementById(`pianoKeyF#${pianoOctave}`)
            const keyNumber = pianoKey.dataset.keyNumber
            if (!activeKeys.has(keyNumber)) {
                activeKeys.add(keyNumber)
                playNote(keyNumber)
            }
        }
        if (event.key === "g") {
            const pianoKey = document.getElementById(`pianoKeyG${pianoOctave}`)
            const keyNumber = pianoKey.dataset.keyNumber
            if (!activeKeys.has(keyNumber)) {
                activeKeys.add(keyNumber)
                playNote(keyNumber)
            }
        }
        if (event.key === "y") {
            const pianoKey = document.getElementById(`pianoKeyG#${pianoOctave}`)
            const keyNumber = pianoKey.dataset.keyNumber
            if (!activeKeys.has(keyNumber)) {
                activeKeys.add(keyNumber)
                playNote(keyNumber)
            }
        }
        if (event.key === "h") {
            const pianoKey = document.getElementById(`pianoKeyA${pianoOctave}`)
            const keyNumber = pianoKey.dataset.keyNumber
            if (!activeKeys.has(keyNumber)) {
                activeKeys.add(keyNumber)
                playNote(keyNumber)
            }
        }
        if (event.key === "u") {
            const pianoKey = document.getElementById(`pianoKeyA#${pianoOctave}`)
            const keyNumber = pianoKey.dataset.keyNumber
            if (!activeKeys.has(keyNumber)) {
                activeKeys.add(keyNumber)
                playNote(keyNumber)
            }
        }
        if (event.key === "j") {
            const pianoKey = document.getElementById(`pianoKeyB${pianoOctave}`)
            const keyNumber = pianoKey.dataset.keyNumber
            if (!activeKeys.has(keyNumber)) {
                activeKeys.add(keyNumber)
                playNote(keyNumber)
            }
        }
        if (event.key === "k") {
            const pianoKey = document.getElementById(`pianoKeyC${pianoOctave+1}`)
            const keyNumber = pianoKey.dataset.keyNumber
            if (!activeKeys.has(keyNumber)) {
                activeKeys.add(keyNumber)
                playNote(keyNumber)
            }
        }
    }
})

document.addEventListener("keyup", (event) => {
    // console.log(`keyup ${event.key}`)

    if (pianoOnKeyboard) {
                if (event.key === "a") {
            const pianoKey = document.getElementById(`pianoKeyC${pianoOctave}`)
            const keyNumber = pianoKey.dataset.keyNumber
            if (activeKeys.has(keyNumber)) {
                activeKeys.delete(keyNumber)
                stopNote(keyNumber)
            }
        }
        if (event.key === "w") {
            const pianoKey = document.getElementById(`pianoKeyC#${pianoOctave}`)
            const keyNumber = pianoKey.dataset.keyNumber
            if (activeKeys.has(keyNumber)) {
                activeKeys.delete(keyNumber)
                stopNote(keyNumber)
            }
        }
        if (event.key === "s") {
            const pianoKey = document.getElementById(`pianoKeyD${pianoOctave}`)
            const keyNumber = pianoKey.dataset.keyNumber
            if (activeKeys.has(keyNumber)) {
                activeKeys.delete(keyNumber)
                stopNote(keyNumber)
            }
        }
        if (event.key === "e") {
            const pianoKey = document.getElementById(`pianoKeyD#${pianoOctave}`)
            const keyNumber = pianoKey.dataset.keyNumber
            if (activeKeys.has(keyNumber)) {
                activeKeys.delete(keyNumber)
                stopNote(keyNumber)
            }
        }
        if (event.key === "d") {
            const pianoKey = document.getElementById(`pianoKeyE${pianoOctave}`)
            const keyNumber = pianoKey.dataset.keyNumber
            if (activeKeys.has(keyNumber)) {
                activeKeys.delete(keyNumber)
                stopNote(keyNumber)
            }
        }
        if (event.key === "f") {
            const pianoKey = document.getElementById(`pianoKeyF${pianoOctave}`)
            const keyNumber = pianoKey.dataset.keyNumber
            if (activeKeys.has(keyNumber)) {
                activeKeys.delete(keyNumber)
                stopNote(keyNumber)
            }
        }
        if (event.key === "t") {
            const pianoKey = document.getElementById(`pianoKeyF#${pianoOctave}`)
            const keyNumber = pianoKey.dataset.keyNumber
            if (activeKeys.has(keyNumber)) {
                activeKeys.delete(keyNumber)
                stopNote(keyNumber)
            }
        }
        if (event.key === "g") {
            const pianoKey = document.getElementById(`pianoKeyG${pianoOctave}`)
            const keyNumber = pianoKey.dataset.keyNumber
            if (activeKeys.has(keyNumber)) {
                activeKeys.delete(keyNumber)
                stopNote(keyNumber)
            }
        }
        if (event.key === "y") {
            const pianoKey = document.getElementById(`pianoKeyG#${pianoOctave}`)
            const keyNumber = pianoKey.dataset.keyNumber
            if (activeKeys.has(keyNumber)) {
                activeKeys.delete(keyNumber)
                stopNote(keyNumber)
            }
        }
        if (event.key === "h") {
            const pianoKey = document.getElementById(`pianoKeyA${pianoOctave}`)
            const keyNumber = pianoKey.dataset.keyNumber
            if (activeKeys.has(keyNumber)) {
                activeKeys.delete(keyNumber)
                stopNote(keyNumber)
            }
        }
        if (event.key === "u") {
            const pianoKey = document.getElementById(`pianoKeyA#${pianoOctave}`)
            const keyNumber = pianoKey.dataset.keyNumber
            if (activeKeys.has(keyNumber)) {
                activeKeys.delete(keyNumber)
                stopNote(keyNumber)
            }
        }
        if (event.key === "j") {
            const pianoKey = document.getElementById(`pianoKeyB${pianoOctave}`)
            const keyNumber = pianoKey.dataset.keyNumber
            if (activeKeys.has(keyNumber)) {
                activeKeys.delete(keyNumber)
                stopNote(keyNumber)
            }
        }
        if (event.key === "k") {
            const pianoKey = document.getElementById(`pianoKeyC${pianoOctave+1}`)
            const keyNumber = pianoKey.dataset.keyNumber
            if (activeKeys.has(keyNumber)) {
                activeKeys.delete(keyNumber)
                stopNote(keyNumber)
            }
        }
    }
})