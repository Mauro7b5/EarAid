let pianoOnKeyboard = false
let pianoOctave = 4

document.addEventListener("keydown", (event) => {
    console.log(event.key)
    if (event.key === " ") {
        if (waveSurfer.isPlaying()) {
            pauseButton.click()
        } else {
            playButton.click()
        }
    }

    if (!pianoOnKeyboard) {        
        if (event.key === "ArrowLeft") {
            fiveBwdButton.click()
        }
        if (event.key === "ArrowRight") {
            fiveFwdButton.click()
        }
        if (event.key === "f") {
            flagButton.click()
        }
        if (event.key === "Delete") {
            clearSelectionButton.click()
        }
        if (event.key === "BackSpace") {
            undoFlagButton.click()
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

    // if (event.key === "+") {
    //     const startingZoomValue = zoomNumber.valueAsNumber
    //     zoomNumber.value = startingZoomValue + 10
    // }

    if (event.key === "p") {
        pianoOnKeyboard = !pianoOnKeyboard
    }
})