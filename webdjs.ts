module WebDJS {
    export module VJ {
	    /**
	     * Generic OpenGL operation.
	     */
        export interface GLOp {
	        apply(gl : WebGLRenderingContext) : void;
        }
		
		/**
		 * HTML Image -> Texture operation.
		 */
        export class HTMLImageTexOp implements GLOp {
	        private source : HTMLImageElement;
	        private texture : WebGLTexture;
	        constructor(source : HTMLImageElement, texture : WebGLTexture = null) { 
	            this.source = source; 
	            this.bind(texture);
	        }
	        bind(texture : WebGLTexture) : void {
	            this.texture = texture;
	        }
	        apply(gl : WebGLRenderingContext) : void {
	            gl.activeTexture(gl.TEXTURE0);
	            gl.bindTexture(gl.TEXTURE_2D, this.texture);
		        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.source);
	        }
        }
		
		/**
		 * HTML Video -> Texture operation.
		 */
	    export class HTMLVideoElementTexOp implements GLOp {
		    private source : HTMLVideoElement;
		    private texture : WebGLTexture;
		    constructor(source : HTMLVideoElement, texture : WebGLTexture = null) { 
		        this.source = source; 
		        this.bind(texture);
		    }
		    bind(texture : WebGLTexture) : void {
		        this.texture = texture;
		    }
		    apply(gl : WebGLRenderingContext) : void {
		        gl.activeTexture(gl.TEXTURE0);
		        gl.bindTexture(gl.TEXTURE_2D, this.texture);
			    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.source);
		    }
	    }
		
		/**
		 * Vertex Array Object.
		 *
		 * Transforms <x,y,width,height>-Tuples to a pair of Vertex/Index Buffers.
		 */
	    export class RectangularVertexArrayOp implements GLOp {
		    private width : number;
		    private height : number;
		    private x : number;
		    private y : number;
		    private vertices : Float32Array = new Float32Array(8);
		    private indices : Uint16Array = new Uint16Array([0,1,2,0,2,3]);
		    private vertexBuffer : WebGLBuffer;
		    private indexBuffer : WebGLBuffer;
		    constructor(vertexBuffer : WebGLBuffer = null, indexBuffer : WebGLBuffer = null) {
		        this.bind(vertexBuffer, indexBuffer);
		    }
		    bind(vertexBuffer : WebGLBuffer, indexBuffer : WebGLBuffer) : void {
		        this.vertexBuffer = vertexBuffer;
		        this.indexBuffer = indexBuffer;
		    }
		    translate(x : number, y : number) : void {
			    this.x = x;
			    this.y = y;
			    this.vertices[0] = this.x;
			    this.vertices[1] = this.y;
			    this.vertices[3] = this.y;
			    this.vertices[6] = this.x;
		    }
		    resize(width : number, height : number) : void {
			    this.width = width;
			    this.height = height;
			    this.vertices[2] = this.x + this.width;
			    this.vertices[4] = this.x + this.width;
			    this.vertices[5] = this.y + this.height;
			    this.vertices[7] = this.y + this.height;
		    }
		    apply(gl : WebGLRenderingContext) : void {
			    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
			    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
			    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
			    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
		    }
	    }
		
		/**
		 * Simple Renderer - Render HTML Image/Video to GL context.
		 */
        export class Simple implements GLOp {
            private texOp : GLOp;
            private vertexShader : WebGLShader;
            private fragmentShader : WebGLShader;
            private shaderProgram : WebGLProgram;
            private texture : WebGLTexture;
            private xyAttribLocation : number;
            private samplerAttribLocation : WebGLUniformLocation;
            private rgbaAttribLocation : WebGLUniformLocation;
            private vertexBuffer : WebGLBuffer;
            private indexBuffer : WebGLBuffer;
            private vertexArray : RectangularVertexArrayOp;
            private rgba : Float32Array = new Float32Array([1,1,1,1]);
            private initialized : boolean = false;
            private dirty : boolean = false;
            private recolor : boolean = false;
            image(img : HTMLImageElement) : void {
                if (!this.initialized) {
                    return;
                }
                this.texOp = new HTMLImageTexOp(img, this.texture);
            }
            video(vid : HTMLVideoElement) : void {
                if (!this.initialized) {
                    return;
                }
                this.texOp = new HTMLVideoElementTexOp(vid, this.texture);
            }
            initialize(gl : WebGLRenderingContext) : void {
                if (this.initialized) {
                    return;
                }
                
                this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
                gl.shaderSource(this.vertexShader, 
                    "attribute vec2 vxy;" +
                    "varying vec2 txy;" +
                    "void main() {" +
                    "   gl_Position = vec4(vxy.x*2.0-1.0, 1.0-vxy.y*2.0, 0, 1);" +
                    "   txy = vxy;" +
                    "}");
                gl.compileShader(this.vertexShader);

                this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
                gl.shaderSource(this.fragmentShader,
                    "precision mediump float;" +
                    "uniform sampler2D sampler;" +
                    "uniform vec4 rgba;" +
                    "varying vec2 txy;" +
                    "void main() {" +
                    "   vec4 texColor = texture2D(sampler, txy);" +
                    "   gl_FragColor = texColor * rgba;" +
                    "}");
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
                this.vertexArray.translate(0, 0);
                this.vertexArray.resize(1, 1);
                this.vertexArray.apply(gl);
                
                this.texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, this.texture);        
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                
                this.initialized = true;
            }
            translate(x : number, y : number) : void {
                this.vertexArray.translate(x, y);
                this.dirty = true;
            }
            resize(width : number, height : number) : void {
                this.vertexArray.resize(width, height);
                this.dirty = true;
            }
            color(r : number, g : number, b : number, a : number) : void {
                this.rgba[0] = r;
                this.rgba[1] = g;
                this.rgba[2] = b;
                this.rgba[3] = a;
                this.recolor = true;
            }
            apply(gl : WebGLRenderingContext) : void {
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
            }
        }
    }
}

