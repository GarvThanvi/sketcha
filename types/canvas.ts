export type Tool = "selection" | "Rectangle" | "Circle" | "Square";

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

export type Shape =
  | ({ type: "Rectangle" } & Rectangle)
  | ({ type: "Circle" } & Circle)
  | ({ type: "Square" } & Square);
