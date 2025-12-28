const axios = require("axios");

const PRESIDIO_URL = "http://localhost:5001/mask";

/**
 * Comprehensive masking for sensitive data
 * Preserves: file paths, function names, line numbers, error messages, stack traces, exception lines
 * Masks: PII, credentials, financial data, Indian-specific identifiers
 */
function selectiveMask(text) {
  if (typeof text !== "string") return "";

  let masked = text;

  // ========================================
  // CRITICAL: ORDER MATTERS!
  // More specific patterns must come before general ones
  // ========================================

  // ========================================
  // CREDENTIALS & SECRETS (MUST BE FIRST)
  // ========================================

  // 1. AWS Secret Access Keys (40 characters, base64-like)
  // Format: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
  masked = masked.replace(
    /\b[A-Za-z0-9/+=]{40}\b/g,
    (match) => {
      // Only mask if it looks like a secret (has mix of upper, lower, and special chars)
      if (/[a-z]/.test(match) && /[A-Z]/.test(match) && /[/+=]/.test(match)) {
        return '<AWS_SECRET_KEY>';
      }
      return match;
    }
  );

  // 2. Labeled secrets (SecretAccessKey:, Secret:, PrivateKey:, etc.)
  // This catches secrets in key-value format with various labels
  masked = masked.replace(
    /\b(SecretAccessKey|Secret|PrivateKey|private[_-]?key|api[_-]?secret)\s*[:=]\s*([A-Za-z0-9/+=_\-]{20,})\b/gi,
    '$1: <SECRET>'
  );

  // 3. Password in JSON (CRITICAL - must be early)
  masked = masked.replace(
    /"password"\s*:\s*"([^"]+)"/gi,
    '"password": "<PASSWORD>"'
  );

  // 4. CVV in JSON (must come before generic number masking)
  masked = masked.replace(
    /"cvv"\s*:\s*"?\d{3,4}"?/gi,
    '"cvv": "<CVV>"'
  );

  // 5. Card Expiry in JSON
  masked = masked.replace(
    /"expiry"\s*:\s*"?\d{2}\/\d{2}"?/gi,
    '"expiry": "<EXPIRY>"'
  );

  // 6. Card Number in JSON
  masked = masked.replace(
    /"cardNumber"\s*:\s*"([^"]+)"/gi,
    '"cardNumber": "<CREDIT_CARD>"'
  );

  // ========================================
  // IP ADDRESSES (BEFORE ADDRESS PATTERN)
  // ========================================

  // 5. IP Addresses (both plain and in key-value format)
  // MUST come before address pattern to avoid being caught by it
  masked = masked.replace(
    /\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/g,
    (match) => {
      // Validate it's a real IP (each octet <= 255)
      const parts = match.split('.');
      if (parts.every(p => parseInt(p) <= 255)) {
        return '<IP_ADDRESS>';
      }
      return match;
    }
  );

  // ========================================
  // INDIAN PII PATTERNS
  // ========================================

  // 6. Aadhaar Number (12 digits with optional spaces/dashes)
  // Format: 1234 5678 9012 or 1234-5678-9012 or 123456789012
  // MUST check context to avoid masking bank accounts
  masked = masked.replace(
    /\b(\d{4}[\s-]?\d{4}[\s-]?\d{4})\b/g,
    (match, p1, offset, string) => {
      const cleaned = match.replace(/[\s-]/g, '');

      // Only 12 digits could be Aadhaar
      if (cleaned.length !== 12) {
        return match;
      }

      // Check context - if preceded by "Aadhaar" label, it's definitely Aadhaar
      const before = string.substring(Math.max(0, offset - 20), offset);
      if (/aadhaar/i.test(before)) {
        return '<AADHAAR>';
      }

      // If preceded by "Bank Account" or "Account", it's a bank account
      if (/bank\s*account|account/i.test(before)) {
        return '<BANK_ACCOUNT>';
      }

      // If it has spaces/dashes in Aadhaar format (4-4-4), likely Aadhaar
      if (/\d{4}[\s-]\d{4}[\s-]\d{4}/.test(match)) {
        return '<AADHAAR>';
      }

      // Default: treat as bank account (safer for privacy)
      return '<BANK_ACCOUNT>';
    }
  );

  // 7. PAN Card (Format: ABCDE1234F)
  masked = masked.replace(
    /\b[A-Z]{5}\d{4}[A-Z]\b/g,
    '<PAN_CARD>'
  );

  // 8. Indian Phone Numbers (with +91 or without)
  // Format: +91 91234 56789, +91-9123456789, 9123456789, etc.
  masked = masked.replace(
    /\+91[\s-]?\d{5}[\s-]?\d{5}\b/g,
    '<PHONE>'
  );
  masked = masked.replace(
    /\b[6-9]\d{9}\b/g,
    '<PHONE>'
  );

  // 9. UPI ID (Format: username@bankname)
  masked = masked.replace(
    /\b[\w.]+@(paytm|phonepe|googlepay|okaxis|okhdfc|okicici|oksbi|okhdfcbank|ybl|ibl|axl)\b/gi,
    '<UPI_ID>'
  );

  // 10. Bank Account Numbers (typically 9-18 digits, but NOT 12 digits which could be Aadhaar)
  // This is now handled by the Aadhaar pattern above with context checking

  // 11. IFSC Code (Format: ABCD0001234)
  masked = masked.replace(
    /\b[A-Z]{4}0\d{6}\b/g,
    '<IFSC_CODE>'
  );

  // 12. Date of Birth (various formats)
  masked = masked.replace(
    /\b(Date of Birth|DOB|Birth Date)\s*:?\s*\d{4}-\d{2}-\d{2}\b/gi,
    '$1: <DATE_OF_BIRTH>'
  );
  masked = masked.replace(
    /\b(Date of Birth|DOB|Birth Date)\s*:?\s*\d{2}\/\d{2}\/\d{4}\b/gi,
    '$1: <DATE_OF_BIRTH>'
  );

  // 13. Full Address (lines containing address keywords, but NOT "IP Address:")
  masked = masked.replace(
    /^(.*(?:^|[^IP\s])(Address|address):\s*)(.+)$/gm,
    (match, prefix, keyword, content) => {
      // Don't mask if this is "IP Address:"
      if (/IP\s*Address/i.test(match)) {
        return match;
      }
      return prefix + '<ADDRESS>';
    }
  );

  // 14. Full Name (when labeled)
  masked = masked.replace(
    /\b(Full Name|Name|Customer Name)\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g,
    '$1: <FULL_NAME>'
  );

  // ========================================
  // FINANCIAL DATA
  // ========================================

  // 15. Credit Card Numbers (16 digits with optional spaces/dashes)
  masked = masked.replace(
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    (match) => {
      if (match.replace(/[\s-]/g, '').length === 16) {
        return '<CREDIT_CARD>';
      }
      return match;
    }
  );

  // ========================================
  // OTHER CREDENTIALS
  // ========================================

  // 16. Emails (preserve domain for debugging)
  masked = masked.replace(
    /\b([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/g,
    '<EMAIL_USER>@$2'
  );

  // 17. Passwords in connection strings
  masked = masked.replace(
    /(mongodb|mysql|postgres|redis):\/\/([^:]+):([^@]+)@/gi,
    '$1://$2:<PASSWORD>@'
  );

  // 18. API keys and tokens (long alphanumeric strings)
  masked = masked.replace(
    /\b(api[_-]?key|token|secret|auth[_-]?token|access[_-]?token|bearer)\s*[:=]\s*['"]?([A-Za-z0-9_\-]{20,})['"]?/gi,
    '$1=<API_KEY>'
  );

  // 19. JWT tokens (three base64 parts separated by dots)
  masked = masked.replace(
    /\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
    '<JWT_TOKEN>'
  );

  // 20. AWS access keys
  masked = masked.replace(
    /\b(AKIA[0-9A-Z]{16})\b/g,
    '<AWS_KEY>'
  );

  // 21. Generic secrets in key=value format
  masked = masked.replace(
    /\b(password|passwd|pwd|secret|private[_-]?key)\s*[:=]\s*['"]?([^\s'"]+)['"]?/gi,
    '$1=<SECRET>'
  );

  // ========================================
  // ID MASKS (PAYMENT, USER, ETC.)
  // ========================================

  // 22. Payment/Transaction IDs (Stripe-like prefixes or labeled)
  // Matches: pi_123..., ch_123..., txn_123...
  masked = masked.replace(
    /\b((?:pi|ch|py|txn|re)_[a-zA-Z0-9]{10,})\b/g,
    '<PAYMENT_ID>'
  );
  // Matches: payment_id=123, txn_id: "abc"
  masked = masked.replace(
    /\b(payment[_-]?id|txn[_-]?id|transaction[_-]?id)\s*[:=]\s*['"]?([a-zA-Z0-9_.-]+)['"]?/gi,
    '$1=<PAYMENT_ID>'
  );

  // 23. User/Customer IDs (Stripe-like prefixes or labeled)
  // Matches: usr_123..., cus_123...
  masked = masked.replace(
    /\b((?:usr|cus|acc)_[a-zA-Z0-9]{10,})\b/g,
    '<USER_ID>'
  );
  // Matches: user_id=123, customer_id: "abc"
  masked = masked.replace(
    /\b(user[_-]?id|customer[_-]?id|account[_-]?id|uid)\s*[:=]\s*['"]?([a-zA-Z0-9_.-]+)['"]?/gi,
    '$1=<USER_ID>'
  );

  // ========================================
  // PRESERVE (DO NOT MASK)
  // ========================================
  // - File paths (e.g., UPIService.java:142)
  // - Function names (e.g., process, updateFunctionComponent)
  // - Error messages and exception names
  // - Stack trace lines (e.g., "at com.safeai.payment.UPIService.process")
  // - Line numbers
  // - Transaction IDs (e.g., TXN98237465)
  // - Currency amounts (e.g., ₹12,500)

  return masked;
}

/**
 * Try Presidio first, fall back to selective masking
 */
async function maskLog(rawLog) {
  if (typeof rawLog !== "string") return "";

  // Use selective masking instead of Presidio
  // Presidio is too aggressive and masks everything
  return selectiveMask(rawLog);

  /* Presidio disabled - too aggressive
  try {
    const response = await axios.post(
      PRESIDIO_URL,
      { text: rawLog },
      { timeout: 4000 }
    );

    if (response?.data?.maskedText) {
      return response.data.maskedText;
    }

    return selectiveMask(rawLog);
  } catch (err) {
    return selectiveMask(rawLog);
  }
  */
}

module.exports = {
  maskLog
};
