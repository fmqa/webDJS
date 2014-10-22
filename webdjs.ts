module WebDJS {
	export module VJ {
		export interface TextureSource {
			load(WebGLContext, WebGLTexture) : void;
		}
		
		export class HTMLImageElementTextureSource implements TextureSource {
			private source : HTMLImageElement;
			constructor(source : HTMLImageElement) { this.source = source; }
			load(gl : WebGLRenderingContext) : void {
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.source);
			}
		}
		
		export class HTMLVideoElementTextureSource implements TextureSource {
			private source : HTMLVideoElement;
			constructor(source : HTMLVideoElement) { this.source = source; }
			load(gl : WebGLRenderingContext) : void {
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.source);
			}
		}
		
		export class RectangularVertexArray {
			private width : number;
			private height : number;
			private x : number;
			private y : number;
			private array : Float32Array = new Float32Array(12);
			constructor(width : number = 0, height : number = 0, x : number = 0, y : number = 0) {
				this.resize(width, height);
			}
			translate(x, y : number) : void {
				this.x = x;
				this.y = y;
				this.array[0] = this.x;
				this.array[1] = this.y;
				this.array[3] = this.y;
				this.array[4] = this.x;
				this.array[6] = this.x;
				this.array[9] = this.y;
			}
			resize(width, height : number) : void {
				this.width = width;
				this.height = height;
				this.array[2] = this.x + this.width;
				this.array[5] = this.y + this.height;
				this.array[7] = this.y + this.height;
				this.array[8] = this.x + this.width;
				this.array[10] = this.x + this.width;
				this.array[11] = this.y + this.height;
			}
			store(gl : WebGLRenderingContext) : void {
				gl.bufferData(gl.ARRAY_BUFFER, this.array, gl.STATIC_DRAW);
			}
		};
		
		export interface Drawable {
			draw(WebGLRenderingContext) : void;
		}
	}
}
