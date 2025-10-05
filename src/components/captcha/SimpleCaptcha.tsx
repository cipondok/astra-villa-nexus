import { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateCaptchaCode } from '@/utils/captchaGenerator';

interface SimpleCaptchaProps {
  code: string;
  onRefresh: () => void;
}

export const SimpleCaptcha = ({ code, onRefresh }: SimpleCaptchaProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background with gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f0f9ff');
    gradient.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add noise lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(0, 0, 0, 0.1)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Draw captcha text with variations
    const characters = code.split('');
    const totalWidth = canvas.width;
    const charWidth = totalWidth / characters.length;

    characters.forEach((char, index) => {
      const x = charWidth * index + charWidth / 2;
      const y = canvas.height / 2;
      const rotation = (Math.random() - 0.5) * 0.4; // Random rotation
      const fontSize = 32 + Math.random() * 8; // Random size variation

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = `hsl(${200 + Math.random() * 40}, 70%, 40%)`; // Blue tones
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(char, 0, 0);
      ctx.restore();
    });

    // Add noise dots
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.2})`;
      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        2,
        2
      );
    }
  }, [code]);

  return (
    <div className="flex items-center gap-2">
      <canvas
        ref={canvasRef}
        width={180}
        height={60}
        className="border-2 border-primary/20 rounded-lg shadow-sm"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onRefresh}
        title="Refresh captcha"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
};

export const useCaptcha = () => {
  const [captchaCode, setCaptchaCode] = useState('');

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptchaCode(6));
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  return {
    captchaCode,
    refreshCaptcha,
  };
};
