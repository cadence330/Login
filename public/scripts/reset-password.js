const crypto = require('crypto');

// Generate a cryptographically secure random token
function generateResetPassword() {
  resetPassword = crypto.randomBytes(20).toString('hex');
  return resetPassword;
}

module.exports = generateResetPassword;

// Example usage
// const resetToken = generateResetPassword();
// console.log('Generated Token:', resetToken);