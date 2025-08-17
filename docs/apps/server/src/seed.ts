import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create season
  const season = await prisma.season.create({
    data: {
      title: 'Остров Архив - Сезон 1',
      startsAt: new Date('2024-01-01'),
      endsAt: new Date('2024-12-31'),
      mapBgUrl: '/assets/skins/neo-solarpunk/bg.webp',
      mapMidUrl: '/assets/skins/neo-solarpunk/mid.webp',
      mapFgUrl: '/assets/skins/neo-solarpunk/fg.webp',
      fogUrl: '/assets/skins/neo-solarpunk/fog.webp',
      skin: 'neo-solarpunk',
    },
  });

  console.log('✅ Season created:', season.title);

  // Create books
  const books = await Promise.all([
    prisma.book.create({
      data: {
        seasonId: season.id,
        title: 'Формула Успеха',
        coverUrl: '/assets/covers/book1.webp',
        fragmentsCount: 7,
        teaserText: 'Откройте секреты успешных людей и узнайте, как применить их принципы в своей жизни. Эта книга изменит ваше представление о достижении целей.',
        teaserImageUrl: '/assets/teasers/book1.webp',
        channelId: '-1001234567890',
        channelPostId: 1,
      },
    }),
    prisma.book.create({
      data: {
        seasonId: season.id,
        title: 'Психология Влияния',
        coverUrl: '/assets/covers/book2.webp',
        fragmentsCount: 5,
        teaserText: 'Изучите принципы психологического влияния и научитесь применять их в бизнесе и личной жизни. Практические техники для достижения результатов.',
        teaserImageUrl: '/assets/teasers/book2.webp',
        channelId: '-1001234567890',
        channelPostId: 2,
      },
    }),
    prisma.book.create({
      data: {
        seasonId: season.id,
        title: 'Финансовая Свобода',
        coverUrl: '/assets/covers/book3.webp',
        fragmentsCount: 6,
        teaserText: 'Пошаговый план достижения финансовой независимости. Инвестиции, пассивный доход и правильное управление деньгами.',
        teaserImageUrl: '/assets/teasers/book3.webp',
        channelId: '-1001234567890',
        channelPostId: 3,
      },
    }),
  ]);

  console.log('✅ Books created:', books.length);

  // Create hotspots
  const hotspots = await Promise.all([
    // Tap hotspots (70-80%)
    prisma.hotspot.create({
      data: {
        seasonId: season.id,
        x: 20,
        y: 30,
        type: 'tap',
        baseReward: 2,
        chanceGold: 0.1,
      },
    }),
    prisma.hotspot.create({
      data: {
        seasonId: season.id,
        x: 45,
        y: 25,
        type: 'tap',
        baseReward: 1,
        chanceGold: 0.05,
      },
    }),
    prisma.hotspot.create({
      data: {
        seasonId: season.id,
        x: 70,
        y: 40,
        type: 'tap',
        baseReward: 3,
        chanceGold: 0.15,
      },
    }),
    prisma.hotspot.create({
      data: {
        seasonId: season.id,
        x: 35,
        y: 60,
        type: 'tap',
        baseReward: 2,
        chanceGold: 0.1,
      },
    }),
    prisma.hotspot.create({
      data: {
        seasonId: season.id,
        x: 80,
        y: 70,
        type: 'tap',
        baseReward: 1,
        chanceGold: 0.05,
      },
    }),
    prisma.hotspot.create({
      data: {
        seasonId: season.id,
        x: 15,
        y: 75,
        type: 'tap',
        baseReward: 2,
        chanceGold: 0.1,
      },
    }),
    prisma.hotspot.create({
      data: {
        seasonId: season.id,
        x: 60,
        y: 80,
        type: 'tap',
        baseReward: 3,
        chanceGold: 0.15,
      },
    }),
    prisma.hotspot.create({
      data: {
        seasonId: season.id,
        x: 25,
        y: 50,
        type: 'tap',
        baseReward: 1,
        chanceGold: 0.05,
      },
    }),
    prisma.hotspot.create({
      data: {
        seasonId: season.id,
        x: 55,
        y: 45,
        type: 'tap',
        baseReward: 2,
        chanceGold: 0.1,
      },
    }),
    prisma.hotspot.create({
      data: {
        seasonId: season.id,
        x: 85,
        y: 55,
        type: 'tap',
        baseReward: 1,
        chanceGold: 0.05,
      },
    }),

    // Hold hotspots
    prisma.hotspot.create({
      data: {
        seasonId: season.id,
        x: 40,
        y: 35,
        type: 'hold',
        baseReward: 4,
        chanceGold: 0.2,
      },
    }),
    prisma.hotspot.create({
      data: {
        seasonId: season.id,
        x: 65,
        y: 65,
        type: 'hold',
        baseReward: 3,
        chanceGold: 0.15,
      },
    }),

    // Minigame hotspots (20-30%)
    prisma.hotspot.create({
      data: {
        seasonId: season.id,
        x: 30,
        y: 20,
        type: 'minigame',
        minigame: 'ripple',
        baseReward: 5,
        chanceGold: 0.25,
      },
    }),
    prisma.hotspot.create({
      data: {
        seasonId: season.id,
        x: 75,
        y: 30,
        type: 'minigame',
        minigame: 'dial',
        baseReward: 4,
        chanceGold: 0.2,
      },
    }),
    prisma.hotspot.create({
      data: {
        seasonId: season.id,
        x: 50,
        y: 85,
        type: 'minigame',
        minigame: 'constellation',
        baseReward: 6,
        chanceGold: 0.3,
      },
    }),
  ]);

  console.log('✅ Hotspots created:', hotspots.length);

  // Create test user
  const testUser = await prisma.user.create({
    data: {
      tgId: '123456789',
      username: 'testuser',
      referralCode: 'TEST1234',
      isSubscribed: true,
      subscriptionUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      streak: 5,
    },
  });

  console.log('✅ Test user created:', testUser.username);

  // Create some progress for test user
  await prisma.progress.create({
    data: {
      userId: testUser.id,
      seasonId: season.id,
      bookId: books[0].id,
      fragments: 3,
    },
  });

  console.log('✅ Test progress created');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
