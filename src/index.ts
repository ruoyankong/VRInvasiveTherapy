/* CSCI 5619 Assignment 5, Fall 2020
 * Author: Evan Suma Rosenberg
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3, Color3, Space, Quaternion, Color4, Vector4 } from "@babylonjs/core/Maths/math";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { WebXRInputSource } from "@babylonjs/core/XR/webXRInputSource";
import { WebXRCamera } from "@babylonjs/core/XR/webXRCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { MeshBuilder } from  "@babylonjs/core/Meshes/meshBuilder";
import { InstancedMesh } from "@babylonjs/core/Meshes/instancedMesh";
import { StandardMaterial} from "@babylonjs/core/Materials/standardMaterial";
import { Logger } from "@babylonjs/core/Misc/logger";
import {GlowLayer} from "@babylonjs/core/Layers";
import {TextBlock} from "@babylonjs/gui/2D/controls/textBlock";
import {AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import {HolographicButton} from "@babylonjs/gui/3D/controls";
import {GUI3DManager} from "@babylonjs/gui/3D";
import {ScrollViewer} from "@babylonjs/gui";
import {Button,StackPanel, Control, Checkbox, Rectangle} from "@babylonjs/gui/2D/controls";
import { Button3D } from "@babylonjs/gui/3D/controls/button3D";
import { Animation } from "@babylonjs/core/Animations/animation"
import { PlanePanel } from "@babylonjs/gui/3D/controls/planePanel"
import { CylinderPanel } from "@babylonjs/gui/3D/controls/cylinderPanel"
import { SpherePanel } from "@babylonjs/gui/3D/controls/spherePanel"
import { ScatterPanel } from "@babylonjs/gui/3D/controls/scatterPanel"
import { StackPanel3D } from "@babylonjs/gui/3D/controls/stackPanel3D"
// import {AdvancedDynamicTexture} from "@babylonjs/gui/2D";

// Side effects
import "@babylonjs/core/Helpers/sceneHelpers";

// Import debug layer
import "@babylonjs/inspector";

import { AssetsManager, MeshAssetTask } from "@babylonjs/core/Misc/assetsManager";

import { WebXRControllerComponent } from "@babylonjs/core/XR/motionController/webXRControllerComponent";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { LinesMesh } from "@babylonjs/core/Meshes/linesMesh";
import { Ray } from "@babylonjs/core/Culling/ray";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Mesh } from "@babylonjs/core/Meshes/mesh";

// Side effects
import "@babylonjs/core/Helpers/sceneHelpers";
import "@babylonjs/inspector";
import { int } from "@babylonjs/core/types";
import { WebXRMotionControllerTeleportation } from "@babylonjs/core/XR/features/WebXRControllerTeleportation";
import { WebXRControllerPointerSelection } from "@babylonjs/core/XR/features/WebXRControllerPointerSelection";
import { WebXRDefaultExperience } from "@babylonjs/core/XR/webXRDefaultExperience";
import { WebXRFeatureName } from "@babylonjs/core/XR/webXRFeaturesManager";

import {CSG} from "@babylonjs/core/Meshes/csg";
import { Plane } from "@babylonjs/core";
/******* Start of the Game class ******/ 
class Game 
{ 
    private canvas: HTMLCanvasElement;
    private engine: Engine;
    private scene: Scene;

    private xrCamera: WebXRCamera | null; 
    private leftController: WebXRInputSource | null;
    private rightController: WebXRInputSource | null;

    private selectedObject: AbstractMesh | null;
    private miniatureObject: AbstractMesh | null;
    private selectionTransform: TransformNode | null;

    private laserPointer: LinesMesh | null;
    private meshCopies: Array<Mesh>;//<InstancedMesh>;
    private meshCopyNode: TransformNode | null;
    private meshNode: TransformNode | null;
    private previousRightControllerPosition: Vector3 | null;
    private previousSelectedPosition: Vector3 | null;
    private previousSelectedRotation: Quaternion | null;
    private isPressed: boolean;
    private headset: AbstractMesh | null;
    private count: Map<string, number> | null;
    private lastPoint: Vector3 | null;
    private acpoint: Mesh | null;
    private hl: GlowLayer | null;
    private acpointCopy: Mesh|null;//InstancedMesh | null; 

    private text: TextBlock | null;
    private title: TextBlock | null;
    private advancedTexture: AdvancedDynamicTexture | null;
    private directiony: int;
    private directionx: int;
    private nearPoint: Mesh | null;
    private leftControllerTransform: TransformNode | null;

    private flag: int;
    private plane_type: int;
    private panel: PlanePanel | null;
    private plane: Mesh | null;
    private newMeshNode: TransformNode | null;
    private sv: ScrollViewer | null;

    constructor()
    {
        // Get the canvas element 
        this.canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
        this.sv = null;

        // Generate the BABYLON 3D engine
        this.engine = new Engine(this.canvas, true, { stencil: true }); 

        // Creates a basic Babylon Scene object
        this.scene = new Scene(this.engine);   

        // Initialize XR member variables to null
        this.xrCamera = null;
        this.leftController = null;
        this.rightController = null;

        this.selectedObject = null;
        this.selectionTransform = null;
        this.leftControllerTransform = null;
        this.miniatureObject = null;
        
        this.laserPointer = null;
        this.meshCopies = new Array<Mesh>();//<InstancedMesh>();
        this.meshCopyNode = null;
        this.meshNode = null;

        this.previousSelectedPosition = null;
        this.previousRightControllerPosition = null;
        this.previousSelectedRotation = null;

        this.isPressed = false;
        this.headset = null;
        this.count = new Map<string, number>() 
        this.lastPoint = null; 
        this.acpoint = null;  
        this.acpointCopy = null;        
        this.hl = null;    
        this.text = null;
        this.title = null;
        this.advancedTexture = null;  
        
        this.directionx = 0;
        this.directiony = 0;
        this.nearPoint = null;
        this.flag = 0;
        this.panel = null;
        this.plane_type = 0;

        this.plane = null;

        this.newMeshNode = null;
    }

    start() : void 
    {
        // Create the scene and then execute this function afterwards
        this.createScene().then(() => {

            // Register a render loop to repeatedly render the scene
            this.engine.runRenderLoop(() => { 
                this.update();
                this.scene.render();
            });

            // Watch for browser/canvas resize events
            window.addEventListener("resize", () => { 
                this.engine.resize();
            });
        });
    }

