import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

// 8 Fixed Intersections (Nodes)
const NODE_POSITIONS = [
  [-12, 0, -12], // C1
  [0, 0, -12],   // C2
  [12, 0, -12],  // C3
  [-12, 0, 0],   // C4
  [12, 0, 0],    // C5
  [-12, 0, 12],  // C6
  [0, 0, 12],    // C7
  [12, 0, 12]    // C8
];

// Road connections between node indices
const ROAD_SEGMENTS = [
  [0, 1], [1, 2],
  [0, 3], [1, 6], [2, 5],
  [3, 5], [4, 7],
  [5, 6], [6, 7],
  [3, 4]
];

// Active Trajectories [fromIdx, toIdx, isCongested]
const TRAJECTORIES = [
  [0, 1, false],
  [1, 2, true],  // C2 -> C3 congested
  [1, 6, false],
  [3, 4, false],
  [6, 7, false],
  [2, 5, true]   // congested
];

// 1. Camera Node with pulsing sphere, rotating scan beam, and C1..C8 label
function CameraNode({ position, label, index }) {
  const sphereRef = useRef();
  const coneRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + index * 0.8;
    // Pulsing sphere
    if (sphereRef.current) {
      const scale = 1 + Math.sin(t * 3) * 0.25;
      sphereRef.current.scale.set(scale, scale, scale);
    }
    // Rotating scanning cone
    if (coneRef.current) {
      coneRef.current.rotation.y = t * 1.2;
    }
  });

  return (
    <group position={position}>
      {/* Node Base Beacon */}
      <mesh ref={sphereRef} position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={2.5}
          roughness={0.2}
        />
      </mesh>

      {/* Point light for node glow */}
      <pointLight color="#00d4ff" intensity={1.8} distance={8} position={[0, 0.8, 0]} />

      {/* Rotating Scanning Beam (Cone) */}
      <group ref={coneRef} position={[0, 2.5, 0]}>
        <mesh rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[1.8, 4.5, 16, 1, true]} />
          <meshBasicMaterial
            color="#00d4ff"
            transparent
            opacity={0.18}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Camera Label */}
      <Text
        position={[0, 5.2, 0]}
        fontSize={0.9}
        color="#00d4ff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.06}
        outlineColor="#050a18"
      >
        {label}
      </Text>
    </group>
  );
}

