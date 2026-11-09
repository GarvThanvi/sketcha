export type Tool = "selection" | "Rectangle" | "Circle" | "Square" | "Text";

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
  type: 'Text';
  fontSize: number;
  fontFamily: string;
  color: string;
}

export type Shape =
  | ({ type: "Rectangle" } & Rectangle)
  | ({ type: "Circle" } & Circle)
  | ({ type: "Square" } & Square)
  | TextShape;
