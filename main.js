import * as THREE from './libraries/three.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var movDirection = {x: 0, y:0, z:0};
var bodyDirection = {x: 0, y:0, z:1};
var hpIndicators = {};

function dist(v){
    return Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
}

function mult(v, m){
    return {x:v.x*m, y:v.y*m, z:v.z*m};
}

function add(v, u){
    return {x:v.x+u.x, y:v.y+u.y, z:v.z+u.z};
}

const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(new THREE.Color(0, .1, .7));
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const treeHeight = 2.5;
const trunk = new THREE.ConeGeometry( .5, treeHeight, 5 );
const leaves = new THREE.IcosahedronGeometry( treeHeight/3, 0 );
const leaves2 = new THREE.IcosahedronGeometry( treeHeight/3, 0 );

const torchHeight = 1.7;
const torchModel = new THREE.CylinderGeometry( .2, .4, torchHeight, 4);
const fireModel = new THREE.ConeGeometry( .2, .5, 5 );

const triforcePieceModel = new THREE.CylinderGeometry( .2, .2, .1, 3);

const abdomenHeight = .45;
const headHeight = .4;
const legWidth = .15;
const elderModel = new THREE.BoxGeometry( .5, abdomenHeight*2, .3 );
var positions = elderModel.attributes.position;

for (var i = 0; i < positions.array.length/3; i++)
    if (positions.getY(i) > 0)
        positions.setXYZ(i, positions.getX(i)*0.8, positions.getY(i), positions.getZ(i)*0.8);

const elderChestModel = new THREE.BoxGeometry( .45, abdomenHeight, .25 );

const elderheadModel = new THREE.IcosahedronGeometry( headHeight/2, 0 );
const elderhairModel = new THREE.IcosahedronGeometry( headHeight/1.9, 0 );
elderhairModel.scale(1, .9, 1);
const elderArmModel = new THREE.CapsuleGeometry( legWidth/3., .40, 1 );
elderArmModel.translate(0,-.2,0);
const elderHandModel = new THREE.IcosahedronGeometry( legWidth/3., 0 );

const hatModel = new THREE.ConeGeometry( headHeight/2, headHeight*2.5, 5 );
hatModel.translate(0, .5, 0);
const hatModel2 = new THREE.IcosahedronGeometry( headHeight/2, 1 );
const abdomenModel = new THREE.BoxGeometry( .5, abdomenHeight, .3 );
var positions = abdomenModel.attributes.position;

for (var i = 0; i < positions.array.length/3; i++)
    if (positions.getY(i) > 0)
        positions.setXYZ(i, positions.getX(i)*0.8, positions.getY(i), positions.getZ(i)*0.8);

const chestModel = new THREE.BoxGeometry( .55, abdomenHeight*1.1, .3 );
positions = chestModel.attributes.position;

for (var i = 0; i < positions.array.length/3; i++)
    if (positions.getY(i) < 0)
        positions.setXYZ(i, positions.getX(i)*0.9, positions.getY(i), positions.getZ(i)*0.9);

const headModel = new THREE.IcosahedronGeometry( headHeight/2, 0 );
const faceModel = new THREE.PlaneGeometry( headHeight/1.5, headHeight/1.5, 1, 1 );
const hairModel = new THREE.IcosahedronGeometry( headHeight/1.9, 0 );
const upperLegModel = new THREE.CapsuleGeometry( legWidth/2., .4, 1 );
upperLegModel.translate(0,-.2,0);
const lowerLegModel = new THREE.CapsuleGeometry( legWidth/2., .3, 1 );
lowerLegModel.translate(0,-.2,0);
const upperArmModel = new THREE.CapsuleGeometry( legWidth/3., .2, 1 );
upperArmModel.translate(0,-.1,0);
const lowerArmModel = new THREE.CapsuleGeometry( legWidth/3., .25, 1 );
lowerArmModel.translate(0,-.125,0);
const bootModel = new THREE.CapsuleGeometry( legWidth/1.5, .14, 1 );

const enemyWidth = .5;
const enemyModel = new THREE.IcosahedronGeometry( enemyWidth, 1 );
const enemyModel2 = new THREE.ConeGeometry( enemyWidth, abdomenHeight*3, 6 );
enemyModel2.rotateX(3.14);
const enemyModel3 = new THREE.IcosahedronGeometry( .4, 1 );
enemyModel3.scale(1, .5, 1);

const crossGuardModel = new THREE.CapsuleGeometry( legWidth/8., .1, 1 );
const crossGuardModel2 = new THREE.CapsuleGeometry( legWidth/8., .1, 1 );
const bladeModel = new THREE.BoxGeometry( .05, abdomenHeight, .05 );
const bladeModel2 = new THREE.ConeGeometry( .04, .1, 5 );

const hpWidth = .075;
const hpIndicatorModel = new THREE.CircleGeometry(hpWidth/2, 5);

const caveWidth = 7.;
const cavePortalModel = new THREE.CircleGeometry(caveWidth/2, 20);
cavePortalModel.scale(0.5, 1, 1);

