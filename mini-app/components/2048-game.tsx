"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

const SIZE = 4;

function emptyBoard(): number[][] {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function addRandomTile(board: number[][]): number[][] {
  const empty: [number, number][] = [];
  board.forEach((row, r) =>
    row.forEach((cell, c) => {
      if (cell === 0) empty.push([r, c]);
    })
  );
  if (empty.length === 0) return board;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  const newBoard = board.map((row) => row.slice());
  newBoard[r][c] = value;
  return newBoard;
}

function compress(board: number[][]): number[][] {
  return board.map((row) =>
    row.filter((v) => v !== 0).concat(Array(SIZE - row.filter((v) => v !== 0).length).fill(0))
  );
}

function merge(board: number[][]): { board: number[][]; score: number } {
  let score = 0;
  const newBoard = board.map((row) => {
    const newRow: number[] = [];
    let skip = false;
    for (let i = 0; i < row.length; i++) {
      if (skip) {
        skip = false;
        continue;
      }
      if (i + 1 < row.length && row[i] === row[i + 1] && row[i] !== 0) {
        newRow.push(row[i] * 2);
        score += row[i] * 2;
        skip = true;
      } else {
        newRow.push(row[i]);
      }
    }
    return newRow.concat(Array(SIZE - newRow.length).fill(0));
  });
  return { board: newBoard, score };
}

function reverse(board: number[][]): number[][] {
  return board.map((row) => row.slice().reverse());
}

function transpose(board: number[][]): number[][] {
  const newBoard: number[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      newBoard[c][r] = board[r][c];
    }
  }
  return newBoard;
}

function canMove(board: number[][]): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) return true;
      if (c + 1 < SIZE && board[r][c] === board[r][c + 1]) return true;
      if (r + 1 < SIZE && board[r][c] === board[r + 1][c]) return true;
    }
  }
  return false;
}

export function Game2048() {
  const [board, setBoard] = useState<number[][]>(emptyBoard());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    // Start with two tiles
    let b = addRandomTile(emptyBoard());
    b = addRandomTile(b);
    setBoard(b);
  }, []);

  const move = (direction: "up" | "down" | "left" | "right") => {
    if (gameOver) return;
    let newBoard = board;
    if (direction === "up") newBoard = transpose(newBoard);
    if (direction === "down") newBoard = reverse(transpose(newBoard));
    if (direction === "right") newBoard = reverse(newBoard);

    const compressed = compress(newBoard);
    const { board: merged, score: delta } = merge(compressed);
    const final = compress(merged);

    if (JSON.stringify(final) !== JSON.stringify(board)) {
      let updated = final;
      if (direction === "up") updated = transpose(updated);
      if (direction === "down") updated = transpose(reverse(updated));
      if (direction === "right") updated = reverse(updated);
      updated = addRandomTile(updated);
      setBoard(updated);
      setScore((s) => s + delta);
      if (!canMove(updated)) setGameOver(true);
    }
  };

  const renderCell = (value: number) => {
    const base = "w-12 h-12 flex items-center justify-center rounded-md text-2xl font-bold";
    const color = value
      ? `bg-${value === 2048 ? "green-500" : "blue-500"} text-white`
      : "bg-gray-200";
    return <div className={`${base} ${color}`}>{value || ""}</div>;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-4 gap-2">
        {board.flat().map((v, i) => (
          <div key={i}>{renderCell(v)}</div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => move("up")} variant="outline">
          <ArrowUp />
        </Button>
        <Button onClick={() => move("left")} variant="outline">
          <ArrowLeft />
        </Button>
        <Button onClick={() => move("right")} variant="outline">
          <ArrowRight />
        </Button>
        <Button onClick={() => move("down")} variant="outline">
          <ArrowDown />
        </Button>
      </div>
      <div className="text-xl">Score: {score}</div>
      {gameOver && (
        <div className="flex flex-col items-center gap-2">
          <div className="text-2xl font-bold">Game Over!</div>
          <Share text={`I scored ${score} in 2048! ${url}`} />
        </div>
      )}
    </div>
  );
}
