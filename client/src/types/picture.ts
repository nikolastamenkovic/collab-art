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
  comments?: CommentDto[];
  liked_by?: string[];
  disliked_by?: string[];
  user_reaction?: 'like' | 'dislike' | null;
}

export type CommentDto = {
  comment_id: string;
  author: Author;
  text: string;
  created_at: string;
}

