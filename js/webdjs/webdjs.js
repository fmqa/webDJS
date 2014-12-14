var WebDJS;
(function (WebDJS) {
    var VJ;
    (function (VJ) {
        var StoreConsumer = (function () {
            function StoreConsumer() {
            }
            StoreConsumer.prototype.texturize = function (texture, width, height) {
                this.texture = texture;
                this.w = width;
                this.h = height;
            };
            StoreConsumer.prototype.get = function () {
                return this.texture;
            };
            StoreConsumer.prototype.width = function () {
                return this.w;
            };
            StoreConsumer.prototype.height = function () {
                return this.h;
            };
            return StoreConsumer;
        })();
        VJ.StoreConsumer = StoreConsumer;
        /**
         * HTML Image -> Texture operation.
         */
        var ImageSupplier = (function () {
            function ImageSupplier(src, texture) {
                if (texture === void 0) { texture = null; }
                this.src = src;
                this.bind(texture);
            }
            ImageSupplier.prototype.bind = function (texture) {
                this.texture = texture;
                this.reload();
            };
            ImageSupplier.prototype.register = function (target) {
                this.target = target;
            };
            ImageSupplier.prototype.reload = function () {
                this.context = null;
            };
            ImageSupplier.prototype.apply = function (gl) {
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                if (gl !== this.context) {
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.src);
                    this.context = gl;
                }
                this.target.texturize(this.texture, this.src.width, this.src.height);
            };
            return ImageSupplier;
        })();
        VJ.ImageSupplier = ImageSupplier;
        /**
         * HTML Video -> Texture operation.
         */
        var VideoSupplier = (function () {
            function VideoSupplier(src, texture) {
                if (src === void 0) { src = null; }
                if (texture === void 0) { texture = null; }
                this.src = src;
                this.bind(texture);
            }
            VideoSupplier.prototype.inlet = function (src) {
                this.src = src;
                this.reload();
            };
            VideoSupplier.prototype.bind = function (texture) {
                this.texture = texture;
                this.reload();
            };
            VideoSupplier.prototype.register = function (target) {
                this.target = target;
            };
            VideoSupplier.prototype.reload = function () {
                this.context = null;
            };
            VideoSupplier.prototype.apply = function (gl) {
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                if (gl !== this.context) {
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.src);
                    this.context = gl;
                }
                this.target.texturize(this.texture, this.src.videoWidth, this.src.videoHeight);
            };
            return VideoSupplier;
        })();
        VJ.VideoSupplier = VideoSupplier;
        var FramebufferSupplier = (function () {
            function FramebufferSupplier(scn, texture, fbo) {
                if (scn === void 0) { scn = null; }
                if (texture === void 0) { texture = null; }
                if (fbo === void 0) { fbo = null; }
                this.scn = scn;
                this.bind(texture);
                this.framebuffer(fbo);
            }
            FramebufferSupplier.prototype.inlet = function (scn) {
                this.scn = scn;
                this.context = null;
            };
            FramebufferSupplier.prototype.bind = function (texture) {
                this.texture = texture;
                this.context = null;
            };
            FramebufferSupplier.prototype.register = function (target) {
                this.target = target;
            };
            FramebufferSupplier.prototype.framebuffer = function (fbo) {
                this.fbo = fbo;
                this.context = null;
            };
            FramebufferSupplier.prototype.apply = function (gl) {
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                if (gl !== this.context) {
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.scn.width(), this.scn.height(), 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                }
                gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
                if (gl !== this.context) {
                    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
                    this.context = gl;
                }
                gl.viewport(0, 0, this.scn.width(), this.scn.height());
                this.scn.apply(gl);
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                this.target.texturize(this.texture, this.scn.width(), this.scn.height());
            };
            return FramebufferSupplier;
        })();
        VJ.FramebufferSupplier = FramebufferSupplier;
        /**
         * Rectangle Vertex Array Object.
         *
         * Transforms <x,y,width,height>-Tuples to a pair of Vertex/Index Buffers.
         */
        var Rectangle = (function () {
            function Rectangle(vertexBuffer, indexBuffer) {
                if (vertexBuffer === void 0) { vertexBuffer = null; }
                if (indexBuffer === void 0) { indexBuffer = null; }
                this.vertices = new Float32Array(8);
                this.indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
                this.bind(vertexBuffer, indexBuffer);
                this.translate(0, 0);
                this.resize(1, 1);
            }
            Rectangle.prototype.bind = function (vertexBuffer, indexBuffer) {
                this.vertexBuffer = vertexBuffer;
                this.indexBuffer = indexBuffer;
                this.changed = true;
                this.context = null;
            };
            Rectangle.prototype.translate = function (x, y) {
                this.x = x;
                this.y = y;
                this.vertices[0] = this.x;
                this.vertices[1] = this.y;
                this.vertices[3] = this.y;
                this.vertices[6] = this.x;
                this.changed = true;
            };
            Rectangle.prototype.resize = function (width, height) {
                this.width = width;
                this.height = height;
                this.vertices[2] = this.x + this.width;
                this.vertices[4] = this.x + this.width;
                this.vertices[5] = this.y + this.height;
                this.vertices[7] = this.y + this.height;
                this.changed = true;
            };
            Rectangle.prototype.apply = function (gl) {
                gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
                if (this.changed || gl !== this.context) {
                    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
                    this.changed = false;
                }
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
                if (gl !== this.context) {
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
                    this.context = gl;
                }
            };
            return Rectangle;
        })();
        VJ.Rectangle = Rectangle;
        /**
         * Simple Renderer - Render HTML Image/Video to GL context.
         */
        var Simple = (function () {
            function Simple() {
                this.yflip = 1;
                this.vertexArray = new Rectangle();
                this.rgba = new Float32Array([1, 1, 1, 1]);
                this.recolor = true;
                this.rebind = false;
                this.flipped = false;
            }
            Simple.prototype.colorize = function (red, green, blue, alpha) {
                this.rgba[0] = red;
                this.rgba[1] = green;
                this.rgba[2] = blue;
                this.rgba[3] = alpha;
                this.recolor = true;
            };
            Simple.prototype.flipy = function (yflip) {
                this.yflip = yflip;
                this.flipped = true;
            };
            Simple.prototype.width = function () {
                return this.textureWidth;
            };
            Simple.prototype.height = function () {
                return this.textureHeight;
            };
            Simple.prototype.texturize = function (texture, width, height) {
                this.texture = texture;
                this.textureWidth = width;
                this.textureHeight = height;
                this.rebind = true;
            };
            Simple.prototype.apply = function (gl) {
                if (gl !== this.context) {
                    this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
                    gl.shaderSource(this.vertexShader, "attribute vec2 vxy;" + "varying vec2 txy;" + "uniform float flipy;" + "void main() {" + "   gl_Position = vec4(vxy.x*2.0-1.0, (1.0-vxy.y*2.0)*flipy, 0, 1);" + "   txy = vxy;" + "}");
                    gl.compileShader(this.vertexShader);
                    this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
                    gl.shaderSource(this.fragmentShader, "precision mediump float;" + "uniform sampler2D sampler;" + "uniform vec4 rgba;" + "varying vec2 txy;" + "void main() {" + "   vec4 texColor = texture2D(sampler, txy);" + "   gl_FragColor = texColor * rgba;" + "}");
                    gl.compileShader(this.fragmentShader);
                    this.shaderProgram = gl.createProgram();
                    gl.attachShader(this.shaderProgram, this.vertexShader);
                    gl.attachShader(this.shaderProgram, this.fragmentShader);
                    gl.linkProgram(this.shaderProgram);
                    gl.useProgram(this.shaderProgram);
                    this.xyLocation = gl.getAttribLocation(this.shaderProgram, "vxy");
                    gl.enableVertexAttribArray(this.xyLocation);
                    this.samplerLocation = gl.getUniformLocation(this.shaderProgram, "sampler");
                    gl.uniform1i(this.samplerLocation, 0);
                    this.rgbaLocation = gl.getUniformLocation(this.shaderProgram, "rgba");
                    gl.uniform4fv(this.rgbaLocation, this.rgba);
                    this.flipyLocation = gl.getUniformLocation(this.shaderProgram, "flipy");
                    gl.uniform1f(this.flipyLocation, this.yflip);
                    this.vertexBuffer = gl.createBuffer();
                    this.indexBuffer = gl.createBuffer();
                    this.vertexArray.bind(this.vertexBuffer, this.indexBuffer);
                }
                if (this.rebind || gl !== this.context) {
                    gl.bindTexture(gl.TEXTURE_2D, this.texture);
                    this.rebind = false;
                }
                this.vertexArray.apply(gl);
                gl.useProgram(this.shaderProgram);
                if (this.recolor || gl !== this.context) {
                    gl.uniform4fv(this.rgbaLocation, this.rgba);
                    this.recolor = false;
                }
                if (this.flipped || gl !== this.context) {
                    gl.uniform1f(this.flipyLocation, this.yflip);
                    this.flipped = false;
                }
                if (gl !== this.context) {
                    this.context = gl;
                }
                gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
                gl.vertexAttribPointer(this.xyLocation, 2, gl.FLOAT, false, 0, 0);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
                gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
            };
            return Simple;
        })();
        VJ.Simple = Simple;
        var Convolver = (function () {
            function Convolver() {
                this.kernel = new Float32Array([0, 0, 0, 0, 1, 0, 0, 0, 0]);
                this.vertexArray = new Rectangle();
                this.rebind = false;
                this.changed = false;
                this.flipped = false;
                this.yflip = 1;
            }
            Convolver.prototype.transform = function (kernel) {
                this.kernel = kernel;
                this.changed = true;
            };
            Convolver.prototype.width = function () {
                return this.textureWidth;
            };
            Convolver.prototype.height = function () {
                return this.textureHeight;
            };
            Convolver.prototype.texturize = function (texture, width, height) {
                this.texture = texture;
                this.textureWidth = width;
                this.textureHeight = height;
                this.rebind = true;
            };
            Convolver.prototype.flipy = function (yflip) {
                this.yflip = yflip;
                this.flipped = true;
            };
            Convolver.prototype.apply = function (gl) {
                if (gl !== this.context) {
                    this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
                    gl.shaderSource(this.vertexShader, "attribute vec2 vxy;" + "varying vec2 txy;" + "uniform float flipy;" + "void main() {" + "   gl_Position = vec4(vxy.x*2.0-1.0, (1.0-vxy.y*2.0)*flipy, 0, 1);" + "   txy = vxy;" + "}");
                    gl.compileShader(this.vertexShader);
                    this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
                    gl.shaderSource(this.fragmentShader, "precision mediump float;" + "uniform sampler2D sampler;" + "uniform vec2 tsize;" + "uniform float kernel[9];" + "varying vec2 txy;" + "void main() {" + "   vec2 p = vec2(1.0, 1.0) / tsize;" + "   vec4 s = texture2D(sampler, txy + p * vec2(-1, -1)) * kernel[0] +" + "            texture2D(sampler, txy + p * vec2(0, -1)) * kernel[1] +" + "            texture2D(sampler, txy + p * vec2(1, -1)) * kernel[2] +" + "            texture2D(sampler, txy + p * vec2(-1, 0)) * kernel[3] +" + "            texture2D(sampler, txy + p * vec2(0, 0)) * kernel[4] +" + "            texture2D(sampler, txy + p * vec2(1, 0)) * kernel[5] +" + "            texture2D(sampler, txy + p * vec2(-1, 1)) * kernel[6] +" + "            texture2D(sampler, txy + p * vec2(0, 1)) * kernel[7] +" + "            texture2D(sampler, txy + p * vec2(1, 1)) * kernel[8];" + "   float w = kernel[0] +" + "             kernel[1] +" + "             kernel[2] +" + "             kernel[3] +" + "             kernel[4] +" + "             kernel[5] +" + "             kernel[6] +" + "             kernel[7] +" + "             kernel[8];" + "   if (w <= 0.0) {" + "       w = 1.0;" + "   }" + "   gl_FragColor = vec4((s / w).rgb, 1);" + "}");
                    gl.compileShader(this.fragmentShader);
                    this.shaderProgram = gl.createProgram();
                    gl.attachShader(this.shaderProgram, this.vertexShader);
                    gl.attachShader(this.shaderProgram, this.fragmentShader);
                    gl.linkProgram(this.shaderProgram);
                    gl.useProgram(this.shaderProgram);
                    this.vertexBuffer = gl.createBuffer();
                    this.indexBuffer = gl.createBuffer();
                    this.vertexArray.bind(this.vertexBuffer, this.indexBuffer);
                    this.xyLocation = gl.getAttribLocation(this.shaderProgram, "vxy");
                    gl.enableVertexAttribArray(this.xyLocation);
                    this.samplerLocation = gl.getUniformLocation(this.shaderProgram, "sampler");
                    gl.uniform1i(this.samplerLocation, 0);
                    this.tsizeLocation = gl.getUniformLocation(this.shaderProgram, "tsize");
                    this.kernelLocation = gl.getUniformLocation(this.shaderProgram, "kernel[0]");
                    this.flipyLocation = gl.getUniformLocation(this.shaderProgram, "flipy");
                    gl.uniform1f(this.flipyLocation, this.yflip);
                }
                if (this.rebind || gl !== this.context) {
                    gl.bindTexture(gl.TEXTURE_2D, this.texture);
                    this.rebind = false;
                }
                this.vertexArray.apply(gl);
                gl.useProgram(this.shaderProgram);
                if (this.rebind || gl !== this.context) {
                    gl.uniform2f(this.tsizeLocation, this.textureWidth, this.textureHeight);
                    this.rebind = false;
                }
                if (this.changed || gl !== this.context) {
                    gl.uniform1fv(this.kernelLocation, this.kernel);
                }
                if (this.flipped || gl !== this.context) {
                    gl.uniform1f(this.flipyLocation, this.yflip);
                    this.flipped = false;
                }
                if (gl !== this.context) {
                    this.context = gl;
                }
                gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
                gl.vertexAttribPointer(this.xyLocation, 2, gl.FLOAT, false, 0, 0);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
                gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
            };
            return Convolver;
        })();
        VJ.Convolver = Convolver;
        var Mixer = (function () {
            function Mixer() {
                this.l = new StoreConsumer();
                this.r = new StoreConsumer();
                this.vertexArray = new Rectangle();
                this.yflip = 1;
                this.flipped = false;
                this.fadeValue = 0;
                this.faded = false;
            }
            Mixer.prototype.left = function () {
                return this.l;
            };
            Mixer.prototype.right = function () {
                return this.r;
            };
            Mixer.prototype.width = function () {
                return this.l.width();
            };
            Mixer.prototype.height = function () {
                return this.l.height();
            };
            Mixer.prototype.flipy = function (yflip) {
                this.yflip = yflip;
                this.flipped = true;
            };
            Mixer.prototype.fade = function (value) {
                this.fadeValue = value;
                this.faded = true;
            };
            Mixer.prototype.apply = function (gl) {
                if (gl !== this.context) {
                    this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
                    gl.shaderSource(this.vertexShader, "attribute vec2 vxy;" + "varying vec2 txy;" + "uniform float flipy;" + "void main() {" + "   gl_Position = vec4(vxy.x*2.0-1.0, (1.0-vxy.y*2.0)*flipy, 0, 1);" + "   txy = vxy;" + "}");
                    gl.compileShader(this.vertexShader);
                    this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
                    gl.shaderSource(this.fragmentShader, "precision mediump float;" + "uniform sampler2D samplerOne;" + "uniform sampler2D samplerTwo;" + "uniform float fade;" + "varying vec2 txy;" + "void main() {" + "   vec4 texOneColor = texture2D(samplerOne, txy);" + "   vec4 texTwoColor = texture2D(samplerTwo, txy);" + "   gl_FragColor = (texOneColor * (1.0 - fade)) + (texTwoColor * fade);" + "}");
                    gl.compileShader(this.fragmentShader);
                    this.shaderProgram = gl.createProgram();
                    gl.attachShader(this.shaderProgram, this.vertexShader);
                    gl.attachShader(this.shaderProgram, this.fragmentShader);
                    gl.linkProgram(this.shaderProgram);
                    gl.useProgram(this.shaderProgram);
                    this.vertexBuffer = gl.createBuffer();
                    this.indexBuffer = gl.createBuffer();
                    this.vertexArray.bind(this.vertexBuffer, this.indexBuffer);
                    this.xyLocation = gl.getAttribLocation(this.shaderProgram, "vxy");
                    gl.enableVertexAttribArray(this.xyLocation);
                    this.flipyLocation = gl.getUniformLocation(this.shaderProgram, "flipy");
                    gl.uniform1f(this.flipyLocation, this.yflip);
                    this.samplerOneLocation = gl.getUniformLocation(this.shaderProgram, "samplerOne");
                    gl.uniform1i(this.samplerOneLocation, 0);
                    this.samplerTwoLocation = gl.getUniformLocation(this.shaderProgram, "samplerTwo");
                    gl.uniform1i(this.samplerTwoLocation, 1);
                    this.fadeLocation = gl.getUniformLocation(this.shaderProgram, "fade");
                    gl.uniform1f(this.fadeLocation, this.fadeValue);
                }
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.l.get());
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, this.r.get());
                this.vertexArray.apply(gl);
                gl.useProgram(this.shaderProgram);
                if (this.flipped || gl !== this.context) {
                    gl.uniform1f(this.flipyLocation, this.yflip);
                    this.flipped = false;
                }
                if (this.faded || gl !== this.context) {
                    gl.uniform1f(this.fadeLocation, this.fadeValue);
                    this.faded = false;
                }
                if (gl !== this.context) {
                    this.context = gl;
                }
                gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
                gl.vertexAttribPointer(this.xyLocation, 2, gl.FLOAT, false, 0, 0);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
                gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, null);
                gl.activeTexture(gl.TEXTURE0);
            };
            return Mixer;
        })();
        VJ.Mixer = Mixer;
        var Colorizer = (function () {
            function Colorizer(target, rGen, gGen, bGen, aGen) {
                this.target = target;
                this.rGen = rGen;
                this.gGen = gGen;
                this.bGen = bGen;
                this.aGen = aGen;
            }
            Colorizer.prototype.send = function () {
                this.target.colorize(this.rGen(), this.gGen(), this.bGen(), this.aGen());
            };
            return Colorizer;
        })();
        VJ.Colorizer = Colorizer;
        var Pipeline = (function () {
            function Pipeline() {
                this.leftVideoSupplier = new VideoSupplier();
                this.leftMatrixFilterOne = new Convolver();
                this.leftFBOConnectorOne = new FramebufferSupplier();
                this.leftMatrixFilterTwo = new Convolver();
                this.leftFBOConnectorTwo = new FramebufferSupplier();
                this.leftRGBAFilter = new Simple();
                this.leftFBOConnectorThree = new FramebufferSupplier();
                this.rightVideoSupplier = new VideoSupplier();
                this.rightMatrixFilterOne = new Convolver();
                this.rightFBOConnectorOne = new FramebufferSupplier();
                this.rightMatrixFilterTwo = new Convolver();
                this.rightFBOConnectorTwo = new FramebufferSupplier();
                this.rightRGBAFilter = new Simple();
                this.rightFBOConnectorThree = new FramebufferSupplier();
                this.mixer = new Mixer();
                this.leftUpdate = false;
                this.rightUpdate = false;
                this.leftRGBAFilter.flipy(-1);
                this.rightRGBAFilter.flipy(-1);
                this.mixer.fade(0.5);
            }
            Pipeline.prototype.leftInlet = function (l) {
                this.leftVideoSupplier.inlet(l);
            };
            Pipeline.prototype.rightInlet = function (r) {
                this.rightVideoSupplier.inlet(r);
            };
            Pipeline.prototype.colorizeLeft = function (red, green, blue, alpha) {
                this.leftRGBAFilter.colorize(red, green, blue, alpha);
            };
            Pipeline.prototype.colorizeRight = function (red, green, blue, alpha) {
                this.rightRGBAFilter.colorize(red, green, blue, alpha);
            };
            Pipeline.prototype.leftConvOne = function (m) {
                this.leftMatrixFilterOne.transform(m);
            };
            Pipeline.prototype.leftConvTwo = function (m) {
                this.leftMatrixFilterTwo.transform(m);
            };
            Pipeline.prototype.rightConvOne = function (m) {
                this.rightMatrixFilterOne.transform(m);
            };
            Pipeline.prototype.rightConvTwo = function (m) {
                this.rightMatrixFilterTwo.transform(m);
            };
            Pipeline.prototype.fade = function (value) {
                this.mixer.fade(value);
            };
            Pipeline.prototype.updateLeft = function () {
                this.leftUpdate = true;
            };
            Pipeline.prototype.updateRight = function () {
                this.rightUpdate = true;
            };
            Pipeline.prototype.apply = function (gl) {
                if (gl !== this.context) {
                    this.leftVideoSupplierTex = gl.createTexture();
                    gl.bindTexture(gl.TEXTURE_2D, this.leftVideoSupplierTex);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    this.leftVideoSupplier.bind(this.leftVideoSupplierTex);
                    this.leftFBOConnectorOneTex = gl.createTexture();
                    gl.bindTexture(gl.TEXTURE_2D, this.leftFBOConnectorOneTex);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    this.leftFBOConnectorOne.bind(this.leftFBOConnectorOneTex);
                    this.leftFBOOne = gl.createFramebuffer();
                    this.leftFBOConnectorOne.framebuffer(this.leftFBOOne);
                    this.leftFBOConnectorTwoTex = gl.createTexture();
                    gl.bindTexture(gl.TEXTURE_2D, this.leftFBOConnectorTwoTex);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    this.leftFBOConnectorTwo.bind(this.leftFBOConnectorTwoTex);
                    this.leftFBOTwo = gl.createFramebuffer();
                    this.leftFBOConnectorTwo.framebuffer(this.leftFBOTwo);
                    this.leftFBOConnectorThreeTex = gl.createTexture();
                    gl.bindTexture(gl.TEXTURE_2D, this.leftFBOConnectorThreeTex);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    this.leftFBOConnectorThree.bind(this.leftFBOConnectorThreeTex);
                    this.leftFBOThree = gl.createFramebuffer();
                    this.leftFBOConnectorThree.framebuffer(this.leftFBOThree);
                    // Build left scene graph
                    this.leftVideoSupplier.register(this.leftMatrixFilterOne);
                    this.leftFBOConnectorOne.inlet(this.leftMatrixFilterOne);
                    this.leftFBOConnectorOne.register(this.leftMatrixFilterTwo);
                    this.leftFBOConnectorTwo.inlet(this.leftMatrixFilterTwo);
                    this.leftFBOConnectorTwo.register(this.leftRGBAFilter);
                    this.leftFBOConnectorThree.inlet(this.leftRGBAFilter);
                    this.leftFBOConnectorThree.register(this.mixer.left());
                    this.rightVideoSupplierTex = gl.createTexture();
                    gl.bindTexture(gl.TEXTURE_2D, this.rightVideoSupplierTex);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    this.rightVideoSupplier.bind(this.rightVideoSupplierTex);
                    this.rightFBOConnectorOneTex = gl.createTexture();
                    gl.bindTexture(gl.TEXTURE_2D, this.rightFBOConnectorOneTex);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    this.rightFBOConnectorOne.bind(this.rightFBOConnectorOneTex);
                    this.rightFBOOne = gl.createFramebuffer();
                    this.rightFBOConnectorOne.framebuffer(this.rightFBOOne);
                    this.rightFBOConnectorTwoTex = gl.createTexture();
                    gl.bindTexture(gl.TEXTURE_2D, this.rightFBOConnectorTwoTex);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    this.rightFBOConnectorTwo.bind(this.rightFBOConnectorTwoTex);
                    this.rightFBOTwo = gl.createFramebuffer();
                    this.rightFBOConnectorTwo.framebuffer(this.rightFBOTwo);
                    this.rightFBOConnectorThreeTex = gl.createTexture();
                    gl.bindTexture(gl.TEXTURE_2D, this.rightFBOConnectorThreeTex);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    this.rightFBOConnectorThree.bind(this.rightFBOConnectorThreeTex);
                    this.rightFBOThree = gl.createFramebuffer();
                    this.rightFBOConnectorThree.framebuffer(this.rightFBOThree);
                    // Build right scene graph
                    this.rightVideoSupplier.register(this.rightMatrixFilterOne);
                    this.rightFBOConnectorOne.inlet(this.rightMatrixFilterOne);
                    this.rightFBOConnectorOne.register(this.rightMatrixFilterTwo);
                    this.rightFBOConnectorTwo.inlet(this.rightMatrixFilterTwo);
                    this.rightFBOConnectorTwo.register(this.rightRGBAFilter);
                    this.rightFBOConnectorThree.inlet(this.rightRGBAFilter);
                    this.rightFBOConnectorThree.register(this.mixer.right());
                }
                if (this.leftUpdate) {
                    this.leftVideoSupplier.reload();
                    this.leftVideoSupplier.apply(gl);
                    this.leftFBOConnectorOne.apply(gl);
                    this.leftFBOConnectorTwo.apply(gl);
                    this.leftFBOConnectorThree.apply(gl);
                    this.leftUpdate = false;
                }
                if (this.rightUpdate) {
                    this.rightVideoSupplier.reload();
                    this.rightVideoSupplier.apply(gl);
                    this.rightFBOConnectorOne.apply(gl);
                    this.rightFBOConnectorTwo.apply(gl);
                    this.rightFBOConnectorThree.apply(gl);
                    this.rightUpdate = false;
                }
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
                this.mixer.apply(gl);
                if (gl !== this.context) {
                    this.context = gl;
                }
            };
            return Pipeline;
        })();
        VJ.Pipeline = Pipeline;
        var Controller = (function () {
            function Controller(ui) {
                this.gl = null;
                this.pipe = new Pipeline();
                this.canPlayLeft = false;
                this.leftPlaying = false;
                this.canPlayRight = false;
                this.rightPlaying = false;
                this.onLeftPlayClick = null;
                this.onLeftStopClick = null;
                this.onLeftFileSelect = null;
                this.onLeftCanPlay = null;
                this.onLeftPlaying = null;
                this.onLeftPaused = null;
                this.onLeftTimeUpdate = null;
                this.onLeftVolumeDrag = null;
                this.onLeftVolumeSpin = null;
                this.onLeftSpeedDrag = null;
                this.onLeftSpeedSpin = null;
                this.onLeftRedDrag = null;
                this.onLeftRedSpin = null;
                this.onLeftGreenDrag = null;
                this.onLeftGreenSpin = null;
                this.onLeftBlueDrag = null;
                this.onLeftBlueSpin = null;
                this.onRightPlayClick = null;
                this.onRightStopClick = null;
                this.onRightFileSelect = null;
                this.onRightCanPlay = null;
                this.onRightPlaying = null;
                this.onRightPaused = null;
                this.onRightVolumeDrag = null;
                this.onRightVolumeSpin = null;
                this.onRightSpeedDrag = null;
                this.onRightSpeedSpin = null;
                this.onRightRedDrag = null;
                this.onRightRedSpin = null;
                this.onRightGreenDrag = null;
                this.onRightGreenSpin = null;
                this.onRightBlueDrag = null;
                this.onRightBlueSpin = null;
                this.onFaderDrag = null;
                this.leftRedness = 1;
                this.leftGreenness = 1;
                this.leftBlueness = 1;
                this.rightRedness = 1;
                this.rightGreenness = 1;
                this.rightBlueness = 1;
                this.leftSpeed = 1;
                this.rightSpeed = 1;
                this.ui = ui;
                var glContextTypes = ["webgl", "experimental-webgl", "moz-webgl", "webkit-3d"];
                for (var i = 0; i < glContextTypes.length && !this.gl; ++i) {
                    this.gl = this.ui.canvas.getContext(glContextTypes[i]);
                }
                this.pipe.leftInlet(this.ui.left.video);
                this.pipe.rightInlet(this.ui.right.video);
            }
            Controller.prototype.speedUpLeft = function () {
                this.ui.left.video.playbackRate = this.leftSpeed;
            };
            Controller.prototype.volumeLeftTo = function (percentage) {
                this.ui.left.video.volume = percentage;
            };
            Controller.prototype.leftRednessTo = function (percentage) {
                this.leftRedness = percentage;
                this.pipe.colorizeLeft(this.leftRedness, this.leftGreenness, this.leftBlueness, 1);
            };
            Controller.prototype.leftGreennessTo = function (percentage) {
                this.leftGreenness = percentage;
                this.pipe.colorizeLeft(this.leftRedness, this.leftGreenness, this.leftBlueness, 1);
            };
            Controller.prototype.leftBluenessTo = function (percentage) {
                this.leftBlueness = percentage;
                this.pipe.colorizeLeft(this.leftRedness, this.leftGreenness, this.leftBlueness, 1);
            };
            Controller.prototype.speedUpRight = function () {
                this.ui.right.video.playbackRate = this.rightSpeed;
            };
            Controller.prototype.volumeRightTo = function (percentage) {
                this.ui.right.video.volume = percentage;
            };
            Controller.prototype.rightRednessTo = function (percentage) {
                this.rightRedness = percentage;
                this.pipe.colorizeRight(this.rightRedness, this.rightGreenness, this.rightBlueness, 1);
            };
            Controller.prototype.rightGreennessTo = function (percentage) {
                this.rightGreenness = percentage;
                this.pipe.colorizeRight(this.rightRedness, this.rightGreenness, this.rightBlueness, 1);
            };
            Controller.prototype.rightBluenessTo = function (percentage) {
                this.rightBlueness = percentage;
                this.pipe.colorizeRight(this.rightRedness, this.rightGreenness, this.rightBlueness, 1);
            };
            Controller.prototype.updateLeftFrame = function () {
                this.pipe.updateLeft();
                this.pipe.apply(this.gl);
            };
            Controller.prototype.updateRightFrame = function () {
                this.pipe.updateRight();
                this.pipe.apply(this.gl);
            };
            Controller.prototype.update = function () {
                var _this = this;
                if (this.leftPlaying) {
                    this.updateLeftFrame();
                }
                if (this.rightPlaying) {
                    this.updateRightFrame();
                }
                if (this.leftPlaying || this.rightPlaying) {
                    requestAnimationFrame(function () {
                        _this.update();
                    });
                }
            };
            Controller.prototype.register = function () {
                var _this = this;
                this.ui.left.playButton.addEventListener("click", (this.onLeftPlayClick = function () {
                    if (_this.ui.left.video.paused) {
                        _this.ui.left.video.play();
                        _this.speedUpLeft();
                        _this.ui.left.playButton.value = "Pause";
                    }
                    else {
                        _this.ui.left.video.pause();
                        _this.ui.left.playButton.value = "Play";
                    }
                }));
                this.ui.left.stopButton.addEventListener("click", (this.onLeftStopClick = function () {
                    _this.ui.left.video.load();
                    _this.ui.left.playButton.value = "Play";
                }));
                this.ui.left.fileInput.addEventListener("change", (this.onLeftFileSelect = function (evt) {
                    if (!_this.ui.left.video.paused) {
                        _this.ui.left.playButton.value = "Play";
                    }
                    _this.ui.left.video.src = URL.createObjectURL(evt.target.files[0]);
                }));
                this.ui.left.video.oncanplay = (this.onLeftCanPlay = function () {
                    _this.canPlayLeft = true;
                });
                this.ui.left.video.onplaying = (this.onLeftPlaying = function () {
                    _this.leftPlaying = true;
                    _this.update();
                });
                this.ui.left.video.onpause = (this.onLeftPaused = function () {
                    _this.leftPlaying = false;
                });
                this.ui.left.video.ontimeupdate = (this.onLeftTimeUpdate = function () {
                    if (isNaN(_this.ui.left.video.currentTime / _this.ui.left.video.duration)) {
                        _this.ui.left.playingTime.value = "--";
                        return;
                    }
                    _this.ui.left.playingTime.value = Math.floor(_this.ui.left.video.currentTime / 3600) + "h" + Math.floor((_this.ui.left.video.currentTime / 60) % 60) + "m" + Math.floor(_this.ui.left.video.currentTime % 60) + "s" + " (" + Math.floor((_this.ui.left.video.currentTime / _this.ui.left.video.duration) * 100) + "%)";
                });
                this.ui.left.volume.addEventListener("change", (this.onLeftVolumeDrag = function () {
                    _this.volumeLeftTo(+_this.ui.left.volume.value / 100);
                    _this.ui.left.volumeSpinner.value = _this.ui.left.volume.value;
                }));
                this.ui.left.volumeSpinner.addEventListener("change", (this.onLeftVolumeSpin = function () {
                    _this.volumeLeftTo(+_this.ui.left.volumeSpinner.value / 100);
                    _this.ui.left.volume.value = _this.ui.left.volumeSpinner.value;
                }));
                this.ui.left.speed.addEventListener("change", (this.onLeftSpeedDrag = function () {
                    _this.leftSpeed = +_this.ui.left.speed.value / 100;
                    _this.speedUpLeft();
                    _this.ui.left.speedSpinner.value = _this.ui.left.speed.value;
                }));
                this.ui.left.speedSpinner.addEventListener("change", (this.onLeftSpeedSpin = function () {
                    _this.leftSpeed = +_this.ui.left.speedSpinner.value / 100;
                    _this.speedUpLeft();
                    _this.ui.left.speed.value = _this.ui.left.speedSpinner.value;
                }));
                this.ui.left.red.addEventListener("change", (this.onLeftRedDrag = function () {
                    _this.leftRednessTo(+_this.ui.left.red.value / 255);
                    _this.ui.left.redSpinner.value = _this.ui.left.red.value;
                }));
                this.ui.left.redSpinner.addEventListener("change", (this.onLeftRedSpin = function () {
                    _this.leftRednessTo(+_this.ui.left.red.value / 255);
                    _this.ui.left.red.value = _this.ui.left.redSpinner.value;
                }));
                this.ui.left.green.addEventListener("change", (this.onLeftGreenDrag = function () {
                    _this.leftGreennessTo(+_this.ui.left.green.value / 255);
                    _this.ui.left.greenSpinner.value = _this.ui.left.green.value;
                }));
                this.ui.left.greenSpinner.addEventListener("change", (this.onLeftGreenSpin = function () {
                    _this.leftGreennessTo(+_this.ui.left.green.value / 255);
                    _this.ui.left.green.value = _this.ui.left.greenSpinner.value;
                }));
                this.ui.left.blue.addEventListener("change", (this.onLeftBlueDrag = function () {
                    _this.leftBluenessTo(+_this.ui.left.blue.value / 255);
                    _this.ui.left.blueSpinner.value = _this.ui.left.blue.value;
                }));
                this.ui.left.blueSpinner.addEventListener("change", (this.onLeftBlueSpin = function () {
                    _this.leftBluenessTo(+_this.ui.left.blue.value / 255);
                    _this.ui.left.blue.value = _this.ui.left.blueSpinner.value;
                }));
                this.ui.right.playButton.addEventListener("click", (this.onRightPlayClick = function () {
                    if (_this.ui.right.video.paused) {
                        _this.ui.right.video.play();
                        _this.speedUpRight();
                        _this.ui.right.playButton.value = "Pause";
                    }
                    else {
                        _this.ui.right.video.pause();
                        _this.ui.right.playButton.value = "Play";
                    }
                }));
                this.ui.right.stopButton.addEventListener("click", (this.onRightStopClick = function () {
                    _this.ui.right.video.load();
                    _this.ui.right.playButton.value = "Play";
                }));
                this.ui.right.fileInput.addEventListener("change", (this.onRightFileSelect = function (evt) {
                    if (!_this.ui.left.video.paused) {
                        _this.ui.left.playButton.value = "Play";
                    }
                    _this.ui.right.video.src = URL.createObjectURL(evt.target.files[0]);
                }));
                this.ui.right.video.oncanplay = (this.onRightCanPlay = function () {
                    _this.canPlayRight = true;
                });
                this.ui.right.video.onplaying = (this.onRightPlaying = function () {
                    _this.rightPlaying = true;
                    _this.update();
                });
                this.ui.right.video.onpause = (this.onRightPaused = function () {
                    _this.rightPlaying = false;
                });
                this.ui.right.video.ontimeupdate = (this.onLeftTimeUpdate = function () {
                    if (isNaN(_this.ui.right.video.currentTime / _this.ui.right.video.duration)) {
                        _this.ui.right.playingTime.value = "--";
                        return;
                    }
                    _this.ui.right.playingTime.value = Math.floor(_this.ui.right.video.currentTime / 3600) + "h" + Math.floor((_this.ui.right.video.currentTime / 60) % 60) + "m" + Math.floor(_this.ui.right.video.currentTime % 60) + "s" + " (" + Math.floor((_this.ui.right.video.currentTime / _this.ui.right.video.duration) * 100) + "%)";
                });
                this.ui.right.volume.addEventListener("change", (this.onRightVolumeDrag = function () {
                    _this.volumeRightTo(+_this.ui.right.volume.value / 100);
                    _this.ui.right.volumeSpinner.value = _this.ui.right.volume.value;
                }));
                this.ui.right.volumeSpinner.addEventListener("change", (this.onRightVolumeSpin = function () {
                    _this.volumeRightTo(+_this.ui.right.volumeSpinner.value / 100);
                    _this.ui.right.volume.value = _this.ui.right.volumeSpinner.value;
                }));
                this.ui.right.speed.addEventListener("change", (this.onRightSpeedDrag = function () {
                    _this.rightSpeed = +_this.ui.right.speed.value / 100;
                    _this.speedUpRight();
                    _this.ui.right.speedSpinner.value = _this.ui.right.speed.value;
                }));
                this.ui.right.speedSpinner.addEventListener("change", (this.onRightSpeedSpin = function () {
                    _this.rightSpeed = +_this.ui.right.speedSpinner.value / 100;
                    _this.speedUpRight();
                    _this.ui.right.speed.value = _this.ui.right.speedSpinner.value;
                }));
                this.ui.right.red.addEventListener("change", (this.onRightRedDrag = function () {
                    _this.rightRednessTo(+_this.ui.right.red.value / 255);
                    _this.ui.right.redSpinner.value = _this.ui.right.red.value;
                }));
                this.ui.right.redSpinner.addEventListener("change", (this.onRightRedSpin = function () {
                    _this.rightRednessTo(+_this.ui.right.red.value / 255);
                    _this.ui.right.red.value = _this.ui.right.redSpinner.value;
                }));
                this.ui.right.green.addEventListener("change", (this.onRightGreenDrag = function () {
                    _this.rightGreennessTo(+_this.ui.right.green.value / 255);
                    _this.ui.right.greenSpinner.value = _this.ui.right.green.value;
                }));
                this.ui.right.greenSpinner.addEventListener("change", (this.onRightGreenSpin = function () {
                    _this.rightGreennessTo(+_this.ui.right.green.value / 255);
                    _this.ui.right.green.value = _this.ui.right.greenSpinner.value;
                }));
                this.ui.right.blue.addEventListener("change", (this.onRightBlueDrag = function () {
                    _this.rightBluenessTo(+_this.ui.right.blue.value / 255);
                    _this.ui.right.blueSpinner.value = _this.ui.right.blue.value;
                }));
                this.ui.right.blueSpinner.addEventListener("change", (this.onRightBlueSpin = function () {
                    _this.rightBluenessTo(+_this.ui.right.blue.value / 255);
                    _this.ui.right.blue.value = _this.ui.right.blueSpinner.value;
                }));
                this.ui.fader.addEventListener("change", (this.onFaderDrag = function () {
                    _this.pipe.fade(+_this.ui.fader.value / 100);
                }));
            };
            Controller.prototype.unregister = function () {
                if (this.ui.left.video.oncanplay === this.onLeftCanPlay) {
                    this.ui.left.video.oncanplay = null;
                    this.onLeftCanPlay = null;
                }
                if (this.onLeftVolumeDrag) {
                    this.ui.left.volume.removeEventListener("change", this.onLeftVolumeDrag);
                    this.onLeftVolumeDrag = null;
                }
                if (this.onLeftVolumeSpin) {
                    this.ui.left.volumeSpinner.removeEventListener("change", this.onLeftVolumeSpin);
                    this.onLeftVolumeSpin = null;
                }
                if (this.onLeftSpeedDrag) {
                    this.ui.left.speed.removeEventListener("change", this.onLeftSpeedDrag);
                    this.onLeftSpeedDrag = null;
                }
                if (this.onLeftSpeedSpin) {
                    this.ui.left.speedSpinner.removeEventListener("change", this.onLeftSpeedSpin);
                    this.onLeftSpeedSpin = null;
                }
                if (this.ui.right.video.oncanplay === this.onRightCanPlay) {
                    this.ui.right.video.oncanplay = null;
                    this.onRightCanPlay = null;
                }
                if (this.onRightVolumeDrag) {
                    this.ui.right.volume.removeEventListener("change", this.onRightVolumeDrag);
                    this.onRightVolumeDrag = null;
                }
                if (this.onRightVolumeSpin) {
                    this.ui.right.volumeSpinner.removeEventListener("change", this.onRightVolumeSpin);
                    this.onRightVolumeSpin = null;
                }
                if (this.onRightSpeedDrag) {
                    this.ui.right.speed.removeEventListener("change", this.onRightSpeedDrag);
                    this.onRightSpeedDrag = null;
                }
                if (this.onRightSpeedSpin) {
                    this.ui.right.speedSpinner.removeEventListener("change", this.onRightSpeedSpin);
                    this.onRightSpeedSpin = null;
                }
            };
            return Controller;
        })();
        VJ.Controller = Controller;
    })(VJ = WebDJS.VJ || (WebDJS.VJ = {}));
})(WebDJS || (WebDJS = {}));