    private async createScene() 
    {
        // This creates and positions a first-person camera (non-mesh)
        var camera = new UniversalCamera("camera1", new Vector3(0, 1.6, 0), this.scene);
        camera.fov = 90 * Math.PI / 180;
        camera.minZ = .1;
        camera.maxZ = 100;

        // This attaches the camera to the canvas
        camera.attachControl(this.canvas, true);

        // Creates the XR experience helper
        const xrHelper = await this.scene.createDefaultXRExperienceAsync({});
        // .then((xrHelper: WebXRDefaultExperience) => {
        //     xrHelper.pointerSelection = <WebXRControllerPointerSelection>xrHelper.baseExperience.featuresManager.enableFeature(WebXRFeatureName.POINTER_SELECTION, "latest", {
        //         xrInput: xrHelper.input,
        //         renderingGroupId: 2
        //     });
        //     xrHelper.pointerSelection.displayLaserPointer = true;
        //     xrHelper.pointerSelection.displaySelectionMesh = true;
        //     // set controller meshes's renderingGroupId
        //     xrHelper.input.onControllerAddedObservable.add((controller: { onMeshLoadedObservable: { add: (arg0: (rootMesh: { renderingGroupId: number; getChildMeshes: (arg0: boolean) => any[]; }) => void) => void; }; }) => {
        //         controller.onMeshLoadedObservable.add((rootMesh: { renderingGroupId: number; getChildMeshes: (arg0: boolean) => any[]; }) => {
        //             rootMesh.renderingGroupId = 2;
        //             rootMesh.getChildMeshes(false).forEach(m => m.renderingGroupId = 2)
        //         });
        //     });
        //     // set teleportation target zone renderingGroupId
        //     xrHelper.teleportation = <WebXRMotionControllerTeleportation>xrHelper.baseExperience.featuresManager.enableFeature(WebXRFeatureName.TELEPORTATION, 'stable', {
        //         xrInput: xrHelper.input, floorMeshes: [], renderingGroupId: 2,
        //         });
        //     return xrHelper;
        // });

        // Disable teleportation and the laser pointer
        xrHelper.teleportation.dispose();
        // xrHelper.pointerSelection.dispose();

        // Create points for the laser pointer
        var laserPoints = [];
        laserPoints.push(new Vector3(0, 0, 0));
        laserPoints.push(new Vector3(0, 0, 10));

        // Create a laser pointer and make sure it is not pickable
        this.laserPointer = MeshBuilder.CreateLines("laserPointer", {points: laserPoints}, this.scene);
        this.laserPointer.color = Color3.Blue();
        this.laserPointer.alpha = .5;
        this.laserPointer.visibility = 0;
        this.laserPointer.isPickable = false;

        // Assign the xrCamera to a member variable
        this.xrCamera = xrHelper.baseExperience.camera;
        this.xrCamera.position.z=-100;

        // This transform will be used to attach objects to the laser pointer
        this.selectionTransform = new TransformNode("selectionTransform", this.scene);
        this.selectionTransform.parent = this.laserPointer;
        this.meshCopyNode = new TransformNode("meshCopyNode", this.scene);
        this.meshNode = new TransformNode("meshNode", this.scene);
        this.hl = new GlowLayer("glow", this.scene,{    mainTextureFixedSize: 1024,
            blurKernelSize: 128});
        this.hl.intensity = 10;

        this.leftControllerTransform = new TransformNode("leftTransform", this.scene);

        // Attach the laser pointer to the right controller when it is connected
        xrHelper.input.onControllerAddedObservable.add((inputSource) => {
            if(inputSource.uniqueId.endsWith("right"))
            {
                this.rightController = inputSource;
                this.laserPointer!.parent = this.rightController.pointer;
                this.laserPointer!.visibility = 1;
            }
            else 
            {
                this.xrCamera!.position.z=-100;
                this.leftController = inputSource;
                this.meshCopyNode!.scaling = new Vector3(0.002, 0.002, 0.002);
                this.meshCopyNode!.parent = this.leftController.pointer;
                this.meshCopyNode!.position = new Vector3(0, 0.1, 0);
                TextPlane.parent = this.leftController.pointer!;
                TextPlane.position.y += 0.2;
                this.leftControllerTransform!.parent = this.leftController.pointer!;
                this.panel!.linkToTransformNode(this.leftControllerTransform);
                this.panel!.children.forEach((button)=>{
                    button.isVisible = false;
                })
                // this.meshCopyNode!.scaling = new Vector3(0.1, 0.1, 0.1);
            }  
        });


        xrHelper.input.onControllerRemovedObservable.add((inputSource) => {

            if(inputSource.uniqueId.endsWith("right")) 
            {
                this.laserPointer!.parent = null;
                this.laserPointer!.visibility = 0;
            }
            else
            {
                this.meshCopyNode!.parent = null;
            }
        });

        // Creates a default skybox
        const environment = this.scene.createDefaultEnvironment({
            // createGround: true,
            // groundSize: 50,
            createGround: false,
            skyboxSize: 1200,
            skyboxColor: new Color3(219/255,250/255, 189/255)
        });

        // Make sure the environment and skybox is not pickable!
        // environment!.ground!.isPickable = false;
        environment!.skybox!.isPickable = false;
        // environment!.ground!.isPickable = false;

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        var light = new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.72;

        // // Our built-in 'sphere' shape.
        // var sphere = MeshBuilder.CreateSphere("sphere", {diameter: 1, segments: 32}, this.scene);
        // sphere.position = new Vector3(-1, 1.6, 2);

        // // Use an instanced mesh to efficiently create a copy of an object
        // var sphereCopy = new InstancedMesh("sphereCopy", sphere);
        // sphereCopy.position = new Vector3(1, 1.6, 2)
        // sphereCopy.scaling = new Vector3(1, 2, 1);

        // // Any modifications to the original Mesh also changes the InstancedMesh
        // var cubeMaterial = new StandardMaterial("blueMaterial", this.scene);
        // cubeMaterial.diffuseColor = new Color3(0, 0, 1);
        // sphere.material = cubeMaterial;



        var assetsManager = new AssetsManager(this.scene);

        // var noPickMesh = Array.from(new Array(36),(val,index)=> "Box" + index);
        // noPickMesh.push("Box");
        // noPickMesh.push("Box47");
        // noPickMesh.push("Box53");
        // noPickMesh.push("Plane");
        // noPickMesh.push("pod");
        var noPickMesh = ["Brain.obj", "Skull.obj", "Vasculature.obj"];
        // noPickMesh.push("Plane");

        var resourceName = ["ACPoint.obj", "Brain.obj", "Caudate_L.obj", "Caudate_R.obj", "GPe_L.obj", "GPe_R.obj", "PCPoint.obj", 
        "Putamen_L.obj", "Putamen_R.obj", "RN_L.obj", "RN_R.obj", "Skull.obj", "SN_L.obj", "SN_R.obj", "STN_L.obj", "STN_R.obj", "Thalamus_L.obj", "Thalamus_R.obj",
     "Vasculature.obj", "GPi_L.obj", "GPi_R.obj"]//, "Frame.obj"
        resourceName.forEach(resource => {
            var ModelTask = assetsManager.addMeshTask(resource, "", "assets/ModelsAligned/", resource);
            ModelTask.onSuccess = (task) => {
                ModelTask.loadedMeshes.forEach((mesh) => {
                    mesh.name = resource.substring(0, resource.length-4);
                    mesh.material!.name = resource+"_material";
                    mesh.visibility = 0.8;
                    console.log("loaded mesh: " + mesh.name);
                    mesh.setParent(this.meshNode);
                    var meshCopy = <Mesh>mesh.clone(mesh.name+"Copy", this.meshCopyNode);//new InstancedMesh(mesh.name+"Copy", <Mesh>mesh);
                    this.meshCopies.push(meshCopy);
                    // meshCopy.setParent(this.meshCopyNode);
                    meshCopy.isPickable = false;
                    mesh.isPickable = true;
                    // console.log("Flag ? "+ flag);
                    // if (flag == 1){
                    //     if (mesh.name == "Skull"){
                    //         mesh.visibility = 0;
                    //     }
                    // }
                    if (mesh.name == "ACPoint"){
                        // mesh.enableEdgesRendering();
                        // mesh.edgesColor = new Color4(1, 0, 0, 1);
                        // meshCopy.enableEdgesRendering();
                        // meshCopy.edgesColor = new Color4(1, 0, 0, 1);
                        mesh.visibility = 1;
                        console.log("vis"+mesh.visibility);
                        this.acpoint = <Mesh>mesh;
                        this.acpointCopy = meshCopy;
                        // hl.addMesh(meshCopy, Color3.Red());

                        // var sphere = Mesh.CreateSphere("sphere", 16, 2, this.scene);
                        // var sphereCopy = new InstancedMesh("sphereCopy", <Mesh>sphere);
                        // sphere.setParent(this.meshNode);
                        // sphereCopy.setParent(this.meshCopyNode);
                        // sphere.position = mesh.position.clone();
                        // sphereCopy.position = meshCopy.position.clone();


                    }
                    // if (noPickMesh.includes(mesh.name)){
                    //     mesh.isPickable = false;
                    //     // meshCopy.isPickable = false;
                    // }
                    // else{
                    //     mesh.isPickable = true;
                    //     // meshCopy.isPickable = true;
                    // }
                    // console.log("isPickable "+mesh.isPickable);
                    
                    
                });
            }

        });


        var headsetTask = assetsManager.addMeshTask("headsetTask", "", "assets/people/", "FIGURE_MAN_OBJ.obj");
        headsetTask.onSuccess = (task) => {
            headsetTask.loadedMeshes.forEach((mesh) => {
                console.log("loaded mesh: " + mesh.name);
                mesh.scaling = new Vector3(1.5, 1.5, 1.5);
                mesh.name = "headset";
                mesh.isPickable = true;
                mesh.setParent(this.meshCopyNode);
                this.headset = mesh;
                mesh.enableEdgesRendering();
                mesh.edgesWidth = 0.1;
                mesh.edgesColor = new Color4(0, 1, 0, 1);

                
            });
        }
        
        var TextPlane = MeshBuilder.CreatePlane("textPlane", {}, this.scene);
        TextPlane.position.y = .1;
        TextPlane.isPickable = false;

        // // Create a dynamic texture for adding GUI controls
        // var staticTextTexture = AdvancedDynamicTexture.CreateForMesh(TextPlane, 512, 512);

        // // Create a static text block
        // var staticText = new TextBlock();
        // staticText.text = "Hello world!";
        // staticText.color = "white";
        // staticText.fontSize = 12;
        // staticTextTexture.addControl(staticText);
        this.sv = new ScrollViewer();
        this.sv.thickness = 5;
        this.sv.color = "#add8e6";
        this.sv.width = 0.8;
        this.sv.height = 0.3;
        this.sv.alpha = 0.7;
        this.sv.background = "#95c8d8";
        this.sv.barColor = "red";
        this.sv.barSize = 10;

        this.advancedTexture = AdvancedDynamicTexture.CreateForMesh(TextPlane, 512, 512);//CreateFullscreenUI("UI");
        
        this.text = new TextBlock();
        this.title = new TextBlock();
        this.title.text = "Risk Estimation\n";
        this.title.color = "57a0d3";
        this.title.fontSize = 24;
        this.title.shadowColor = "white";
        this.title.shadowOffsetX = 2;
        this.title.shadowOffsetY = 2;
        // this.sv.addControl(this.title);

        this.text.text = "Press Right Trigger to Select Direction\n";
        this.text.color = "white";
        this.text.fontSize = 20;
        this.text.shadowColor = "black";
        this.text.shadowOffsetX = 2;
        this.text.shadowOffsetY = 2;
        // this.text.width = 10;
        // this.text.textHorizontalAlignment = 0.8;
        this.text.textVerticalAlignment = 0;
        this.advancedTexture.addControl(this.text);    

        this.hl.customEmissiveColorSelector = function(mesh, subMesh, material, result) {
            if ((mesh.name === "ACPoint")||(mesh.name === "ACPointCopy")) {
                result.set(1, 0, 0, 1);
            } else {
                result.set(0, 0, 0, 0);
            }
        }
        // Test GUI: 
        // var appBar = new TransformNode("Bars");
        // var manager = new GUI3DManager(this.scene); //???3dui???
        // var panel = new PlanePanel(); //??
        // panel.margin = 0.2;
        // panel.rows = 3;
        // manager.addControl(panel); //?????ui???????
        // panel.linkToTransformNode(appBar); //?????
        // panel.position = new Vector3(this.xrCamera!.position.x, this.xrCamera!.position.y + 2.5 + 2, this.xrCamera!.position.z - 2.5 + 0.5);
        // var btnName = ["","left","", "down","", "up","", "right",""];
        // var btns = [] //???
        // for (var index = 0; index < 9; index++) {
        //     var button = new HolographicButton(btnName[index]);
        //     btns.push(button)
        // }

        // version 1:
        // var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        // var panel = new StackPanel();
        // var button1 = Button.CreateSimpleButton("but1", "Layer Frame");
        // var button2 = Button.CreateSimpleButton("but2", "Layer Skull");
        // var button3 = Button.CreateSimpleButton("but3", "Layer Brain");
        // var button4 = Button.CreateSimpleButton("but4", "Layer Vascular");
        // button1.width = "150px"
        // button1.height = "40px";
        // button1.color = "white";
        // button1.cornerRadius = 20;
        // button1.background = "green";
        // var flag = 0;
        // button1.onPointerClickObservable.add(function() {
        //     // alert("you did it!");
        //     flag = 1;
        //     // meshNode
        // });
        // button2.width = "150px"
        // button2.height = "40px";
        // button2.color = "white";
        // button2.cornerRadius = 20;
        // button2.background = "green";
        // button2.onPointerUpObservable.add(function() {
        //     // alert("you did it!");
        //     flag = 2;
        // });
        // button3.width = "150px"
        // button3.height = "40px";
        // button3.color = "white";
        // button3.cornerRadius = 20;
        // button3.background = "green";
        // button3.onPointerUpObservable.add(function() {
        //     // alert("you did it!");
        //     flag = 3;
        // });
        // button4.width = "150px"
        // button4.height = "40px";
        // button4.color = "white";
        // button4.cornerRadius = 20;
        // button4.background = "green";
        // button4.onPointerUpObservable.add(function() {
        //     // alert("you did it!");
        //     flag = 4;
        // });
        // console.log("Flag?: " + flag)
        // if (flag == 1){
        //     // this.meshNode.name
        //     console.log("Flag: " + flag + this.meshNode.getChildren.name)
        // }else if(flag == 2){

        // }else if(flag == 3){

        // }else if(flag == 4){

        // }
        // panel.addControl(button1);    
        // panel.addControl(button2);    
        // panel.addControl(button3);    
        // panel.addControl(button4);    
        // advancedTexture.addControl(panel);    

        // Version 2:
        // GUI
        // global.editor.manipulatorControl("snap", state)
        // var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        // // var panel = new StackPanel();
        // var panel = new Rectangle();
        // panel.width = "200px";
        // panel.top = "20px";
        // panel.width = "235px";
        // panel.height = "30px";
        // panel.thickness = 0;
        // panel.background = "#cccccc";
        // panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        // panel.isVertical = false;
        // panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        // panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;

        // var checkbox = new Checkbox();
        // checkbox.width = "20px";
        // checkbox.height = "20px";
        // checkbox.isChecked = true;
        // checkbox.color = "green";
        // checkbox.onIsCheckedChangedObservable.add(function(value) {
        //     // if (skull) {
        //     //     skull.useVertexColors = value;
        //     // }
        //     console.log("What? ")
        // });
        // panel.addControl(checkbox);    

        // var header1 = new TextBlock();
        // var header2 = new TextBlock();
        // var header3 = new TextBlock();
        // var header4 = new TextBlock();
        // header1.text = "Layer Frame";
        // header1.width = "180px";
        // header1.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        // header1.color = "white";
        // let header_button1 = Control.AddHeader(
        //     header1, "header1", "100px", { isHorizontal: true, controlFirst: true }
        // );
        // header_button1.width = "100px";
        // header_button1.height = "24px";
        // header_button1.left = "-50px";

        // header2.text = "Layer Skull";
        // header2.width = "180px";
        // header2.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        // header2.color = "white";
        // let header_button2 = Control.AddHeader(
        //     header2, "header2", "100px", { isHorizontal: true, controlFirst: true }
        // );
        // header_button2.width = "100px";
        // header_button2.height = "24px";
        // header_button2.left = "90px";
        // advancedTexture.addControl(panel);
        // panel.addControl(header_button1); 
        // panel.addControl(header_button2); 
        // Version 3:
        // The manager automates some of the GUI creation steps
        // var testAnimation = new Animation(
        //     "testAnimation", 
        //     "position", 75, 
        //     Animation.ANIMATIONTYPE_VECTOR3,
        //     Animation.ANIMATIONLOOPMODE_CONSTANT
        // );

        // var testAnimationKeys = [];
        // testAnimationKeys.push({frame: 0, value: new Vector3(0, 4, 5)});
        // testAnimationKeys.push({frame: 75, value: new Vector3(0, .5, 5)});
        // testAnimation.setKeys(testAnimationKeys);
        var guiManager = new GUI3DManager(this.scene);
        // var testSphere = MeshBuilder.CreateSphere("testSphere", {diameter: 1}, this.scene);
        // testSphere.position = new Vector3(0, 3, 5);
        // testSphere.animations.push(testAnimation);
        // // Create a test button
        // var testButton = new Button3D("testButton");
        // guiManager.addControl(testButton);

        // // This must be done after addControl to overwrite the default content
        // testButton.position = new Vector3(0, 1.6, 3); 
        // testButton.scaling.y = .5;   

        // // Link a transform node so we can move the button around
        // var testButtonTransform = new TransformNode("testButtonTransform", this.scene);
        // testButtonTransform.rotation.y = 90 * Math.PI / 180;
        // testButton.linkToTransformNode(testButtonTransform);

        // // Create the test button text
        // var testButtonText = new TextBlock();
        // testButtonText.text = "Hello world!";
        // testButtonText.color = "white";
        // testButtonText.fontSize = 24;
        // testButtonText.scaleY = 2;
        // testButton.content = testButtonText;

        // // Type cast the button material so we can change the color
        // var testButtonMaterial = <StandardMaterial>testButton.mesh!.material;
       
        // Custom background color
        // var backgroundColor = new Color3(.284, .73, .831);
        // testButtonMaterial.diffuseColor = backgroundColor;
        // testButton.pointerOutAnimation = () => {
        //     testButtonMaterial.diffuseColor = backgroundColor;
        // }

        // // Custom hover color
        // var hoverColor = new Color3(.752, .53, .735);
        // testButton.pointerEnterAnimation = () => {
        //     testButtonMaterial.diffuseColor = hoverColor;
        // }

        // // Start the animation when the button is selected
        // testButton.onPointerDownObservable.add(() => {
        //     this.scene.beginAnimation(testSphere, 0, 75, false);
        // });



        //var panel = new StackPanel3D();
        //var panel = new PlanePanel();
        //var panel = new CylinderPanel();
        //var panel = new SpherePanel();
        var panel = new PlanePanel();
        this.panel = panel;
        this.panel.margin = 0.02;
  
        guiManager.addControl(this.panel);

        var addButton = (name: string) => {
            var button = new Button3D(name);
            this.panel!.addControl(button);
            // button.onPointerUpObservable.add(function(){
            //     panel.isVertical = false;
            // });   
            
            button.onPointerDownObservable.add(() =>{
                if (this.flag == 2){
                    button.isVisible = true;
                var mesh = this!.scene.getMeshByName(button!.name!);
                mesh!.isVisible = !mesh!.isVisible;
                mesh!.isPickable = !mesh!.isPickable;
                if (button.content.color == "white") button.content.color = "green";
                else button.content.color = "white";
                }
            })
            // button.scaling = new Vector3(0.1, 0.1, 0.1);
            
            var text1 = new TextBlock();
            text1.text = name;
            text1.color = "green";
            text1.fontSize = 44;
            button.content = text1; 
        }
    
        
        // Create 20 holographic buttons
        this.panel.blockLayout = true;
        resourceName.forEach(resource => {
            addButton(resource.substring(0, resource.length-4));
            console.log("load button"+resource);
        }
        )
        this.panel.blockLayout = false;
        this.panel.scaling = new Vector3(0.1, 0.1, 0.1);
        this.panel.isVisible = false;
        console.log("panelvis"+this.panel.isVisible);
        this.meshCopyNode.setEnabled(false);
        
        

        // This loads all the assets and displays a loading screen
        assetsManager.load();
        


        // This will execute when all assets are loaded
        assetsManager.onFinish = (tasks) => {
            // this.scene.clipPlane = new Plane(0, 1, 0, 0);
            // this.hl!.outerGlow = true;
            // this.hl!.innerGlow = true;
            // this.hl!.isEnabled = true;

            // Show the debug layer
            // this.scene.debugLayer.show();
        };

        // Show the debug layer
        // this.scene.debugLayer.show();
    }

