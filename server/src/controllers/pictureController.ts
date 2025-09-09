import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Picture } from "../entities/Picture";
import { User } from "../entities/User";
import { CommentDto, DeletePictureRes, GetPictureRes, NewPictureRes, PictureDto, PictureListingPage, UpdatePictureRes } from "../types/picture";
import { Comment } from "../entities/Comment";

const pictureRepository = AppDataSource.getRepository(Picture);
const userRepository = AppDataSource.getRepository(User);
const commentRepository = AppDataSource.getRepository(Comment);

export const getPictures = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 10, 1), 25);
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const author = req.query.author as string;
    const olderFirst = req.query.older_first === 'true';

    const offset = (page - 1) * limit;

    const findOptions: any = {
      take: limit,
      skip: offset,
      order: {
        created_at: olderFirst ? 'ASC' : 'DESC'
      }
    };

    if (author) {
      findOptions.where = {
        author: { id: author }
      };
    }

    const [pictures, total] = await pictureRepository.findAndCount(findOptions);

    const picturesDtos: PictureDto[] = pictures.map(picture => ({
      picture_id: picture.id,
      name: picture.name,
      picture_data: picture.picture_data,
      author: {
        user_id: picture.author.id,
        username: picture.author.username
      },
      created_at: picture.created_at.toISOString(),
      updated_at: picture.updated_at.toISOString()
    }));

    const response: PictureListingPage = {
      pictures: picturesDtos,
      total: total
    };
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ failed: true, code: "INTERNAL_ERROR" });
  }
};

export const likePicture = async (req: Request, res: Response) => {
  try {
    const pictureId = req.params.id;
    const picture = await pictureRepository.findOneBy({ id: pictureId });

    if (!picture) {
      return res.status(404).json({ failed: true, code: "NO_SUCH_ENTITY" });
    }

    const user = await userRepository.findOneBy({ id: req.user?.id });
    if (!user) {
      return res.status(404).json({ failed: true, code: "NO_SUCH_ENTITY" });
    }

    const likedBy = await picture.liked_by;

    const likeIndex = likedBy.findIndex(u => u.id === user.id);
    if (likeIndex === -1) {
      likedBy.push(user);
      await pictureRepository.save(picture);
      return res.status(200).json({ failed: false });
    } else {
      likedBy.splice(likeIndex, 1);
      await pictureRepository.save(picture);
      return res.status(200).json({ failed: false });
    }
  } catch (error) {
    res.status(500).json({ failed: true, code: "INTERNAL_ERROR" });
  }
};

export const dislikePicture = async (req: Request, res: Response) => {
  try {
    const pictureId = req.params.id;
    const picture = await pictureRepository.findOneBy({ id: pictureId });

    if (!picture) {
      return res.status(404).json({ failed: true, code: "NO_SUCH_ENTITY" });
    }

    const user = await userRepository.findOneBy({ id: req.user?.id });
    if (!user) {
      return res.status(404).json({ failed: true, code: "NO_SUCH_ENTITY" });
    }

    const dislikedBy = await picture.disliked_by;

    const dislikeIndex = dislikedBy.findIndex(u => u.id === user.id);
    if (dislikeIndex === -1) {
      dislikedBy.push(user);
      await pictureRepository.save(picture);
      return res.status(200).json({ failed: false });
    } else {
      dislikedBy.splice(dislikeIndex, 1);
      await pictureRepository.save(picture);
      return res.status(200).json({ failed: false });
    }
  } catch (error) {
    res.status(500).json({ failed: true, code: "INTERNAL_ERROR" });
  }
};

export const commentPicture = async (req: Request, res: Response) => {
  try {
    const pictureId = req.params.id;
    const picture = await pictureRepository.findOneBy({ id: pictureId });

    if (!picture) {
      return res.status(404).json({ failed: true, code: "NO_SUCH_ENTITY" });
    }

    const user = await userRepository.findOneBy({ id: req.user?.id });
    if (!user) {
      return res.status(404).json({ failed: true, code: "NO_SUCH_ENTITY" });
    }

    const text = req.body.text;

    const newComment = commentRepository.create({
      text,
      author: user,
      picture
    });
    const savedComment = await commentRepository.save(newComment);

    const response:CommentDto = {
      comment_id: savedComment.id,
      text: savedComment.text,
      author: {
        user_id: user.id,
        username: user.username
      },
      created_at: savedComment.created_at.toISOString()
    }

    res.status(201).json({ failed: false, comment: response });
  } catch (error) {
    res.status(500).json({ failed: true, code: "INTERNAL_ERROR" });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.id;
    const comment = await commentRepository.findOneBy({ id: commentId });

    if (!comment) {
      return res.status(404).json({ failed: true, code: "NO_SUCH_ENTITY" });
    }

    // const user = await userRepository.findOneBy({ id: req.user?.id });
    // if (!user) {
    //   return res.status(404).json({ failed: true, code: "NO_SUCH_ENTITY" });
    // }

    if (comment.author.id !== req.user?.id) {
      return res.status(403).json({ failed: true, code: "NOT_YOURS" });
    }

    await commentRepository.remove(comment);

    res.status(200).json({ failed: false });
  } catch (error) {
    res.status(500).json({ failed: true, code: "INTERNAL_ERROR" });
  }
};

