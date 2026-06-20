import { useState, useRef, useEffect } from 'react';

interface Item {
  id: number;
  icon: string;
  name: string;
  subtext?: string;
  borderColor: string;
  checkColor: string;
}

const ITEMS: Item[] = [
  {
    id: 1,
    icon: '🥛☕',
    name: 'Овсяное молоко',
    subtext: 'маме в кофе',
    borderColor: '#7BC8F0',
    checkColor: '#7BC8F0',
  },
  {
    id: 2,
    icon: '🥄🍶',
    name: 'Сметана',
    borderColor: '#6DC96E',
    checkColor: '#6DC96E',
  },
  {
    id: 3,
    icon: '🥐🥫',
    name: 'Булочка и',
    subtext: 'сгущенка папе',
    borderColor: '#F5A53E',
    checkColor: '#F5A53E',
  },
  {
    id: 4,
    icon: '🍫',
    name: 'Шоколад Milka',
    borderColor: '#B97CD3',
    checkColor: '#B97CD3',
  },
  {
    id: 5,
    icon: '🌭🥩',
    name: 'Колбаса',
    subtext: 'и кубики и ломтики',
    borderColor: '#F07070',
    checkColor: '#F07070',
  },
  {
    id: 6,
    icon: '🫙🍓',
    name: 'Ягодный джем',
    borderColor: '#9B72CF',
    checkColor: '#9B72CF',
  },
];

const CONFETTI_COLORS = [
  '#FF6B6B', '#FFD700', '#6DC96E', '#7BC8F0',
  '#B97CD3', '#F5A53E', '#FF69B4', '#40E0D0',
];

function launchConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  type Shape = 'rect' | 'circle' | 'star';

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rotation: number;
    rotSpeed: number;
    color: string;
    w: number;
    h: number;
    alpha: number;
    shape: Shape;
    wobble: number;
    wobbleSpeed: number;
  }

  const particles: Particle[] = [];
  const shapes: Shape[] = ['rect', 'circle', 'star'];

  // Launch from multiple positions across the top
  for (let i = 0; i < 180; i++) {
    const side = Math.random();
    const startX = side < 0.33
      ? Math.random() * canvas.width * 0.4
      : side < 0.66
      ? canvas.width * 0.3 + Math.random() * canvas.width * 0.4
      : canvas.width * 0.6 + Math.random() * canvas.width * 0.4;

    particles.push({
      x: startX,
      y: -Math.random() * 40,
      vx: (Math.random() - 0.5) * 7,
      vy: Math.random() * 4 + 2,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 14,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      w: Math.random() * 12 + 6,
      h: Math.random() * 6 + 3,
      alpha: 1,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.15 + 0.05,
    });
  }

  let rafId: number;
  let tick = 0;

  const drawStar = (ctx: CanvasRenderingContext2D, size: number) => {
    const spikes = 5;
    const outerR = size;
    const innerR = size * 0.4;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  };

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    tick++;

    let alive = 0;

    for (const p of particles) {
      if (p.alpha <= 0) continue;
      alive++;

      p.x += p.vx + Math.sin(p.wobble) * 0.8;
      p.y += p.vy;
      p.vy += 0.08;
      p.vx *= 0.995;
      p.rotation += p.rotSpeed;
      p.wobble += p.wobbleSpeed;

      if (tick > 90) {
        p.alpha = Math.max(0, p.alpha - 0.012);
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      } else if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        drawStar(ctx, p.w / 2);
      }

      ctx.restore();
    }

    if (alive > 0) {
      rafId = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  rafId = requestAnimationFrame(animate);
  return () => cancelAnimationFrame(rafId);
}

