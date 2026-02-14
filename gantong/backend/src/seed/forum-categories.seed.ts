import 'dotenv/config';
import { DataSource } from 'typeorm';
import { ForumCategory } from '../forum/entities/category.entity';

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [ForumCategory],
});

const DEFAULT_CATEGORIES = [
  '训练分享',
  '求助咨询',
  '机构推荐',
  '家庭训练',
  '心情分享',
  '费用讨论',
  '康复经验',
  '医院就诊',
];

async function run() {
  await dataSource.initialize();
  const repo = dataSource.getRepository(ForumCategory);

  for (const name of DEFAULT_CATEGORIES) {
    const exist = await repo.findOne({ where: { name } });
    if (!exist) {
      const cat = repo.create({ name });
      await repo.save(cat);

      console.log('Inserted category:', name);
    }
  }
  await dataSource.destroy();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