export const getPictureById = async (req: Request, res: Response) => {
  try {
    const pictureId = req.params.id;
    const picture = await pictureRepository.findOneBy({ id: pictureId });

    if (!picture) {
      return res.status(404).json({ failed: true, code: "NO_SUCH_ENTITY" });
    }

    const comments = await commentRepository.find({
      where: { picture: { id: pictureId } },
      order: { created_at: 'DESC' }
    });

    const commentDtos: CommentDto[] = comments.map((comment): CommentDto => ({
      comment_id: comment.id,
      text: comment.text,
      author: {
        user_id: comment.author.id,
        username: comment.author.username
      },
      created_at: comment.created_at.toISOString()
    }));

    const likedBy = await picture.liked_by;
    const dislikedBy = await picture.disliked_by;

    const result: PictureDto = {
      picture_id: picture.id,
      name: picture.name,
      author: {
        user_id: picture.author.id,
        username: picture.author.username
      },
      picture_data: picture.picture_data,
      created_at: picture.created_at.toISOString(),
      updated_at: picture.updated_at.toISOString(),
      comments: commentDtos,
      liked_count: likedBy.length,
      disliked_count: dislikedBy.length,
    };

    console.log(result)

    const getPictureRes: GetPictureRes = {
      failed: false,
      picture: result
    };

    res.status(200).json(getPictureRes);
  } catch (error) {
    res.status(500).json({ failed: true, code: "INTERNAL_ERROR" });
  }
};

export const createPicture = async (req: Request, res: Response) => {
  try {
    const user = await userRepository.findOneBy({ id: req.user?.id });
    if (!user) {
      return res.status(404).json({ failed: true, code: "NO_SUCH_ENTITY" });
    }

    const newPicture = pictureRepository.create({
      picture_data: req.body.picture_data,
      name: req.body.name,
      author: user
    });
    const savedPicture = await pictureRepository.save(newPicture);

    const newPictureRes: NewPictureRes = {
      failed: false,
      picture_id: savedPicture.id
    }
    res.status(201).json(newPictureRes);
  } catch (error) {
    res.status(500).json({ failed: true, code: "INTERNAL_ERROR" });
  }
};

export const deletePicture = async (req: Request, res: Response) => {
  try {
    const pictureId = req.params.id;
    const picture = await pictureRepository.findOneBy({ id: pictureId });

    if (!picture) {
      return res.status(404).json({ failed: true, code: "NO_SUCH_ENTITY" });
    }

    if (picture.author.id !== req.user.id) {
      return res.status(403).json({ failed: true, code: "NOT_YOURS" });
    }

    await pictureRepository.remove(picture);

    const deletePictureRes: DeletePictureRes = {
      failed: false
    };

    res.status(200).json(deletePictureRes);
  } catch (error) {
    res.status(500).json({ failed: true, code: "INTERNAL_ERROR" });
  }
};

export const updatePicture = async (req: Request, res: Response) => {
  try {
    const pictureId = req.params.id;
    const picture = await pictureRepository.findOneBy({ id: pictureId });

    if (!picture) {
      return res.status(404).json({ failed: true, code: "NO_SUCH_ENTITY" });
    }

    if (picture.author.id !== req.user.id) {
      return res.status(403).json({ failed: true, code: "NOT_YOURS" });
    }

    const updatedPicture = pictureRepository.merge(picture, req.body);
    await pictureRepository.save(updatedPicture);

    const updatePictureRes: UpdatePictureRes = {
      failed: false,
    }
    res.status(200).json(updatePictureRes);
  } catch (error) {
    res.status(500).json({ failed: true, code: "INTERNAL_ERROR" });
  }
};