    private update() : void
    {
        if (this.headset && this.xrCamera){
            this.headset.position = this.xrCamera!.position;
            this.headset.rotation = this.xrCamera!.rotation;
        }
        this.processControllerInput(); 
        if(this.rightController)
        {
            this.previousRightControllerPosition = this.rightController.grip!.position.clone();
        }

    }

    private processControllerInput()
    {
        this.onRightTrigger(this.rightController?.motionController?.getComponent("xr-standard-trigger"));
        this.onRightThumbstick(this.rightController?.motionController?.getComponent("xr-standard-thumbstick"));
        this.onRightSqueeze(this.rightController?.motionController?.getComponent("xr-standard-squeeze"));
        // this.onLeftThumbstick(this.leftController?.motionController?.getComponent("xr-standard-thumbstick"));
        this.onLeftSqueeze(this.leftController?.motionController?.getComponent("xr-standard-squeeze"));
    }

    private onLeftSqueeze(component?: WebXRControllerComponent){
        if(component?.changes.pressed?.current)
        {
            console.log(this.flag);
            this.flag = (this.flag+1)%3;
            if (this.flag == 0){
                this.panel!.children.forEach((button)=>{
                    button.isVisible = false;
                })
            }
            if (this.flag == 1){
                this.sv!.removeControl(this.text!);
                this.advancedTexture?.removeControl(this.text!);
                
                this.advancedTexture?.removeControl(this.sv!);
                this.meshCopyNode?.setEnabled(true);
                console.log("panelvis"+this.panel?.isVisible);
            }
            if (this.flag == 2){
                this.meshCopyNode?.setEnabled(false);
                this.panel!.children.forEach((button)=>{
                    button.isVisible = true;
                })
                
            }
            if (this.selectedObject){
                if (this.selectedObject.name == "headset") this.selectedObject.setParent(this.meshCopyNode);
                this.selectedObject = null;
            }
            if (this.newMeshNode){
                this.newMeshNode.dispose();
                this.newMeshNode = null;
                this.meshNode?.setEnabled(true);
            }
            
        }
    }