const terrainModel = new THREE.PlaneGeometry( 100, 100, 200, 200 );
positions = terrainModel.attributes.position;

var caveLength = 20;
const wallModel = new THREE.PlaneGeometry( caveLength, caveLength, 1, 1 );
const plainsRadius = 10;

function terrainHeight(x, z){
    var d = dist({x: x, y: 0, z: z});
    var coef = Math.min(Math.max(d - plainsRadius, 0), 1);
    return coef * (10*Math.sin(x/5) * Math.sin(z/5));
}

for (var i = 0; i < positions.array.length/3; i++)
    positions.setXYZ(i, positions.getX(i), positions.getY(i), terrainHeight(positions.getX(i), -positions.getY(i)));

positions.needsUpdate = true;
terrainModel.computeVertexNormals();
var abdomen;
var lowerArmL, elderArmR, elderArmL, elderHandL;
var crossGuard;
var elder;
var terrain, cavePortal, triforce;
var dungeonGround, dungeonWallZ, dungeonWallX, dungeonWallX2;

var textureLoader = new THREE.TextureLoader();
textureLoader.crossOrigin = true;
var nEnemies = new URLSearchParams(window.location.search).get('difficulty');
if (nEnemies == null)
    nEnemies = 4;

var slainEnemies = 0;
var torches = [];


document.getElementById("apply").addEventListener("click", function (event) {
    window.location.search = '&difficulty=' + document.getElementById("difficulty").value;
});

textureLoader.load('images/enemy.jpg', function(texture) {
    for (var i = 0; i < nEnemies; i++){
        var enemyMat = new THREE.MeshPhongMaterial( {color: 0xefcb64, specular: 0x999999, shininess: 50, map: texture} );
        var enemyBody = new THREE.Mesh(enemyModel, enemyMat);
        var enemyBody2 = new THREE.Mesh(enemyModel2, enemyMat);
        enemyBody.add(enemyBody2);
        enemyBody2.position.y -= abdomenHeight * 1.5;
        var enemyBody3 = new THREE.Mesh(enemyModel3, enemyMat);
        enemyBody2.add(enemyBody3);
        enemyBody3.position.y -= abdomenHeight;

        let f = function (o) {enemies[o.i].scale.y = o.s; enemies[o.i].rotation.x = (1 - o.s)-.1; enemies[o.i].rotation.z = (1 - o.s)-.1; enemies[o.i].scale.z = 2 - o.s; enemies[o.i].scale.x = 2- o.s};
        var e1 = new TWEEN.Tween({s: 1, i: i}).to({s: .7}, 300).onUpdate(f);
        var e2 = new TWEEN.Tween({s: .7, i: i}).to({s: 1}, 300).onUpdate(f);
        
        e1.chain(e2);
        e2.chain(e1);
        e1.start();

        var initR = enemyBody.material.color.r;
        var initG = enemyBody.material.color.g;
        var initB = enemyBody.material.color.b;
        var c1 = new TWEEN.Tween({r: initR, i: i}).to({r: 1}, 300).onUpdate(function (o) {enemies[o.i].material.color.set(o.r, initG*Math.pow(initR/o.r,10), initB *Math.pow(initR/o.r,10))});
        var c2 = new TWEEN.Tween({r: 1, i: i}).to({r: initR}, 300).onUpdate(function (o) {enemies[o.i].material.color.set(o.r, initG*Math.pow(initR/o.r,10), initB *Math.pow(initR/o.r,10))});

        c1.chain(c2);
        enemyBody.colourAnimation = c1;

        enemies[i] = enemyBody;
        enemyBody.spawned = false;
        enemyBody.hp = 0;

        enemyBody.position.x = caveLength/2*(Math.random()-0.5);
        enemyBody.position.z = caveLength/2*(Math.random()-0.5);
        enemyBody.position.y = -abdomenHeight*2;
    }
});

textureLoader.load('images/grass.avif', function(texture) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat = new THREE.Vector2(15, 15);
    const grass = new THREE.MeshPhongMaterial( {color: 0x00ee00, specular: 0x111111, shininess: 5, map: texture, bumpMap: texture, bumpScale: .2} );
    
    terrain = new THREE.Mesh( terrainModel, grass );
    terrain.rotation.x = -3.14/2;
    terrain.position.y -= 1;
    scene.add( terrain );
});

textureLoader.load('images/tiling.jpg', function(texture) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat = new THREE.Vector2(3, 5);
    const dungeonGroundMat = new THREE.MeshPhongMaterial( {color: 0x664d39, specular: 0x111111, shininess: 10, bumpMap: texture} );

    dungeonGround = new THREE.Mesh( wallModel, dungeonGroundMat );
    dungeonGround.rotation.y = 3.14;
    dungeonGround.rotation.x = 3.14/2;
    dungeonGround.position.y = -1;
});

