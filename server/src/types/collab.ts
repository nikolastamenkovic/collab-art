export type PixelChangeData = {
    x: number;
    y: number;
    color: string;
}

export type CursorData = {
    x: number;
    y: number;
}

export type UserInRoom = {
    id: string;
    username: string;
    user_reaction?: `like` | `dislike` | null;
}

export type RoomData = {
    picture_id: string;
}