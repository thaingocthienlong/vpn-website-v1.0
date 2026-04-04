"use client";

import { useEffect, useRef } from "react";
import styles from "./landing-page.module.css";

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
}

function prefersReducedMotion() {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
        return true;
    }

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function LandingParticleCanvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || prefersReducedMotion()) {
            return undefined;
        }

        const context = canvas.getContext("2d");
        if (!context) {
            return undefined;
        }

        let width = 0;
        let height = 0;
        let animationFrame = 0;
        let particles: Particle[] = [];

        const particleCount = window.innerWidth > 768 ? 52 : 24;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * window.devicePixelRatio;
            canvas.height = height * window.devicePixelRatio;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

            particles = Array.from({ length: particleCount }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
            }));
        };

        const draw = () => {
            context.clearRect(0, 0, width, height);

            particles.forEach((particle, index) => {
                particle.x += particle.vx;
                particle.y += particle.vy;

                if (particle.x < -20) particle.x = width + 20;
                if (particle.x > width + 20) particle.x = -20;
                if (particle.y < -20) particle.y = height + 20;
                if (particle.y > height + 20) particle.y = -20;

                context.beginPath();
                context.fillStyle = "rgba(186, 230, 253, 0.32)";
                context.arc(particle.x, particle.y, 1.6, 0, Math.PI * 2);
                context.fill();

                for (let cursor = index + 1; cursor < particles.length; cursor += 1) {
                    const neighbor = particles[cursor];
                    const dx = particle.x - neighbor.x;
                    const dy = particle.y - neighbor.y;
                    const distance = Math.hypot(dx, dy);

                    if (distance <= 140) {
                        context.beginPath();
                        context.strokeStyle = `rgba(56, 189, 248, ${0.18 * (1 - distance / 140)})`;
                        context.lineWidth = 1;
                        context.moveTo(particle.x, particle.y);
                        context.lineTo(neighbor.x, neighbor.y);
                        context.stroke();
                    }
                }
            });

            animationFrame = window.requestAnimationFrame(draw);
        };

        resize();
        draw();
        window.addEventListener("resize", resize);

        return () => {
            window.cancelAnimationFrame(animationFrame);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return <canvas ref={canvasRef} className={styles.backgroundCanvas} aria-hidden="true" />;
}
