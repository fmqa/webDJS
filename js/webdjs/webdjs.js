var WebDJS;
(function (WebDJS) {
    var VJ;
    (function (VJ) {
        /**
         * HTML Image -> Texture operation.
         */
        var HTMLImageTexOp = (function () {
            function HTMLImageTexOp(source, texture) {
                if (texture === void 0) { texture = null; }
                this.source = source;
                this.bind(texture);
            }
            HTMLImageTexOp.prototype.bind = function (texture) {
                this.texture = texture;
            };
            HTMLImageTexOp.prototype.apply = function (gl) {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.source);
            };
            return HTMLImageTexOp;
        })();
        VJ.HTMLImageTexOp = HTMLImageTexOp;
        /**
         * HTML Video -> Texture operation.
         */
        var HTMLVideoElementTexOp = (function () {
            function HTMLVideoElementTexOp(source, texture) {
                if (texture === void 0) { texture = null; }
                this.source = source;
                this.bind(texture);
            }
            HTMLVideoElementTexOp.prototype.bind = function (texture) {
                this.texture = texture;
            };
            HTMLVideoElementTexOp.prototype.apply = function (gl) {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.source);
            };
            return HTMLVideoElementTexOp;
        })();
        VJ.HTMLVideoElementTexOp = HTMLVideoElementTexOp;
        /**
         * Vertex Array Object.
         *
         * Transforms <x,y,width,height>-Tuples to a pair of Vertex/Index Buffers.
         */
        var RectangularVertexArrayOp = (function () {
            function RectangularVertexArrayOp(vertexBuffer, indexBuffer) {
                if (vertexBuffer === void 0) { vertexBuffer = null; }
                if (indexBuffer === void 0) { indexBuffer = null; }
                this.vertices = new Float32Array(8);
                this.indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
                this.bind(vertexBuffer, indexBuffer);
                this.translate(0, 0);
                this.resize(1, 1);
            }
            RectangularVertexArrayOp.prototype.bind = function (vertexBuffer, indexBuffer) {
                this.vertexBuffer = vertexBuffer;
                this.indexBuffer = indexBuffer;
            };
            RectangularVertexArrayOp.prototype.translate = function (x, y) {
                this.x = x;
                this.y = y;
                this.vertices[0] = this.x;
                this.vertices[1] = this.y;
                this.vertices[3] = this.y;
                this.vertices[6] = this.x;
            };
            RectangularVertexArrayOp.prototype.resize = function (width, height) {
                this.width = width;
                this.height = height;
                this.vertices[2] = this.x + this.width;
                this.vertices[4] = this.x + this.width;
                this.vertices[5] = this.y + this.height;
                this.vertices[7] = this.y + this.height;
            };
            RectangularVertexArrayOp.prototype.apply = function (gl) {
                gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
            };
            return RectangularVertexArrayOp;
        })();
        VJ.RectangularVertexArrayOp = RectangularVertexArrayOp;
        /**
         * Simple Renderer - Render HTML Image/Video to GL context.
         */
        var Simple = (function () {
            function Simple() {
                this.rgba = new Float32Array([1, 1, 1, 1]);
                this.initialized = false;
                this.dirty = true;
                this.recolor = true;
            }
            Simple.prototype.image = function (img) {
                if (!this.initialized) {
                    return;
                }
                this.texOp = new HTMLImageTexOp(img, this.texture);
            };
            Simple.prototype.video = function (vid) {
                if (!this.initialized) {
                    return;
                }
                this.texOp = new HTMLVideoElementTexOp(vid, this.texture);
            };
            Simple.prototype.initialize = function (gl) {
                if (this.initialized) {
                    return;
                }
                this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
                gl.shaderSource(this.vertexShader, "attribute vec2 vxy;" + "varying vec2 txy;" + "void main() {" + "   gl_Position = vec4(vxy.x*2.0-1.0, 1.0-vxy.y*2.0, 0, 1);" + "   txy = vxy;" + "}");
                gl.compileShader(this.vertexShader);
                this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
                gl.shaderSource(this.fragmentShader, "precision mediump float;" + "uniform sampler2D sampler;" + "uniform vec4 rgba;" + "varying vec2 txy;" + "void main() {" + "   vec4 texColor = texture2D(sampler, txy);" + "   gl_FragColor = texColor * rgba;" + "}");
                gl.compileShader(this.fragmentShader);
                this.shaderProgram = gl.createProgram();
                gl.attachShader(this.shaderProgram, this.vertexShader);
                gl.attachShader(this.shaderProgram, this.fragmentShader);
                gl.linkProgram(this.shaderProgram);
                gl.useProgram(this.shaderProgram);
                this.xyAttribLocation = gl.getAttribLocation(this.shaderProgram, "vxy");
                gl.enableVertexAttribArray(this.xyAttribLocation);
                this.samplerAttribLocation = gl.getUniformLocation(this.shaderProgram, "sampler");
                gl.uniform1i(this.samplerAttribLocation, 0);
                this.rgbaAttribLocation = gl.getUniformLocation(this.shaderProgram, "rgba");
                gl.uniform4fv(this.rgbaAttribLocation, this.rgba);
                this.vertexBuffer = gl.createBuffer();
                this.indexBuffer = gl.createBuffer();
                this.vertexArray = new RectangularVertexArrayOp(this.vertexBuffer, this.indexBuffer);
                this.texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                this.initialized = true;
            };
            Simple.prototype.translate = function (x, y) {
                this.vertexArray.translate(x, y);
                this.dirty = true;
            };
            Simple.prototype.resize = function (width, height) {
                this.vertexArray.resize(width, height);
                this.dirty = true;
            };
            Simple.prototype.color = function (r, g, b, a) {
                this.rgba[0] = r;
                this.rgba[1] = g;
                this.rgba[2] = b;
                this.rgba[3] = a;
                this.recolor = true;
            };
            Simple.prototype.apply = function (gl) {
                if (!this.initialized) {
                    return;
                }
                gl.useProgram(this.shaderProgram);
                this.texOp.apply(gl);
                if (this.dirty) {
                    this.vertexArray.apply(gl);
                    this.dirty = false;
                }
                if (this.recolor) {
                    gl.uniform4fv(this.rgbaAttribLocation, this.rgba);
                    this.recolor = false;
                }
                gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
                gl.vertexAttribPointer(this.xyAttribLocation, 2, gl.FLOAT, false, 0, 0);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
                gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
            };
            return Simple;
        })();
        VJ.Simple = Simple;
    })(VJ = WebDJS.VJ || (WebDJS.VJ = {}));
})(WebDJS || (WebDJS = {}));
