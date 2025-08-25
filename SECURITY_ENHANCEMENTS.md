# Security Enhancements Documentation

## Overview
This document outlines the comprehensive security enhancements implemented in the casting platform application to protect against common web vulnerabilities and ensure data integrity.

## Implemented Security Measures

### 1. Input Validation and Sanitization

#### Express Validator Integration
- **Location**: `server/middleware/security.js`
- **Purpose**: Validates and sanitizes all user inputs before processing
- **Features**:
  - Email validation with normalization
  - Password strength requirements (8+ chars, uppercase, lowercase, numbers, special chars)
  - Name validation (2-50 chars, letters only)
  - Phone number validation
  - URL validation for social media links
  - Text content length limits (1-1000 chars)

#### Input Sanitization
- **Location**: `server/middleware/security.js` - `sanitizeInput` function
- **Purpose**: Removes malicious HTML, scripts, and dangerous characters
- **Protection Against**:
  - XSS (Cross-Site Scripting) attacks
  - HTML injection
  - JavaScript injection
  - Iframe injection

### 2. CSRF (Cross-Site Request Forgery) Protection

#### CSRF Token Implementation
- **Location**: `server/middleware/security.js` - `generateCSRFToken`, `validateCSRFToken`
- **Purpose**: Prevents unauthorized cross-site requests
- **Implementation**:
  - Token generation on each request
  - Token validation for state-changing operations
  - Client-side token inclusion in headers

#### Client Integration
- **Location**: `client/src/contexts/AuthContext.js`
- **Features**:
  - Automatic CSRF token fetching
  - Token inclusion in all API requests
  - Token refresh mechanism

### 3. Rate Limiting and Speed Limiting

#### Rate Limiting Configuration
- **Location**: `server/middleware/security.js` - `rateLimiters`
- **Limits**:
  - General API: 100 requests per 15 minutes
  - Authentication: 10 login attempts per 15 minutes
  - Registration: 5 attempts per hour
  - File Upload: 20 uploads per 15 minutes

#### Speed Limiting
- **Location**: `server/middleware/security.js` - `speedLimiter`
- **Purpose**: Slows down requests after threshold to prevent abuse
- **Configuration**: 50 requests per 15 minutes, then 500ms delay per additional request

### 4. Security Headers

#### Enhanced Helmet Configuration
- **Location**: `server/middleware/security.js` - `helmetConfig`
- **Headers Implemented**:
  - Content Security Policy (CSP)
  - X-Frame-Options: DENY (prevents clickjacking)
  - X-Content-Type-Options: nosniff (prevents MIME sniffing)
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: restricts geolocation, microphone, camera

### 5. MongoDB Security

#### NoSQL Injection Protection
- **Location**: `server/middleware/security.js` - `mongoSanitize`
- **Purpose**: Prevents NoSQL injection attacks
- **Features**:
  - Removes `$` and `.` characters from user inputs
  - Sanitizes query parameters
  - Protects against operator injection

### 6. HTTP Parameter Pollution Protection

#### HPP (HTTP Parameter Pollution) Prevention
- **Location**: `server/middleware/security.js` - `hpp`
- **Purpose**: Prevents HTTP parameter pollution attacks
- **Features**:
  - Removes duplicate parameters
  - Keeps only the last occurrence of each parameter
  - Prevents parameter manipulation

### 7. Request Size Limiting

#### Payload Size Control
- **Location**: `server/middleware/security.js` - `limitRequestSize`
- **Limit**: 10MB maximum request size
- **Purpose**: Prevents large payload attacks and DoS attempts

### 8. Security Logging and Monitoring

#### Request Logging
- **Location**: `server/middleware/security.js` - `securityLogging`
- **Features**:
  - Comprehensive request logging
  - Suspicious activity detection
  - Performance monitoring
  - User tracking for security analysis

### 9. CORS Configuration

#### Enhanced CORS Settings
- **Location**: `server/index.js`
- **Configuration**:
  - Specific origin allowance
  - Credentials support
  - Method restrictions
  - Header restrictions including CSRF token support

## Usage Examples

### Adding Validation to Routes

```javascript
const { commonValidations, handleValidationErrors } = require('../middleware/security');

// Apply validation to route
router.post('/example', 
  [
    commonValidations.email,
    commonValidations.text,
    body('customField').isLength({ min: 1 }).withMessage('فیلد ضروری است')
  ],
  handleValidationErrors,
  async (req, res) => {
    // Route handler
  }
);
```

### CSRF Protection in Routes

```javascript
const { validateCSRFToken } = require('../middleware/security');

// Apply CSRF protection to state-changing operations
router.post('/update', validateCSRFToken, async (req, res) => {
  // Protected route handler
});
```

### Client-Side CSRF Token Usage

```javascript
import { useAuth } from '../contexts/AuthContext';

const { csrfToken, fetchCSRFToken } = useAuth();

// Token is automatically included in axios requests
// Manual token refresh if needed
await fetchCSRFToken();
```

## Security Best Practices

### 1. Environment Variables
- Store sensitive data in environment variables
- Use different secrets for development and production
- Regularly rotate secrets

### 2. Password Security
- Enforce strong password requirements
- Use bcrypt for password hashing
- Implement password reset with secure tokens

### 3. Session Management
- Use secure session configuration
- Implement session timeout
- Secure cookie settings

### 4. Error Handling
- Don't expose sensitive information in error messages
- Log security events for monitoring
- Implement proper error responses

### 5. Regular Updates
- Keep dependencies updated
- Monitor security advisories
- Regular security audits

## Monitoring and Maintenance

### Security Monitoring
- Monitor rate limiting violations
- Track failed authentication attempts
- Log suspicious activities
- Monitor for unusual traffic patterns

### Regular Maintenance
- Update security dependencies
- Review and update rate limits
- Audit access logs
- Test security measures

## Testing Security Measures

### Automated Testing
```javascript
// Example test for input validation
test('should reject invalid email', async () => {
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      email: 'invalid-email',
      password: 'ValidPass123!',
      role: 'talent',
      firstName: 'John',
      lastName: 'Doe'
    });
  
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('داده‌های ورودی نامعتبر است');
});
```

### Manual Testing Checklist
- [ ] Test XSS protection with script tags
- [ ] Verify CSRF token validation
- [ ] Test rate limiting behavior
- [ ] Check security headers
- [ ] Validate input sanitization
- [ ] Test file upload restrictions

## Future Enhancements

### Planned Security Features
1. **Two-Factor Authentication (2FA)**
2. **API Key Management**
3. **Advanced Threat Detection**
4. **Security Event Correlation**
5. **Automated Security Scanning**

### Security Roadmap
- Implement OAuth 2.0 integration
- Add security audit logging
- Implement IP-based blocking
- Add security dashboard for admins
- Implement automated vulnerability scanning

## Conclusion

The implemented security enhancements provide comprehensive protection against common web vulnerabilities while maintaining good user experience. Regular monitoring and updates are essential to maintain security posture as threats evolve.

For questions or security concerns, please contact the development team or create an issue in the project repository.
