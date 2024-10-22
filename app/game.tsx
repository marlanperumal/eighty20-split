"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Card, CardHeader } from "@/components/ui/card";

interface Dot {
  x: number;
  y: number;
}

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWidth = canvasRef.current?.width ?? 0;
  const canvasHeight = canvasRef.current?.height ?? 0;

  const totalDots = 1000;
  const [dots, setDots] = useState<Dot[]>([]);
  const [lineStart, setLineStart] = useState<Dot | null>(null);
  const [lineEnd, setLineEnd] = useState<Dot | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [percentageAbove, setPercentageAbove] = useState(0);
  const [percentageBelow, setPercentageBelow] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Function to generate random dots
    function generateDots() {
      const newDots: Dot[] = [];
      for (let i = 0; i < totalDots; i++) {
        const dot: Dot = {
          x: Math.random() * canvasWidth,
          y: Math.random() * canvasHeight,
        };
        newDots.push(dot);
      }
      setDots(newDots);
    }
    generateDots();
  }, [canvasWidth, canvasHeight]);

  // Function to draw the dots on the canvas
  const drawDots = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = "black";
      dots.forEach((dot) => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    },
    [canvasWidth, canvasHeight, dots]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawDots(ctx);
  }, [drawDots]);

  // Function to extend the line beyond the canvas edges
  const extendLine = useCallback(
    (start: Dot, end: Dot) => {
      const slope = (end.y - start.y) / (end.x - start.x);

      const extendedStart = { x: 0, y: start.y - slope * start.x };
      const extendedEnd = {
        x: canvasWidth,
        y: start.y + slope * (canvasWidth - start.x),
      };

      return { extendedStart, extendedEnd };
    },
    [canvasWidth]
  );

  // Function to draw a line on the canvas
  const drawLine = useCallback(
    (ctx: CanvasRenderingContext2D, start: Dot, end: Dot) => {
      const { extendedStart, extendedEnd } = extendLine(start, end);
      // Fill the area above the line

      ctx.fillStyle = "rgba(0, 0, 255, 0.4)"; // Semi-transparent blue
      ctx.beginPath();
      ctx.moveTo(extendedStart.x, extendedStart.y);
      ctx.lineTo(extendedEnd.x, extendedEnd.y);
      ctx.lineTo(canvasWidth, extendedEnd.y);
      ctx.lineTo(canvasWidth, 0);
      ctx.lineTo(0, 0);
      ctx.lineTo(0, extendedStart.y);
      ctx.closePath();
      ctx.fill();

      // Fill the area below the line
      ctx.fillStyle = "rgba(255, 0, 0, 0.4)"; // Semi-transparent red
      ctx.beginPath();
      ctx.moveTo(extendedStart.x, extendedStart.y);
      ctx.lineTo(extendedEnd.x, extendedEnd.y);
      ctx.lineTo(canvasWidth, extendedEnd.y);
      ctx.lineTo(canvasWidth, canvasHeight);
      ctx.lineTo(0, canvasHeight);
      ctx.lineTo(0, extendedStart.y);
      ctx.closePath();
      ctx.fill();

      // Draw the line
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(extendedStart.x, extendedStart.y);
      ctx.lineTo(extendedEnd.x, extendedEnd.y);
      ctx.stroke();
    },
    [canvasWidth, canvasHeight, extendLine]
  );

  // Function to calculate the split (dummy implementation)
  const calculateSplit = useCallback(
    (start: Dot, end: Dot) => {
      // Implement the logic for calculating the split
      const { extendedStart, extendedEnd } = extendLine(start, end);

      let dotsAbove = 0;
      let dotsBelow = 0;

      const A = extendedEnd.y - extendedStart.y;
      const B = extendedStart.x - extendedEnd.x;
      const C = A * extendedStart.x + B * extendedStart.y;

      dots.forEach((dot) => {
        const position = A * dot.x + B * dot.y - C;
        if (position > 0) {
          dotsAbove++;
        } else {
          dotsBelow++;
        }
      });

      const total = dotsAbove + dotsBelow;
      const percentageAboveCalc = (dotsAbove / total) * 100;
      const percentageBelowCalc = (dotsBelow / total) * 100;
      setPercentageAbove(percentageAboveCalc);
      setPercentageBelow(percentageBelowCalc);

      // Calculate the score
      const targetAbove = 80;
      const diffAbove = Math.abs(percentageAboveCalc - targetAbove);
      const baseScore = 100 - diffAbove;
      // Scale the score such that an undersplit is penalized as much as an oversplit
      const scoreCalc = (baseScore / 100) ** 16 * 1000;
      setScore(scoreCalc);
    },
    [dots, extendLine]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // drawDots(ctx);

    // Function to handle mouse down (start drawing the line)
    const handleMouseDown = (e: MouseEvent) => {
      setLineStart({ x: e.offsetX, y: e.offsetY });
      setIsDrawing(true);
    };

    // Function to handle mouse move (draw the line as the mouse moves)
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawing || !lineStart) return;
      const newLineEnd: Dot = { x: e.offsetX, y: e.offsetY };
      setLineEnd(newLineEnd);
      drawDots(ctx);
      drawLine(ctx, lineStart, newLineEnd);
    };

    // Function to handle mouse up (stop drawing the line)
    const handleMouseUp = (e: MouseEvent) => {
      setIsDrawing(false);
      if (lineStart && lineEnd) {
        const newLineEnd: Dot = { x: e.offsetX, y: e.offsetY };
        setLineEnd(newLineEnd);
        drawLine(ctx, lineStart, newLineEnd);
        calculateSplit(lineStart, newLineEnd);
      }
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dots, lineStart, lineEnd, isDrawing, calculateSplit, drawDots, drawLine]);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={500}
        height={400}
        id="gameCanvas"
        className="cursor-crosshair mb-2"
      ></canvas>
      <Card className="w-[500px]">
        <CardHeader className="text-center">
          <p className="font-bold">
            {`Dots Above: ${percentageAbove.toFixed(
              2
            )}%, Dots Below: ${percentageBelow.toFixed(
              2
            )}%, Score: ${score.toFixed(0)}`}
          </p>
        </CardHeader>
      </Card>
    </>
  );
}
