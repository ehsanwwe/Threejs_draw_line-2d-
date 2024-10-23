// LineDrawingTool.jsx
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

function Task3() {
    const mountRef = useRef(null);

    let line ;
    let isDrawing = false;
    let cubeObject = null;
    useEffect(() => {
        const currentMount = mountRef.current;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1,1000);
        camera.position.z = 20;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        currentMount.appendChild(renderer.domElement);

        // this plane is Math plan for Raycasting
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

        const pointA = new THREE.Vector3(0, 0, 0);
        const pointB = new THREE.Vector3(0, 0, 0);
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([pointA, pointB]);
        const material = new THREE.LineBasicMaterial({ color: 0xff0000 , linecap: 'round' });
        line = new THREE.Line(lineGeometry, material);
        scene.add(line);

        const cubeMesh = new THREE.BoxGeometry(1, 1, 1);
        const cubematerial = new THREE.MeshBasicMaterial({ color: 0xeeffee });
        cubeObject = new THREE.Mesh(cubeMesh, cubematerial);
        cubeObject.scale.set(0,0,0)
        scene.add(cubeObject);

        function getMouse3DPosition(event, plane) {
            const mouseNDC = new THREE.Vector2();
            const rect = renderer.domElement.getBoundingClientRect();
            mouseNDC.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouseNDC.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouseNDC, camera);
            const intersectionPoint = new THREE.Vector3();
            const intersects = raycaster.ray.intersectPlane(plane, intersectionPoint);
            if (intersects) {
                return intersectionPoint;
            } else {
                return null;
            }
        }

        const handleMouseDown = (event) => {
            isDrawing = true
            let viewPortPosStartOfLine =  getMouse3DPosition(event,plane)
            line.geometry.attributes.position.setXYZ(0,viewPortPosStartOfLine.x,viewPortPosStartOfLine.y,0)
            line.geometry.attributes.position.setXYZ(1, viewPortPosStartOfLine.x, viewPortPosStartOfLine.y, 0);
        };
        renderer.domElement.addEventListener('mousedown', handleMouseDown);
        const handleMouseMove = (event) => {
            if (!isDrawing)
                return;

            let viewPortPosEndOfLine = getMouse3DPosition(event, plane);
            if (viewPortPosEndOfLine) {
                line.geometry.attributes.position.setXYZ(1, viewPortPosEndOfLine.x, viewPortPosEndOfLine.y, 0);
                line.geometry.attributes.position.needsUpdate = true;
            }
            cubeObject.scale.set(1,1,1)
            cubeObject.position.x = (line.geometry.attributes.position.getX(0) + line.geometry.attributes.position.getX(1))/2
            cubeObject.position.y = (line.geometry.attributes.position.getY(0) + line.geometry.attributes.position.getY(1))/2
        };
        renderer.domElement.addEventListener('mousemove', handleMouseMove);
        const handleMouseUp = () => {
            isDrawing = false;
        };
        renderer.domElement.addEventListener('mouseup', handleMouseUp);

        const animate = () => {
            requestAnimationFrame(animate);
            line.geometry.attributes.position.needsUpdate = true;
            renderer.render(scene, camera);
        };
        animate();

        // === Cleanup Function ===
        return () => {
            currentMount.removeChild(renderer.domElement);
            renderer.domElement.removeEventListener('mousedown', handleMouseDown);
        };
    }, []);

    return (
        <div
            ref={mountRef}
            style={{ width: '100vw', height: '100vh' }}
        />
    );
}

export default Task3;
