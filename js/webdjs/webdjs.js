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
                if (texture === void 0) { texture = null; }
                this.src = src;
                this.bind(texture);
            }
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
                if (texture === void 0) { texture = null; }
                if (fbo === void 0) { fbo = null; }
                this.scn = scn;
                this.bind(texture);
                this.framebuffer(fbo);
            }
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
    })(VJ = WebDJS.VJ || (WebDJS.VJ = {}));
})(WebDJS || (WebDJS = {}));
