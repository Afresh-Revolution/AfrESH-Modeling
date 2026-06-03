"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
    } catch {
      canvas.style.display = "none";
      return;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.018);

    const camera = new THREE.PerspectiveCamera(
      60,
      canvas.clientWidth / Math.max(canvas.clientHeight, 1),
      0.1,
      200
    );
    camera.position.set(0, 4, 10);
    camera.lookAt(0, 2, -30);

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    const ambient = new THREE.AmbientLight(0x222222, 1);
    scene.add(ambient);

    const floorGeom = new THREE.PlaneGeometry(Math.max(0.01, 20), Math.max(0.01, 120));
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x080808,
      roughness: 0.15,
      metalness: 0.85,
    });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -50);
    scene.add(floor);

    for (let i = 0; i < 35; i++) {
      const z = -i * 3;
      [-3.5, 3.5].forEach((x) => {
        const sphereGeom = new THREE.SphereGeometry(Math.max(0.001, 0.06), 8, 8);
        const sphereMat = new THREE.MeshBasicMaterial({ color: 0xc9a84c });
        const sphere = new THREE.Mesh(sphereGeom, sphereMat);
        sphere.position.set(x, 0.06, z);
        scene.add(sphere);
      });
      if (i % 7 === 0) {
        const pl = new THREE.PointLight(0xc9a84c, 0.4, 10);
        pl.position.set(0, 1, z);
        scene.add(pl);
      }
    }

    const mainSpot = new THREE.SpotLight(0xffffff, 4, 80, Math.PI / 7, 0.5, 1);
    mainSpot.position.set(0, 25, -15);
    mainSpot.target.position.set(0, 0, -15);
    scene.add(mainSpot);
    scene.add(mainSpot.target);

    const goldSpot1 = new THREE.SpotLight(0xc9a84c, 1.5, 50, Math.PI / 5, 0.7, 1);
    goldSpot1.position.set(-6, 12, -5);
    scene.add(goldSpot1);

    const goldSpot2 = new THREE.SpotLight(0xc9a84c, 1.5, 50, Math.PI / 5, 0.7, 1);
    goldSpot2.position.set(6, 12, -25);
    scene.add(goldSpot2);

    const coolSpot = new THREE.SpotLight(0x6bb5ff, 0.6, 40, Math.PI / 6, 0.8, 1);
    coolSpot.position.set(0, 15, -40);
    scene.add(coolSpot);

    type ShapeEntry = {
      mesh: THREE.Mesh;
      rotSpeed: { x: number; y: number; z: number };
      floatSpeed: number;
      floatAmp: number;
      baseY: number;
    };
    const shapes: ShapeEntry[] = [];

    const torusGeom = new THREE.TorusGeometry(Math.max(0.01, 1.2), Math.max(0.01, 0.35), 16, 40);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0xc9a84c,
      wireframe: true,
      roughness: 0.5,
      metalness: 0.3,
    });
    const torus = new THREE.Mesh(torusGeom, torusMat);
    torus.position.set(-5, 5, -10);
    scene.add(torus);
    shapes.push({
      mesh: torus,
      rotSpeed: { x: 0.002, y: 0.004, z: 0 },
      floatSpeed: 0.5,
      floatAmp: 0.6,
      baseY: 5,
    });

    const icoGeom = new THREE.IcosahedronGeometry(Math.max(0.01, 0.9), 0);
    const icoMat = new THREE.MeshStandardMaterial({
      color: 0xf5f0e8,
      wireframe: true,
      roughness: 0.5,
    });
    const ico = new THREE.Mesh(icoGeom, icoMat);
    ico.position.set(5, 7, -18);
    scene.add(ico);
    shapes.push({
      mesh: ico,
      rotSpeed: { x: 0.004, y: 0.002, z: 0.003 },
      floatSpeed: 0.7,
      floatAmp: 0.4,
      baseY: 7,
    });

    const octGeom = new THREE.OctahedronGeometry(Math.max(0.01, 0.6), 0);
    const octMat = new THREE.MeshStandardMaterial({
      color: 0xe85d75,
      wireframe: true,
      roughness: 0.5,
    });
    const oct = new THREE.Mesh(octGeom, octMat);
    oct.position.set(-3, 8, -28);
    scene.add(oct);
    shapes.push({
      mesh: oct,
      rotSpeed: { x: 0.003, y: 0.005, z: 0.001 },
      floatSpeed: 0.9,
      floatAmp: 0.5,
      baseY: 8,
    });

    const ringGeom = new THREE.TorusGeometry(Math.max(0.01, 0.7), Math.max(0.01, 0.08), 8, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x6bb5ff,
      wireframe: true,
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.position.set(4, 4, -6);
    scene.add(ring);
    shapes.push({
      mesh: ring,
      rotSpeed: { x: 0.006, y: 0.001, z: 0.004 },
      floatSpeed: 0.6,
      floatAmp: 0.3,
      baseY: 4,
    });

    function createParticles(count: number, color: number, size: number) {
      const geom = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 24;
        positions[i * 3 + 1] = Math.random() * 18;
        positions[i * 3 + 2] = Math.random() * -100;
      }
      geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        color,
        size: Math.max(0.001, size),
        transparent: true,
        opacity: 0.5,
        sizeAttenuation: true,
      });
      return new THREE.Points(geom, mat);
    }

    const goldParticles = createParticles(500, 0xc9a84c, 0.06);
    scene.add(goldParticles);
    const whiteParticles = createParticles(400, 0xf5f0e8, 0.04);
    scene.add(whiteParticles);

    let time = 0;
    let raf = 0;
    let cancelled = false;

    function animate() {
      if (cancelled) return;
      raf = requestAnimationFrame(animate);
      time += 0.008;

      camera.position.x = Math.sin(time * 0.3) * 0.6;
      camera.position.y = 4 + Math.sin(time * 0.2) * 0.25;
      camera.lookAt(0, 2, -30);

      shapes.forEach((s) => {
        s.mesh.rotation.x += s.rotSpeed.x;
        s.mesh.rotation.y += s.rotSpeed.y;
        s.mesh.rotation.z += s.rotSpeed.z;
        s.mesh.position.y =
          s.baseY + Math.sin(time * s.floatSpeed * 2) * s.floatAmp;
      });

      const gp = goldParticles.geometry.attributes.position;
      const gpa = gp.array as Float32Array;
      for (let i = 0; i < 500; i++) {
        gpa[i * 3 + 1] += 0.004;
        if (gpa[i * 3 + 1] > 18) gpa[i * 3 + 1] = 0;
      }
      gp.needsUpdate = true;

      const wp = whiteParticles.geometry.attributes.position;
      const wpa = wp.array as Float32Array;
      for (let i = 0; i < 400; i++) {
        wpa[i * 3 + 1] += 0.002;
        if (wpa[i * 3 + 1] > 18) wpa[i * 3 + 1] = 0;
      }
      wp.needsUpdate = true;

      renderer.render(scene, camera);
    }
    animate();

    const onResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (h < 1) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    const onScroll = () => {
      const heroEl = document.getElementById("hero");
      if (!heroEl) return;
      const scrollY = window.scrollY;
      const heroH = heroEl.offsetHeight;
      const opacity = Math.max(0, 1 - scrollY / (heroH * 0.6));
      canvas.style.opacity = String(opacity);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      renderer.dispose();
      scene.clear();
      torusGeom.dispose();
      torusMat.dispose();
      icoGeom.dispose();
      icoMat.dispose();
      octGeom.dispose();
      octMat.dispose();
      ringGeom.dispose();
      ringMat.dispose();
      floorGeom.dispose();
      floorMat.dispose();
      goldParticles.geometry.dispose();
      (goldParticles.material as THREE.Material).dispose();
      whiteParticles.geometry.dispose();
      (whiteParticles.material as THREE.Material).dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-canvas" id="hero-canvas" />;
}
