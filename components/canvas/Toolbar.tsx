"use client";

import type { CSSProperties } from "react";
import type { Tool } from "../../types/canvas";

type ToolbarProps = {
  tool: Tool;
  onSelectTool: (tool: Tool) => void;
};

const tools: Tool[] = ["Rectangle", "Circle", "Square"];

const containerStyle: CSSProperties = {
  position: "fixed",
  top: 16,
  left: 16,
  zIndex: 10,
  display: "flex",
  gap: 8,
  padding: 8,
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.12)",
};

function buttonStyle(isActive: boolean): CSSProperties {
  return {
    border: "none",
    borderRadius: 8,
    padding: "8px 14px",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    background: isActive ? "#3b82f6" : "transparent",
    color: isActive ? "white" : "#475569",
  };
}

export default function Toolbar({ tool, onSelectTool }: ToolbarProps) {
  return (
    <div style={containerStyle}>
      {tools.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onSelectTool(value)}
          aria-pressed={tool === value}
          style={buttonStyle(tool === value)}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
