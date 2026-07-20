import pg from 'pg'
const { Pool } = pg

const pool = new Pool({
  connectionString: 'postgresql://postgres:An0n1m0s0204%40@db.nrokzgsxljjrgoebbajn.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
})

try {
  // Attempt to insert a default instance with correct SITE_URL
  const { rows: existing } = await pool.query('SELECT id, uuid FROM auth.instances')
  
  if (existing.length === 0) {
    console.log('Nenhuma instancia encontrada. Tentando criar...')
    
    // Check what columns are required
    const { rows: cols } = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'auth' AND table_name = 'instances'
      ORDER BY ordinal_position
    `)
    
    for (const col of cols) {
      console.log(`${col.column_name}: ${col.data_type} default=${col.column_default}`)
    }
    
    // Try inserting an instance
    const { rows: inserted } = await pool.query(`
      INSERT INTO auth.instances (id, raw_base_config)
      VALUES (gen_random_uuid(), '{"site_url": "https://loja-saas-ten.vercel.app"}')
      ON CONFLICT DO NOTHING
      RETURNING id
    `)
    console.log('Inserted:', inserted)
  } else {
    console.log('Instancias existentes:', existing)
    
    // Update the existing instance
    for (const inst of existing) {
      const { rows: updated } = await pool.query(`
        UPDATE auth.instances 
        SET raw_base_config = '{"site_url": "https://loja-saas-ten.vercel.app"}',
            updated_at = NOW()
        WHERE id = $1
        RETURNING id
      `, [inst.id])
      console.log('Updated:', updated)
    }
  }
  
  // Verify
  const { rows: verify } = await pool.query('SELECT id, uuid, raw_base_config, created_at, updated_at FROM auth.instances')
  console.log('\nVerificacao final:', JSON.stringify(verify, null, 2))

} catch (err) {
  console.error('Erro:', err.message)
} finally {
  await pool.end()
}
