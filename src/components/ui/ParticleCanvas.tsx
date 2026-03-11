"use client";

import { useEffect, useRef } from "react";

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
}

interface ParticleCanvasProps {
    className?: string;
    particleColor?: string;
    lineColor?: string;
    particleCountDesktop?: number;
    particleCountMobile?: number;
    connectionDistance?: number;
}

export function ParticleCanvas({
    className = "",
    particleColor = "rgba(56, 189, 248, 1)",
    lineColor = "rgba(56, 189, 248, 0.8)",
    particleCountDesktop = 60,
    particleCountMobile = 30,
    connectionDistance = 10000,
}: ParticleCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const particleCount =
            window.innerWidth > 768 ? particleCountDesktop : particleCountMobile;

        function initCanvas() {
            if (!canvas) return;
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;

            particlesRef.current = [];
            for (let i = 0; i < particleCount; i++) {
                particlesRef.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    radius: Math.random() * 1.5 + 0.5,
                });
            }
        }

        function drawParticles() {
            if (!canvas || !ctx) return;

            const width = canvas.width;
            const height = canvas.height;
            const particles = particlesRef.current;

            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = particleColor;
            ctx.strokeStyle = lineColor;

            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = dx * dx + dy * dy;

                    if (dist < connectionDistance) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });

            animationRef.current = requestAnimationFrame(drawParticles);
        }

        initCanvas();
        drawParticles();

        const handleResize = () => initCanvas();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationRef.current);
        };
    }, [
        particleColor,
        lineColor,
        particleCountDesktop,
        particleCountMobile,
        connectionDistance,
    ]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={className}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                zIndex: 0,
                pointerEvents: "none",
                opacity: 1,
                mixBlendMode: "normal",
            }}
        />
    );
}
