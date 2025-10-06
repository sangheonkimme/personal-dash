import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 샘플 사용자 생성
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      id: 'demo-user-id', // cuid 대신 직접 지정
      email: 'demo@example.com',
      name: '데모 사용자',
      role: 'user',
      salaryDay: 25,
      currency: 'KRW',
      locale: 'ko-KR',
    },
  });

  console.log('✅ Created user:', user.email);

  // 샘플 거래 내역 생성
  const transactions = await Promise.all([
    // 수입
    prisma.transaction.create({
      data: {
        userId: user.id,
        date: new Date('2025-10-25'),
        type: 'income',
        fixed: true,
        category: '급여',
        description: '10월 급여',
        amount: 3500000,
        tags: ['정기', '급여'],
      },
    }),
    // 고정 지출
    prisma.transaction.create({
      data: {
        userId: user.id,
        date: new Date('2025-11-01'),
        type: 'expense',
        fixed: true,
        category: '주거',
        subcategory: '월세',
        description: '11월 월세',
        amount: 600000,
        paymentMethod: '계좌이체',
        tags: ['고정', '주거'],
      },
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        date: new Date('2025-11-05'),
        type: 'expense',
        fixed: true,
        category: '통신',
        subcategory: '휴대폰',
        description: '휴대폰 요금',
        amount: 55000,
        paymentMethod: '자동이체',
        tags: ['고정', '통신'],
      },
    }),
    // 변동 지출
    prisma.transaction.create({
      data: {
        userId: user.id,
        date: new Date('2025-11-06'),
        type: 'expense',
        fixed: false,
        category: '식비',
        description: '점심 - 된장찌개',
        amount: 9000,
        paymentMethod: '카드',
        tags: ['변동', '식비'],
      },
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        date: new Date('2025-11-07'),
        type: 'expense',
        fixed: false,
        category: '교통',
        description: '지하철 요금',
        amount: 1400,
        paymentMethod: '카드',
        tags: ['변동', '교통'],
      },
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        date: new Date('2025-11-08'),
        type: 'expense',
        fixed: false,
        category: '문화',
        subcategory: '영화',
        description: '영화 관람',
        amount: 15000,
        paymentMethod: '카드',
        tags: ['변동', '문화'],
      },
    }),
  ]);

  console.log(`✅ Created ${transactions.length} transactions`);

  // 정기 지출 템플릿 생성
  const templates = await Promise.all([
    prisma.fixedExpenseTemplate.create({
      data: {
        userId: user.id,
        name: '월세',
        amount: 600000,
        category: '주거',
        subcategory: '월세',
        rrule: 'FREQ=MONTHLY;BYMONTHDAY=1',
        startDate: new Date('2025-01-01'),
        notes: '매월 1일 자동 이체',
      },
    }),
    prisma.fixedExpenseTemplate.create({
      data: {
        userId: user.id,
        name: '휴대폰 요금',
        amount: 55000,
        category: '통신',
        subcategory: '휴대폰',
        rrule: 'FREQ=MONTHLY;BYMONTHDAY=5',
        startDate: new Date('2025-01-01'),
        notes: '매월 5일 자동 이체',
      },
    }),
    prisma.fixedExpenseTemplate.create({
      data: {
        userId: user.id,
        name: '넷플릭스',
        amount: 17000,
        category: '문화',
        subcategory: 'OTT',
        rrule: 'FREQ=MONTHLY;BYMONTHDAY=15',
        startDate: new Date('2025-01-01'),
        notes: '매월 15일 카드 자동 결제',
      },
    }),
  ]);

  console.log(`✅ Created ${templates.length} fixed expense templates`);

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
