import 'dotenv/config';
import { AppDataSource } from './data-source';
import { User, UserRole } from './modules/auth/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const userRepository = AppDataSource.getRepository(User);

    // Verificar se admin já existe
    const adminExists = await userRepository.findOne({
      where: { email: 'admin@salao.com' },
    });

    if (adminExists) {
      console.log('⏭️  Admin user already exists');
      await AppDataSource.destroy();
      return;
    }

    // Criar admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = userRepository.create({
      email: 'admin@salao.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      is_active: true,
    });

    await userRepository.save(admin);
    console.log('✅ Admin user created: admin@salao.com / admin123');

    // Criar algumas funcionárias de exemplo
    const employees = [
      { email: 'ana@salao.com', name: 'Ana', commission_rate: 30 },
      { email: 'bruna@salao.com', name: 'Bruna', commission_rate: 25 },
    ];

    for (const emp of employees) {
      const exists = await userRepository.findOne({
        where: { email: emp.email },
      });

      if (!exists) {
        const hashedPwd = await bcrypt.hash('employee123', 10);
        const employee = userRepository.create({
          email: emp.email,
          password: hashedPwd,
          role: UserRole.EMPLOYEE,
          is_active: true,
          commission_rate: emp.commission_rate,
        });
        await userRepository.save(employee);
        console.log(`✅ Employee created: ${emp.email} / employee123`);
      }
    }

    console.log('✅ Seed completed successfully!');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
