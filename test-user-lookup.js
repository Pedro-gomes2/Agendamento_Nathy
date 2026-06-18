const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
  host: 'ep-empty-sun-acavwqho-pooler.sa-east-1.aws.neon.tech',
  port: 5432,
  user: 'neondb_owner',
  password: 'npg_aXFh8OBbEq9K',
  database: 'neondb',
  ssl: {
    rejectUnauthorized: false,
  },
});

async function test() {
  try {
    await client.connect();
    console.log('✅ Conectado ao banco\n');

    // Find user
    const result = await client.query('SELECT * FROM users WHERE email = $1', [
      'admin@salao.com',
    ]);

    if (result.rows.length === 0) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    const user = result.rows[0];
    console.log('✅ Usuário encontrado:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Password hash:', user.password.substring(0, 20) + '...');
    console.log('  Role:', user.role);
    console.log('  Is Active:', user.is_active);

    // Test password comparison
    const password = 'admin123456';
    console.log('\n🔍 Testando comparação de senha...');
    console.log('  Senha inserida:', password);

    const match = await bcrypt.compare(password, user.password);
    console.log('  Match:', match ? '✅ Correto' : '❌ Incorreto');

    if (match) {
      console.log('\n✅ Login deveria funcionar!');
    }
  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await client.end();
  }
}

test();