// 2. Road Segments
function RoadMesh({ start, end }) {
  const startVec = useMemo(() => new THREE.Vector3(...start), [start]);
  const endVec = useMemo(() => new THREE.Vector3(...end), [end]);
  const length = useMemo(() => startVec.distanceTo(endVec), [startVec, endVec]);
  const center = useMemo(() => new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5), [startVec, endVec]);
  const orientation = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(endVec, startVec).normalize();
    const rotY = Math.atan2(dir.x, dir.z);
    return rotY;
  }, [startVec, endVec]);

  return (
    <group position={[center.x, 0.02, center.z]} rotation={[0, orientation, 0]}>
      {/* Asphalt Surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, length]} />
        <meshStandardMaterial color="#142030" roughness={0.8} />
      </mesh>

      {/* Center Yellow Markings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[0.15, length * 0.95]} />
        <meshBasicMaterial color="#eab308" transparent opacity={0.65} />
      </mesh>
    </group>
  );
}

// 3. Moving Cars along paths
function CarSimulation() {
  const CAR_COUNT = 12;
  const cars = useMemo(() => {
    return Array.from({ length: CAR_COUNT }, (_, i) => {
      const roadIdx = i % ROAD_SEGMENTS.length;
      return {
        roadIdx,
        progress: Math.random(),
        speed: 0.12 + Math.random() * 0.18,
        direction: Math.random() > 0.5 ? 1 : -1,
        color: Math.random() > 0.4 ? '#ffffff' : '#facc15'
      };
    });
  }, []);

  const carMeshRefs = useRef([]);

  useFrame((_, delta) => {
    cars.forEach((car, idx) => {
      const mesh = carMeshRefs.current[idx];
      if (!mesh) return;

      car.progress += car.speed * car.direction * delta;
      if (car.progress > 1) {
        car.progress = 0;
      } else if (car.progress < 0) {
        car.progress = 1;
      }

      const [startIdx, endIdx] = ROAD_SEGMENTS[car.roadIdx];
      const start = NODE_POSITIONS[startIdx];
      const end = NODE_POSITIONS[endIdx];

      const x = THREE.MathUtils.lerp(start[0], end[0], car.progress);
      const z = THREE.MathUtils.lerp(start[2], end[2], car.progress);

      mesh.position.set(x, 0.25, z);
    });
  });

  return (
    <group>
      {cars.map((car, i) => (
        <mesh
          key={i}
          ref={(el) => (carMeshRefs.current[i] = el)}
          position={[0, 0.25, 0]}
        >
          <boxGeometry args={[0.5, 0.3, 0.8]} />
          <meshStandardMaterial
            color={car.color}
            emissive={car.color}
            emissiveIntensity={1.8}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

// 4. Trajectory Lines between cameras
function TrajectoryLines() {
  const linesData = useMemo(() => {
    return TRAJECTORIES.map(([from, to, isCongested]) => {
      const p1 = new THREE.Vector3(...NODE_POSITIONS[from]).add(new THREE.Vector3(0, 0.5, 0));
      const p2 = new THREE.Vector3(...NODE_POSITIONS[to]).add(new THREE.Vector3(0, 0.5, 0));
      return {
        points: [p1, p2],
        color: isCongested ? '#ef4444' : '#00d4ff'
      };
    });
  }, []);

  return (
    <group>
      {linesData.map((traj, idx) => (
        <Line
          key={idx}
          points={traj.points}
          color={traj.color}
          lineWidth={2.5}
          dashed
          dashScale={2}
          dashSize={1}
          gapSize={0.5}
          transparent
          opacity={0.8}
        />
      ))}
    </group>
  );
}

// 5. 300 Floating Data Particles
function DataParticles() {
  const PARTICLE_COUNT = 300;
  const meshRef = useRef();

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const colorCyan = new THREE.Color('#00d4ff');
    const colorBlue = new THREE.Color('#3b82f6');

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 36;
      pos[i * 3 + 1] = Math.random() * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 36;

      const c = Math.random() > 0.4 ? colorCyan : colorBlue;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const posArr = meshRef.current.geometry.attributes.position.array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      posArr[i * 3 + 1] += delta * 1.2;
      if (posArr[i * 3 + 1] > 16) {
        posArr[i * 3 + 1] = 0;
      }
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        vertexColors
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </points>
  );
}

// 6. Scrolling Ground Plane
function GroundGrid() {
  const gridRef = useRef();

  useFrame(({ clock }) => {
    if (gridRef.current) {
      // Subtle drift motion
      gridRef.current.position.z = (clock.getElapsedTime() * 0.8) % 4;
    }
  });

  return (
    <group position={[0, -0.05, 0]}>
      {/* Dark Base Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#071220" roughness={0.9} />
      </mesh>

      {/* Glowing Cyan Grid Lines */}
      <group ref={gridRef}>
        <gridHelper
          args={[60, 60, '#00d4ff', '#0d2d4c']}
          position={[0, 0, 0]}
        />
      </group>
    </group>
  );
}

export default function CityScene({ opacity = 1, interactive = false }) {
  return (
    <div
      className="w-full h-full absolute inset-0 pointer-events-auto transition-opacity duration-1000"
      style={{ opacity }}
    >
      <Canvas
        camera={{ position: [0, 22, 28], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Ambient Dark Dim Lighting */}
        <ambientLight intensity={0.35} color="#1b304f" />
        
        {/* Top Directional Light */}
        <directionalLight position={[10, 30, 15]} intensity={1.2} color="#93c5fd" />

        {/* City Elements */}
        <GroundGrid />

        {/* Road Segments */}
        {ROAD_SEGMENTS.map(([fromIdx, toIdx], i) => (
          <RoadMesh
            key={i}
            start={NODE_POSITIONS[fromIdx]}
            end={NODE_POSITIONS[toIdx]}
          />
        ))}

        {/* 8 Camera Nodes */}
        {NODE_POSITIONS.map((pos, idx) => (
          <CameraNode
            key={idx}
            position={pos}
            label={`C${idx + 1}`}
            index={idx}
          />
        ))}

        {/* Moving Cars */}
        <CarSimulation />

        {/* Active Congested / Fast Trajectories */}
        <TrajectoryLines />

        {/* Data Floating Particles */}
        <DataParticles />

        {/* Camera Control / Auto-Rotate */}
        <OrbitControls
          enableZoom={interactive}
          enableRotate={interactive}
          enablePan={interactive}
          autoRotate={!interactive}
          autoRotateSpeed={0.35}
          maxPolarAngle={Math.PI / 2.3}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>
    </div>
  );
}
