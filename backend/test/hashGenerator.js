// hashGenerator.ts
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const plainPassword = process.env.ADMIN_PASSWORD;
if (!plainPassword) {
  console.error('❌ ADMIN_PASSWORD no está definido en .env');
  process.exit(1);
}

bcrypt.genSalt(10, (err, salt) => {
  if (err) throw err;

  bcrypt.hash(plainPassword, salt, (err, hash) => {
    if (err) throw err;

    console.log('🔐 Hash generado:');
    console.log(hash);
  });
});
