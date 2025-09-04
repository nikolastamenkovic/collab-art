export type LoginReq = {
    username: string;
    password: string;
}

export type LoginRes = {
    failed: false;
    token: string;
    user_id: string;
    username: string;
}

export type UserCreationReq = {
    username: string;
    password: string;
}

export type UserCreationRes = {
    failed: false;
    user_id: string;
}