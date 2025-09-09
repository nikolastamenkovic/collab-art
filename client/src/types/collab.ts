export type PixelChangeData = {
  x: number;
  y: number;
  color: string;
}

export type CursorData = {
  x: number;
  y: number;
}

export type JoinRoomData = {
  picture_id: string;
}

export type UserInRoom = {
  id: string;
  username: string;
}

export type RoomData = {
    picture_id: string;
}

export type CursorDataUser = CursorData & { username: string, color: string }

export type ChatMessage = {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: Date;
}