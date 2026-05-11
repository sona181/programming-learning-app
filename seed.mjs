import pkg from './node_modules/@prisma/client/index.js';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.create({
        data: {
            email: 'timdoe@gmail.com',
            password_hash: 'test123',
            role: 'INSTRUCTOR',
            is_active: true,
            is_verified: true,
        }
    });
    console.log('Created user:', user);
}

main().catch(console.error).finally(() => prisma.$disconnect());