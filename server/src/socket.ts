import { Server } from "socket.io";
import { AppDataSource } from "./data-source";
import { verifyToken } from "./auth/jwtUtils";
import { CursorData, PixelChangeData, UserInRoom } from "./types/collab";
import { Picture } from "./entities/Picture";
import { CommentDto } from "./types/picture";

const roomUsers = new Map<string, Map<string, UserInRoom>>();
const roomPictureStates = new Map<string, string[][]>();

export const setupSocket = (io: Server) => {
  const pictureRepository = AppDataSource.getRepository(Picture);
  // const userRepository = AppDataSource.getRepository(User);
  // const commentRepository = AppDataSource.getRepository(Comment);
  io.use((socket, next) => {
    const token = socket.handshake.auth.token?.split(" ")[1];
    if (!token) {
      return next(new Error("Token nije obezbeđen."));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new Error("Nevažeći token."));
    }

    socket.data.user = decoded;
    next();
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.data.user.username}`);

    socket.on("join-room", async (pictureId: string) => {
      try {
        let picture = roomPictureStates.get(pictureId);
        if(!picture) {
          const pictureTmp = await pictureRepository.findOneBy({ id: pictureId });
          // console.log("Picture fetched from DB:", pictureTmp);

          if(!pictureTmp) {
            socket.emit("error", { message: "Picture not found." });
            return;
          }

          picture = pictureTmp.picture_data;
          roomPictureStates.set(pictureId,  picture);
        }

        socket.data.picture_id = pictureId;

        const user = socket.data.user;

        socket.join(pictureId);

        if (!roomUsers.has(pictureId)) {
          roomUsers.set(pictureId, new Map());
        }

        const userMap = roomUsers.get(pictureId);
        userMap.set(user.id, user);

        socket.emit("joined-picture", picture, Array.from(userMap.values()));

        socket.to(pictureId).emit("user-joined", user);

        console.log(`User ${socket.data.user.username} joined picture room: ${pictureId}`);
      } catch (error) {
        console.error("Error in join room:", error);
        socket.emit("error", { message: "Failed to join picture room." });
      }
    });  

    socket.on("chat-message", (messageData: { text: string, userId: string, username: string }) => {
      const message = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userId: messageData.userId,
        username: messageData.username,
        text: messageData.text,
        timestamp: new Date().toISOString()
      };
      
      io.to(socket.data.picture_id).emit("chat-message", message);
    });

    socket.on("pixel-change", (data: PixelChangeData) => {
      // console.log("Pixel change received:", data);
      const picture_id = socket.data.picture_id;

      const { x, y, color } = data;

      const picture = roomPictureStates.get(picture_id);

      picture[x][y] = color;
      socket.to(picture_id).emit("pixel-change", data);
    });

    socket.on("cursor-move", (data: CursorData) => {
      socket.to(socket.data.picture_id).emit("cursor-moved", data, socket.data.user.id);
    });

    socket.on("cursor-color-change", (color: string) => {
      socket.to(socket.data.picture_id).emit("cursor-color-changed", color, socket.data.user.id);
    });

    socket.on("comment", (comment: CommentDto) => {
      socket.to(socket.data.picture_id).emit("comment", comment);
    });

    socket.on("comment-delete", (comment_id: string) => {
      socket.to(socket.data.picture_id).emit("comment-delete", comment_id);
    });

    socket.on("like", () => {
      socket.to(socket.data.picture_id).emit("like");
    });

    socket.on("dislike", () => {
      socket.to(socket.data.picture_id).emit("dislike");
    });

    socket.on("unlike", () => {
      socket.to(socket.data.picture_id).emit("unlike");
    });

    socket.on("undislike", () => {
      socket.to(socket.data.picture_id).emit("undislike");
    });

    socket.on("save-started", async () => {
      socket.to(socket.data.picture_id).emit("save-started");
    });

    socket.on("save-finished", async (data: string[][]) => {
      //ako stigne null ili undefined, cuvanje nije uspelo
      if(!data) {
        socket.to(socket.data.picture_id).emit("save-failed");
        return;
      }
      roomPictureStates.set(socket.data.picture_id, data);
      socket.to(socket.data.picture_id).emit("save-finished", data);
    });

    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.data.user.username}`);
      if (socket.data.picture_id && roomUsers.has(socket.data.picture_id)) {
        const userMap = roomUsers.get(socket.data.picture_id);
        userMap.delete(socket.data.user.id);

        if (userMap.size === 0) {
          roomUsers.delete(socket.data.picture_id);
          roomPictureStates.delete(socket.data.picture_id);
          console.log(`Room ${socket.data.picture_id} deleted due to no users.`);
        }
        else {
          socket.to(socket.data.picture_id).emit("user-left", socket.data.user.id);
        }
      }
    });
  });
}
