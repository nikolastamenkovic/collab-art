import type Author from "./author";

export type BasePictureDto = {
  name: string;
  picture_data: string[][];
}

export type PictureDto = BasePictureDto & {
  picture_id: string;
  created_at: string;
  updated_at: string;
  author: Author;
}
