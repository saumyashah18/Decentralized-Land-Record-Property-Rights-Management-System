import React, { useEffect, useRef } from 'react';

export const BackgroundGrid: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        // Grid parameters
        const gridSize = 40;
        let offset = 0;

        // Nodes for blockchain feel
        const nodes: { x: number, y: number, size: number, speed: number }[] = [];
        for (let i = 0; i < 20; i++) {
            nodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 0.5 + 0.1
            });
        }

        const draw = () => {
            ctx.fillStyle = '#0F172A'; // Match background
            ctx.fillRect(0, 0, width, height);

            // Gradient overlay for depth
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, '#0F172A');
            gradient.addColorStop(0.5, '#1e293b'); // Slightly lighter blue-grey
            gradient.addColorStop(1, '#0F172A');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)'; // Light Blue grid lines
            ctx.lineWidth = 1;

            // Draw Perspective Grid
            // Vertical lines
            for (let x = 0; x <= width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }

            // Horizontal lines (Moving down)
            offset = (offset + 0.2) % gridSize;
            for (let y = offset; y <= height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            // Draw "Blockchain Nodes" connecting
            ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
            nodes.forEach(node => {
                node.y -= node.speed;
                if (node.y < 0) node.y = height;

                ctx.beginPath();
                ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
                ctx.fill();

                // Connect nearby nodes
                nodes.forEach(otherNode => {
                    const dx = node.x - otherNode.x;
                    const dy = node.y - otherNode.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 150) {
                        ctx.strokeStyle = `rgba(56, 189, 248, ${0.15 * (1 - dist / 150)})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(otherNode.x, otherNode.y);
                        ctx.stroke();
                    }
                });
            });

            requestAnimationFrame(draw);
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        const animationId = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[-1]"
        />
    );
};