textureLoader.load('images/arches.png', function(texture) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat = new THREE.Vector2(2, 4);
    const dungeonWallMat = new THREE.MeshPhongMaterial( {color: 0x7b2101, specular: 0x111111, shininess: 5, map: texture, bumpMap: texture, bumpScale: .05} );
    
    dungeonWallZ = new THREE.Mesh( wallModel, dungeonWallMat );
    dungeonWallZ.rotation.y = 3.14;
    dungeonWallZ.position.y = caveLength/2 - 1;
    dungeonWallZ.position.z = caveLength/2;
    
    dungeonWallX = new THREE.Mesh( wallModel, dungeonWallMat );
    dungeonWallX.rotation.y = 3.14 + -3.14/2;
    dungeonWallX.position.y = caveLength/2 - 1;
    dungeonWallX.position.x = -caveLength/2;
    
    dungeonWallX2 = new THREE.Mesh( wallModel, dungeonWallMat );
    dungeonWallX2.rotation.y = 3.14 + 3.14/2;
    dungeonWallX2.position.y = caveLength/2 - 1;
    dungeonWallX2.position.x = caveLength/2;
});

var decoration = [];
textureLoader.load('images/wood.webp', function(texture) {
    const stripes = new THREE.TextureLoader().load( "images/stripes.png" );
    const leavesNorm = new THREE.TextureLoader().load( "images/hairNormal.jpg" );
    const torchMat = new THREE.MeshPhongMaterial( {color: 0x624f39, specular: 0x111111, shininess: 10, map: texture, normalMap: stripes} );
    const leafMat = new THREE.MeshPhongMaterial( {color: 0x008800, specular: 0x111111, shininess: 10, normalMap: leavesNorm} );
        
    var torchUR = new THREE.Mesh( torchModel, torchMat);
    torchUR.position.y = -.3;
    torchUR.position.z = 6;
    torchUR.position.x = 3;
    torches[0] = torchUR;

    var torchUL = new THREE.Mesh( torchModel, torchMat);
    torchUL.position.y -= .3;
    torchUL.position.z = 6;
    torchUL.position.x = -3;
    torches[1] = torchUL;

    var torchDR = new THREE.Mesh( torchModel, torchMat);
    torchDR.position.y -= .3;
    torchDR.position.z = 2;
    torchDR.position.x = 1.5;
    torches[2] = torchDR;

    var torchDL = new THREE.Mesh( torchModel, torchMat);
    torchDL.position.y -= .3;
    torchDL.position.z = 2;
    torchDL.position.x = -1.5;
    torches[3] = torchDL;

    function genTree(){
        var tree = new THREE.Mesh( trunk, torchMat);
        var tree1 = new THREE.Mesh( leaves, leafMat);
        var tree2 = new THREE.Mesh( leaves2, leafMat);
        tree2.position.y = 1.;
        tree2.rotation.y = 3.14/2;
        tree1.position.y = 1.;
        tree.add(tree1);
        tree1.add(tree2);
        tree.scale.y = 2;
        tree.scale.x = 2;
        tree.scale.z = 2;
        tree.position.y = .9;
        scene.add(tree);

        var t1 = new TWEEN.Tween(tree1.rotation).to({z: 3.14/30}, 2000)
        var t2 = new TWEEN.Tween(tree1.rotation).to({z: 0}, 2000)
        var ts1 = new TWEEN.Tween(tree1.scale).to({x: 1.1}, 2000)
        var ts2 = new TWEEN.Tween(tree1.scale).to({x: 1}, 2000)
        t1.chain(t2);
        t2.chain(t1);
        t1.start();
        ts1.chain(ts2);
        ts2.chain(ts1);
        ts1.start();
        return tree;
    }
    var tree = genTree();
    tree.position.z = 6;
    tree.position.x = 4.5;
    decoration[0] = tree;

    tree = genTree();
    tree.position.z = 7;
    tree.position.x = 3;
    decoration[1] = tree;
    
    tree = genTree();
    tree.position.z = 8;
    tree.position.x = 0.5;
    decoration[2] = tree;
    
    tree = genTree();
    tree.position.z = 4;
    tree.position.x = 7.2;
    decoration[3] = tree;

    tree = genTree();
    tree.position.z = 2;
    tree.position.x = 7.5;
    decoration[4] = tree;

    tree = genTree();
    tree.position.z = 7;
    tree.position.x = -4;
    decoration[5] = tree;
});