    private onRightThumbstick(component?: WebXRControllerComponent)
    {
        if(component?.changes.axes)
        { 
            if (component.axes.y == 0){
                // Get the current hand direction
                var directionVector = this.rightController!.pointer.forward;

                // Use delta time to calculate the move distance based on speed of 3 m/sec
                var moveDistance = -this.directiony * 4;
                this.directiony = 0;

                // Translate the camera forward
                this.xrCamera!.position.addInPlace(directionVector.scale(moveDistance));

                // Use delta time to calculate the turn angle based on speed of 60 degrees/sec
                // var turnAngle = this.directionx * 20;
                // this.directionx = 0;

                // // 6. Convert this into a [snap turn]
                // var cameraRotation = Quaternion.FromEulerAngles(0, turnAngle * Math.PI / 180, 0);
                // this.xrCamera!.rotationQuaternion.multiplyInPlace(cameraRotation); 
            }else{
                if (component.axes.x > 0) this.directionx = 1;
                else this.directionx = -1;
                if (component.axes.y > 0) this.directiony = 1;
                else this.directiony = -1;
            }
        }
    }
 
    private onRightTrigger(component?: WebXRControllerComponent)
    {  
        var dealt = 0;
        if (this.flag == 1){
            if(component?.changes.pressed)
            {
                if(component?.pressed)
                {
                    this.laserPointer!.color = Color3.Green();
    
                    var ray = new Ray(this.rightController!.pointer.position, this.rightController!.pointer.forward, 10);
                    var pickInfo = this.scene.pickWithRay(ray);
                    var previousName = "";
    
                    // Deselect the currently selected object 
                    if(this.selectedObject)
                    {   
                        previousName = this.selectedObject.name;
                        if (this.selectedObject.name == "headset"){
                            this.selectedObject.enableEdgesRendering();
                            this.selectedObject!.edgesColor = new Color4(0, 1, 0, 1);
                        }
                        else{
                            this.selectedObject!.disableEdgesRendering();
                            previousName = this.selectedObject.name;
                            // this.selectedObject.disableEdgesRendering();
                            // this.selectedObject.setParent(this.meshNode);
                            this.selectedObject = null;
                            // this.miniatureObject?.disableEdgesRendering();
                            // this.miniatureObject = null;
                            this.previousSelectedPosition = null;
                            this.previousSelectedRotation = null;
                            this.isPressed = false;
                            this.sv!.removeControl(this.text!);
                            this.advancedTexture?.removeControl(this.text!);
                            
                            this.advancedTexture?.removeControl(this.sv!);
                            dealt =1;
                        }
                        // this.selectedObject!.edgesColor = new Color4(0, 1, 0, 1);
                        if (this.selectedObject!.name =="headset") this.selectedObject!.setParent(this.meshCopyNode);
                        // if (this.selectedObject.name == "headset") dealt = 1;
                        this.selectedObject = null;
                        this.previousSelectedPosition = null;
                        this.isPressed = false;
                        if (this.nearPoint){
                            this.nearPoint.dispose();
                            this.nearPoint = null;
                        }
                        
                    }
    
                    console.log("squeeze "+pickInfo);
    
                    if(pickInfo?.hit && pickInfo!.pickedMesh?.name == "headset")// && (pickInfo!.pickedMesh?.name != previousName))
                    {
                        this.selectedObject = this.headset;//pickInfo!.pickedMesh;
                        this.selectedObject!.enableEdgesRendering();
                        this.selectedObject!.edgesColor = new Color4(0, 0, 1, 1);
    
                        // Parent the object to the transform on the laser pointer
                        this.selectionTransform!.position = new Vector3(0, 0, pickInfo.distance);
                        this.selectedObject!.setParent(this.selectionTransform!);
    
                        this.isPressed = true;
                        this.previousSelectedPosition = this.selectedObject!.getAbsolutePosition().subtract(this.meshCopyNode!.getAbsolutePosition());
                        dealt = 1;
    
                    }
                }
                else
                {
                    // Reset the laser pointer color
                    this.laserPointer!.color = Color3.Blue();
    
                    // Release the object from the laser pointer
                    if(this.selectedObject)
                    {
                        if (this.selectedObject!.name == "headset") this.selectedObject!.setParent(this.meshCopyNode);
                        if (this.selectedObject.name == "headset"){
                            this.selectedObject.enableEdgesRendering();
                            this.selectedObject!.edgesColor = new Color4(0, 1, 0, 1);
                        }
                        else{
                             this.selectedObject!.disableEdgesRendering();
                             this.previousSelectedPosition = null;
                             this.previousSelectedRotation = null;
                             this.isPressed = false;
                             this.sv!.removeControl(this.text!);
                             this.advancedTexture?.removeControl(this.text!);
                             
                             this.advancedTexture?.removeControl(this.sv!);
                             dealt = 1;
                        }
                        if (this.selectedObject!.name == "headset") dealt = 1;
                        this.selectedObject = null;
                        // this.selectedObject!.edgesColor = new Color4(0, 1, 0, 1);
                        this.previousSelectedPosition = null;
                        this.previousSelectedRotation = null;
                        this.isPressed = false;
                        if (this.nearPoint){
                            this.nearPoint.dispose();
                            this.nearPoint = null;
                        }
                        
                    } 
                }
            }
    
            if(component?.pressed){
                if (this.selectedObject && this.selectedObject.name == "headset" && this.previousSelectedPosition){
                    var positionChange = this.selectedObject.getAbsolutePosition().subtract(this.meshCopyNode!.getAbsolutePosition()).subtract(this.previousSelectedPosition);
                    this.meshNode!.getChildMeshes().forEach(mesh => {
                        mesh.position = mesh.position.subtract(positionChange);
                        console.log("position"+mesh.position);
                    });
    
                    this.previousSelectedPosition = this.selectedObject!.getAbsolutePosition().subtract(this.meshCopyNode!.getAbsolutePosition());
                    
                    this.isPressed = true;
                    dealt = 1;
                }
                
    
            }
        } 
        
        if(component?.changes.pressed && (dealt==0))
        {
            if(component?.pressed)
            {
                this.laserPointer!.color = Color3.Green();

                var ray = new Ray(this.rightController!.pointer.position, this.rightController!.pointer.forward, 500);
         
                var pickInfo = this.scene.pickWithRay(ray);
                console.log(pickInfo);
                var previousName = "";

                // Deselect the currently selected object 
                if(this.selectedObject)
                {   previousName = this.selectedObject.name;
                    // this.selectedObject.disableEdgesRendering();
                    // this.selectedObject.setParent(this.meshNode);
                    this.selectedObject = null;
                    // this.miniatureObject?.disableEdgesRendering();
                    // this.miniatureObject = null;
                    this.previousSelectedPosition = null;
                    this.previousSelectedRotation = null;
                    this.isPressed = false;
                    this.sv!.removeControl(this.text!);
                    this.advancedTexture?.removeControl(this.text!);
                    
                    this.advancedTexture?.removeControl(this.sv!);
                    this.text!.text = "Press Right Rigger to Select Direction\n";
                    this.text!.color = "white";
                    this.text!.fontSize = 20;
                    this.text!.shadowColor = "black";
                    this.text!.shadowOffsetX = 2;
                    this.text!.shadowOffsetY = 2;
                    this.advancedTexture?.addControl(this.text!);
                    if (this.nearPoint){
                        this.nearPoint.dispose();
                        this.nearPoint = null;
                    }
                    // this.rightController!.pointer.dispose();

                }

                // If an object was hit, select it
                if(pickInfo?.hit && !pickInfo!.pickedMesh?.name.endsWith("Copy") && (pickInfo!.pickedMesh?.name != previousName))
                {
                    // this.laserPointer!.parent = this.rightController!.pointer;
                    // this.laserPointer!.visibility = 1;
                    this.selectedObject = pickInfo!.pickedMesh;
                    // this.selectedObject!.enableEdgesRendering();

                    // Parent the object to the transform on the laser pointer
                    // this.selectionTransform!.position = new Vector3(0, 0, pickInfo.distance);
                    // this.selectedObject!.setParent(this.selectionTransform!);

                    // this.miniatureObject = this.scene.getMeshByName(this.selectedObject?.name+"Copy");
                    // this.miniatureObject!.enableEdgesRendering();
                    this.isPressed = true;
                    this.previousSelectedPosition = this.selectedObject!.getAbsolutePosition().clone();
                    this.previousSelectedRotation = this.selectedObject!.absoluteRotationQuaternion.clone();
                    const delta = ray.direction.scale(0.01);
                    var ACPointPos = new Vector3(1, -19, 29);
                    this.count = new Map<string, number>() 
                    if (this.selectedObject!.name!= "ACPoint" && this.selectedObject!.name!= "headset") this.count.set(this.selectedObject!.name, 1);
                    // console.log(this.count);
                    var start = pickInfo!.pickedPoint?.add(delta);
                    var v = ACPointPos.subtract(start!);
                    
                    var d = Vector3.Dot(v, ray.direction);
                    if (d<0){
                        var direction = ray.direction.scale(-1);
                    }else{
                        var direction = ray.direction.scale(1);
                    }
                    var nearPoint =  start!.add(direction.scale(d));
                    this.nearPoint = MeshBuilder.CreateSphere('nearPoint',{});
                    this.nearPoint.position = nearPoint;
                    this.hl!.customEmissiveColorSelector = function(mesh, subMesh, material, result) {
                        if ((mesh.name === "ACPoint")||(mesh.name === "ACPointCopy")) {
                            result.set(1, 0, 0, 1);
                        }else if(mesh.name === "nearPoint"){
                            result.set(0, 1, 0, 1);
                        }else {
                            result.set(0, 0, 0, 0);
                        }
                    }
                    var distance = Vector3.Distance(nearPoint, ACPointPos);
                    console.log(start, nearPoint, ACPointPos, d, direction);

                    if (start){
                        var ray = Ray.CreateNewFromTo(start, nearPoint);//start?.add(ray.direction.scale(50))
                        var pickInfo = this.scene.pickWithRay(ray);
                        while(pickInfo?.hit){
                            var name = pickInfo.pickedMesh!.name;
                            if (name!= "ACPoint" && name != "headset"){
                                if (this.count.has(name))  this.count.set(name, this.count.get(name)!+1);
                                else this.count.set(name, 1);
                            }
                            start = pickInfo!.pickedPoint?.add(delta);
                            ray = Ray.CreateNewFromTo(start!, nearPoint);//start!.add(ray.direction.scale(50))
                            pickInfo = this.scene.pickWithRay(ray);

                        }
                    }
                    this.advancedTexture?.removeControl(this.text!);
                    // this.advancedTexture?.removeControl(this.title!);
                    this.sv!.removeControl(this.text!);
                    this.advancedTexture?.removeControl(this.sv!);
                    
                    this.text!.text = "";
                    var line = 0;
                    if (d<0) {
                        this.text!.text += "ACPoint is on your back.\n";
                        line += 1;
                    }
                    this.text!.text += "Risk Estimation\n";
                    this.text!.text += "Direction: "+direction.x.toFixed(0)+", "+direction.y.toFixed(0)+", "+direction.z.toFixed(0)+"\n";
                    this.text!.text += "ACPoint: "+ACPointPos.x+", "+ACPointPos.y+", "+ACPointPos.z+"\n";
                    this.text!.text += "NearPoint: "+nearPoint.x.toFixed(0)+", "+nearPoint.y.toFixed(0)+", "+nearPoint.z.toFixed(0)+"\n";
                    this.text!.text += "Distance to ACPoint: "+distance.toFixed(0)+"\n"+"# Intersections:\n";
                    line += 6;
                    this.text!.color = "white";
                    this.text!.fontSize = 20;
                    this.text!.shadowColor = "black";
                    this.text!.shadowOffsetX = 2;
                    this.text!.shadowOffsetY = 2;
                    
                    
                    this.count.forEach((value, key) => {
                        this.count?.set(key, Math.ceil(value!/2.0));
                        this.text!.text += key+": "+this.count?.get(key)+"\n";
                        line += 1;
                    });
                    this.sv!.height = 0.05 * line;
                    this.sv!.addControl(this.text);
                    // this.advancedTexture?.addControl(this.title!);
                    this.advancedTexture?.addControl(this.sv!);
                    console.log(this.text);




                }
            }
            else
            {
                // Reset the laser pointer color
                this.laserPointer!.color = Color3.Blue();

                // Release the object from the laser pointer
                if(this.selectedObject)
                {
                    // this.selectedObject!.setParent(this.meshNode);
                    this.previousSelectedPosition = null;
                    this.previousSelectedRotation = null;
                    this.isPressed = false;
                }  
            }
        }

        if(component?.pressed){
            // if (this.miniatureObject && this.selectedObject && this.previousSelectedPosition && this.previousSelectedRotation){
            //     var positionChange = this.selectedObject.getAbsolutePosition().subtract(this.previousSelectedPosition);
            //     this.miniatureObject.position = this.miniatureObject.position.add(positionChange);

            //     var rotationChange = this.selectedObject.absoluteRotationQuaternion.subtract(this.previousSelectedRotation);
            //     this.miniatureObject.rotationQuaternion = this.miniatureObject.rotationQuaternion!.add(rotationChange);

            //     this.previousSelectedPosition = this.selectedObject!.getAbsolutePosition().clone();
            //     this.previousSelectedRotation = this.selectedObject!.absoluteRotationQuaternion.clone();
            //     this.isPressed = true;
            // }

        }

    }

