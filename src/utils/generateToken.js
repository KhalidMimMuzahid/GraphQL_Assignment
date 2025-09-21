/**
 * Token Generation Utility
 * Generate JWT tokens for development and testing
 */

const authService = require('../core/auth');
const logger = require('../core/logging/logger');

/**
 * Generate a sample JWT token
 * @param {Object} userData - User data for token
 * @returns {string} JWT token
 */
function generateSampleToken(userData = {}) {
  const defaultUser = {
    userId: 'sample-user-123',
    email: 'user@example.com',
    role: 'user',
    ...userData
  };
  
  const token = authService.generateSampleToken(defaultUser);
  
  logger.info('Token generated successfully', {
    userId: defaultUser.userId,
    email: defaultUser.email,
    role: defaultUser.role
  });
  
  return token;
}

/**
 * Generate multiple tokens for different roles
 * @returns {Object} Tokens for different roles
 */
function generateRoleTokens() {
  const tokens = {
    admin: generateSampleToken({
      userId: 'admin-123',
      email: 'admin@example.com',
      role: 'admin'
    }),
    user: generateSampleToken({
      userId: 'user-123',
      email: 'user@example.com',
      role: 'user'
    }),
    guest: generateSampleToken({
      userId: 'guest-123',
      email: 'guest@example.com',
      role: 'guest'
    })
  };
  
  return tokens;
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'admin':
      console.log('🔑 Admin Token:');
      console.log(generateSampleToken({
        userId: 'admin-123',
        email: 'admin@example.com',
        role: 'admin'
      }));
      break;
      
    case 'user':
      console.log('🔑 User Token:');
      console.log(generateSampleToken({
        userId: 'user-123',
        email: 'user@example.com',
        role: 'user'
      }));
      break;
      
    case 'guest':
      console.log('🔑 Guest Token:');
      console.log(generateSampleToken({
        userId: 'guest-123',
        email: 'guest@example.com',
        role: 'guest'
      }));
      break;
      
    case 'all':
      const tokens = generateRoleTokens();
      console.log('🔑 Generated Tokens for All Roles:');
      console.log('\n👑 Admin Token:');
      console.log(tokens.admin);
      console.log('\n👤 User Token:');
      console.log(tokens.user);
      console.log('\n👥 Guest Token:');
      console.log(tokens.guest);
      break;
      
    default:
      const token = generateSampleToken();
      console.log('🔑 Generated JWT Token:');
      console.log(token);
      console.log('\n📋 Use this token in your requests:');
      console.log(`Authorization: Bearer ${token}`);
      console.log('\n🌐 Test the API with curl:');
      console.log(`curl -X POST http://localhost:4000/graphql \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${token}" \\
  -d '{"query": "query { health { status timestamp } }"}'`);
      console.log('\n💡 Available commands:');
      console.log('  node src/utils/generateToken.js admin  - Generate admin token');
      console.log('  node src/utils/generateToken.js user   - Generate user token');
      console.log('  node src/utils/generateToken.js guest  - Generate guest token');
      console.log('  node src/utils/generateToken.js all    - Generate all role tokens');
  }
}

module.exports = {
  generateSampleToken,
  generateRoleTokens
};
