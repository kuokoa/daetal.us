import { Scene, Mesh, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, CylinderGeometry, MeshDepthMaterial, SphereGeometry, GridHelper, FogExp2 } from "./vendor/three/three.module.js";
import { copy, tv, rgb, film } from "./vendor/shaders.js";
import { EffectComposer } from "./vendor/postprocessing/EffectComposer.js";
import { RenderPass } from "./vendor/postprocessing/RenderPass.js";
import { ShaderPass } from "./vendor/postprocessing/ShaderPass.js";

const CyberSpace = {
    element: null,
    width: 0,
    height: 0,
    scene: new Scene(),
    camera: new PerspectiveCamera(),
    renderer: new WebGLRenderer(),
    grid: null,
    cube: null,
    pyramid: null,
    solar: null,
    font: null,
    text: null,
    AFID: null,
    shaderTime: 0,
    composer: null,
    renderPass: null,
    copyPass: new ShaderPass(copy),
    speed: 1,
    effectPasses: {
        tv: new ShaderPass(tv),
        rgb: new ShaderPass(rgb),
        film: new ShaderPass(film)
    },
    effectParams: {
        tv: {
            distortion: 0.1,
            distortion2: 0.1,
            speed: 0,
            rollSpeed: 0,
        },
        rgb: {
            angle: 0,
            amount: 0
        },
        film: {
            grayscale: 0,
            sCount: 400,
            sIntensity: 0.8,
            nIntensity: 0.4,
        },
    },
  mount(element) {
    this.element = element;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.antialias = true;
    this.renderer.shadowMap.enabled = true;
    this.initialize();
    window.addEventListener('resize', () => this.resize());
    
    this.resize();
    this.randomizeEffect();
  },
    initialize() {
      this.camera.near = 0.1;
      this.camera.far = 5000;
      this.camera.position.z = 100;
      this.camera.position.y = 10;

      var cubeGeometry = new BoxGeometry( 1000, 1000, 1000 );
      var material = new MeshBasicMaterial( { color: 0x33cccc } );
      material.wireframe = true;

      var pyramidGeometry = new CylinderGeometry(0, 500, 500, 3, false);
      var pyramidMaterial = new MeshDepthMaterial({ color: 0x000000 });
      this.pyramid = new Mesh( pyramidGeometry, pyramidMaterial );
      this.pyramid.position.z = -2000;
      //this.pyramid.rotation.z = 90 * (180 / Math.PI);
      this.scene.add(this.pyramid);

      var solarGeometry = new SphereGeometry(250, 64, 64);
      var solarMaterial = new MeshBasicMaterial({ color: 0xffffff });
      this.solar = new Mesh( solarGeometry, solarMaterial);
      this.solar.position.z = -3000;
      this.solar.position.y = 350;
      this.scene.add(this.solar);

      this.cube = new Mesh( cubeGeometry, material );
      this.scene.add(this.cube);

      this.grid = new GridHelper( 200000, 10000, 0x9900ff, 0xff0088 );
      this.scene.add(this.grid);

      this.scene.fog = new FogExp2( 0x33cccc, 0.0025 );
      this.renderer.setClearColor( 0x2b2b2b, 1 );
      this.composeShaders();
    },
    resize() {
      this.dequeue();
      this.element.innerHTML = '';
      this.width = this.element.clientWidth;
      this.height = this.element.clientHeight;
      this.renderer.setSize(this.width, this.height);
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.element.append(this.renderer.domElement);
      this.queueNextFrame();
    },
    dequeue() {
      cancelAnimationFrame(this.AFID);
    },
    queueNextFrame() {
      this.AFID = requestAnimationFrame(() => this.animate());
    },
    nextFrame() {
        this.cube.rotation.x += 0.01;
        this.cube.rotation.y += 0.01;
        this.camera.position.z -= 0.1 * this.cameraSpeed;
        if (this.camera.position.z > 0) {
          this.camera.position.z = 0;
        }
        if (this.camera.position.z < -1500) {
          this.camera.position.z = -1500;
        }
  
        this.shaderTime += 0.1;
        Object.keys(this.effectPasses).map(e => {
          if (this.effectPasses[e].uniforms['time']) {
            this.effectPasses[e].uniforms['time'].value = this.shaderTime;
          }
        })
  
        this.render();
      },
    animate() {
      this.nextFrame();
      this.queueNextFrame();
      if (Math.random() < 0.01) {
        this.randomizeEffect();
      }
    },
    render() {
      this.renderer.render(this.scene, this.camera);
      this.composer.render(1);
    },
    composeShaders() {
      this.composer = new EffectComposer(this.renderer);
      this.renderPass = new RenderPass(this.scene, this.camera);
      this.composer.addPass(this.renderPass);
      const effects = Object.keys(this.effectPasses);
      effects.map(e => {
        this.composer.addPass(this.effectPasses[e]);
      });
      this.composer.addPass(this.copyPass);
      this.copyPass.renderToScreen = true;
    },
    randomizeEffect() {
      this.camera.position.z = -1500 * Math.random() * Math.random();
      this.cameraSpeed = Math.random() * Math.random() * 200;
      if (Math.random() < 0.1){
				this.effectParams.tv.distortion  = 3;
				this.effectParams.tv.distortion2 = 1;
				this.effectParams.tv.speed       = 0.3;
				this.effectParams.tv.rollSpeed   = 0;
				this.effectParams.rgb.angle      = 2;
				this.effectParams.rgb.amount     = 0.05;
        this.cameraSpeed                 = -this.cameraSpeed;

			} else {
				this.effectParams.tv.distortion  = Math.random()*10+0.1;
				this.effectParams.tv.distortion2 = Math.random()*10+0.1;
				this.effectParams.tv.speed       = Math.random()*0.4;
				this.effectParams.tv.rollSpeed   = Math.random()*0.1;
        if (Math.random() < .25) {
          this.effectParams.tv.rollSpeed *= -1;
        }
				this.effectParams.rgb.angle      = Math.random()*2;
				this.effectParams.rgb.amount     = Math.random()*0.03;
        // this.effectParams.film.sCount = 800;
        // this.effectParams.film.sIntensity: 0.8;
        // this.effectParams.film.nIntensity: 0.4;
			}
			this.effectParamsChanged();
    },
    effectParamsChanged() {
      const effects = Object.keys(this.effectPasses);
      effects.map(e => {
        const params = Object.keys(this.effectParams[e]);
        params.map(p => {
          this.effectPasses[e].uniforms[p].value = this.effectParams[e][p];
        });
      });
    }
}

CyberSpace.mount(document.getElementById('cyberspace'));