    // private onRightThumbstick(component?: WebXRControllerComponent)
    // {
    //     // If we have an object that is currently attached to the laser pointer
    //     if(component?.changes.axes && this.selectedObject && this.previousSelectedPosition && this.isPressed)
    //     {
    //         // Use delta time to calculate the proper speed
    //         var moveDistance = -component.axes.y * (this.engine.getDeltaTime() / 1000) * 3;

    //         // Translate the object along the depth ray in world space
    //         // this.selectedObject.translate(this.laserPointer!.forward, moveDistance, Space.WORLD);
            
    //         // if (this.miniatureObject && this.selectedObject && this.previousSelectedPosition){
    //         //     var positionChange = this.selectedObject.getAbsolutePosition().subtract(this.previousSelectedPosition);
    //         //     this.miniatureObject.position = this.miniatureObject.position.add(positionChange);
    //         // }
    //         this.previousSelectedPosition = this.selectedObject!.getAbsolutePosition().clone();
    //     }
    // }

    private onRightSqueeze(component?: WebXRControllerComponent)
    {
        if (this.flag == 1){
            if (this.plane_type == 0){
                if (component?.changes.pressed){
                    if (component?.pressed){
                        if (this.scene.clipPlane){//this.newMeshNode){
                            // this.newMeshNode.dispose();
                            // this.newMeshNode = null;
                            // this.meshNode?.setEnabled(true);
                            this.scene.clipPlane = null;
                            this.plane_type = 1;
                            // this.scene.clipPlane = new Plane(this.plane?.getFacetNormal(4).x!, this.plane?.getFacetNormal(4).y!, this.plane?.getFacetNormal(4).z!, this.plane?.getAbsolutePosition.length!);
                        }else if (!this.plane){
                            this.plane = MeshBuilder.CreateBox("box", {height: 0.01, width: 0.6, depth: 0.6}, this.scene);
                            this.plane.enableEdgesRendering(); 
                            this.plane.edgesWidth = 0.5;
                            this.plane.edgesColor = new Color4(0, 1, 0, 1);
                            this.plane.visibility = 0.8;
                            this.plane.position.z = 0.3;
                            this.plane.parent = this.rightController!.pointer;
                        }

                    }else{
                        if (this.plane){
                            var distv = this.plane!.getAbsolutePosition()?.subtract(this.meshCopyNode!.getAbsolutePosition()!);
                            var d;
                            if (Vector3.Dot(distv, this.plane?.getFacetNormal(8))>=0){
                                d = -distv.length();
                            }else{
                                d = distv.length();
                            }
                            this.scene.clipPlane = new Plane(this.plane?.getFacetNormal(8).x!, this.plane?.getFacetNormal(8).y!, this.plane?.getFacetNormal(8).z!, d*300);
        
                            this.plane?.dispose();
                            this.plane = null;
                        }
                    }
                }
            }else if(this.plane_type == 1){
                if (component?.changes.pressed){
                    if (component?.pressed){
                        if (this.newMeshNode){
                            this.newMeshNode.dispose();
                            this.newMeshNode = null;
                            this.meshNode?.setEnabled(true);
                            this.plane_type = 0;
                        }else if (!this.plane){
                            this.plane = MeshBuilder.CreateBox("box", {height: 0.01, width: 0.6, depth: 0.6}, this.scene);
                            this.plane.enableEdgesRendering(); 
                            this.plane.edgesWidth = 0.5;
                            this.plane.edgesColor = new Color4(0, 0, 1, 1);
                            this.plane.visibility = 0.8;
                            this.plane.position.z = 0.3;
                            this.plane.parent = this.rightController!.pointer;
                        }

                    }else{
                        if (this.plane){
                            var aCSG = CSG.FromMesh(this.plane!);
                            console.log(aCSG);

                            this.newMeshNode = new TransformNode("newMesh", this.scene);
                            this.newMeshNode.setParent(this.leftController!.pointer);
                            this.meshNode?.setEnabled(false);

                            this.meshCopyNode?.getChildMeshes().forEach(mesh => {
                                var bCSG = CSG.FromMesh(<Mesh>mesh);
                                console.log(bCSG)
                                
                                
                                var csg = bCSG.intersect(aCSG);
                                var newMesh = csg.toMesh("csg"+mesh.name, mesh.material, this.scene);
                                newMesh.parent = this.newMeshNode;
                                
                            });
                            this.newMeshNode!.scaling = new Vector3(0.01, 0.01, 0.01);
                            this.newMeshNode!.rotation.x = 270/180*Math.PI;
                            
                            this.newMeshNode!.position = new Vector3(0,0,0);
                            console.log(<Mesh>this.scene.getMeshByName("BrainCopy")!);
        
                            this.plane?.dispose();
                            this.plane = null;
                        }
                    }
                }              
            }
        }

        //     if (this.flag == 1){
        //     if(component?.changes.pressed)
        //     {
        //         if(component?.pressed)
        //         {
        //             this.laserPointer!.color = Color3.Green();

        //             var ray = new Ray(this.rightController!.pointer.position, this.rightController!.pointer.forward, 10);
        //             var pickInfo = this.scene.pickWithRay(ray);
        //             var previousName = "";

        //             // Deselect the currently selected object 
        //             if(this.selectedObject)
        //             {   
        //                 previousName = this.selectedObject.name;
        //                 this.selectedObject!.disableEdgesRendering();
        //                 // this.selectedObject!.edgesColor = new Color4(0, 1, 0, 1);
        //                 this.selectedObject.setParent(this.meshCopyNode);
        //                 this.selectedObject = null;
        //                 this.previousSelectedPosition = null;
        //                 this.isPressed = false;
        //                 if (this.nearPoint){
        //                     this.nearPoint.dispose();
        //                     this.nearPoint = null;
        //                 }
        //                 // if (this.selectedObject.name == "headset"){
        //                 //     previousName = this.selectedObject.name;
        //                 //     this.selectedObject!.disableEdgesRendering();
        //                 //     // this.selectedObject!.edgesColor = new Color4(0, 1, 0, 1);
        //                 //     this.selectedObject.setParent(this.meshCopyNode);
        //                 //     this.selectedObject = null;
        //                 //     this.previousSelectedPosition = null;
        //                 //     this.isPressed = false;
        //                 // }else{
        //                 //     // previousName = this.selectedObject.name;
        //                 //     // this.selectedObject.disableEdgesRendering();
        //                 //     // this.selectedObject.setParent(this.meshCopyNode);
        //                 //     // this.selectedObject = null;
        //                 //     // this.miniatureObject?.disableEdgesRendering();
        //                 //     // this.miniatureObject = null;
        //                 //     // this.previousSelectedPosition = null;
        //                 //     // this.previousSelectedRotation = null;
        //                 //     // this.isPressed = false;
        //                 // }
        //             }

        //             // If an object was hit, select it
        //             // if(pickInfo?.hit && pickInfo!.pickedMesh?.name.endsWith("Copy") && (pickInfo!.pickedMesh?.name != previousName))
        //             // {
        //             //     this.selectedObject = pickInfo!.pickedMesh;
        //             //     this.selectedObject!.enableEdgesRendering();

        //             //     // Parent the object to the transform on the laser pointer
        //             //     this.selectionTransform!.position = new Vector3(0, 0, pickInfo.distance);
        //             //     this.selectedObject!.setParent(this.selectionTransform!);

        //             //     this.miniatureObject = this.scene.getMeshByName(this.selectedObject?.name.substring(0, this.selectedObject?.name.length-4));
        //             //     this.miniatureObject!.enableEdgesRendering();
        //             //     this.isPressed = true;
        //             //     this.previousSelectedPosition = this.selectedObject!.getAbsolutePosition().subtract(this.meshCopyNode!.getAbsolutePosition());
        //             //     this.previousSelectedRotation = this.selectedObject!.absoluteRotationQuaternion.subtract(this.meshCopyNode!.absoluteRotationQuaternion);

        //             // }
        //             console.log("squeeze "+pickInfo);

        //             if(pickInfo?.hit && pickInfo!.pickedMesh?.name == "headset")// && (pickInfo!.pickedMesh?.name != previousName))
        //             {
        //                 this.selectedObject = this.headset;//pickInfo!.pickedMesh;
        //                 this.selectedObject!.enableEdgesRendering();
        //                 this.selectedObject!.edgesColor = new Color4(0, 0, 1, 1);

        //                 // Parent the object to the transform on the laser pointer
        //                 this.selectionTransform!.position = new Vector3(0, 0, pickInfo.distance);
        //                 this.selectedObject!.setParent(this.selectionTransform!);

        //                 this.isPressed = true;
        //                 this.previousSelectedPosition = this.selectedObject!.getAbsolutePosition().subtract(this.meshCopyNode!.getAbsolutePosition());

        //             }
        //         }
        //         else
        //         {
        //             // Reset the laser pointer color
        //             this.laserPointer!.color = Color3.Blue();

        //             // Release the object from the laser pointer
        //             if(this.selectedObject)
        //             {
        //                 this.selectedObject!.setParent(this.meshCopyNode);
        //                 this.selectedObject!.disableEdgesRendering();
        //                 this.selectedObject = null;
        //                 // this.selectedObject!.edgesColor = new Color4(0, 1, 0, 1);
        //                 this.previousSelectedPosition = null;
        //                 this.previousSelectedRotation = null;
        //                 this.isPressed = false;
        //                 if (this.nearPoint){
        //                     this.nearPoint.dispose();
        //                     this.nearPoint = null;
        //                 }
        //             }  
        //         }
        //     }

        //     if(component?.pressed){
        //         if (this.selectedObject && this.selectedObject.name == "headset" && this.previousSelectedPosition){
        //             var positionChange = this.selectedObject.getAbsolutePosition().subtract(this.meshCopyNode!.getAbsolutePosition()).subtract(this.previousSelectedPosition);
        //             this.meshNode!.getChildMeshes().forEach(mesh => {
        //                 mesh.position = mesh.position.subtract(positionChange);
        //                 console.log("position"+mesh.position);
        //             });

        //             this.previousSelectedPosition = this.selectedObject!.getAbsolutePosition().subtract(this.meshCopyNode!.getAbsolutePosition());
                    
        //             this.isPressed = true;
        //         }
        //         // else if (this.miniatureObject && this.selectedObject && this.previousSelectedPosition && this.previousSelectedRotation){
        //         //     // the corresponding movement should also be applied to the original object, so that they appear to be synchronized.
        //         //     // var positionChange = this.selectedObject.getAbsolutePosition().subtract(this.meshCopyNode!.getAbsolutePosition()).subtract(this.previousSelectedPosition);
        //         //     // this.miniatureObject.position = this.miniatureObject.position.add(positionChange.scale(10));

        //         //     // var rotationChange = this.selectedObject.absoluteRotationQuaternion.subtract(this.meshCopyNode!.absoluteRotationQuaternion).subtract(this.previousSelectedRotation);
        //         //     // this.miniatureObject.rotationQuaternion = this.miniatureObject.rotationQuaternion!.add(rotationChange);

        //         //     // this.previousSelectedPosition = this.selectedObject!.getAbsolutePosition().subtract(this.meshCopyNode!.getAbsolutePosition());
        //         //     // this.previousSelectedRotation = this.selectedObject!.absoluteRotationQuaternion.subtract(this.meshCopyNode!.absoluteRotationQuaternion);

        //         //     // this.isPressed = true;
        //         // }

        //     }
        // }
    }
 

}


/******* End of the Game class ******/   

// start the game
var game = new Game();
game.start();