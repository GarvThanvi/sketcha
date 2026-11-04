export type Tool = "selection" | "Rectangle";

export interface Rectangle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Cirlce {
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
