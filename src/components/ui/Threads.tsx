import { useRef, useEffect } from "react";
import { Renderer, Program, Mesh, Triangle, Vec2 } from "ogl";

interface ThreadsProps {
  color?: [number, number, number];
  amplitude?: number;
  distance?: number;
  enableMouseInteraction?: boolean;
  className?: string;
}

const Threads = ({
  color = [0.165, 0.616, 0.561], // Teal #2A9D8F converted to RGB 0-1
  amplitude = 0.6,
  distance = 0.3,
  enableMouseInteraction = true,
  className = "",
}: ThreadsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const renderer = new Renderer({
      alpha: true,
      antialias: true,
    });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);

    gl.clearColor(0, 0, 0, 0);

    const handleResize = () => {
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    const vertex = /* glsl */ `
      attribute vec2 position;
      attribute vec2 uv;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragment = /* glsl */ `
      precision highp float;

      uniform float uTime;
      uniform vec3 uColor;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform float uAmplitude;
      uniform float uDistance;

      varying vec2 vUv;

      float lines(vec2 uv, float offset) {
        return smoothstep(
          0.0, 0.5 + offset * 0.5,
          abs(0.5 * (sin(uv.x * 30.0) + offset * 2.0))
        );
      }

      mat2 rotate2d(float angle) {
        return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
      }

      void main() {
        vec2 baseUv = vUv;
        float time = uTime * 0.15;
        
        vec2 mouse = uMouse * 2.0 - 1.0;
        vec2 uv = baseUv;
        
        // Subtle mouse interaction
        uv += mouse * 0.03;
        
        // Slow wave distortion
        uv.y += sin(uv.x * 3.0 + time) * uAmplitude * 0.1;
        uv.x += cos(uv.y * 2.0 + time * 0.7) * uAmplitude * 0.08;
        
        // Rotate for diagonal threads
        uv = rotate2d(0.4) * uv;
        
        // Create soft flowing lines
        float line1 = lines(uv * (1.0 + uDistance), 0.5);
        float line2 = lines(uv * (1.5 + uDistance), 0.3);
        
        // Blend lines together
        float pattern = line1 * 0.5 + line2 * 0.5;
        
        // Soft gradient overlay
        float gradient = smoothstep(0.0, 1.0, baseUv.y * 0.7 + 0.3);
        
        // Apply color with very low opacity for subtlety
        vec3 col = uColor * pattern * gradient;
        float alpha = pattern * 0.08 * gradient;
        
        gl_FragColor = vec4(col, alpha);
      }
    `;

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: color },
        uResolution: { value: new Vec2(gl.canvas.width, gl.canvas.height) },
        uMouse: { value: new Vec2(0.5, 0.5) },
        uAmplitude: { value: amplitude },
        uDistance: { value: distance },
      },
      transparent: true,
    });

    const geometry = new Triangle(gl);
    const mesh = new Mesh(gl, { geometry, program });

    let animationId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!enableMouseInteraction) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      program.uniforms.uMouse.value = new Vec2(x, y);
    };

    if (enableMouseInteraction) {
      container.addEventListener("mousemove", handleMouseMove);
    }

    const animate = (time: number) => {
      program.uniforms.uTime.value = time * 0.001;
      program.uniforms.uResolution.value = new Vec2(
        gl.canvas.width,
        gl.canvas.height
      );
      renderer.render({ scene: mesh });
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      if (enableMouseInteraction) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
      container.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [color, amplitude, distance, enableMouseInteraction]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
};

export default Threads;
