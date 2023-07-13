/**
 * @author alteredq / http://alteredqualia.com/
 */

import { LinearFilter, RGBAFormat, WebGLRenderTarget } from "../three/three.module.js";
import CopyShader from "../shaders/CopyShader.js";
import { ShaderPass } from "./ShaderPass.js";
import { MaskPass, ClearMaskPass } from "./MaskPass.js";

function EffectComposer( renderer, renderTarget ) {

	this.renderer = renderer;

	if ( renderTarget === undefined ) {

		var parameters = {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			format: RGBAFormat,
			stencilBuffer: false
		};
		var size = renderer.getSize();
		renderTarget = new WebGLRenderTarget( size.width, size.height, parameters );

	}

	this.renderTarget1 = renderTarget;
	this.renderTarget2 = renderTarget.clone();

	this.writeBuffer = this.renderTarget1;
	this.readBuffer = this.renderTarget2;

	this.passes = [];

	if ( CopyShader === undefined )
		console.error( "THREE.EffectComposer relies on CopyShader" );

  if ( ShaderPass === undefined)
    console.error( "THREEEffectComposer relies on ShaderPass")

	this.copyPass = new ShaderPass( CopyShader );

};

EffectComposer.prototype = {

  constructor: EffectComposer,

	swapBuffers: function() {

		var tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;

	},

	addPass: function ( pass ) {

		this.passes.push( pass );

	},

	insertPass: function ( pass, index ) {

		this.passes.splice( index, 0, pass );

	},

	render: function ( delta ) {

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

		var maskActive = false;

		var pass, i, il = this.passes.length;

		for ( i = 0; i < il; i ++ ) {

			pass = this.passes[ i ];

			if ( ! pass.enabled ) continue;

			pass.render( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );

			if ( pass.needsSwap ) {

				if ( maskActive ) {

					var context = this.renderer.context;

					context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );

					this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, delta );

					context.stencilFunc( context.EQUAL, 1, 0xffffffff );

				}

				this.swapBuffers();

			}

      if ( MaskPass === undefined )
    		console.error( "THREE.EffectComposer relies on MaskPass" );

      if ( ClearMaskPass === undefined )
    		console.error( "THREE.EffectComposer relies on ClearMaskPass" );

			if ( pass instanceof MaskPass ) {

				maskActive = true;

			} else if ( pass instanceof ClearMaskPass ) {

				maskActive = false;

			}

		}

	},

	reset: function ( renderTarget ) {

		if ( renderTarget === undefined ) {

			var size = this.renderer.getSize();

			renderTarget = this.renderTarget1.clone();
			renderTarget.setSize( size.width, size.height );

		}

		this.renderTarget1.dispose();
		this.renderTarget2.dispose();
		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

	},

	setSize: function ( width, height ) {

		this.renderTarget1.setSize( width, height );
		this.renderTarget2.setSize( width, height );

	}

};

export {
  EffectComposer
};
