export type Tool =
  | "selection"
  | "Rectangle"
  | "Circle"
  | "Square"
  | "Text"
  | "Line";

export type Shapes = Rectangle | Circle | Square;

export interface Rectangle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Circle {
  id: string;
  x: number;
  y: number;
  radius: number;
}

export interface Square {
  id: string;
  x: number;
  y: number;
  side: number;
}

export interface TextShape {
  id: string;
  x: number;
  y: number;
  text: string;
  type: "Text";
  fontSize: number;
  fontFamily: string;
  color: string;
}

export interface Line {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export type Shape =
  | ({ type: "Rectangle" } & Rectangle)
  | ({ type: "Circle" } & Circle)
  | ({ type: "Square" } & Square)
  | ({ type: "Line" } & Line)
  | TextShape;
