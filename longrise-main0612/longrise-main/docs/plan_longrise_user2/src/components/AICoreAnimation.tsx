import { useEffect, useRef } from 'react';

export const AICoreAnimation = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width: number, height: number, cx: number, cy: number;
        let particles: Particle[] = [];
        let numParticles = 400; // 가변형으로 변경
        let connectionDistance = 60; // 가변형으로 변경

        // 캔버스 사이즈 초기화
        function resize() {
            if (!canvas) return;
            const parent = canvas.parentElement;
            if (!parent) return;
            width = canvas.width = parent.clientWidth;
            height = canvas.height = parent.clientHeight;
            cx = width / 2;
            cy = height / 2;
            
            // 모바일 최적화 수치 조정
            numParticles = width < 480 ? 240 : 400;
            connectionDistance = width < 480 ? 45 : 65; // 축소된 크기에 맞춰 연결 거리 조정

            initParticles();
        }

        // 파티클(노드) 객체 정의
        class Particle {
            baseX: number;
            baseY: number;
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            angle: number;
            speed: number;

            constructor(x: number, y: number) {
                this.baseX = x;
                this.baseY = y;
                this.x = x;
                this.y = y;
                // 무작위 이동 속도
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 1.5 + 0.5;
                this.angle = Math.random() * Math.PI * 2;
                this.speed = Math.random() * 0.02 + 0.01;
            }

            update() {
                // 미세하게 진동 및 회전하는 움직임
                this.angle += this.speed;
                this.x = this.baseX + Math.cos(this.angle) * 3;
                this.y = this.baseY + Math.sin(this.angle) * 3;
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = '#ff3b3b';
                ctx.fill();
            }
        }

        // 뇌 형태를 구성하는 파티클 생성 로직
        function initParticles() {
            particles = [];
            
            // 모바일에서 겹침 현상을 방지하기 위한 정밀한 반경 계산
            const radiusX = width < 480 ? width * 0.18 : Math.min(width * 0.2, 130);
            const radiusY = width < 480 ? height * 0.3 : Math.min(height * 0.35, 230); // 과하게 늘어난 반경 축소
            const offset = radiusX * 0.85; // 반구 간 벌어짐 정도 조정

            const halfParticles = Math.floor(numParticles / 2);

            // 좌우 완벽한 대칭을 위해 1회 루프 시 좌/우 한 쌍의 노드를 동시에 생성
            for (let i = 0; i < halfParticles; i++) {
                let angle = Math.random() * Math.PI * 2;
                // 중앙에 더 밀집되도록 sqrt 사용
                let r = Math.sqrt(Math.random()); 
                
                let localX = Math.cos(angle) * radiusX * r;
                let localY = Math.sin(angle) * radiusY * r;

                // 중앙 틈(시냅스 갭) 만들기: 중앙 중심축(cx)에 너무 가까운 점은 제외
                if (offset + localX < offset * 0.1) continue;

                // 우측 반구 파티클
                particles.push(new Particle(cx + offset + localX, cy + localY));
                // 좌측 반구 파티클 (X축을 반전시켜 완벽한 대칭 형성)
                particles.push(new Particle(cx - offset - localX, cy + localY));
            }
        }

        let animationFrameId: number;

        // 메인 애니메이션 루프
        function animate() {
            if (!ctx) return;
            // 배경 투명도를 유지하면서 잔상(Trail) 효과를 주는 알고리즘 (destination-out)
            ctx.globalCompositeOperation = 'destination-out';
            // 알파값(0.2)으로 기존 픽셀을 서서히 지워 잔상을 생성
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'; 
            ctx.fillRect(0, 0, width, height);

            // 빛이 겹치면 밝아지는 가산 혼합 모드 활성화 (네온/레이저 효과용)
            ctx.globalCompositeOperation = 'lighter';

            // 1. 파티클 업데이트 및 연결선 렌더링
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    // 거리가 가까운 노드끼리 선으로 연결 (거리에 따라 투명도 조절)
                    if (dist < connectionDistance) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(255, 59, 59, ${1 - dist / connectionDistance})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // 2. 중앙 발광선 그리기
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 59, 59, 0.4)';
            ctx.lineWidth = 2;
            ctx.moveTo(cx - 200, cy);
            ctx.lineTo(cx + 200, cy);
            ctx.stroke();

            // 3. 중앙 "LONGRISE AI" 텍스트 2열 렌더링
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // 텍스트 글로우 효과
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#ffffff';

            // 1열: LONGRISE
            ctx.font = 'bold 36px Arial, sans-serif';
            ctx.fillText('LONGRISE', cx, cy - 20);
            
            // 2열: AI
            ctx.font = 'bold 52px Arial, sans-serif';
            ctx.fillText('AI', cx, cy + 30);
            
            // 성능을 위해 shadow 초기화
            ctx.shadowBlur = 0; 

            animationFrameId = requestAnimationFrame(animate);
        }

        resize();
        animate();

        window.addEventListener('resize', resize);
        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="w-full h-full block" />;
};
