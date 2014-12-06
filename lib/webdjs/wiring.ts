/// <reference path="webdjs.ts" />

module WebDJS {
    module Wiring {
        export function wireVJ(doc : Document) : VJ.UI {
            return {
                left: {
                    midiActive: <HTMLInputElement>doc.getElementById("leftCtrl"),
                    video: <HTMLVideoElement>doc.getElementById("leftVideo"),
                    volume: <HTMLInputElement>doc.getElementById("volumeLeft"),
                    volumeSpinner: <HTMLInputElement>doc.getElementById("volumeLeftField"),
                    speed: <HTMLInputElement>doc.getElementById("speedLeft"),
                    speedSpinner: <HTMLInputElement>doc.getElementById("speedLeftField"),
                    red: <HTMLInputElement>doc.getElementById("RLeft"),
                    redSpinner: <HTMLInputElement>doc.getElementById("RLeftField"),
                    green: <HTMLInputElement>doc.getElementById("GLeft"),
                    greenSpinner: <HTMLInputElement>doc.getElementById("GLeftField"),
                    blue: <HTMLInputElement>doc.getElementById("BLeft"),
                    blueSpinner: <HTMLInputElement>doc.getElementById("BLeftField"),
                    playingTime: <HTMLInputElement>doc.getElementById("timeLeft"),
                    filterOne: <HTMLSelectElement>doc.getElementById("leftFilterOne"),
                    filterTwo: <HTMLSelectElement>doc.getElementById("leftFilterTwo"),
                    fileInput: <HTMLInputElement>doc.getElementById("leftFile"),
                    playButton: <HTMLButtonElement>doc.getElementById("leftButtonPlay"),
                    stopButton: <HTMLButtonElement>doc.getElementById("leftButtonStop"),
                    resetButton: <HTMLButtonElement>doc.getElementById("leftButtonStop")
                },
                right: {
                    midiActive: <HTMLInputElement>doc.getElementById("rightCtrl"),
                    video: <HTMLVideoElement>doc.getElementById("rightVideo"),
                    volume: <HTMLInputElement>doc.getElementById("volumeRight"),
                    volumeSpinner: <HTMLInputElement>doc.getElementById("volumeRightField"),
                    speed: <HTMLInputElement>doc.getElementById("speedRight"),
                    speedSpinner: <HTMLInputElement>doc.getElementById("speedRightField"),
                    red: <HTMLInputElement>doc.getElementById("RRight"),
                    redSpinner: <HTMLInputElement>doc.getElementById("RRightField"),
                    green: <HTMLInputElement>doc.getElementById("GRight"),
                    greenSpinner: <HTMLInputElement>doc.getElementById("GRightField"),
                    blue: <HTMLInputElement>doc.getElementById("BRight"),
                    blueSpinner: <HTMLInputElement>doc.getElementById("BRightField"),
                    playingTime: <HTMLInputElement>doc.getElementById("timeRight"),
                    filterOne: <HTMLSelectElement>doc.getElementById("rightFilterOne"),
                    filterTwo: <HTMLSelectElement>doc.getElementById("rightFilterTwo"),
                    fileInput: <HTMLInputElement>doc.getElementById("rightFile"),
                    playButton: <HTMLButtonElement>doc.getElementById("rightButtonPlay"),
                    stopButton: <HTMLButtonElement>doc.getElementById("rightButtonStop"),
                    resetButton: <HTMLButtonElement>doc.getElementById("rightButtonStop")
                },
                fader: <HTMLInputElement>doc.getElementById("fader")
            };
        }
    }
}

