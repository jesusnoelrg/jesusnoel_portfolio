import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { useEffect, useRef, useState } from 'react';

interface SoftAuroraProps {
  speed?: number;
  scale?: number;
  brightness?: number;
  color1?: string;
  color2?: string;
  noiseFrequency?: number;
  noiseAmplitude?: number;
  bandHeight?: number;
  bandSpread?: number;
  octaveDecay?: number;
  layerOffset?: number;
  colorSpeed?: number;
  enableMouseInteraction?: boolean;
  mouseInfluence?: number;
}

function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255
  ];
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function shouldUseWebGL(): boolean {
  if (typeof window === 'undefined') return false;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (window.matchMedia('(pointer: coarse)').matches) return false;
  if (window.matchMedia('(max-width: 1023px)').matches) return false;

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true })
      ?? canvas.getContext('experimental-webgl', { failIfMajorPerformanceCaveat: true });

    if (!gl) return false;

    const highp = (gl as WebGLRenderingContext).getShaderPrecisionFormat(
      (gl as WebGLRenderingContext).FRAGMENT_SHADER,
      (gl as WebGLRenderingContext).HIGH_FLOAT
    );

    return !!highp && highp.precision > 0;
  } catch {
    return false;
  }
}

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform float uTime;
uniform vec3 uResolution;
uniform float uSpeed;
uniform float uScale;
uniform float uBrightness;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uNoiseFreq;
uniform float uNoiseAmp;
uniform float uBandHeight;
uniform float uBandSpread;
uniform float uOctaveDecay;
uniform float uLayerOffset;
uniform float uColorSpeed;
uniform vec2 uMouse;
uniform float uMouseInfluence;
uniform bool uEnableMouse;

#define TAU 6.28318

vec3 gradientHash(vec3 p) {
  p = vec3(
    dot(p, vec3(127.1, 311.7, 234.6)),
    dot(p, vec3(269.5, 183.3, 198.3)),
    dot(p, vec3(169.5, 283.3, 156.9))
  );
  vec3 h = fract(sin(p) * 43758.5453123);
  float phi = acos(2.0 * h.x - 1.0);
  float theta = TAU * h.y;
  return vec3(cos(theta) * sin(phi), sin(theta) * cos(phi), cos(phi));
}

float quinticSmooth(float t) {
  float t2 = t * t;
  float t3 = t * t2;
  return 6.0 * t3 * t2 - 15.0 * t2 * t2 + 10.0 * t3;
}

vec3 cosineGradient(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(TAU * (c * t + d));
}

float perlin3D(float amplitude, float frequency, float px, float py, float pz) {
  float x = px * frequency;
  float y = py * frequency;

  float fx = floor(x); float fy = floor(y); float fz = floor(pz);
  float cx = ceil(x);  float cy = ceil(y);  float cz = ceil(pz);

  vec3 g000 = gradientHash(vec3(fx, fy, fz));
  vec3 g100 = gradientHash(vec3(cx, fy, fz));
  vec3 g010 = gradientHash(vec3(fx, cy, fz));
  vec3 g110 = gradientHash(vec3(cx, cy, fz));
  vec3 g001 = gradientHash(vec3(fx, fy, cz));
  vec3 g101 = gradientHash(vec3(cx, fy, cz));
  vec3 g011 = gradientHash(vec3(fx, cy, cz));
  vec3 g111 = gradientHash(vec3(cx, cy, cz));

  float d000 = dot(g000, vec3(x - fx, y - fy, pz - fz));
  float d100 = dot(g100, vec3(x - cx, y - fy, pz - fz));
  float d010 = dot(g010, vec3(x - fx, y - cy, pz - fz));
  float d110 = dot(g110, vec3(x - cx, y - cy, pz - fz));
  float d001 = dot(g001, vec3(x - fx, y - fy, pz - cz));
  float d101 = dot(g101, vec3(x - cx, y - fy, pz - cz));
  float d011 = dot(g011, vec3(x - fx, y - cy, pz - cz));
  float d111 = dot(g111, vec3(x - cx, y - cy, pz - cz));

  float sx = quinticSmooth(x - fx);
  float sy = quinticSmooth(y - fy);
  float sz = quinticSmooth(pz - fz);

  float lx00 = mix(d000, d100, sx);
  float lx10 = mix(d010, d110, sx);
  float lx01 = mix(d001, d101, sx);
  float lx11 = mix(d011, d111, sx);

  float ly0 = mix(lx00, lx10, sy);
  float ly1 = mix(lx01, lx11, sy);

  return amplitude * mix(ly0, ly1, sz);
}