textureLoader.load('images/fabric.avif', function(texture) {
    const greenFabric = new THREE.MeshPhongMaterial( {color: 0x008800, specular: 0x111111, shininess: 10, bumpMap: texture, bumpScale: .3} );
    const brownFabric = new THREE.MeshPhongMaterial( {color: 0x984e22, specular: 0x111111, shininess: 10, bumpMap: texture, bumpScale: .3} );
    const crossGuardMat = new THREE.MeshPhongMaterial( {color: 0x9e42f5, specular: 0x999999, shininess: 20} );
    const bladeMat = new THREE.MeshPhongMaterial( {color: 0x999999, specular: 0xffffff, shininess: 100} );
    const skin = new THREE.MeshPhongMaterial( {color: 0xffdd96, specular: 0x111111, shininess: 10} );
    const bootMat = new THREE.MeshPhongMaterial( {color: 0x8f3e00, specular: 0x111111, shininess: 10} );
    const triforceMat = new THREE.MeshPhongMaterial( {color: 0xffff00, specular: 0xffffff, shininess: 100} );

    triforce = new THREE.Mesh( triforcePieceModel, triforceMat);
    triforce.rotation.x = -3.14/2;
    triforce.position.z = 5;
    triforce.position.y = 8;
    var triforce2 = new THREE.Mesh( triforcePieceModel, triforceMat);
    var triforce3 = new THREE.Mesh( triforcePieceModel, triforceMat);
    triforce.add(triforce2);
    triforce2.position.x = .2;
    triforce2.position.z = -.4;
    triforce.add(triforce3);
    triforce3.position.x = -.2;
    triforce3.position.z = -.4;

    cavePortal = new THREE.Mesh( cavePortalModel, new THREE.MeshBasicMaterial({color: 0x000000}));
    scene.add(cavePortal);
    cavePortal.rotation.y = 3.14 + 3.14/4;
    cavePortal.position.z = 7;
    cavePortal.position.x = 7;

    elder = new THREE.Mesh( elderModel, brownFabric );
    elderModel.translate(0, -.2, 0);
    scene.add( elder );
    elder.position.z = 1;
    elder.position.x = -1;
    elder.rotation.y = 3.14;
    elder.position.y = terrainHeight(elder.position.x, elder.position.z);

    const elderChest = new THREE.Mesh( elderChestModel, brownFabric );
    elder.add(elderChest);
    elderChest.position.y = .35;
    elderChest.rotation.x = 3.14/32;

    const elderHead = new THREE.Mesh( elderheadModel, skin );
    elderChest.add(elderHead);
    elderHead.position.y = .45;

    elderArmR = new THREE.Mesh( elderArmModel, brownFabric );
    elder.add(elderArmR);
    elderArmR.position.x = .25;
    elderArmR.position.y = abdomenHeight;
    elderArmR.rotation.x = -3.14/4;

    elderArmL = new THREE.Mesh( elderArmModel, brownFabric );
    elder.add(elderArmL);
    elderArmL.position.x = -.25;
    elderArmL.position.y = abdomenHeight;
    elderArmL.rotation.x = -3.14/4;

    const elderHandR = new THREE.Mesh( elderHandModel, skin );
    elderArmR.add(elderHandR);
    elderHandR.position.y = -.45;

    elderHandL = new THREE.Mesh( elderHandModel, skin );
    elderArmL.add(elderHandL);
    elderHandL.position.y = -.45;
    
    const elderBootL = new THREE.Mesh( bootModel, bootMat );
    elder.add(elderBootL);
    elderBootL.position.y -= .75;
    elderBootL.position.x -= .15;
    elderBootL.position.z += .05;
    elderBootL.rotation.x = 3.14/2;

    const elderBootR = new THREE.Mesh( bootModel, bootMat );
    elder.add(elderBootR);
    elderBootR.position.y -= .75;
    elderBootR.position.x += .15;
    elderBootR.position.z += .05;
    elderBootR.rotation.x = 3.14/2;
    
    var elr1 = new TWEEN.Tween(elderBootR.position).to({z: .2}, 500)
    var elr2 = new TWEEN.Tween(elderBootR.position).to({z: 0}, 500)
    var ell1 = new TWEEN.Tween(elderBootL.position).to({z: 0}, 500)
    var ell2 = new TWEEN.Tween(elderBootL.position).to({z: .2}, 500)
    var ell3 = new TWEEN.Tween(elderBootL.position).to({z: 0}, 500)
    elr1.chain(elr2);
    elr2.chain(elr1);
    elder.walkAnimR = elr1;
    ell1.chain(ell2);
    ell2.chain(ell3);
    ell3.chain(ell2);
    elder.walkAnimL = ell1;

    
    var el1 = new TWEEN.Tween(elder.rotation).to({y: 3.14 + 3.14/4}, 1000)
    var el2 = new TWEEN.Tween(elder.position).to({x: -5, z: -5}, 10000)
    var el12 = new TWEEN.Tween(elderArmL.rotation).to({x: 3.14/8, z: 3.14/16}, 1000)
    var el13 = new TWEEN.Tween(elderArmR.rotation).to({x: 3.14/8, z: -3.14/16}, 1000)
    el1.chain(el2);
    
    elder.startTranslate = function () {
        el1.start();
        el12.start();
        el13.start();
    }

    crossGuard = new THREE.Mesh( crossGuardModel, crossGuardMat );
    elderHandL.add(crossGuard);
    const crossGuard2 = new THREE.Mesh( crossGuardModel2, crossGuardMat );
    crossGuard.add(crossGuard2);
    crossGuard2.rotation.z = 3.14/2;
    crossGuard2.position.y = .05;
    crossGuard.rotation.z = -3.14/2;
    crossGuard.position.z = .05;

    bladeModel.rotateY(3.14/4);
    bladeModel.scale(1, 1, .3);
    bladeModel2.scale(1, 1, .3);
    const blade = new THREE.Mesh( bladeModel, bladeMat );
    crossGuard.add(blade);
    const blade2 = new THREE.Mesh( bladeModel2, bladeMat );
    blade2.position.y = abdomenHeight/2+.05;
    blade.position.y = abdomenHeight/2+.07
    blade.add(blade2);

    abdomen = new THREE.Mesh( abdomenModel, greenFabric );
    scene.add( abdomen );
    abdomen.hp = 3;

    const chest = new THREE.Mesh( chestModel, greenFabric );
    abdomen.add(chest);
    chest.position.y = .35;
    
    var c1 = new TWEEN.Tween(chest.scale).to({y: 1.05}, 2000)
    var c2 = new TWEEN.Tween(chest.scale).to({y: 1}, 2000)
    c1.chain(c2);
    c2.chain(c1);
    c1.start();

    const head = new THREE.Mesh( headModel, skin );
    chest.add(head);
    head.position.y = .45;
    
    textureLoader.load('images/face.png', function(texture) {
        const faceMat = new THREE.MeshPhongMaterial( {specular: 0x111111, shininess: 10, map: texture, transparent: true} );
        const face = new THREE.Mesh( faceModel, faceMat );
        head.add(face);
        face.position.z = .16;

        const faceElder = new THREE.Mesh( faceModel, faceMat );
        elderHead.add(faceElder);
        faceElder.position.z = .16;
    });
    
    textureLoader.load('images/hairNormal.jpg', function(texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat = new THREE.Vector2(2, 2);
        const hairMat = new THREE.MeshPhongMaterial( {color: 0xfff942, specular: 0x111111, shininess: 10, normalMap: texture} );
        const elderHairMat = new THREE.MeshPhongMaterial( {color: 0x999999, specular: 0x111111, shininess: 10, normalMap: texture} );

        const hair = new THREE.Mesh( hairModel, hairMat );
        head.add(hair);
        hair.position.y = .07;
        hair.position.z = -.01;
        
        const elderHair = new THREE.Mesh( elderhairModel, elderHairMat );
        elderHead.add(elderHair);
        elderHair.position.z = -.01;
    });

    const hat = new THREE.Mesh( hatModel2, greenFabric );
    head.add(hat);
    hat.position.z -= .09;
    hat.position.y = .07;
    hat.rotation.x = -2.3;

    const hat2 = new THREE.Mesh( hatModel, greenFabric );
    hat.add(hat2);

    const upperLegR = new THREE.Mesh( upperLegModel, skin );
    abdomen.add(upperLegR);
    upperLegR.position.x = legWidth;

    const upperLegL = new THREE.Mesh( upperLegModel, skin );
    abdomen.add(upperLegL);
    upperLegL.position.x = -legWidth;

    const lowerLegR = new THREE.Mesh( lowerLegModel, skin );
    upperLegR.add(lowerLegR);
    lowerLegR.position.z = -.01;
    lowerLegR.position.y = -.4;

    const lowerLegL = new THREE.Mesh( lowerLegModel, skin );
    upperLegL.add(lowerLegL);
    lowerLegL.position.z = -.01;
    lowerLegL.position.y = -.4;

    const bootL = new THREE.Mesh( bootModel, bootMat );
    lowerLegL.add(bootL);
    bootL.position.y -= .4;
    bootL.position.z += .05;
    bootL.rotation.x = 3.14/2;

    const bootR = new THREE.Mesh( bootModel, bootMat );
    lowerLegR.add(bootR);
    bootR.position.y -= .4;
    bootR.position.z += .05;
    bootR.rotation.x = 3.14/2;

    const upperArnR = new THREE.Mesh( upperArmModel, skin );
    abdomen.add(upperArnR);
    upperArnR.position.x = .3;
    upperArnR.position.y = abdomenHeight;

    const lowerArmR = new THREE.Mesh( lowerArmModel, skin );
    upperArnR.add(lowerArmR);
    lowerArmR.position.y = -.25;

    const upperArnL = new THREE.Mesh( upperArmModel, skin );
    abdomen.add(upperArnL);
    upperArnL.position.x = -.3;
    upperArnL.position.y = abdomenHeight;

    lowerArmL = new THREE.Mesh( lowerArmModel, skin );
    upperArnL.add(lowerArmL);
    lowerArmL.position.y = -.25;

    for (let i = 0; i < abdomen.hp; i++){
        var hpIndicator = new THREE.Mesh(hpIndicatorModel, new THREE.MeshBasicMaterial({color: 0xff0000}));
        camera.add(hpIndicator);
        hpIndicator.position.z = -.5;
        hpIndicator.lookAt(camera.position);
        hpIndicator.position.x = -.5+i*hpWidth;
        hpIndicator.position.y = .3;
        
        hpIndicators[i] = hpIndicator;

    }

    var walking = false;
    var timePerFrame = 250;
    var ull1 = new TWEEN.Tween(upperLegL.rotation).to({x: -3.14/10}, timePerFrame)
    var lll1 = new TWEEN.Tween(lowerLegL.rotation).to({x: 3.14/2}, timePerFrame)
    var ulr1 = new TWEEN.Tween(upperLegR.rotation).to({x: 0}, timePerFrame)
    var uar1 = new TWEEN.Tween(upperArnR.rotation).to({x: 0}, timePerFrame)
    var ual1 = new TWEEN.Tween(upperArnL.rotation).to({x: 0}, timePerFrame)
    var h1 = new TWEEN.Tween(hat2.rotation).to({z: 0}, timePerFrame)
    
    var ull2 = new TWEEN.Tween(upperLegL.rotation).to({x: -3.14/10}, timePerFrame)
    var lll2 = new TWEEN.Tween(lowerLegL.rotation).to({x: 0}, timePerFrame)
    var ulr2 = new TWEEN.Tween(upperLegR.rotation).to({x: 3.14/8}, timePerFrame)
    var uar2 = new TWEEN.Tween(upperArnR.rotation).to({x: -3.14/4}, timePerFrame)
    var ual2 = new TWEEN.Tween(upperArnL.rotation).to({x: 3.14/8}, timePerFrame)
    var h2 = new TWEEN.Tween(hat2.rotation).to({z: -3.14/10}, timePerFrame)
    
    ull1.chain(ull2);
    ulr1.chain(ulr2);
    lll1.chain(lll2);
    uar1.chain(uar2);
    ual1.chain(ual2);
    h1.chain(h2);

    var ulr3 = new TWEEN.Tween(upperLegR.rotation).to({x: -3.14/10}, timePerFrame)
    var llr3 = new TWEEN.Tween(lowerLegR.rotation).to({x: 3.14/2}, timePerFrame)
    var ull3 = new TWEEN.Tween(upperLegL.rotation).to({x: 0}, timePerFrame)
    var uar3 = new TWEEN.Tween(upperArnR.rotation).to({x: 0}, timePerFrame)
    var ual3 = new TWEEN.Tween(upperArnL.rotation).to({x: 0}, timePerFrame)
    var h3 = new TWEEN.Tween(hat2.rotation).to({z: 0}, timePerFrame)
    
    lll2.chain(llr3);
    ulr2.chain(ulr3);
    ull2.chain(ull3);
    uar2.chain(uar3);
    ual2.chain(ual3);
    h2.chain(h3);
    
    var ulr4 = new TWEEN.Tween(upperLegR.rotation).to({x: -3.14/10}, timePerFrame)
    var llr4 = new TWEEN.Tween(lowerLegR.rotation).to({x: 0}, timePerFrame)
    var ull4 = new TWEEN.Tween(upperLegL.rotation).to({x: 3.14/8}, timePerFrame)
    var uar4 = new TWEEN.Tween(upperArnR.rotation).to({x: 3.14/8}, timePerFrame)
    var ual4 = new TWEEN.Tween(upperArnL.rotation).to({x: -3.14/4}, timePerFrame)
    var h4 = new TWEEN.Tween(hat2.rotation).to({z: 3.14/10}, timePerFrame)

    llr3.chain(llr4);
    ulr3.chain(ulr4);
    ull3.chain(ull4);
    uar3.chain(uar4);
    ual3.chain(ual4);
    h3.chain(h4);

    var ull5 = new TWEEN.Tween(upperLegL.rotation).to({x: -3.14/10}, timePerFrame)
    var lll5 = new TWEEN.Tween(lowerLegL.rotation).to({x: 3.14/2}, timePerFrame)
    var ulr5 = new TWEEN.Tween(upperLegR.rotation).to({x: 0}, timePerFrame)
    var uar5 = new TWEEN.Tween(upperArnR.rotation).to({x: 0}, timePerFrame)
    var ual5 = new TWEEN.Tween(upperArnL.rotation).to({x: 0}, timePerFrame)
    var h5 = new TWEEN.Tween(hat2.rotation).to({z: 0}, timePerFrame)
   
    llr4.chain(lll5);
    ulr4.chain(ull5);
    ull4.chain(ulr5);
    uar4.chain(uar5);
    ual4.chain(ual5);
    h4.chain(h5);
    
    ull5.chain(ull2);
    ulr5.chain(ulr2);
    lll5.chain(lll2);
    uar5.chain(uar2);
    ual5.chain(ual2);
    h5.chain(h2);

    var timePerFrame = 250;
    
    var ull7 = new TWEEN.Tween(upperLegL.rotation).to({x: -3.14/8}, timePerFrame)
    var lll7 = new TWEEN.Tween(lowerLegL.rotation).to({x: 0}, timePerFrame)
    var ulr7 = new TWEEN.Tween(upperLegR.rotation).to({x: 3.14/8}, timePerFrame)
    var llr7 = new TWEEN.Tween(lowerLegR.rotation).to({x: 0}, timePerFrame)
    var uar7 = new TWEEN.Tween(upperArnR.rotation).to({x: 3.14/4}, timePerFrame)
    var ual7 = new TWEEN.Tween(upperArnL.rotation).to({x: -3.14/2}, timePerFrame)
    var a7 = new TWEEN.Tween(abdomen.position).to(add(abdomen.position, mult(bodyDirection, .2)), timePerFrame)
    
    var ull8 = new TWEEN.Tween(upperLegL.rotation).to({x: 0}, 200)
    var lll8 = new TWEEN.Tween(lowerLegL.rotation).to({x: 0}, 200)
    var ulr8 = new TWEEN.Tween(upperLegR.rotation).to({x: 0}, 200)
    var llr8 = new TWEEN.Tween(lowerLegR.rotation).to({x: 0}, 200)
    var uar8 = new TWEEN.Tween(upperArnR.rotation).to({x: 0}, 200)
    var ual8 = new TWEEN.Tween(upperArnL.rotation).to({x: 0}, 200)

    ull7.chain(ull8);
    ulr7.chain(ulr8);
    lll7.chain(lll8);
    llr7.chain(llr8);
    uar7.chain(uar8);
    ual7.chain(ual8);

    function startWalk(){
        
        abdomen.lookAt(abdomen.position.x + movDirection.x, abdomen.position.y + movDirection.y, abdomen.position.z + movDirection.z);
        bodyDirection = Object.assign({}, movDirection);

        if (!walking)
            walking = true;
        else
            return;
        
        ull1.start();
        lll1.start();
        ulr1.start();
        uar1.start();
        ual1.start();
        h1.start();
    }

    window.addEventListener("keydown", function (event) {
        if (event.defaultPrevented) {
            return; // Do nothing if the event was already processed
        }
        
        switch (event.key.toLowerCase()) {
            case "w":
                movDirection.z = 1;
                startWalk();
                break;
            case "a":
                movDirection.x = 1;
                startWalk();
                break;
            case "s":
                movDirection.z = -1;
                startWalk();
                break;
            case "d":
                movDirection.x = -1;
                startWalk();
                break;
            default:
            return;
        }
    });

    window.addEventListener("keyup", function (event) {
        if (event.defaultPrevented) {
            return; // Do nothing if the event was already processed
        }
        
        switch (event.key.toLowerCase()) {
            case "w":
            case "a":
            case "s":
            case "d":
            movDirection.x = 0;
            movDirection.z = 0;
            walking = false;

            ull1.stop();
            lll1.stop();
            ulr1.stop();
            uar1.stop();
            ual1.stop();
            h1.stop();

            ull2.stop();
            lll2.stop();
            ulr2.stop();
            uar2.stop();
            ual2.stop();
            h2.stop();

            ull3.stop();
            llr3.stop();
            ulr3.stop();
            uar3.stop();
            ual3.stop();
            h3.stop();

            ull4.stop();
            llr4.stop();
            ulr4.stop();
            uar4.stop();
            ual4.stop();
            h4.stop();

            ull5.stop();
            lll5.stop();
            ulr5.stop();
            uar5.stop();
            ual5.stop();
            h5.stop();

            
            new TWEEN.Tween(upperLegL.rotation).to({x: 0}, 200).start()
            new TWEEN.Tween(lowerLegL.rotation).to({x: 0}, 200).start()
            new TWEEN.Tween(upperLegR.rotation).to({x: 0}, 200).start()
            new TWEEN.Tween(lowerLegR.rotation).to({x: 0}, 200).start()
            new TWEEN.Tween(upperArnR.rotation).to({x: 0}, 200).start()
            new TWEEN.Tween(upperArnL.rotation).to({x: 0}, 200).start()
            break;
            default:
            return;
        }
    });

    window.addEventListener("click", function (event) {
        a7 = new TWEEN.Tween(abdomen.position).to(add(abdomen.position, mult(bodyDirection, .2)), 600);
        
        enemies.forEach(enemy => {
            var diff = add(abdomen.position, mult(enemy.position, -1));
            var distance = dist(diff);
            var direction = mult(diff, -1/distance);
            var bDir = mult(bodyDirection, 1/dist(bodyDirection));

            if (enemy.hp > 0 && distance < 1. && Math.acos(bDir.x*direction.x+bDir.y*direction.y+bDir.z*direction.z) < 3.14/4){
                
                if (gotSword){
                    enemy.colourAnimation.start();
                    enemy.hp -= 1;
                }

                if (enemy.hp > 0)
                    new TWEEN.Tween(enemy.position).to(add(enemy.position, mult(bodyDirection, 1.5)), 100).start();
                else{
                    scene.remove(enemy);

                    slainEnemies += 1;
                    var nTorches = Math.floor(4*slainEnemies/nEnemies);
                    for (var i = 0; i < nTorches; i++){
                        if (torches[i].kindled == undefined){
                            var fire = new THREE.Mesh( fireModel, new THREE.MeshBasicMaterial({color: 0xff0000}));
                            var light = new THREE.PointLight( 0xff0000, 2, 10 );
                            
                            var f1 = new TWEEN.Tween(fire.scale).to({y: 2}, 500);
                            var f2 = new TWEEN.Tween(fire.scale).to({y: 1}, 500);
                            f1.chain(f2);
                            f2.chain(f1);
                            f1.start();
                            fire.position.y += torchHeight - .6;
                            torches[i].add(fire);
                            fire.add( light );
                            torches[i].kindled = true;
                            

                            if (nTorches == 4){
                                scene.add(triforce);
                                new TWEEN.Tween(triforce.position).to({y: 0}, 4000).start();
                                var t1 = new TWEEN.Tween(triforce.rotation).to({z: 4*3.14}, 10000).start();
                                var t2 = new TWEEN.Tween(triforce.rotation).to({z: 8*3.14}, 20000).start();
                                t1.chain(t2);
                                t1.start();
                            }
                        }
                    }
                }
            }
        });
        

        ull7.start();
        lll7.start();
        llr7.start();
        ulr7.start();
        uar7.start();
        ual7.start();
        a7.start();
    });
});


