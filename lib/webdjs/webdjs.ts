module WebDJS {
    export module VJ {
	    /**
	     * Generic OpenGL operation.
	     */
        export interface GLOperation {
            apply(gl : WebGLRenderingContext) : void;
        }
        
        /**
         * Generic OpenGL texture operation.
         */
        export interface GLTextureOperation extends GLOperation {
            bind(texture : WebGLTexture) : void;
        }
        
        /**
         * Loads a fixed-size image to a texture.
         */
        export interface GLSizedTextureOperation extends GLTextureOperation {
            width() : number;
            height() : number;
        }
		
		/**
		 * HTML Image -> Texture operation.
		 */
        export class GLImageInput implements GLSizedTextureOperation {
	        private src : HTMLImageElement;
	        private texture : WebGLTexture;
	        private context : WebGLRenderingContext;
	        constructor(src : HTMLImageElement, texture : WebGLTexture = null) { 
	            this.src = src; 
	            this.bind(texture);
	        }
	        bind(texture : WebGLTexture) : void {
	            this.texture = texture;
	            this.reload();
	        }
	        reload() : void {
	            this.context = null;
	        }
	        width() : number {
	            return this.src.width;
	        }
	        height() : number {
	            return this.src.height;
	        }
	        apply(gl : WebGLRenderingContext) : void {
	            gl.activeTexture(gl.TEXTURE0);
	            gl.bindTexture(gl.TEXTURE_2D, this.texture);
	            if (gl !== this.context) {
    		        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.src);
    		        this.context = gl;
    		    }
	        }
        }
		
		/**
		 * HTML Video -> Texture operation.
		 */
	    export class GLVideoInput implements GLSizedTextureOperation {
		    private src : HTMLVideoElement;
		    private texture : WebGLTexture;
		    private context : WebGLRenderingContext;
		    constructor(src : HTMLVideoElement, texture : WebGLTexture = null) { 
		        this.src = src; 
		        this.bind(texture);
		    }
		    bind(texture : WebGLTexture) : void {
		        this.texture = texture;
		        this.reload();
		    }
		    reload() : void {
		        this.context = null;
		    }
		    width() : number {
		        return this.src.videoWidth;
		    }
		    height() : number {
		        return this.src.videoHeight;
		    }
		    apply(gl : WebGLRenderingContext) : void {
		        gl.activeTexture(gl.TEXTURE0);
		        gl.bindTexture(gl.TEXTURE_2D, this.texture);
		        if (gl !== this.context) {
    			    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.src);
    			    this.context = gl;
    			}
		    }
	    }
	    
	    export class GLFramebufferInput implements GLSizedTextureOperation {
	        private context : WebGLRenderingContext;
	        private src : GLSizedTextureOperation;
	        private texture : WebGLTexture;
	        private fbo : WebGLFramebuffer;
	        constructor(src : GLSizedTextureOperation, texture : WebGLTexture = null, fbo : WebGLFramebuffer = null) {
	            this.src = src;
	            this.bind(texture);
	            this.framebuffer(fbo);
	        }
	        bind(texture : WebGLTexture) : void {
		        this.texture = texture;
		        this.context = null;
		    }
		    framebuffer(fbo : WebGLFramebuffer) : void {
		        this.fbo = fbo;
		        this.context = null;
		    }
		    width() : number {
		        return this.src.width();
		    }
		    height() : number {
		        return this.src.height();
		    }
		    apply(gl : WebGLRenderingContext) : void {
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
		    }
	    }
		
		/**
		 * Vertex Array Object.
		 *
		 * Transforms <x,y,width,height>-Tuples to a pair of Vertex/Index Buffers.
		 */
	    export class GLRectangleVertexArray implements GLOperation {
		    private width : number;
		    private height : number;
		    private x : number;
		    private y : number;
		    private vertices : Float32Array = new Float32Array(8);
		    private indices : Uint16Array = new Uint16Array([0,1,2,0,2,3]);
		    private vertexBuffer : WebGLBuffer;
		    private indexBuffer : WebGLBuffer;
		    private changed : boolean;
		    private context : WebGLRenderingContext;
		    constructor(vertexBuffer : WebGLBuffer = null, indexBuffer : WebGLBuffer = null) {
		        this.bind(vertexBuffer, indexBuffer);
		        this.translate(0, 0);
		        this.resize(1, 1);
		    }
		    bind(vertexBuffer : WebGLBuffer, indexBuffer : WebGLBuffer) : void {
		        this.vertexBuffer = vertexBuffer;
		        this.indexBuffer = indexBuffer;
		        this.changed = true;
		        this.context = null;
		    }
		    translate(x : number, y : number) : void {
			    this.x = x;
			    this.y = y;
			    this.vertices[0] = this.x;
			    this.vertices[1] = this.y;
			    this.vertices[3] = this.y;
			    this.vertices[6] = this.x;
			    this.changed = true;
		    }
		    resize(width : number, height : number) : void {
			    this.width = width;
			    this.height = height;
			    this.vertices[2] = this.x + this.width;
			    this.vertices[4] = this.x + this.width;
			    this.vertices[5] = this.y + this.height;
			    this.vertices[7] = this.y + this.height;
			    this.changed = true;
		    }
		    apply(gl : WebGLRenderingContext) : void {
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
		    }
	    }
		
		/**
		 * Simple Renderer - Render HTML Image/Video to GL context.
		 */
        export class Simple implements GLSizedTextureOperation {
            private input : GLSizedTextureOperation;
            private vertexShader : WebGLShader;
            private fragmentShader : WebGLShader;
            private shaderProgram : WebGLProgram;
            private texture : WebGLTexture;
            private xyLocation : number;
            private yflip : number = 1;
            private samplerLocation : WebGLUniformLocation;
            private rgbaLocation : WebGLUniformLocation;
            private flipyLocation : WebGLUniformLocation;
            private vertexBuffer : WebGLBuffer;
            private indexBuffer : WebGLBuffer;
            private vertexArray : GLRectangleVertexArray = new GLRectangleVertexArray();
            private rgba : Float32Array = new Float32Array([1,1,1,1]);
            private context : WebGLRenderingContext;
            private recolor : boolean = true;
            private rebind : boolean = false;
            private flipped : boolean = false;
            constructor(input : GLSizedTextureOperation = null, texture : WebGLTexture = null) {
                this.inlet(input);
                this.bind(texture);
            }
            inlet(input : GLSizedTextureOperation) : void {
                this.input = input;
                this.rebind = true;
            }
            color(r : number, g : number, b : number, a : number) : void {
                this.rgba[0] = r;
                this.rgba[1] = g;
                this.rgba[2] = b;
                this.rgba[3] = a;
                this.recolor = true;
            }
            flipy(yflip : number) : void {
                this.yflip = yflip;
                this.flipped = true;
            }
            bind(texture : WebGLTexture) : void {
                this.texture = texture;
            }
            width() : number {
                return this.input.width();
            }
            height() : number {
                return this.input.height();
            }
            apply(gl : WebGLRenderingContext) : void {
                if (gl !== this.context) {
                    this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
                    gl.shaderSource(this.vertexShader, 
                        "attribute vec2 vxy;" +
                        "varying vec2 txy;" +
                        "uniform float flipy;" +
                        "void main() {" +
                        "   gl_Position = vec4(vxy.x*2.0-1.0, (1.0-vxy.y*2.0)*flipy, 0, 1);" +
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
                    
                    //this.texture = gl.createTexture();
                    //gl.bindTexture(gl.TEXTURE_2D, this.texture);        
                    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
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
            }
        }
        
        export class Convolver implements GLSizedTextureOperation {
            private context : WebGLRenderingContext;
            private texture : WebGLTexture;
            private input : GLSizedTextureOperation;
            private kernel : Float32Array = new Float32Array([0,0,0,0,1,0,0,0,0]);
            private vertexShader : WebGLShader;
            private fragmentShader : WebGLShader;
            private shaderProgram : WebGLProgram;
            private xyLocation : number;
            private samplerLocation : WebGLUniformLocation;
            private tsizeLocation : WebGLUniformLocation;
            private kernelLocation : WebGLUniformLocation;
            private flipyLocation : WebGLUniformLocation;
            private vertexArray : GLRectangleVertexArray = new GLRectangleVertexArray();
            private vertexBuffer : WebGLBuffer;
            private indexBuffer : WebGLBuffer;
            private rebind : boolean = false;
            private changed : boolean = false;
            private flipped : boolean = false;
            private yflip : number = 1;
            constructor(input : GLSizedTextureOperation = null, texture : WebGLTexture = null) {
                this.inlet(input);
                this.bind(texture);
            }
            inlet(input : GLSizedTextureOperation) : void {
                this.input = input;
                this.rebind = true;
            }
            transform(kernel : Float32Array) : void {
                this.kernel = kernel;
                this.changed = true;
            }
            bind(texture : WebGLTexture) : void {
                this.texture = texture;
            }
            width() : number {
                return this.input.width();
            }
            height() : number {
                return this.input.height();
            }
            flipy(yflip : number) : void {
                this.yflip = yflip;
                this.flipped = true;
            }
            apply(gl : WebGLRenderingContext) {
                if (gl !== this.context) {
                    this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
                    gl.shaderSource(this.vertexShader, 
                        "attribute vec2 vxy;" +
                        "varying vec2 txy;" +
                        "uniform float flipy;" +
                        "void main() {" +
                        "   gl_Position = vec4(vxy.x*2.0-1.0, (1.0-vxy.y*2.0)*flipy, 0, 1);" +
                        "   txy = vxy;" +
                        "}");
                    gl.compileShader(this.vertexShader);

                    this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
                    gl.shaderSource(this.fragmentShader,
                        "precision mediump float;" +
                        "uniform sampler2D sampler;" +
                        "uniform vec2 tsize;" +
                        "uniform float kernel[9];" +
                        "varying vec2 txy;" +
                        "void main() {" +
                        "   vec2 p = vec2(1.0, 1.0) / tsize;" +
                        "   vec4 s = texture2D(sampler, txy + p * vec2(-1, -1)) * kernel[0] +" +
                        "            texture2D(sampler, txy + p * vec2(0, -1)) * kernel[1] +" +
                        "            texture2D(sampler, txy + p * vec2(1, -1)) * kernel[2] +" +
                        "            texture2D(sampler, txy + p * vec2(-1, 0)) * kernel[3] +" +
                        "            texture2D(sampler, txy + p * vec2(0, 0)) * kernel[4] +" +
                        "            texture2D(sampler, txy + p * vec2(1, 0)) * kernel[5] +" +
                        "            texture2D(sampler, txy + p * vec2(-1, 1)) * kernel[6] +" +
                        "            texture2D(sampler, txy + p * vec2(0, 1)) * kernel[7] +" +
                        "            texture2D(sampler, txy + p * vec2(1, 1)) * kernel[8];" +
                        "   float w = kernel[0] +" +
                        "             kernel[1] +" +
                        "             kernel[2] +" +
                        "             kernel[3] +" +
                        "             kernel[4] +" +
                        "             kernel[5] +" +
                        "             kernel[6] +" +
                        "             kernel[7] +" +
                        "             kernel[8];" +
                        "   if (w <= 0.0) {" +
                        "       w = 1.0;" +
                        "   }" +
                        "   gl_FragColor = vec4((s / w).rgb, 1);" +
                        "}");
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
                    
                    //this.texture = gl.createTexture();
                    //gl.bindTexture(gl.TEXTURE_2D, this.texture);        
                    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
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
            }
        }
        
        export interface ChannelSupplier {
            () : number;
        }
        
        export class ColorController {
            private renderer : Simple;
            private r : ChannelSupplier;
            private g : ChannelSupplier;
            private b : ChannelSupplier;
            private a : ChannelSupplier;
            constructor(renderer : Simple, r : ChannelSupplier, g : ChannelSupplier, b : ChannelSupplier, a : ChannelSupplier) {
                this.renderer = renderer;
                this.red(r);
                this.green(g);
                this.blue(b);
            }
            red(r : ChannelSupplier) : void {
                this.r = r;
            }
            green(g : ChannelSupplier) : void {
                this.g = g;
            }
            blue(b : ChannelSupplier) : void {
                this.b = b;
            }
            alpha(a : ChannelSupplier) : void {
                this.a = a;
            }
            send() : void {
                this.renderer.color(this.r(), this.g(), this.b(), this.a());
            }
        }
    }
}

