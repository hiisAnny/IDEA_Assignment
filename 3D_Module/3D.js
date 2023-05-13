import * as THREE from 'three';
let scene, camera, renderer;
        const groundWidth = 1000;
        const groundLength = 1000;
        const groundHeight = 400;

        init();
        // animate();
        render();

        function init() {
            // 创建场景
            scene = new THREE.Scene();
            // scene.background = new THREE.Color(0xffffff);

            // 创建相机
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
            camera.position.set(300, 990, 800);
            camera.lookAt(0, 0, 0);

            // 创建地皮
            const groundGeometry = new THREE.BoxGeometry(groundWidth, groundHeight, groundLength);
            const groundMaterial = new THREE.MeshBasicMaterial(
                {
                    color: 0xafcef3,
                    // 前面FrontSide  背面：BackSide 双面：DoubleSide
                    side:THREE.FrontSide,
                }
            );
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            scene.add(ground);

            // 创建渲染器
            renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);
            renderer.setClearColor(0xffffff);
        }
        function render() {
            renderer.render(scene, camera); // 将场景渲染到界面
        }