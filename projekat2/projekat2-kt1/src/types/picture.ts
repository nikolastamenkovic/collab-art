import type Author from "./author";

export type PictureDto {
  id: string;
  name: string;
  pictureData: string[][];
  createdAt: Date;
  updatedAt: Date;
  author: Author;
}

export type BasePictureDto = {
  name: string;
  picture_data: string;
}

