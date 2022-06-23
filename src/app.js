import * as THREE from 'three';
import GUI from 'lil-gui';
import Torus from './Torus';

const config = {
    speed: 0.002,
    lightHelper: false,
    lightColor: 0xff8888,
};
export default class App {

    /**
     * 
     * @param {boolean} debug - debug mode -> add helpers to camera + scene
     */
    constructor(debug = false) {

        this.mouseY = this.mouseX = 0;
        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;
        this.intersection = null;

        this.createRenderer();
        this.createScene(debug, '#000000');
        this.createCamera(0, 900, 1800, debug, 30);
        this.createLight();

        this.addObjects();

        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2(100, 100);

        this.createGui();
        this.addEventListeners();
        this.createPreloader();

        this.animate();
    }


    /**
     * create right configuration
     */
    createGui() {
        const gui = new GUI();       

        const spotlightFolder = gui.addFolder( 'light config' );
        spotlightFolder.add( config, 'speed' ).name( 'rotation speed' ).min( 0.0003 ).max( 0.03 ).onChange( function ( value ) {
            config.speed = value;
        });

        spotlightFolder.add( config, 'lightHelper', true ).name( 'show position' ).onChange( function (value) {
            config.lightHelper = value;
        });

        spotlightFolder.addColor( config, 'lightColor' ).name( 'color' ).onChange( function (color) {
            config.lightColor = color;
        });
    }

    /**
     * 
     * @param {number} x - coordinate
     * @param {number} y - coordinate
     * @param {number} z - coordinate
     * @param {boolean} helper -add camera helper into scene
     * @param {number} fov -  field of view
     */
    createCamera(x = 0, y = 0, z = 0, helper = false, fov = 45) {
        this.camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, 10000);
        this.camera.position.x = x;
        this.camera.position.y = y;
        this.camera.position.z = z;

