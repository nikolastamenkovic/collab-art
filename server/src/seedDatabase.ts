import { AppDataSource } from './data-source';
import { User } from './entities/User';
import { Picture } from './entities/Picture';
import bcrypt from 'bcrypt';

export const seedDatabase = async () => {

    const userRepository = AppDataSource.getRepository(User);
    const pictureRepository = AppDataSource.getRepository(Picture);

    if ((await userRepository.count()) > 0) {
        console.log('Database already seeded');
        return;
    }

    for (let i = 1; i <= 10; i++) {
        const user = new User();
        user.username = `stamen${i}`;
        user.password = await bcrypt.hash('test1234', 10);
        await userRepository.save(user);
        for (let j = 1; j <= 5; j++) {
            const picture = new Picture();
            picture.name = `Picture ${j} of User ${i}`;
            picture.picture_data = numberPatterns[j];
            picture.author = user;
            await pictureRepository.save(picture);
        }
    }

    console.log('Database seeded successfully');
};

const numberPatterns: { [key: number]: string[][] } = {
  0: [
    ["#000000", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#000000"],
    ["#FFFFFF", "#000000", "#000000", "#000000", "#FFFFFF"],
    ["#FFFFFF", "#000000", "#000000", "#000000", "#FFFFFF"],
    ["#FFFFFF", "#000000", "#000000", "#000000", "#FFFFFF"],
    ["#000000", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#000000"]
  ],
  1: [
    ["#000000", "#000000", "#FFFFFF", "#000000", "#000000"],
    ["#000000", "#FFFFFF", "#FFFFFF", "#000000", "#000000"],
    ["#000000", "#000000", "#FFFFFF", "#000000", "#000000"],
    ["#000000", "#000000", "#FFFFFF", "#000000", "#000000"],
    ["#000000", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#000000"]
  ],
  2: [
    ["#000000", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#000000"],
    ["#FFFFFF", "#000000", "#000000", "#000000", "#FFFFFF"],
    ["#000000", "#000000", "#000000", "#FFFFFF", "#000000"],
    ["#000000", "#FFFFFF", "#000000", "#000000", "#000000"],
    ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"]
  ],
  3: [
    ["#000000", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#000000"],
    ["#FFFFFF", "#000000", "#000000", "#000000", "#FFFFFF"],
    ["#000000", "#000000", "#FFFFFF", "#FFFFFF", "#000000"],
    ["#FFFFFF", "#000000", "#000000", "#000000", "#FFFFFF"],
    ["#000000", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#000000"]
  ],
  4: [
    ["#FFFFFF", "#000000", "#000000", "#FFFFFF", "#000000"],
    ["#FFFFFF", "#000000", "#000000", "#FFFFFF", "#000000"],
    ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"],
    ["#000000", "#000000", "#000000", "#FFFFFF", "#000000"],
    ["#000000", "#000000", "#000000", "#FFFFFF", "#000000"]
  ],
  5: [
    ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"],
    ["#FFFFFF", "#000000", "#000000", "#000000", "#000000"],
    ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#000000"],
    ["#000000", "#000000", "#000000", "#000000", "#FFFFFF"],
    ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#000000"]
  ],
  6: [
    ["#000000", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#000000"],
    ["#FFFFFF", "#000000", "#000000", "#000000", "#000000"],
    ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#000000"],
    ["#FFFFFF", "#000000", "#000000", "#000000", "#FFFFFF"],
    ["#000000", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#000000"]
  ],
  7: [
    ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"],
    ["#000000", "#000000", "#000000", "#000000", "#FFFFFF"],
    ["#000000", "#000000", "#000000", "#FFFFFF", "#000000"],
    ["#000000", "#000000", "#FFFFFF", "#000000", "#000000"],
    ["#000000", "#FFFFFF", "#000000", "#000000", "#000000"]
  ],
  8: [
    ["#000000", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#000000"],
    ["#FFFFFF", "#000000", "#000000", "#000000", "#FFFFFF"],
    ["#000000", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#000000"],
    ["#FFFFFF", "#000000", "#000000", "#000000", "#FFFFFF"],
    ["#000000", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#000000"]
  ],
  9: [
    ["#000000", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#000000"],
    ["#FFFFFF", "#000000", "#000000", "#000000", "#FFFFFF"],
    ["#000000", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"],
    ["#000000", "#000000", "#000000", "#000000", "#FFFFFF"],
    ["#000000", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#000000"]
  ]
};