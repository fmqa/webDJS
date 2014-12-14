module WebDJS {
    export module VJ {
	    /**
	     * Generic OpenGL operation.
	     */
        export interface Command {
            apply(gl : WebGLRenderingContext) : void;
        }
        
        export interface Scene extends Command {
            width() : number;
            height() : number;
        }
        
        /**
         * Generic OpenGL texture consumer.
         */
        export interface Consumer {
            texturize(texture : WebGLTexture, width : number, height : number) : void;
        }
        
        /**
         * Generic OpenGL texture provider.
         */
        export interface Supplier {
            register(target : Consumer) : void;
        }
        
        export interface Colorizable {
            colorize(red : number, green : number, blue : number, alpha : number) : void;
        }
        
        export class StoreConsumer implements Consumer {
            private texture : WebGLTexture;
            private w : number;
            private h : number;
            texturize(texture : WebGLTexture, width : number, height : number) : void {
                this.texture = texture;
                this.w = width;
                this.h = height;
            }
            get() : WebGLTexture {
                return this.texture;
            }
            width() : number {
                return this.w;
            }
            height() : number {
                return this.h;
            }
        }
		
		/**
		 * HTML Image -> Texture operation.
		 */
        export class ImageSupplier implements Command, Supplier {
	        private src : HTMLImageElement;
	        private texture : WebGLTexture;
	        private context : WebGLRenderingContext;
	        private target : Consumer;
	        constructor(src : HTMLImageElement, texture : WebGLTexture = null) { 
	            this.src = src; 
	            this.bind(texture);
	        }
	        bind(texture : WebGLTexture) : void {
	            this.texture = texture;
	            this.reload();
	        }
	        register(target : Consumer) : void {
	            this.target = target;
	        }
	        reload() : void {
	            this.context = null;
	        }
	        apply(gl : WebGLRenderingContext) : void {
	            gl.bindTexture(gl.TEXTURE_2D, this.texture);
	            if (gl !== this.context) {
    		        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.src);
    		        this.context = gl;
    		    }
    		    this.target.texturize(this.texture, this.src.width, this.src.height);
	        }
        }
		
		/**
		 * HTML Video -> Texture operation.
		 */
	    export class VideoSupplier implements Command, Supplier {
		    private src : HTMLVideoElement;
		    private texture : WebGLTexture;
		    private context : WebGLRenderingContext;
		    private target : Consumer;
		    constructor(src : HTMLVideoElement = null, texture : WebGLTexture = null) { 
		        this.src = src; 
		        this.bind(texture);
		    }
		    inlet(src : HTMLVideoElement) : void {
		        this.src = src;
		        this.reload();
		    }
		    bind(texture : WebGLTexture) : void {
		        this.texture = texture;
		        this.reload();
		    }
		    register(target : Consumer) : void {
		        this.target = target;
		    }
		    reload() : void {
		        this.context = null;
		    }
		    apply(gl : WebGLRenderingContext) : void {
		        gl.bindTexture(gl.TEXTURE_2D, this.texture);
		        if (gl !== this.context) {
    			    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.src);
    			    this.context = gl;
    			}
    			this.target.texturize(this.texture, this.src.videoWidth, this.src.videoHeight);
		    }
	    }
	    
	    export class FramebufferSupplier implements Command, Supplier {
	        private context : WebGLRenderingContext;
	        private scn : Scene;
	        private texture : WebGLTexture;
	        private fbo : WebGLFramebuffer;
	        private target : Consumer;
	        constructor(scn : Scene = null, texture : WebGLTexture = null, fbo : WebGLFramebuffer = null) {
	            this.scn = scn;
	            this.bind(texture);
	            this.framebuffer(fbo);
	        }
	        inlet(scn : Scene) : void {
	            this.scn = scn;
	            this.context = null;
	        }
	        bind(texture : WebGLTexture) : void {
		        this.texture = texture;
		        this.context = null;
		    }
		    register(target : Consumer) : void {
		        this.target = target;
		    }
		    framebuffer(fbo : WebGLFramebuffer) : void {
		        this.fbo = fbo;
		        this.context = null;
		    }
		    apply(gl : WebGLRenderingContext) : void {
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
		    }
	    }
		
		/**
		 * Rectangle Vertex Array Object.
		 *
		 * Transforms <x,y,width,height>-Tuples to a pair of Vertex/Index Buffers.
		 */
	    export class Rectangle implements Command {
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
        export class Simple implements Scene, Consumer, Colorizable {
            private vertexShader : WebGLShader;
            private fragmentShader : WebGLShader;
            private shaderProgram : WebGLProgram;
            private texture : WebGLTexture;
            private textureWidth : number;
            private textureHeight : number;
            private xyLocation : number;
            private yflip : number = 1;
            private samplerLocation : WebGLUniformLocation;
            private rgbaLocation : WebGLUniformLocation;
            private flipyLocation : WebGLUniformLocation;
            private vertexBuffer : WebGLBuffer;
            private indexBuffer : WebGLBuffer;
            private vertexArray : Rectangle = new Rectangle();
            private rgba : Float32Array = new Float32Array([1,1,1,1]);
            private context : WebGLRenderingContext;
            private recolor : boolean = true;
            private rebind : boolean = false;
            private flipped : boolean = false;
            colorize(red : number, green : number, blue : number, alpha : number) : void {
                this.rgba[0] = red;
                this.rgba[1] = green;
                this.rgba[2] = blue;
                this.rgba[3] = alpha;
                this.recolor = true;
            }
            flipy(yflip : number) : void {
                this.yflip = yflip;
                this.flipped = true;
            }
            width() : number {
                return this.textureWidth;
            }
            height() : number {
                return this.textureHeight;
            }
            texturize(texture : WebGLTexture, width : number, height : number) : void {
                this.texture = texture;
                this.textureWidth = width;
                this.textureHeight = height;
                this.rebind = true;
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
            }
        }
        
        export class Convolver implements Scene, Consumer {
            private context : WebGLRenderingContext;
            private texture : WebGLTexture;
            private textureWidth : number;
            private textureHeight : number;
            private kernel : Float32Array = new Float32Array([0,0,0,0,1,0,0,0,0]);
            private vertexShader : WebGLShader;
            private fragmentShader : WebGLShader;
            private shaderProgram : WebGLProgram;
            private xyLocation : number;
            private samplerLocation : WebGLUniformLocation;
            private tsizeLocation : WebGLUniformLocation;
            private kernelLocation : WebGLUniformLocation;
            private flipyLocation : WebGLUniformLocation;
            private vertexArray : Rectangle = new Rectangle();
            private vertexBuffer : WebGLBuffer;
            private indexBuffer : WebGLBuffer;
            private rebind : boolean = false;
            private changed : boolean = false;
            private flipped : boolean = false;
            private yflip : number = 1;
            transform(kernel : Float32Array) : void {
                this.kernel = kernel;
                this.changed = true;
            }
            width() : number {
                return this.textureWidth;
            }
            height() : number {
                return this.textureHeight;
            }
            texturize(texture : WebGLTexture, width : number, height : number) : void {
                this.texture = texture;
                this.textureWidth = width;
                this.textureHeight = height;
                this.rebind = true;
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
            }
        }
        
        export class Mixer implements Scene {
            private l : StoreConsumer = new StoreConsumer();
            private r : StoreConsumer = new StoreConsumer();
            private context : WebGLRenderingContext;
            private vertexShader : WebGLShader;
            private fragmentShader : WebGLShader;
            private shaderProgram : WebGLProgram;
            private vertexArray : Rectangle = new Rectangle();
            private vertexBuffer : WebGLBuffer;
            private indexBuffer : WebGLBuffer;
            private xyLocation : number;
            private flipyLocation : WebGLUniformLocation;
            private samplerOneLocation : WebGLUniformLocation;
            private samplerTwoLocation : WebGLUniformLocation;
            private fadeLocation : WebGLUniformLocation;
            private yflip : number = 1;
            private flipped : boolean = false;
            private fadeValue : number = 0;
            private faded : boolean = false;
            left() : Consumer {
                return this.l;
            }
            right() : Consumer {
                return this.r;
            }
            width() : number {
                return this.l.width();
            }
            height() : number {
                return this.l.height();
            }
            flipy(yflip : number) : void {
                this.yflip = yflip;
                this.flipped = true;
            }
            fade(value : number) : void {
                this.fadeValue = value;
                this.faded = true;
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
                        "uniform sampler2D samplerOne;" +
                        "uniform sampler2D samplerTwo;" +
                        "uniform float fade;" +
                        "varying vec2 txy;" +
                        "void main() {" +
                        "   vec4 texOneColor = texture2D(samplerOne, txy);" +
                        "   vec4 texTwoColor = texture2D(samplerTwo, txy);" +
                        "   gl_FragColor = (texOneColor * (1.0 - fade)) + (texTwoColor * fade);" +
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
            }
        }
        
        export interface Generator {
            () : number;
        }
        
        export class Colorizer {
            private target : Colorizable;
            private rGen : Generator;
            private gGen : Generator;
            private bGen : Generator;
            private aGen : Generator;
            constructor(target : Colorizable, rGen : Generator, gGen : Generator, bGen : Generator, aGen : Generator) {
                this.target = target;
                this.rGen = rGen;
                this.gGen = gGen;
                this.bGen = bGen;
                this.aGen = aGen;
            }
            send() : void {
                this.target.colorize(this.rGen(), this.gGen(), this.bGen(), this.aGen());
            }
        }

        export interface ChannelUI {
	        midiActive : HTMLInputElement;
	        video : HTMLVideoElement;
	        volume : HTMLInputElement;
	        volumeSpinner : HTMLInputElement;
	        speed : HTMLInputElement;
	        speedSpinner : HTMLInputElement;
	        red : HTMLInputElement;
	        redSpinner : HTMLInputElement;
	        green : HTMLInputElement;
	        greenSpinner : HTMLInputElement;
	        blue : HTMLInputElement;
	        blueSpinner : HTMLInputElement;
	        playingTime : HTMLInputElement;
	        filterOne : HTMLSelectElement;
	        filterTwo : HTMLSelectElement;
	        fileInput : HTMLInputElement;
	        playButton : HTMLButtonElement;
	        stopButton : HTMLButtonElement;
	        resetButton : HTMLButtonElement;
        }
        
        export interface UI {
            left : ChannelUI;
            right : ChannelUI;
            canvas : HTMLCanvasElement;
            fader : HTMLInputElement;
        }
        
        export class Pipeline implements Command {
            private context : WebGLRenderingContext;
            
            private leftVideoSupplierTex : WebGLTexture;
            private leftVideoSupplier : VideoSupplier = new VideoSupplier();
            private leftMatrixFilterOne : Convolver = new Convolver();
            private leftFBOOne : WebGLFramebuffer;
            private leftFBOConnectorOneTex : WebGLTexture;
            private leftFBOConnectorOne : FramebufferSupplier = new FramebufferSupplier();
            private leftMatrixFilterTwo : Convolver = new Convolver();
            private leftFBOTwo : WebGLFramebuffer;
            private leftFBOConnectorTwoTex : WebGLTexture;
            private leftFBOConnectorTwo : FramebufferSupplier = new FramebufferSupplier();
            private leftRGBAFilter : Simple = new Simple();
            private leftFBOThree : WebGLFramebuffer;
            private leftFBOConnectorThreeTex : WebGLTexture;
            private leftFBOConnectorThree : FramebufferSupplier = new FramebufferSupplier();
            
            private rightVideoSupplierTex : WebGLTexture;
            private rightVideoSupplier : VideoSupplier = new VideoSupplier();
            private rightMatrixFilterOne : Convolver = new Convolver();
            private rightFBOOne : WebGLFramebuffer;
            private rightFBOConnectorOneTex : WebGLTexture;
            private rightFBOConnectorOne : FramebufferSupplier = new FramebufferSupplier();
            private rightMatrixFilterTwo : Convolver = new Convolver();
            private rightFBOTwo : WebGLFramebuffer;
            private rightFBOConnectorTwoTex : WebGLTexture;
            private rightFBOConnectorTwo : FramebufferSupplier = new FramebufferSupplier();
            private rightRGBAFilter : Simple = new Simple();
            private rightFBOThree : WebGLFramebuffer;
            private rightFBOConnectorThreeTex : WebGLTexture;
            private rightFBOConnectorThree : FramebufferSupplier = new FramebufferSupplier();
            private mixer : Mixer = new Mixer();
            private leftUpdate : boolean = false;
            private rightUpdate : boolean = false;
            constructor() {
                this.leftRGBAFilter.flipy(-1);
                this.rightRGBAFilter.flipy(-1);
                this.mixer.fade(0.5);
            }
            leftInlet(l : HTMLVideoElement) : void {
                this.leftVideoSupplier.inlet(l);
            }
            rightInlet(r : HTMLVideoElement) : void {
                this.rightVideoSupplier.inlet(r);
            }
            colorizeLeft(red : number, green : number, blue : number, alpha : number) : void {
                this.leftRGBAFilter.colorize(red, green, blue, alpha);
            }
            colorizeRight(red : number, green : number, blue : number, alpha : number) : void {
                this.rightRGBAFilter.colorize(red, green, blue, alpha);
            }
            leftConvOne(m : Float32Array) : void {
                this.leftMatrixFilterOne.transform(m);
            }
            leftConvTwo(m : Float32Array) : void {
                this.leftMatrixFilterTwo.transform(m);
            }
            rightConvOne(m : Float32Array) : void {
                this.rightMatrixFilterOne.transform(m);
            }
            rightConvTwo(m : Float32Array) : void {
                this.rightMatrixFilterTwo.transform(m);
            }
            fade(value : number) : void {
                this.mixer.fade(value);
            }
            updateLeft() : void {
                this.leftUpdate = true;
            }
            updateRight() : void {
                this.rightUpdate = true;
            }
            apply(gl : WebGLRenderingContext) : void {
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
            }
        }
        
        var kernels : {[key : string] : Float32Array} = {};
        kernels['id'] = new Float32Array([0,0,0,0,1,0,0,0,0]);
        kernels['hsobel'] = new Float32Array([1,2,1,0,0,0,-1,-2,-1]);
        kernels['vsobel'] = new Float32Array([1,0,-1,2,0,-2,1,0,-1]);
        kernels['gaussianI'] = new Float32Array([0.045,0.122,0.045,0.122,0.332,0.122,0.045,0.122,0.045]);
        kernels['gaussianII'] = new Float32Array([1,2,1,2,4,2,1,2,1]);
        kernels['gaussianIII'] = new Float32Array([0,1,0,1,1,1,0,1,0]);
        kernels['unsharpen'] = new Float32Array([-1,-1,-1,-1,9,-1,-1,-1,-1]);
        kernels['sharpen'] = new Float32Array([-1,-1,-1,-1,16,-1,-1,-1,-1]);
        kernels['emboss'] = new Float32Array([-2,-1,0,-1,1,1,0,1,2]);
        kernels['edgedtctI'] = new Float32Array([-0.125,-0.125,-0.125,-0.125,1,-0.125,-0.125,-0.125,-0.125]);
        kernels['edgedtctII'] = new Float32Array([-1,-1,-1,-1,8,-1,-1,-1,-1]);
        kernels['edgedtctIII'] = new Float32Array([-5,0,0,0,0,0,0,0,5]);
        kernels['edgedtctIV'] = new Float32Array([-1,-1,-1,0,0,0,1,1,1]);
        kernels['edgedtctV'] = new Float32Array([-1,-1,-1,2,2,2,-1,-1,-1]);
        kernels['edgedtctVI'] = new Float32Array([-5,-5,-5,-5,39,-5,-5,-5,-5]);
        
        export class Controller {
		    private ui : UI;
		    private gl : WebGLRenderingContext = null;
		    private pipe : Pipeline = new Pipeline();
		    private canPlayLeft : boolean = false;
		    private leftPlaying : boolean = false;
		    private canPlayRight : boolean = false;
		    private rightPlaying : boolean = false;
		    private onLeftPlayClick : () => void = null;
		    private onLeftStopClick : () => void = null;
		    private onLeftEnded : () => void = null;
		    private onLeftFileSelect : (evt : any) => void = null;
		    private onLeftCanPlay : () => void = null;
		    private onLeftPlaying : () => void = null;
		    private onLeftPaused : () => void = null;
		    private onLeftTimeUpdate : () => void = null;
		    private onLeftVolumeDrag : () => void = null;
		    private onLeftVolumeSpin : () => void = null;
		    private onLeftSpeedDrag : () => void = null;
		    private onLeftSpeedSpin : () => void = null;
		    private onLeftRedDrag : () => void = null;
		    private onLeftRedSpin : () => void = null;
		    private onLeftGreenDrag : () => void = null;
		    private onLeftGreenSpin : () => void = null;
		    private onLeftBlueDrag : () => void = null;
		    private onLeftBlueSpin : () => void = null;
		    private onLeftMatrixOneChange : () => void = null;
		    private onLeftMatrixTwoChange : () => void = null;
		    private onRightPlayClick : () => void = null;
		    private onRightStopClick : () => void = null;
		    private onRightEnded : () => void = null;
		    private onRightFileSelect : (evt : any) => void = null;
		    private onRightCanPlay : () => void = null;
		    private onRightPlaying : () => void = null;
		    private onRightPaused : () => void = null;
		    private onRightVolumeDrag : () => void = null;
		    private onRightVolumeSpin : () => void = null;
		    private onRightSpeedDrag : () => void = null;
		    private onRightSpeedSpin : () => void = null;
		    private onRightRedDrag : () => void = null;
		    private onRightRedSpin : () => void = null;
		    private onRightGreenDrag : () => void = null;
		    private onRightGreenSpin : () => void = null;
		    private onRightBlueDrag : () => void = null;
		    private onRightBlueSpin : () => void = null;
		    private onRightMatrixOneChange : () => void = null;
		    private onRightMatrixTwoChange : () => void = null;
		    private onFaderDrag : () => void = null;
		    private leftRedness : number = 1;
		    private leftGreenness : number = 1;
		    private leftBlueness : number = 1;
		    private rightRedness : number = 1;
		    private rightGreenness : number = 1;
		    private rightBlueness : number = 1;
		    private leftSpeed : number = 1;
		    private rightSpeed : number = 1;
		    constructor(ui : UI) {
		        this.ui = ui;
		        var glContextTypes : string[] = ["webgl", "experimental-webgl", "moz-webgl", "webkit-3d"];
		        for (var i : number = 0; i < glContextTypes.length && !this.gl; ++i) {
                    this.gl = this.ui.canvas.getContext(glContextTypes[i]);
                }
                this.pipe.leftInlet(this.ui.left.video);
                this.pipe.rightInlet(this.ui.right.video);
		    }
		    speedUpLeft() : void {
		        this.ui.left.video.playbackRate = this.leftSpeed;
		    }
		    volumeLeftTo(percentage : number) : void {
		        this.ui.left.video.volume = percentage;
		    }
		    leftRednessTo(percentage : number) : void {
		        this.leftRedness = percentage;
		        this.pipe.colorizeLeft(this.leftRedness, this.leftGreenness, this.leftBlueness, 1);
		    }
		    leftGreennessTo(percentage : number) : void {
		        this.leftGreenness = percentage;
		        this.pipe.colorizeLeft(this.leftRedness, this.leftGreenness, this.leftBlueness, 1);
		    }
		    leftBluenessTo(percentage : number) : void {
		        this.leftBlueness = percentage;
		        this.pipe.colorizeLeft(this.leftRedness, this.leftGreenness, this.leftBlueness, 1);
		    }
		    speedUpRight() : void {
		        this.ui.right.video.playbackRate = this.rightSpeed;
		    }
		    volumeRightTo(percentage : number) : void {
		        this.ui.right.video.volume = percentage;
		    }
		    rightRednessTo(percentage : number) : void {
		        this.rightRedness = percentage;
		        this.pipe.colorizeRight(this.rightRedness, this.rightGreenness, this.rightBlueness, 1);
		    }
		    rightGreennessTo(percentage : number) : void {
		        this.rightGreenness = percentage;
		        this.pipe.colorizeRight(this.rightRedness, this.rightGreenness, this.rightBlueness, 1);
		    }
		    rightBluenessTo(percentage : number) : void {
		        this.rightBlueness = percentage;
		        this.pipe.colorizeRight(this.rightRedness, this.rightGreenness, this.rightBlueness, 1);
		    }
		    updateLeftFrame() : void {
		        this.pipe.updateLeft();
		        this.pipe.apply(this.gl);
		    }
		    updateRightFrame() : void {
		        this.pipe.updateRight();
		        this.pipe.apply(this.gl);
		    }
		    update() : void {
		        if (this.leftPlaying) {
		            this.updateLeftFrame();
		        }
		        if (this.rightPlaying) {
		            this.updateRightFrame();
		        }
		        if (this.leftPlaying || this.rightPlaying) {
		            requestAnimationFrame(() => {this.update();});
		        }
		    }
		    register() : void {
		        this.ui.left.playButton.addEventListener("click", (this.onLeftPlayClick = () => {
		            if (this.ui.left.video.paused) {
		                this.ui.left.video.play();
		                this.speedUpLeft();
		                this.ui.left.playButton.value = "Pause";
		            } else {
		                this.ui.left.video.pause();
		                this.ui.left.playButton.value = "Play";
		            }
		        }));
		        this.ui.left.stopButton.addEventListener("click", (this.onLeftStopClick = () => {
		            this.ui.left.video.load();
		            this.ui.left.playButton.value = "Play";
		        }));
		        this.ui.left.fileInput.addEventListener("change", (this.onLeftFileSelect = (evt) => {
		            if (!this.ui.left.video.paused) {
		                this.ui.left.playButton.value = "Play";
		            }
		            this.ui.left.video.src = URL.createObjectURL(evt.target.files[0]);
		        }));
		        this.ui.left.video.oncanplay = (this.onLeftCanPlay = () => {
		            this.canPlayLeft = true;
                });
                this.ui.left.video.onplaying = (this.onLeftPlaying = () => {
                    this.leftPlaying = true;
                    this.update();
                });
                this.ui.left.video.onpause = (this.onLeftPaused = () => {
                    this.leftPlaying = false;
                });
                this.ui.left.video.onended = (this.onLeftEnded = () => {
                    this.ui.left.playButton.value = "Play";
                });
                this.ui.left.video.ontimeupdate = (this.onLeftTimeUpdate = () => {
                    if (isNaN(this.ui.left.video.currentTime / this.ui.left.video.duration)) {
                        this.ui.left.playingTime.value = "--";
                        return;
                    }
                    this.ui.left.playingTime.value = Math.floor(this.ui.left.video.currentTime / 3600) + "h" +
                                                     Math.floor((this.ui.left.video.currentTime / 60) % 60) + "m" +
                                                     Math.floor(this.ui.left.video.currentTime % 60) + "s" +
                                                     " (" + 
                                                     Math.floor((this.ui.left.video.currentTime / this.ui.left.video.duration) * 100) +
                                                     "%)";
                });
		        this.ui.left.volume.addEventListener("change", (this.onLeftVolumeDrag = () => {
		            this.volumeLeftTo(+this.ui.left.volume.value / 100);
		            this.ui.left.volumeSpinner.value = this.ui.left.volume.value;
		        }));
		        this.ui.left.volumeSpinner.addEventListener("change", (this.onLeftVolumeSpin = () => {
		            this.volumeLeftTo(+this.ui.left.volumeSpinner.value / 100);
		            this.ui.left.volume.value = this.ui.left.volumeSpinner.value;
		        }));
		        this.ui.left.speed.addEventListener("change", (this.onLeftSpeedDrag = () => {
		            this.leftSpeed = +this.ui.left.speed.value / 100;
		            this.speedUpLeft();
		            this.ui.left.speedSpinner.value = this.ui.left.speed.value;
		        }));
		        this.ui.left.speedSpinner.addEventListener("change", (this.onLeftSpeedSpin = () => {
		            this.leftSpeed = +this.ui.left.speedSpinner.value / 100;
		            this.speedUpLeft();
		            this.ui.left.speed.value = this.ui.left.speedSpinner.value;
		        }));
		        this.ui.left.red.addEventListener("change", (this.onLeftRedDrag = () => {
		            this.leftRednessTo(+this.ui.left.red.value / 255);
		            this.ui.left.redSpinner.value = this.ui.left.red.value;
		        }));
		        this.ui.left.redSpinner.addEventListener("change", (this.onLeftRedSpin = () => {
		            this.leftRednessTo(+this.ui.left.red.value / 255);
		            this.ui.left.red.value = this.ui.left.redSpinner.value;
		        }));
		        this.ui.left.green.addEventListener("change", (this.onLeftGreenDrag = () => {
		            this.leftGreennessTo(+this.ui.left.green.value / 255);
		            this.ui.left.greenSpinner.value = this.ui.left.green.value;
		        }));
		        this.ui.left.greenSpinner.addEventListener("change", (this.onLeftGreenSpin = () => {
		            this.leftGreennessTo(+this.ui.left.green.value / 255);
		            this.ui.left.green.value = this.ui.left.greenSpinner.value;
		        }));
		        this.ui.left.blue.addEventListener("change", (this.onLeftBlueDrag = () => {
		            this.leftBluenessTo(+this.ui.left.blue.value / 255);
		            this.ui.left.blueSpinner.value = this.ui.left.blue.value;
		        }));
		        this.ui.left.blueSpinner.addEventListener("change", (this.onLeftBlueSpin = () => {
		            this.leftBluenessTo(+this.ui.left.blue.value / 255);
		            this.ui.left.blue.value = this.ui.left.blueSpinner.value;
		        }));
		        this.ui.left.filterOne.addEventListener("change", (this.onLeftMatrixOneChange = () => {
		            this.pipe.leftConvOne(kernels[this.ui.left.filterOne.value]);
		        }));
		        this.ui.left.filterTwo.addEventListener("change", (this.onLeftMatrixTwoChange = () => {
		            this.pipe.leftConvTwo(kernels[this.ui.left.filterTwo.value]);
		        }));
		        
		        this.ui.right.playButton.addEventListener("click", (this.onRightPlayClick = () => {
		            if (this.ui.right.video.paused) {
		                this.ui.right.video.play();
		                this.speedUpRight();
		                this.ui.right.playButton.value = "Pause";
		            } else {
		                this.ui.right.video.pause();
		                this.ui.right.playButton.value = "Play";
		            }
		        }));
		        this.ui.right.stopButton.addEventListener("click", (this.onRightStopClick = () => {
		            this.ui.right.video.load();
		            this.ui.right.playButton.value = "Play";
		        }));
		        this.ui.right.fileInput.addEventListener("change", (this.onRightFileSelect = (evt) => {
		            if (!this.ui.left.video.paused) {
		                this.ui.left.playButton.value = "Play";
		            }
		            this.ui.right.video.src = URL.createObjectURL(evt.target.files[0]);
		        }));
		        this.ui.right.video.oncanplay = (this.onRightCanPlay = () => {
		            this.canPlayRight = true;
                });
                this.ui.right.video.onplaying = (this.onRightPlaying = () => {
                    this.rightPlaying = true;
                    this.update();
                });
                this.ui.right.video.onpause = (this.onRightPaused = () => {
                    this.rightPlaying = false;
                });
                this.ui.right.video.onended = (this.onRightEnded = () => {
                    this.ui.right.playButton.value = "Play";
                });
                this.ui.right.video.ontimeupdate = (this.onLeftTimeUpdate = () => {
                    if (isNaN(this.ui.right.video.currentTime / this.ui.right.video.duration)) {
                        this.ui.right.playingTime.value = "--";
                        return;
                    }
                    this.ui.right.playingTime.value = Math.floor(this.ui.right.video.currentTime / 3600) + "h" +
                                                      Math.floor((this.ui.right.video.currentTime / 60) % 60) + "m" +
                                                      Math.floor(this.ui.right.video.currentTime % 60) + "s" +
                                                      " (" + 
                                                      Math.floor((this.ui.right.video.currentTime / this.ui.right.video.duration) * 100) +
                                                      "%)";
                });
		        this.ui.right.volume.addEventListener("change", (this.onRightVolumeDrag = () => {
		            this.volumeRightTo(+this.ui.right.volume.value / 100);
		            this.ui.right.volumeSpinner.value = this.ui.right.volume.value;
		        }));
		        this.ui.right.volumeSpinner.addEventListener("change", (this.onRightVolumeSpin = () => {
		            this.volumeRightTo(+this.ui.right.volumeSpinner.value / 100);
		            this.ui.right.volume.value = this.ui.right.volumeSpinner.value;
		        }));
		        this.ui.right.speed.addEventListener("change", (this.onRightSpeedDrag = () => {
		            this.rightSpeed = +this.ui.right.speed.value / 100;
		            this.speedUpRight();
		            this.ui.right.speedSpinner.value = this.ui.right.speed.value;
		        }));
		        this.ui.right.speedSpinner.addEventListener("change", (this.onRightSpeedSpin = () => {
		            this.rightSpeed = +this.ui.right.speedSpinner.value / 100;
		            this.speedUpRight();
		            this.ui.right.speed.value = this.ui.right.speedSpinner.value; 
		        }));
		        this.ui.right.red.addEventListener("change", (this.onRightRedDrag = () => {
		            this.rightRednessTo(+this.ui.right.red.value / 255);
		            this.ui.right.redSpinner.value = this.ui.right.red.value;
		        }));
		        this.ui.right.redSpinner.addEventListener("change", (this.onRightRedSpin = () => {
		            this.rightRednessTo(+this.ui.right.red.value / 255);
		            this.ui.right.red.value = this.ui.right.redSpinner.value;
		        }));
		        this.ui.right.green.addEventListener("change", (this.onRightGreenDrag = () => {
		            this.rightGreennessTo(+this.ui.right.green.value / 255);
		            this.ui.right.greenSpinner.value = this.ui.right.green.value;
		        }));
		        this.ui.right.greenSpinner.addEventListener("change", (this.onRightGreenSpin = () => {
		            this.rightGreennessTo(+this.ui.right.green.value / 255);
		            this.ui.right.green.value = this.ui.right.greenSpinner.value;
		        }));
		        this.ui.right.blue.addEventListener("change", (this.onRightBlueDrag = () => {
		            this.rightBluenessTo(+this.ui.right.blue.value / 255);
		            this.ui.right.blueSpinner.value = this.ui.right.blue.value;
		        }));
		        this.ui.right.blueSpinner.addEventListener("change", (this.onRightBlueSpin = () => {
		            this.rightBluenessTo(+this.ui.right.blue.value / 255);
		            this.ui.right.blue.value = this.ui.right.blueSpinner.value;
		        }));
		        this.ui.right.filterOne.addEventListener("change", (this.onRightMatrixOneChange = () => {
		            this.pipe.rightConvOne(kernels[this.ui.right.filterOne.value]);
		        }));
		        this.ui.right.filterTwo.addEventListener("change", (this.onRightMatrixTwoChange = () => {
		            this.pipe.rightConvTwo(kernels[this.ui.right.filterTwo.value]);
		        }));
		        
		        this.ui.fader.addEventListener("change", (this.onFaderDrag = () => {
		            this.pipe.fade(+this.ui.fader.value / 100);
		        }));
		    }
		    unregister() : void {
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
		    }
        }
    }
}

