import * as THREE from 'three';

export default class App {

    /**
     * 
     * @param {boolean} debug - debug mode -> add helpers to camera + scene
     */
    constructor(debug = false) {
        this.mouseY = this.mouseX = 0;
        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;

        this.createRenderer();
        this.createScene(debug);
        this.createCamera(0, 0, 1800, debug, 30);
        this.createLight(0, 0, 1);

        this.addObjects();

        this.addEventListeners();
        this.createPreloader();
        this.animate();
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
            this.scene.add(
                new THREE.CameraHelper(this.camera)
            );
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
            this.scene.add(
                new THREE.GridHelper(1000, 10)
            );
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
        document.body.appendChild(this.renderer.domElement);
    }

    /**
     * 
     * @param {number} x - position 
     * @param {number} y - position
     * @param {number} z - position
     * @param {number} color - color of lights
     */
    createLight(x = 0, y = 0, z = 0, color = 0xffffff) {
        const light = new THREE.DirectionalLight(color);
        light.position.set(x, y, z);
        this.scene.add(light);
    }

    /**
     * add example objects into scene
     */
    addObjects() {

        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;

        const context = canvas.getContext('2d');
        const gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
        gradient.addColorStop(0.1, 'rgba(210,210,210,1)');
        gradient.addColorStop(1, 'rgba(255,255,255,1)');

        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);

        const shadowTexture = new THREE.CanvasTexture(canvas);

        const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture });
        const shadowGeo = new THREE.PlaneGeometry(300, 300, 1, 1);

        let shadowMesh;

        shadowMesh = new THREE.Mesh(shadowGeo, shadowMaterial);
        shadowMesh.position.y = - 250;
        shadowMesh.rotation.x = - Math.PI / 2;
        this.scene.add(shadowMesh);

        shadowMesh = new THREE.Mesh(shadowGeo, shadowMaterial);
        shadowMesh.position.y = - 250;
        shadowMesh.position.x = - 400;
        shadowMesh.rotation.x = - Math.PI / 2;
        this.scene.add(shadowMesh);

        shadowMesh = new THREE.Mesh(shadowGeo, shadowMaterial);
        shadowMesh.position.y = - 250;
        shadowMesh.position.x = 400;
        shadowMesh.rotation.x = - Math.PI / 2;
        this.scene.add(shadowMesh);

        const radius = 200;

        const geometry1 = new THREE.IcosahedronGeometry(radius, 1);
        let count = geometry1.attributes.position.count;
        geometry1.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));

        const geometry2 = new THREE.IcosahedronGeometry(radius, 4);
        count = geometry2.attributes.position.count;
        geometry2.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));

        const geometry3 = new THREE.IcosahedronGeometry(radius, 8);
        count = geometry3.attributes.position.count;
        geometry3.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));

        const color = new THREE.Color();
        const positions1 = geometry1.attributes.position;
        const positions2 = geometry2.attributes.position;
        const positions3 = geometry3.attributes.position;
        const colors1 = geometry1.attributes.color;
        const colors2 = geometry2.attributes.color;
        const colors3 = geometry3.attributes.color;

        for (let i = 0; i < count; i++) {

            color.setHSL((positions1.getY(i) / radius + 1) / 2, 1.0, 1);
            colors1.setXYZ(i, color.r, color.g, color.b);

            color.setHSL(0, (positions2.getY(i) / radius + 1) / 2, 0.5);
            colors2.setXYZ(i, color.r, color.g, color.b);

            color.setRGB(1, 0.8 - (positions3.getY(i) / radius + 1) / 2, 1);
            colors3.setXYZ(i, color.r, color.g, color.b);

        }

        const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            flatShading: true,
            vertexColors: true,
        });

        const wireframeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x000000, 
            wireframe: true, 
            transparent: true 
        });

        let mesh = new THREE.Mesh(geometry1, material);
        let wireframe = new THREE.Mesh(geometry1, wireframeMaterial);
        mesh.add(wireframe);
        mesh.position.x = - 400;
        mesh.rotation.x = - 1.87;
        this.scene.add(mesh);

        mesh = new THREE.Mesh(geometry2, material);
        wireframe = new THREE.Mesh(geometry2, wireframeMaterial);
        mesh.add(wireframe);
        mesh.position.x = 400;
        this.scene.add(mesh);

        mesh = new THREE.Mesh(geometry3, material);
        wireframe = new THREE.Mesh(geometry3, wireframeMaterial);
        mesh.add(wireframe);
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
        this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.05;
        this.camera.position.y += (-this.mouseY - this.camera.position.y) * 0.05;
        this.camera.lookAt(this.scene.position);
        this.renderer.render(this.scene, this.camera);
    }
}

new App();