camera.position.z = -5;
camera.position.y = .5;
scene.add(camera);

var spawnEnemies;
var enemies = [];
var gotSword = false;
var inCave = false;
var sunLight = new THREE.DirectionalLight( 0xffffff, 0.4 );
scene.add(sunLight);
const ambientLight = new THREE.AmbientLight( 0x909090 ); // soft white light
scene.add( ambientLight );

function animate() {
	requestAnimationFrame( animate );
	TWEEN.update()
    if (abdomen != undefined && abdomen.hp > 0){
        camera.lookAt(new THREE.Vector3().multiplyVectors(abdomen.position, new THREE.Vector3(.1)));
        enemies.forEach(enemy => {
            if (enemy.hp > 0){
                var diff = add(abdomen.position, mult(enemy.position, -1));
                var distance = dist(diff);
                var direction = mult(diff, 1/distance);
    
                enemy.position.x += direction.x * .01;
                enemy.position.z += direction.z * .01;
    
                if (distance < .3){
                    var initR = abdomen.material.color.r + .01;
                    var initG = abdomen.material.color.g;
                    var initB = abdomen.material.color.b;
                    var c1 = new TWEEN.Tween({r: initR}).to({r: 1}, 300).onUpdate(function (o) {abdomen.material.color.set(o.r, initG*Math.pow(initR/o.r,10), initB *Math.pow(initR/o.r,10))});
                    var c2 = new TWEEN.Tween({r: 1}).to({r: initR}, 300).onUpdate(function (o) {abdomen.material.color.set(o.r, initG*Math.pow(initR/o.r,10), initB *Math.pow(initR/o.r,10))});
                    c1.chain(c2);
                    c1.start();
                    abdomen.hp -= 1;
                    camera.remove(hpIndicators[abdomen.hp]);
    
                    if (abdomen.hp > 0)
                        new TWEEN.Tween(abdomen.position).to(add(abdomen.position, mult(direction, 1.5)), 100).start();
                    else
                        location.reload();
                }
            }
        });
        
        abdomen.position.z += movDirection.z * .015;
        abdomen.position.x += movDirection.x * .015;
        if (abdomen.position.z < -4 || (!inCave && dist(abdomen.position) > plainsRadius) || (inCave && abdomen.position.z > caveLength/2 || inCave && abdomen.position.x > caveLength/2 || inCave && abdomen.position.x < -caveLength/2)){
            abdomen.position.z -= movDirection.z * .015;
            abdomen.position.x -= movDirection.x * .015;
        }

        
        if (!gotSword){
            var diff = add(abdomen.position, mult(elder.position, -1));
            var distance = dist(diff);
            if (distance < .5){
                gotSword = true;
                lowerArmL.add(crossGuard);
                crossGuard.position.z = 0;
                crossGuard.rotation.z = 0;
                crossGuard.rotation.y = 3.14/2;
                crossGuard.rotation.x = 3.14/2;
                crossGuard.position.y = -.25;
                
                elder.startTranslate();
                elder.walkAnimR.start();
                elder.walkAnimL.start();
            }
        }

        if (inCave){
            var diff = add(abdomen.position, mult(triforce.position, -1));
            var distance = dist(diff);
            if (distance < .5)
                location.reload();
        }

                
        var diff = add(abdomen.position, mult(cavePortal.position, -1));
        var distance = dist(diff);
        if (distance < 2.5 && !inCave){
            inCave = true;
            abdomen.position.z = -5;
            abdomen.position.x = 0;
            new TWEEN.Tween(abdomen.position).to({z: -4}, 1000).start();
            let f = function (o) {
                if (o.num >= 1){
                    var enemy = enemies[Math.floor(o.num) - 1];
                    if (enemy.spawned == false){
                        scene.add(enemy);
                        enemy.hp = 3;
                        enemy.spawned = true;
                        new TWEEN.Tween(enemy.position).to({y: 0}, 500).start();
                    }
                }
            };
            spawnEnemies = new TWEEN.Tween({num: 0}).to({num: nEnemies}, 10000).onUpdate(f);
            spawnEnemies.start();

            camera.position.y = 5;
            scene.remove(terrain);
            scene.remove(elder);
            scene.remove(cavePortal);
            decoration.forEach(element => {
                scene.remove(element);
            });

            scene.add(dungeonGround);
            scene.add(dungeonWallX);
            scene.add(dungeonWallX2);
            scene.add(dungeonWallZ);
            torches.forEach(torch => {
                scene.add(torch);
            });
        }
    }

	//scene.rotation.x += 0.01;
	//scene.rotation.y += 0.01;
	renderer.render( scene, camera );
}
animate();