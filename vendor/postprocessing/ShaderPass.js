/**
 * @author alteredq / http://alteredqualia.com/
 */

import { ShaderMaterial, UniformsUtils, OrthographicCamera, Scene, Mesh, PlaneBufferGeometry } from "../three/three.module.js";

function ShaderPass( shader, textureID ) {

	this.textureID = ( textureID !== undefined ) ? textureID : "tDiffuse";

	if ( shader instanceof ShaderMaterial ) {

		this.uniforms = shader.uniforms;

		this.material = shader;

	}

	else if ( shader ) {

		this.uniforms = UniformsUtils.clone( shader.uniforms );

		this.material = new ShaderMaterial( {

			defines: shader.defines || {},
			uniforms: this.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader

		} );

	}

	this.renderToScreen = false;

	this.enabled = true;
	this.needsSwap = true;
	this.clear = false;


	this.camera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
	this.scene = new Scene();

	this.quad = new Mesh( new PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );

};

ShaderPass.prototype = {

  constructor: ShaderPass,

	render: function( renderer, writeBuffer, readBuffer, delta ) {

		if ( this.uniforms[ this.textureID ] ) {

			this.uniforms[ this.textureID ].value = readBuffer;

		}

		this.quad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.render( this.scene, this.camera );

		} else {

			renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		}

	}

};

export { ShaderPass };