float auroraGlow(float t, vec2 shift) {
  vec2 uv = gl_FragCoord.xy / uResolution.y;
  uv += shift;

  float noiseVal = 0.0;
  float freq = uNoiseFreq;
  float amp = uNoiseAmp;
  vec2 samplePos = uv * uScale;

  for (float i = 0.0; i < 3.0; i += 1.0) {
    noiseVal += perlin3D(amp, freq, samplePos.x, samplePos.y, t);
    amp *= uOctaveDecay;
    freq *= 2.0;
  }

  float yBand = uv.y * 10.0 - uBandHeight * 10.0;
  return 0.3 * max(exp(uBandSpread * (1.0 - 1.1 * abs(noiseVal + yBand))), 0.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float t = uSpeed * 0.4 * uTime;

  vec2 shift = vec2(0.0);
  if (uEnableMouse) {
    shift = (uMouse - 0.5) * uMouseInfluence;
  }

  vec3 col = vec3(0.0);
  col += 0.99 * auroraGlow(t, shift) * cosineGradient(uv.x + uTime * uSpeed * 0.2 * uColorSpeed, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.3, 0.20, 0.20)) * uColor1;
  col += 0.99 * auroraGlow(t + uLayerOffset, shift) * cosineGradient(uv.x + uTime * uSpeed * 0.1 * uColorSpeed, vec3(0.5), vec3(0.5), vec3(2.0, 1.0, 0.0), vec3(0.5, 0.20, 0.25)) * uColor2;

  col *= uBrightness;
  float alpha = clamp(length(col), 0.0, 1.0);
  gl_FragColor = vec4(col, alpha);
}
`;

function CssAurora({ color1, color2, dimmed = false }: { color1: string; color2: string; dimmed?: boolean }) {
  return (
    <>
      <style>{`
        @keyframes soft-aurora-drift {
          0%, 100% { opacity: 0.88; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.03); }
        }
        .soft-aurora-css {
          animation: soft-aurora-drift 12s ease-in-out infinite;
          transition: opacity 0.8s ease;
        }
        .soft-aurora-css.is-dimmed {
          opacity: 0.35;
          animation: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .soft-aurora-css { animation: none; opacity: 0.92; }
        }
      `}</style>
      <div
        className={`soft-aurora-css absolute inset-0 ${dimmed ? 'is-dimmed' : ''}`}
        style={{
          background: `
            radial-gradient(ellipse 100% 70% at 50% 0%, ${hexToRgba(color1, 0.5)} 0%, transparent 75%),
            radial-gradient(ellipse 80% 50% at 70% 20%, ${hexToRgba(color2, 0.35)} 0%, transparent 70%),
            radial-gradient(ellipse 60% 40% at 25% 30%, ${hexToRgba(color1, 0.18)} 0%, transparent 65%)
          `
        }}
        aria-hidden="true"
      />
    </>
  );
}

export default function SoftAurora({
  speed = 0.6,
  scale = 1.5,
  brightness = 1.0,
  color1 = '#f7f7f7',
  color2 = '#e100ff',
  noiseFrequency = 2.5,
  noiseAmplitude = 1.0,
  bandHeight = 0.5,
  bandSpread = 1.0,
  octaveDecay = 0.1,
  layerOffset = 0,
  colorSpeed = 1.0,
  enableMouseInteraction = true,
  mouseInfluence = 0.25
}: SoftAuroraProps) {
  const webglRef = useRef<HTMLDivElement>(null);
  const [useWebGL, setUseWebGL] = useState(false);
  const [webGLReady, setWebGLReady] = useState(false);

  useEffect(() => {
    setUseWebGL(shouldUseWebGL());
  }, []);

  useEffect(() => {
    if (!useWebGL || !webglRef.current) return;

    const container = webglRef.current;
    let disposed = false;

    try {
      const renderer = new Renderer({
        alpha: true,
        premultipliedAlpha: false,
        dpr: Math.min(window.devicePixelRatio, 2)
      });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);

      let program: Program;
      let currentMouse = [0.5, 0.5];
      let targetMouse = [0.5, 0.5];
      let isVisible = true;

      function resize() {
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width === 0 || height === 0) return;

        renderer.setSize(width, height);
        if (program) {
          program.uniforms.uResolution.value = [
            gl.canvas.width,
            gl.canvas.height,
            gl.canvas.width / gl.canvas.height
          ];
        }
      }

      const geometry = new Triangle(gl);
      program = new Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: [1, 1, 1] },
          uSpeed: { value: speed },
          uScale: { value: scale },
          uBrightness: { value: brightness },
          uColor1: { value: hexToVec3(color1) },
          uColor2: { value: hexToVec3(color2) },
          uNoiseFreq: { value: noiseFrequency },
          uNoiseAmp: { value: noiseAmplitude },
          uBandHeight: { value: bandHeight },
          uBandSpread: { value: bandSpread },
          uOctaveDecay: { value: octaveDecay },
          uLayerOffset: { value: layerOffset },
          uColorSpeed: { value: colorSpeed },
          uMouse: { value: new Float32Array([0.5, 0.5]) },
          uMouseInfluence: { value: mouseInfluence },
          uEnableMouse: { value: enableMouseInteraction }
        }
      });

      const mesh = new Mesh(gl, { geometry, program });
      gl.canvas.style.opacity = '0';
      gl.canvas.style.transition = 'opacity 0.8s ease';
      container.appendChild(gl.canvas);

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
      resize();

      const observer = new IntersectionObserver(
        ([entry]) => { isVisible = entry.isIntersecting; },
        { threshold: 0.05 }
      );
      observer.observe(container);

      let animationFrameId: number;
      let hasFadedIn = false;

      function update(time: number) {
        if (disposed) return;
        animationFrameId = requestAnimationFrame(update);
        if (!isVisible) return;

        program.uniforms.uTime.value = time * 0.001;

        if (enableMouseInteraction) {
          currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0]);
          currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1]);
          program.uniforms.uMouse.value[0] = currentMouse[0];
          program.uniforms.uMouse.value[1] = currentMouse[1];
        }

        renderer.render({ scene: mesh });

        if (!hasFadedIn) {
          hasFadedIn = true;
          gl.canvas.style.opacity = '1';
          setWebGLReady(true);
        }
      }

      animationFrameId = requestAnimationFrame(update);

      return () => {
        disposed = true;
        cancelAnimationFrame(animationFrameId);
        observer.disconnect();
        resizeObserver.disconnect();
        if (container.contains(gl.canvas)) {
          container.removeChild(gl.canvas);
        }
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      };
    } catch {
      setUseWebGL(false);
    }
  }, [
    useWebGL,
    speed,
    scale,
    brightness,
    color1,
    color2,
    noiseFrequency,
    noiseAmplitude,
    bandHeight,
    bandSpread,
    octaveDecay,
    layerOffset,
    colorSpeed,
    enableMouseInteraction,
    mouseInfluence
  ]);

  return (
    <div className="absolute inset-0 z-1 pointer-events-none">
      <CssAurora color1={color1} color2={color2} dimmed={webGLReady} />
      {useWebGL && <div ref={webglRef} className="absolute inset-0" />}
    </div>
  );
}