        if (helper) {
            this.scene.add(new THREE.CameraHelper(this.camera));
        }
    }

    /**
     * 
     * @param {boolean} helper - add scene helper
     * @param {number} bgColor - scene background color
     */
    createScene(helper = false, bgColor = 0xffffff) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(bgColor);
     
        if (helper) {
            this.scene.add(new THREE.GridHelper(1000, 10));
        }
    }

    /**
     * 
     * @param {boolean} antialias - renderer antialising
     */
    createRenderer(antialias = true) {
        this.renderer = new THREE.WebGLRenderer({
            antialias: antialias
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.VSMShadowMap;

        document.body.appendChild(this.renderer.domElement);
    }

    createLight() {        

        this.spotLight = new THREE.SpotLight({
            color: new THREE.Color(config.lightColor),
        });   

        this.spotLight.angle =  Math.PI / 5,
        this.spotLight.penumbra = 0.3
        // shadows config
        this.spotLight.castShadow = true;
        this.spotLight.shadow.camera.near = 8;
        this.spotLight.shadow.camera.far = 10000;
        this.spotLight.shadow.mapSize.width = 1000;
        this.spotLight.shadow.mapSize.height = 1000;
        this.spotLight.shadow.bias = - 0.0001;
        this.spotLight.shadow.radius = 4;

        // position
        this.spotLight.position.set(0, 450, 1000);

        this.scene.add(this.spotLight);

        this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
        this.scene.add(this.spotLightHelper);
    }

    /**
     * add example objects into scene
     */
    addObjects() {
        // generate floor for shadow
        const planeGeometry = new THREE.PlaneGeometry(10, 10);
        const planeMaterial = new THREE.MeshPhongMaterial({
            color: 0x999999,
            shininess: 0,
            specular: 0x111111
        });
        const ground = new THREE.Mesh(planeGeometry, planeMaterial);
        ground.position.y = -250;
        ground.rotation.x = - Math.PI / 2;
        ground.scale.multiplyScalar(6000);
        ground.castShadow = true;
        ground.receiveShadow = true;
        this.scene.add(ground);


        this.addIcosahedron({
            name: 'objekt1',
            color: 0xff0000,
            radius: 200,
            points: 24,
            x: -400,
            wireframe: true,
            shininess: 0          
        }); 

        this.addIcosahedron({
            name: 'objekt2',
            color: 0x00FFFF,
            radius: 200,
            points: 4,
            x: 0,
            wireframe: true,
            shininess: 0         
        });  

        this.addIcosahedron({
            name: 'objekt3',
            color: 0xF7B511,
            radius: 200,
            points: 24,
            x: 400,
            wireframe: false,  
            shininess: 75       
        });    

       this.torus = new Torus(this.scene);
    }

    /**
     * 
     * @param {Object} config - configuration
     */
    addIcosahedron(config) {

        const geometry = new THREE.IcosahedronGeometry(config.radius, config.points);
        
        const mesh = new THREE.Mesh(
            geometry,
            new THREE.MeshPhongMaterial({
                color: config.color,
                specular: 0x222222,
                shininess: config.shininess
            })
        );

        if (config.wireframe) {
            const wireframeMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
                wireframe: true,
                transparent: true
            })
            
            const wireframe = new THREE.Mesh(geometry, wireframeMaterial);
            mesh.add(wireframe)
        }

        mesh.name = config.name;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        mesh.position.x = config.x;
        mesh.rotation.x = - 1.87;
        this.scene.add(mesh);  
    }

    /**
     * initialize event listeners
     */
    addEventListeners() {
        window.addEventListener('mousemove', this.mouseMove.bind(this));
        window.addEventListener('resize', this.resize.bind(this))
    }

    resize() {
        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    mouseMove(event) {
        this.mouseX = (event.clientX - this.windowHalfX);
        this.mouseY = (event.clientY - this.windowHalfY);

        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
    }

    createPreloader() {
        // remove html/css loader
        document.documentElement.classList.remove('loading')
        document.documentElement.classList.add('loaded')
    }

    animate() {
        window.requestAnimationFrame(this.animate.bind(this));
        this.render();
    }

    render() {

        this.animateCamera();
        this.animateLight();
        this.calcIntersect();
        this.torus.animate();

        this.renderer.render(this.scene, this.camera);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.VSMShadowMap;
    }

    animateCamera() {
        this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.05;
        this.camera.position.y += (-this.mouseY - this.camera.position.y) * 0.05 + 25;
        this.camera.lookAt(this.scene.position);
    }

    animateLight() {
        if (config.lightHelper) {
            this.spotLightHelper.visible = true;
            this.spotLightHelper.update();
        } else {
            this.spotLightHelper.visible = false;
        }

        let x = this.spotLight.position.x;
        let z = this.spotLight.position.z;

        this.spotLight.position.x = x * Math.cos(config.speed) + z * Math.sin(config.speed);
        this.spotLight.position.z = z * Math.cos(config.speed) - x * Math.sin(config.speed);

        let color = new THREE.Color(config.lightColor);
        if (color.getHex() != this.spotLight.color.getHex()) {
            this.spotLight.color = color;
        }
    }

    /**
     * calculate intersection of objects and mouse cursor
     */
    calcIntersect() {
        this.raycaster.setFromCamera(this.pointer, this.camera);

        const intersects = this.raycaster.intersectObjects(this.scene.children, false);

        if (intersects.length > 0 && intersects[0].object.name != '') {
            if (this.intersection != intersects[0].object) {
                if (this.intersection) {
                    if (this.intersection.material.emissive)
                        this.intersection.material.emissive.setHex(this.intersection.currentHex);
                }

                this.intersection = intersects[0].object;
                this.intersection.currentHex = this.intersection.material.emissive.getHex();

                this.intersection.material.emissive.setHex(0x03fcf80);

                this.torus.setY(intersects[0].object.position.y + 300)
                this.torus.moveToX = intersects[0].object.position.x;
                this.torus.setVisibillity(true);
            }

            this.torus.moveToX = intersects[0].object.position.x;

        } else {             
            if (this.intersection) {
                if (this.intersection.material.emissive)
                    this.intersection.material.emissive.setHex(0);

            }
            this.torus.setVisibillity(false);
            this.intersection = null;
            this.torus.moveToX = false;

        }
    }
}

new App();