export default function ShoppingList() {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const allChecked = checked.size === ITEMS.length;

  const toggle = (id: number) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    if (allChecked && canvasRef.current) {
      cleanupRef.current?.();
      cleanupRef.current = launchConfetti(canvasRef.current);
    }
    return () => {
      cleanupRef.current?.();
    };
  }, [allChecked]);

  const reset = () => {
    setChecked(new Set());
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    cleanupRef.current?.();
    cleanupRef.current = null;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #fff9f0 0%, #f0f8ff 50%, #fdf0ff 100%)',
      }}
    >
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 100 }}
      />

      <div className="w-full max-w-[340px]">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <span className="text-4xl drop-shadow-sm select-none">⭐</span>
          <div className="text-center">
            <span className="text-xl" style={{ fontSize: 12, display: 'block', marginBottom: -4 }}>❤️</span>
            <h1
              className="text-3xl font-extrabold leading-tight"
              style={{
                color: '#6B3FA0',
                fontFamily: '"Nunito", "Rounded Mplus 1c", "Comic Sans MS", system-ui, sans-serif',
                textShadow: '0 2px 8px rgba(107,63,160,0.15)',
                letterSpacing: '-0.5px',
              }}
            >
              Список покупок
            </h1>
          </div>
          <span className="text-4xl drop-shadow-sm select-none">🛒</span>
        </div>

        {/* Items */}
        <div className="flex flex-col gap-3">
          {ITEMS.map(item => {
            const isChecked = checked.has(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item.id)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white text-left w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  border: `2.5px solid ${item.borderColor}`,
                  boxShadow: `0 2px 10px ${item.borderColor}33`,
                  opacity: isChecked ? 0.75 : 1,
                }}
              >
                {/* Icon */}
                <div
                  className="text-2xl w-14 h-12 flex items-center justify-center rounded-xl shrink-0 select-none"
                  style={{ background: `${item.borderColor}22` }}
                >
                  {item.icon}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-gray-800 leading-tight text-[15px]"
                    style={{
                      textDecoration: isChecked ? 'line-through' : 'none',
                      color: isChecked ? '#aaa' : '#333',
                      fontFamily: '"Nunito", system-ui, sans-serif',
                    }}
                  >
                    {item.name}
                  </p>
                  {item.subtext && (
                    <p
                      className="text-[13px] leading-tight mt-0.5"
                      style={{
                        textDecoration: isChecked ? 'line-through' : 'none',
                        color: isChecked ? '#bbb' : '#666',
                        fontFamily: '"Nunito", system-ui, sans-serif',
                      }}
                    >
                      {item.subtext}
                    </p>
                  )}
                </div>

                {/* Checkbox */}
                <div
                  className="w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200"
                  style={{
                    borderColor: item.borderColor,
                    background: isChecked ? item.checkColor : 'transparent',
                    boxShadow: isChecked ? `0 0 0 3px ${item.checkColor}33` : 'none',
                  }}
                >
                  {isChecked && (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="white"
                      strokeWidth={3.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Completion */}
        <div
          className="transition-all duration-500 overflow-hidden"
          style={{ maxHeight: allChecked ? 160 : 0, opacity: allChecked ? 1 : 0 }}
        >
          <div className="mt-5 text-center pb-2">
            <p
              className="text-2xl font-extrabold"
              style={{
                color: '#6DC96E',
                fontFamily: '"Nunito", system-ui, sans-serif',
              }}
            >
              Ура! Всё куплено! 🎉
            </p>
            <p className="text-gray-500 mt-1 text-sm">Молодец!</p>
            <button
              type="button"
              onClick={reset}
              className="mt-3 px-6 py-2 rounded-full font-bold text-white text-sm transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #B97CD3, #7BC8F0)',
                fontFamily: '"Nunito", system-ui, sans-serif',
                boxShadow: '0 4px 14px rgba(185,124,211,0.4)',
              }}
            >
              Начать заново
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(checked.size / ITEMS.length) * 100}%`,
                background: 'linear-gradient(90deg, #7BC8F0, #B97CD3)',
              }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-400 shrink-0">
            {checked.size}/{ITEMS.length}
          </span>
        </div>
      </div>
    </div>
  );
}
