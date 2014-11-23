var WebDJS;
(function (WebDJS) {
    var VJ;
    (function (VJ) {
        /**
         * HTML Image -> Texture operation.
         */
        var GLImageInput = (function () {
            function GLImageInput(src, texture) {
                if (texture === void 0) { texture = null; }
                this.src = src;
                this.bind(texture);
            }
            GLImageInput.prototype.bind = function (texture) {
                this.texture = texture;
                this.reload();
            };
            GLImageInput.prototype.reload = function () {
                this.context = null;
            };
            GLImageInput.prototype.width = function () {
                return this.src.width;
            };
            GLImageInput.prototype.height = function () {
                return this.src.height;
            };
            GLImageInput.prototype.apply = function (gl) {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                if (gl !== this.context) {
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.src);
                    this.context = gl;
                }
            };
            return GLImageInput;
        })();
        VJ.GLImageInput = GLImageInput;
        /**
         * HTML Video -> Texture operation.
         */
        var GLVideoInput = (function () {
            function GLVideoInput(src, texture) {
                if (texture === void 0) { texture = null; }
                this.src = src;
                this.bind(texture);
            }
            GLVideoInput.prototype.bind = function (texture) {
                this.texture = texture;
                this.reload();
            };
            GLVideoInput.prototype.reload = function () {
                this.context = null;
            };
            GLVideoInput.prototype.width = function () {
                return this.src.videoWidth;
            };
            GLVideoInput.prototype.height = function () {
                return this.src.videoHeight;
            };
            GLVideoInput.prototype.apply = function (gl) {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                if (gl !== this.context) {
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.src);
                    this.context = gl;
                }
            };
            return GLVideoInput;
        })();
        VJ.GLVideoInput = GLVideoInput;
        var GLFramebufferInput = (function () {
            function GLFramebufferInput(src, texture, fbo) {
                if (texture === void 0) { texture = null; }
                if (fbo === void 0) { fbo = null; }
                this.src = src;
                this.bind(texture);
                this.framebuffer(fbo);
            }
            GLFramebufferInput.prototype.bind = function (texture) {
                this.texture = texture;
                this.context = null;
            };
            GLFramebufferInput.prototype.framebuffer = function (fbo) {
                this.fbo = fbo;
                this.context = null;
            };
            GLFramebufferInput.prototype.width = function () {
                return this.src.width();
            };
            GLFramebufferInput.prototype.height = function () {
                return this.src.height();
            };
            GLFramebufferInput.prototype.apply = function (gl) {
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                if (gl !== this.context) {
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width(), this.height(), 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                }
                gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
                if (gl !== this.context) {
                    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
                    this.context = gl;
                }
                this.src.apply(gl);
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
            };
            return GLFramebufferInput;
        })();
        VJ.GLFramebufferInput = GLFramebufferInput;
        /**
         * Vertex Array Object.
         *
         * Transforms <x,y,width,height>-Tuples to a pair of Vertex/Index Buffers.
         */
        var GLRectangleVertexArray = (function () {
            function GLRectangleVertexArray(vertexBuffer, indexBuffer) {
                if (vertexBuffer === void 0) { vertexBuffer = null; }
                if (indexBuffer === void 0) { indexBuffer = null; }
                this.vertices = new Float32Array(8);
                this.indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
                this.bind(vertexBuffer, indexBuffer);
                this.translate(0, 0);
                this.resize(1, 1);
            }
            GLRectangleVertexArray.prototype.bind = function (vertexBuffer, indexBuffer) {
                this.vertexBuffer = vertexBuffer;
                this.indexBuffer = indexBuffer;
                this.changed = true;
                this.context = null;
            };
            GLRectangleVertexArray.prototype.translate = function (x, y) {
                this.x = x;
                this.y = y;
                this.vertices[0] = this.x;
                this.vertices[1] = this.y;
                this.vertices[3] = this.y;
                this.vertices[6] = this.x;
                this.changed = true;
            };
            GLRectangleVertexArray.prototype.resize = function (width, height) {
                this.width = width;
                this.height = height;
                this.vertices[2] = this.x + this.width;
                this.vertices[4] = this.x + this.width;
                this.vertices[5] = this.y + this.height;
                this.vertices[7] = this.y + this.height;
                this.changed = true;
            };
            GLRectangleVertexArray.prototype.apply = function (gl) {
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
            return GLRectangleVertexArray;
        })();
        VJ.GLRectangleVertexArray = GLRectangleVertexArray;
        /**
         * Simple Renderer - Render HTML Image/Video to GL context.
         */
        var Simple = (function () {
            function Simple(input, texture) {
                if (input === void 0) { input = null; }
                if (texture === void 0) { texture = null; }
                this.yflip = 1;
                this.vertexArray = new GLRectangleVertexArray();
                this.rgba = new Float32Array([1, 1, 1, 1]);
                this.recolor = true;
                this.rebind = false;
                this.flipped = false;
                this.inlet(input);
                this.bind(texture);
            }
            Simple.prototype.inlet = function (input) {
                this.input = input;
                this.rebind = true;
            };
            Simple.prototype.color = function (r, g, b, a) {
                this.rgba[0] = r;
                this.rgba[1] = g;
                this.rgba[2] = b;
                this.rgba[3] = a;
                this.recolor = true;
            };
            Simple.prototype.flipy = function (yflip) {
                this.yflip = yflip;
                this.flipped = true;
            };
            Simple.prototype.bind = function (texture) {
                this.texture = texture;
            };
            Simple.prototype.width = function () {
                return this.input.width();
            };
            Simple.prototype.height = function () {
                return this.input.height();
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
                    this.input.bind(this.texture);
                    this.rebind = false;
                }
                this.input.apply(gl);
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
            function Convolver(input, texture) {
                if (input === void 0) { input = null; }
                if (texture === void 0) { texture = null; }
                this.kernel = new Float32Array([0, 0, 0, 0, 1, 0, 0, 0, 0]);
                this.vertexArray = new GLRectangleVertexArray();
                this.rebind = false;
                this.changed = false;
                this.flipped = false;
                this.yflip = 1;
                this.inlet(input);
                this.bind(texture);
            }
            Convolver.prototype.inlet = function (input) {
                this.input = input;
                this.rebind = true;
            };
            Convolver.prototype.transform = function (kernel) {
                this.kernel = kernel;
                this.changed = true;
            };
            Convolver.prototype.bind = function (texture) {
                this.texture = texture;
            };
            Convolver.prototype.width = function () {
                return this.input.width();
            };
            Convolver.prototype.height = function () {
                return this.input.height();
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
                    this.input.bind(this.texture);
                }
                this.input.apply(gl);
                this.vertexArray.apply(gl);
                gl.useProgram(this.shaderProgram);
                if (this.rebind || gl !== this.context) {
                    gl.uniform2f(this.tsizeLocation, this.input.width(), this.input.height());
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
        var ColorController = (function () {
            function ColorController(renderer, r, g, b, a) {
                this.renderer = renderer;
                this.red(r);
                this.green(g);
                this.blue(b);
            }
            ColorController.prototype.red = function (r) {
                this.r = r;
            };
            ColorController.prototype.green = function (g) {
                this.g = g;
            };
            ColorController.prototype.blue = function (b) {
                this.b = b;
            };
            ColorController.prototype.alpha = function (a) {
                this.a = a;
            };
            ColorController.prototype.send = function () {
                this.renderer.color(this.r(), this.g(), this.b(), this.a());
            };
            return ColorController;
        })();
        VJ.ColorController = ColorController;
    })(VJ = WebDJS.VJ || (WebDJS.VJ = {}));
})(WebDJS || (WebDJS = {}));
