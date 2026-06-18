const bcrypt = require('bcrypt');

async function test() {
  const password = 'admin123456';
  const hash = await bcrypt.hash(password, 10);
  console.log('Senha:', password);
  console.log('Hash:', hash);

  const match = await bcrypt.compare(password, hash);
  console.log('Match:', match);
}

test().catch(console.error);
