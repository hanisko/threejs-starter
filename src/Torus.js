import {TorusKnotGeometry, Mesh, MeshPhongMaterial} from 'three'
export default class {

    constructor (scene) {
        this.scene = scene;
        this.speed = 1;
        this.moveToX = false;


        this.torusKnot = new Mesh(
            new TorusKnotGeometry(60, 20, 100, 16),
            new MeshPhongMaterial( {
                color: 0x00FF1F,
                shininess: 0,
                specular: 0x222222,
                shininess: 90
            })
        ); 

        this.torusKnot.visible = false;
        this.torusKnot.castShadow = true;
        this.torusKnot.receiveShadow = true;

        this.scene.add(this.torusKnot);
    }

    animate() {
        this.torusKnot.rotation.y += 0.01;       

        if (this.moveToX !== false) {            
            let distance = Math.abs(this.torusKnot.position.x - this.moveToX);
            
            if (distance >= 100) {
                this.speed += 0.2
            } else {
                this.speed -= 0.5;
            }
            
            if (distance <= this.speed || this.speed <= 0) {
                this.speed = 1;                
                this.torusKnot.position.x = this.moveToX;
                this.moveToX = 0;
            } else {
                if (this.torusKnot.position.x < this.moveToX) {
                    this.torusKnot.position.x += this.speed;
                } else if (this.torusKnot.position.x > this.moveToX) {
                    this.torusKnot.position.x -= this.speed;
                }   
            }      
        }
    }

    setY(val) {
        this.torusKnot.position.y = val;
    }

    setVisibillity(val) {
        this.torusKnot.visible = val;
    }
}