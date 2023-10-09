// CanvasDrawing.tsx
import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

interface DrawingData {
  x: number;
  y: number;
  xAnterior: number | null;
  yAnterior: number | null;
  color: string;
}

const CanvasDrawing: React.FC = () => {
  const socket = io();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dibujando, setDibujando] = useState(false);
  const [xAnterior, setXAnterior] = useState<number | null>(null);
  const [yAnterior, setYAnterior] = useState<number | null>(null);
  const [colorActual, setColorActual] = useState<string>('#000000');

  // Function to clear the canvas
  const limpiarCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  // Function to download the canvas image
  const descargarCanvas = () => {
    if (canvasRef.current) {
      const dataURL = canvasRef.current.toDataURL('image/png');
      const enlace = document.createElement('a');
      enlace.href = dataURL;
      enlace.download = 'mi_dibujo.png';
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) return;

    // Event handler for mouse down
    const handleMouseDown = (event: MouseEvent) => {
      setDibujando(true);
      setXAnterior(event.clientX);
      setYAnterior(event.clientY);
    };

    // Event handler for mouse move
    const handleMouseMove = (event: MouseEvent) => {
      if (dibujando && xAnterior !== null && yAnterior !== null) {
        socket.emit('dibujar', {
          x: event.clientX,
          y: event.clientY,
          xAnterior: xAnterior,
          yAnterior: yAnterior,
          color: colorActual,
        });
        dibujarLinea(xAnterior, yAnterior, event.clientX, event.clientY, colorActual);
        setXAnterior(event.clientX);
        setYAnterior(event.clientY);
      }
    };

    // Event handler for mouse up
    const handleMouseUp = () => {
      setDibujando(false);
    };

    // Function to draw a line
    const dibujarLinea = (xAnt: number, yAnt: number, xAct: number, yAct: number, color: string) => {
      if (!ctx) return;
      ctx.beginPath();
      ctx.moveTo(xAnt, yAnt);
      ctx.lineTo(xAct, yAct);
      ctx.strokeStyle = color;
      ctx.stroke();
    };

    // Add event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    return () => {
      // Cleanup event listeners
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [colorActual, dibujando, xAnterior, yAnterior]);

  return (
    <div>
      <canvas
        id="canvas"
        ref={canvasRef}
        width={800}
        height={600}
      />
      <div className=' bg-slate-900'>
        <div className=' bg-slate-300'>
          <h2>Elige un color</h2>
        </div>
        <div id="botones-colores">
          <button id="color-rojo" onClick={() => setColorActual('#ff0000')}></button>
          <button id="color-verde" onClick={() => setColorActual('#00ff00')}></button>
          <button id="color-azul" onClick={() => setColorActual('#0000ff')}></button>
          <button id="color-negro" onClick={() => setColorActual('#000000')}></button>
        </div>
        <div id="botones">
          <button id="limpiar" onClick={limpiarCanvas}>Limpiar</button>
          <button id="descargar" onClick={descargarCanvas}>Descargar</button>
        </div>
      </div>
    </div>
  );
};

export default CanvasDrawing;
