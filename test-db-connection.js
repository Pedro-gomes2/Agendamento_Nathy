const { Client } = require('pg');

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

client
  .connect()
  .then(() => {
    console.log('✅ Conexão com banco Neon PostgreSQL estabelecida com sucesso!');
    return client.query('SELECT NOW()');
  })
  .then((result) => {
    console.log('✅ Consulta de teste:', result.rows[0]);
    return client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`,
    );
  })
  .then((result) => {
    console.log(
      '✅ Tabelas no banco:',
      result.rows.length > 0 ? result.rows.map((r) => r.table_name) : 'Nenhuma tabela ainda',
    );
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar:', err.message);
    process.exit(1);
  })
  .finally(() => {
    client.end();
  });
