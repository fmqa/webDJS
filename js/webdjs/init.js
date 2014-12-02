var canvas = document.getElementById("canvas");
var gl = null;
var glContextTypes = ["webgl", "experimental-webgl", "moz-webgl", "webkit-3d"];

for (var i = 0; i < glContextTypes.length && !gl; ++i) {
    gl = canvas.getContext(glContextTypes[i]);
}

var video = document.createElement("video");
var videoReady = false;
video.autoplay = true;
video.loop = true;
video.oncanplay = function() {
    videoReady = true;
}
video.src = "assets/video.mp4";
video.play();

var texture1 = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture1);        
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

var texture2 = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture2);        
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

var texture3 = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture3);        
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

var texture4 = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture4);        
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

var texture5 = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture5);        
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

var vinput = new WebDJS.VJ.VideoSupplier(video, texture1);

var renderer = new WebDJS.VJ.Convolver();
renderer.transform(new Float32Array([
    1,  2,  1,
    0,  0,  0,
   -1, -2, -1
]));
vinput.register(renderer);

var renderer2 = new WebDJS.VJ.Convolver();
renderer.transform(new Float32Array([
    -1,  0,  1,
    -2,  0,  2,
    -1,  0,  1
]));

var renderer3 = new WebDJS.VJ.Simple();
renderer3.flipy(-1);

var fbo = gl.createFramebuffer();
var fbinput = new WebDJS.VJ.FramebufferSupplier(renderer, texture2, fbo);
fbinput.register(renderer2);

var fbo2 = gl.createFramebuffer();
var fbinput2 = new WebDJS.VJ.FramebufferSupplier(renderer2, texture3, fbo2);
fbinput2.register(renderer3);

var fbo3 = gl.createFramebuffer();
var fbinput3 = new WebDJS.VJ.FramebufferSupplier(renderer3, texture4, fbo3);

var colorControl = new WebDJS.VJ.Colorizer(
    renderer3, 
    function(){return document.getElementById("R-bar").value/255;}, 
    function(){return document.getElementById("G-bar").value/255;},
    function(){return document.getElementById("B-bar").value/255;},
    function(){return document.getElementById("Alpha-bar").value/255;});


var video2 = document.createElement("video");
var videoReady2 = false;
video2.autoplay = true;
video2.loop = true;
video2.oncanplay = function() {
    videoReady2 = true;
}
video2.src = "assets/video2.mp4";
video2.play();

var video2vinput = new WebDJS.VJ.VideoSupplier(video2, texture5);

var mixer = new WebDJS.VJ.Mixer();
//mixer.fade(0.5);
//mixer.fade(1.0);
video2vinput.register(mixer.left());
fbinput3.register(mixer.right());

function renderLoop() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (videoReady) {
        vinput.reload();
        vinput.apply(gl);
        
        fbinput.apply(gl);
        fbinput2.apply(gl);
        fbinput3.apply(gl);
    }
    if (videoReady2) {
        video2vinput.reload();
        video2vinput.apply(gl);
    }
    if (videoReady && videoReady2) {
        mixer.apply(gl);
    }
    window.requestAnimationFrame(renderLoop);
}

renderLoop();
