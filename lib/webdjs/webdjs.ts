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
		    constructor(src : HTMLVideoElement, texture : WebGLTexture = null) { 
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
    			this.target.texturize(this.texture, this.src.videoWidth, this.src.videoHeight);
		    }
	    }
	    
	    export class FramebufferSupplier implements Command, Supplier {
	        private context : WebGLRenderingContext;
	        private scn : Scene;
	        private texture : WebGLTexture;
	        private fbo : WebGLFramebuffer;
	        private target : Consumer;
	        constructor(scn : Scene, texture : WebGLTexture = null, fbo : WebGLFramebuffer = null) {
	            this.scn = scn;
	            this.bind(texture);
	            this.framebuffer(fbo);
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
            fader : HTMLInputElement;
        }

        export class Controller {
		    private ui : UI;
		    private leftReady : boolean;
		    private rightReady : boolean;
		    constructor(ui : UI) {
		        this.ui = ui;
		    }
		    register() : void {
		        this.leftReady = false;
		        this.ui.left.video.oncanplay = () => {this.leftReady = true;};
		        this.ui.left.volume.addEventListener("change", () => {
		            this.ui.left.video.volume = +this.ui.left.volume.value / 100;
		            this.ui.left.volumeSpinner.value = this.ui.left.volume.value;
		        });
		        this.ui.left.volumeSpinner.addEventListener("change", () => {
		            this.ui.left.video.volume = +this.ui.left.volumeSpinner.value / 100;
		            this.ui.left.volume.value = this.ui.left.volumeSpinner.value;
		        });
		        this.ui.left.speed.addEventListener("change", () => {
		            this.ui.left.video.playbackRate = +this.ui.left.speed.value / 200;
		            this.ui.left.speedSpinner.value = this.ui.left.speed.value;
		        });
		        this.ui.left.speed.addEventListener("change", () => {
		            this.ui.left.video.playbackRate = +this.ui.left.speedSpinner.value / 200;
		            this.ui.left.speed.value = this.ui.left.speedSpinner.value; 
		        });
		    }
        }
    }
}

