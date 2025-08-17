import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create season
  const season = await prisma.season.create({
    data: {
      title: 'Остров Архив',
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      mapBgUrl: '/assets/skins/neo-solarpunk/bg.webp',
      mapMidUrl: '/assets/skins/neo-solarpunk/mid.webp',
      mapFgUrl: '/assets/skins/neo-solarpunk/fg.webp',
      fogUrl: '/assets/skins/neo-solarpunk/fog.webp',
      skin: 'neo-solarpunk',
    },
  })

  // Create books
  const book1 = await prisma.book.create({
    data: {
      seasonId: season.id,
      title: 'Формула Успеха',
      coverUrl: '/assets/covers/book1.webp',
      fragmentsCount: 7,
      teaserText: 'Откройте секреты успешных людей и узнайте, как применить их опыт в своей жизни. Эта книга раскроет перед вами принципы, которые используют миллионеры и лидеры мирового уровня.',
      teaserImageUrl: '/assets/teasers/book1.webp',
      channelId: '-1001234567890',
      channelPostId: 1,
    },
  })

  const book2 = await prisma.book.create({
    data: {
      seasonId: season.id,
      title: 'Искусство Переговоров',
      coverUrl: '/assets/covers/book2.webp',
      fragmentsCount: 5,
      teaserText: 'Научитесь вести эффективные переговоры и добиваться желаемых результатов. Практические техники и стратегии для любых ситуаций.',
      teaserImageUrl: '/assets/teasers/book2.webp',
      channelId: '-1001234567890',
      channelPostId: 2,
    },
  })

  // Create hotspots
  const hotspots = [
    { x: 20, y: 30, type: 'tap', baseReward: 2 },
    { x: 60, y: 40, type: 'hold', baseReward: 3 },
    { x: 80, y: 20, type: 'minigame', minigame: 'ripple', baseReward: 4, chanceGold: 0.1 },
    { x: 40, y: 70, type: 'tap', baseReward: 2 },
    { x: 70, y: 80, type: 'minigame', minigame: 'dial', baseReward: 4, chanceGold: 0.1 },
    { x: 30, y: 50, type: 'tap', baseReward: 2 },
    { x: 50, y: 25, type: 'hold', baseReward: 3 },
    { x: 90, y: 60, type: 'minigame', minigame: 'constellation', baseReward: 4, chanceGold: 0.1 },
    { x: 15, y: 80, type: 'tap', baseReward: 2 },
    { x: 75, y: 35, type: 'hold', baseReward: 3 },
  ]

  for (const hotspot of hotspots) {
    await prisma.hotspot.create({
      data: {
        seasonId: season.id,
        ...hotspot,
      },
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log(`📚 Created ${season.title} with ${hotspots.length} hotspots`)
  console.log(`📖 Created ${2} books`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
