///<amd-module name="world/graphics/Atmosphere"/>

import Kernel = require("../Kernel");
import MeshGraphic = require('./MeshGraphic');
import AtmosphereGeometry = require("../geometries/Atmosphere");
import MeshTextureMaterial = require('../materials/MeshTextureMaterial');
import Camera from "../Camera";
import Vector = require("../math/Vector");

class Atmosphere extends MeshGraphic {
    private constructor(public geometry: AtmosphereGeometry, public material: MeshTextureMaterial){
        super(geometry, material);
    }

    static getInstance(): Atmosphere{
        var geometry = new AtmosphereGeometry();
        var imageUrl = "/WebGlobe/src/world/images/atmosphere64.png";
        var material = new MeshTextureMaterial(imageUrl, true);
        return new Atmosphere(geometry, material);
    }

    onDraw(camera: Camera){
        this.geometry.getMatrix().setUnitMatrix();

        //根据Camera动态调整Atmosphere的matrix，使其一直垂直面向摄像机
        var R = Kernel.EARTH_RADIUS;
        var distanceCamera2Origin = camera.getDistance2EarthOrigin();
        var distanceCamera2EarthTangent = Math.sqrt(distanceCamera2Origin * distanceCamera2Origin - R * R);
        var sinθ = distanceCamera2EarthTangent / distanceCamera2Origin;
        var distanceCamera2Atmosphere = distanceCamera2EarthTangent * sinθ;
        var vector = camera.getLightDirection().setLength(distanceCamera2Atmosphere);
        //计算出Atmosphere新的位置
        var atmosphereNewPosition = Vector.verticePlusVector(camera.getPosition(), vector);
        this.geometry.setPosition(atmosphereNewPosition);
        //将Atmosphere的坐标轴方向设置的与Camera相同，这样使其垂直面向摄像机
        this.geometry.setVectorX(camera.getVectorX());
        this.geometry.setVectorY(camera.getVectorY());
        this.geometry.setVectorZ(camera.getVectorZ());
        //缩小Atmosphere使其能够正好将视线与球的圆切面包围
        this.geometry.localScale(sinθ, sinθ, sinθ);

        super.onDraw(camera);
    }
}

export = Atmosphere;