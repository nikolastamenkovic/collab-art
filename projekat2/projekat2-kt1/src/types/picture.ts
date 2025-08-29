import type Author from "./author";

export default interface Picture {
  id: string;
  name: string;
  pictureData: string[][];
  createdAt: Date;
  updatedAt: Date;
  author: Author;
}

