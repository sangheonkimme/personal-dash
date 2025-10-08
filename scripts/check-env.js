#!/usr/bin/env node

/**
 * 환경변수 검증 스크립트
 * 프로덕션 빌드 전에 필수 환경변수가 설정되어 있는지 확인합니다.
 */

const requiredEnvVars = {
  // Database
  DATABASE_URL: {
    description: 'PostgreSQL database connection string',
    example: 'postgresql://user:password@localhost:5432/dbname',
  },

  // NextAuth
  NEXTAUTH_URL: {
    description: 'NextAuth base URL (프로덕션 도메인)',
    example: 'https://yourdomain.com',
  },
  NEXTAUTH_SECRET: {
    description: 'NextAuth secret key (openssl rand -base64 32)',
    example: 'random-secret-key-here',
  },

  // Google OAuth
  GOOGLE_CLIENT_ID: {
    description: 'Google OAuth Client ID',
    example: 'xxxxx.apps.googleusercontent.com',
  },
  GOOGLE_CLIENT_SECRET: {
    description: 'Google OAuth Client Secret',
    example: 'GOCSPX-xxxxx',
  },

  // App Settings
  NODE_ENV: {
    description: 'Node environment',
    example: 'production',
    optional: false,
  },
};

const warnings = [];
const errors = [];

console.log('🔍 환경변수 검증 중...\n');

// 환경변수 검증
Object.entries(requiredEnvVars).forEach(([key, config]) => {
  const value = process.env[key];

  if (!value || value.trim() === '') {
    if (config.optional) {
      warnings.push(`⚠️  ${key}: 설정되지 않음 (선택사항)`);
      console.log(`⚠️  ${key}: 설정되지 않음 (선택사항)`);
      console.log(`   설명: ${config.description}`);
      console.log(`   예시: ${config.example}\n`);
    } else {
      errors.push(`❌ ${key}: 필수 환경변수가 설정되지 않았습니다`);
      console.log(`❌ ${key}: 필수 환경변수가 설정되지 않았습니다`);
      console.log(`   설명: ${config.description}`);
      console.log(`   예시: ${config.example}\n`);
    }
  } else {
    console.log(`✅ ${key}: 설정됨`);

    // 추가 검증
    if (key === 'DATABASE_URL' && !value.startsWith('postgresql://')) {
      warnings.push(`⚠️  ${key}: PostgreSQL 연결 문자열이 아닌 것 같습니다`);
      console.log(`   ⚠️  PostgreSQL 연결 문자열이 아닌 것 같습니다\n`);
    } else if (key === 'NEXTAUTH_URL' && !value.startsWith('http')) {
      errors.push(`❌ ${key}: 올바른 URL 형식이 아닙니다`);
      console.log(`   ❌ 올바른 URL 형식이 아닙니다\n`);
    } else if (key === 'NEXTAUTH_SECRET' && value.length < 32) {
      warnings.push(`⚠️  ${key}: 시크릿 키가 너무 짧습니다 (최소 32자 권장)`);
      console.log(`   ⚠️  시크릿 키가 너무 짧습니다 (최소 32자 권장)\n`);
    } else if (key === 'NODE_ENV' && !['development', 'production', 'test'].includes(value)) {
      warnings.push(`⚠️  ${key}: 올바른 값이 아닙니다 (development/production/test)`);
      console.log(`   ⚠️  올바른 값이 아닙니다 (development/production/test)\n`);
    } else {
      console.log('');
    }
  }
});

// 결과 출력
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (errors.length > 0) {
  console.log('❌ 환경변수 검증 실패!\n');
  console.log('다음 필수 환경변수를 설정해주세요:\n');
  errors.forEach((error) => console.log(error));
  console.log('\n.env 파일을 생성하거나 환경변수를 설정한 후 다시 시도하세요.');
  console.log('예시: cp .env.example .env\n');
  process.exit(1);
}

if (warnings.length > 0) {
  console.log('⚠️  경고 사항:\n');
  warnings.forEach((warning) => console.log(warning));
  console.log('');
}

console.log('✅ 환경변수 검증 완료!\n');
process.exit(0);
