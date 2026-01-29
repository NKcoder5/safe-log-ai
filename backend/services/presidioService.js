const axios = require("axios");

const PRESIDIO_URL = "http://localhost:5001/mask";

/**
 * Comprehensive masking for sensitive data
 * Preserves: file paths, function names, line numbers, error messages, stack traces, exception lines
 * Masks: PII, credentials, financial data, Indian identifiers, technical IDs (Order/TXN), and SQL data
 */
function selectiveMask(text) {
  if (typeof text !== "string") return "";

  let masked = text;

  // ========================================
  // 1. CREDENTIALS & SECRETS (STRENGTHENED)
  // ========================================

  // AWS Secret Access Keys (40 characters)
  masked = masked.replace(
    /\b[A-Za-z0-9/+=]{40}\b/g,
    (match) => (/[a-z]/.test(match) && /[A-Z]/.test(match) && /[/+=]/.test(match)) ? '<AWS_SECRET_KEY>' : match
  );

  // Labeled secrets (Password, Secret, etc.)
  // Added: EnteredPassword, RegisteredPassword, UserPassword, etc.
  masked = masked.replace(
    /\b(\w*Password|Passwd|SecretAccessKey|Secret|PrivateKey|private[_-]?key|api[_-]?secret|API\s*Key|AccessToken|AuthToken|SessionToken|JWT|Session[_-]?ID|CSRF[_-]?Token|Cookie|CVV|PIN|SSN|SocialSecurity)\s*[:=]\s*([^\s;]{4,})\b/gi,
    '$1: <SENSITIVE_DATA>'
  );

  // JSON password/secret
  masked = masked.replace(/"(password|secret|token|cvv|auth|credential|pin|ssn)"\s*:\s*"[^"]+"/gi, '"$1": "<MASKED>"');

  // Bearer Tokens & JWTs (generic detection for long b64-like strings or labeled)
  masked = masked.replace(/\b(Bearer|Token|Authorization|Session[_-]?Token)\s*[:=]?\s+([a-zA-Z0-9\._\-]{10,})\b/gi, '$1: <TOKEN>');

  // Specific JWT pattern detection (header.payload.signature)
  masked = masked.replace(/\beyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b/g, '<JWT_TOKEN>');

  // ========================================
  // 2. TECHNICAL IDENTIFIERS (STRENGTHENED)
  // ========================================

  // User & Account IDs (UserID, account_id, etc.)
  masked = masked.replace(
    /\b(User[_-]?ID|Account[_-]?ID|Profile[_-]?ID|Member[_-]?ID|Client[_-]?ID|Customer[_-]?ID|Sub[_-]?ID)\s*[:=]\s*([a-zA-Z0-9_-]{4,})\b/gi,
    '$1: <USER_ID>'
  );

  // Transaction IDs
  masked = masked.replace(
    /\b(Transaction\s*ID|txn[_-]?id|transaction[_-]?id|payment[_-]?id)\s*[:=]\s*['"]?([a-zA-Z0-9_-]{8,})['"]?/gi,
    '$1: <TXN_ID>'
  );
  masked = masked.replace(/\bTXN-[A-Z0-9-]{6,}\b/gi, '<TXN_ID>');

  // Order IDs
  masked = masked.replace(
    /\b(Order\s*ID|order[_-]?id|invoice[_-]?id|bill[_-]?id)\s*[:=]\s*['"]?([a-zA-Z0-9_-]{8,})['"]?/gi,
    '$1: <ORDER_ID>'
  );
  masked = masked.replace(/\bORD-[A-Z0-9-]{6,}\b/gi, '<ORDER_ID>');

  // General UUIDs / GUIDs
  masked = masked.replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '<GUID>');

  // Merchant & Payment IDs
  masked = masked.replace(/\b(rzrp|pay|txn|ch|pi|settl|sub|plan)_[a-zA-Z0-9]{10,}\b/g, '<PAYMENT_ID>');

  // Correlation & Trace IDs
  masked = masked.replace(
    /\b(Correlation\s*ID|trace[_-]?id|request[_-]?id|corr[_-]id|x-b3-traceid|x-request-id)\s*[:=]\s*['"]?([a-zA-Z0-9_-]{10,})['"]?/gi,
    '$1: <TRACE_ID>'
  );
  masked = masked.replace(/\bcorr-[a-zA-Z0-9-]{10,}\b/gi, '<TRACE_ID>');

  // ========================================
  // 3. FINANCIAL & PII
  // ========================================

  // Credit Card
  masked = masked.replace(
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    (match) => match.replace(/[\s-]/g, '').length === 16 ? '<CREDIT_CARD>' : match
  );

  // Aadhaar
  masked = masked.replace(
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    (match, offset, string) => {
      const cleaned = match.replace(/[\s-]/g, '');
      if (cleaned.length !== 12) return match;
      const context = string.substring(Math.max(0, offset - 20), offset).toLowerCase();
      if (context.includes('aadhaar') || context.includes('uid')) return '<AADHAAR>';
      return '<ID_NUMBER>';
    }
  );

  // PAN Card
  masked = masked.replace(/\b[A-Z]{5}\d{4}[A-Z]\b/g, '<PAN_CARD>');

  // Phone Numbers / Mobile / Contact
  // Using a more aggressive match for the value part when labeled
  masked = masked.replace(/\b(Phone|Mobile|Contact|WhatsApp|MobileNumber)\s*[:=]\s*([^\s,;]{8,18})\b/gi, '$1: <PHONE>');
  masked = masked.replace(/(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b/g, '<PHONE>');

  // Email
  masked = masked.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '<EMAIL>');

  // UPI IDs
  masked = masked.replace(/\b[\w.]+@(paytm|phonepe|googlepay|okaxis|okhdfc|okicici|oksbi|ybl|ibl|axl)\b/gi, '<UPI_ID>');

  // ========================================
  // 4. SQL VALUES
  // ========================================
  masked = masked.replace(
    /(VALUES|SET|WHERE)\s*\((.*?)\)/gi,
    (match, keyword, values) => {
      const maskedValues = values.replace(/'[^']*'|\d+(\.\d+)?/g, "'<SENSITIVE_DATA>'");
      return `${keyword} (${maskedValues})`;
    }
  );

  // IP Addresses
  masked = masked.replace(
    /\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/g,
    (match) => {
      const parts = match.split('.');
      return parts.every(p => parseInt(p) <= 255) ? '<IP_ADDRESS>' : match;
    }
  );

  // ========================================
  // 5. NAME & USERNAME MASKING (Labeled)
  // ========================================

  // Generic Username/Name labeling
  // Added: AccountUsername, MemberName, etc.
  masked = masked.replace(
    /\b(\w*Username|\w*UserName|Customer\s*Name|Card\s*Holder|Full\s*Name|DOB|DateOfBirth|BirthDate)\s*[:=]\s*([^\n\r,;]{2,})\b/gi,
    '$1: <MASKED_DATA>'
  );

  // Card Metadata (Last 4, bin, etc.)
  masked = masked.replace(
    /\b(Card[_-]?Last[_-]?Four|Account[_-]?Last[_-]?Four|Card[_-]?Number|Account[_-]?Number|Last4)\s*[:=]\s*(\d{4,16})\b/gi,
    '$1: <SENSITIVE_DATA>'
  );

  // Multi-word names (Title Case)
  masked = masked.replace(
    /\b(Name|User)\s*[:=]\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g,
    '$1: <FULL_NAME>'
  );

  return masked;
}

/**
 * Main entry point for log masking
 */
async function maskLog(rawLog) {
  if (typeof rawLog !== "string") return "";
  return selectiveMask(rawLog);
}

module.exports = {
  maskLog
};
