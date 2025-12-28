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
  // 1. CREDENTIALS & SECRETS (MUST BE FIRST)
  // ========================================

  // AWS Secret Access Keys (40 characters)
  masked = masked.replace(
    /\b[A-Za-z0-9/+=]{40}\b/g,
    (match) => (/[a-z]/.test(match) && /[A-Z]/.test(match) && /[/+=]/.test(match)) ? '<AWS_SECRET_KEY>' : match
  );

  // Labeled secrets (Secret:, PrivateKey:, etc.)
  masked = masked.replace(
    /\b(SecretAccessKey|Secret|PrivateKey|private[_-]?key|api[_-]?secret|API\s*Key)\s*[:=]\s*([A-Za-z0-9/+=_\-]{16,})\b/gi,
    '$1: <SECRET>'
  );

  // JSON password/secret
  masked = masked.replace(/"(password|secret|token|cvv)"\s*:\s*"[^"]+"/gi, '"$1": "<MASKED>"');

  // ========================================
  // 2. TECHNICAL IDENTIFIERS (NEW: Order IDs, Transaction IDs, etc.)
  // ========================================

  // Transaction IDs (TXN-..., transaction_id, etc.)
  masked = masked.replace(
    /\b(Transaction\s*ID|txn[_-]?id|transaction[_-]?id)\s*[:=]\s*['"]?([a-zA-Z0-9_-]{8,})['"]?/gi,
    '$1: <TXN_ID>'
  );
  masked = masked.replace(/\bTXN-[A-Z0-9-]{6,}\b/g, '<TXN_ID>');

  // Order IDs (ORD-..., order_id, etc.)
  masked = masked.replace(
    /\b(Order\s*ID|order[_-]?id)\s*[:=]\s*['"]?([a-zA-Z0-9_-]{8,})['"]?/gi,
    '$1: <ORDER_ID>'
  );
  masked = masked.replace(/\bORD-[A-Z0-9-]{6,}\b/g, '<ORDER_ID>');

  // Merchant & Payment IDs (rzrp_..., pay_..., etc.)
  masked = masked.replace(/\b(rzrp|pay|txn|ch|pi|settl)_[a-zA-Z0-9]{10,}\b/g, '<PAYMENT_ID>');

  // Correlation & Trace IDs
  masked = masked.replace(
    /\b(Correlation\s*ID|trace[_-]?id|request[_-]?id|corr[_-]id)\s*[:=]\s*['"]?([a-zA-Z0-9_-]{10,})['"]?/gi,
    '$1: <TRACE_ID>'
  );
  masked = masked.replace(/\bcorr-[a-zA-Z0-9-]{10,}\b/gi, '<TRACE_ID>');

  // ========================================
  // 3. FINANCIAL & PII
  // ========================================

  // Credit Card (16 digits) - MUST come before Aadhaar (12 digits)
  masked = masked.replace(
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    (match) => match.replace(/[\s-]/g, '').length === 16 ? '<CREDIT_CARD>' : match
  );

  // Aadhaar (12 digits)
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

  // Phone Numbers (Indian Context)
  masked = masked.replace(/(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b/g, '<PHONE>');

  // Email
  masked = masked.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '<EMAIL>');

  // UPI IDs
  masked = masked.replace(/\b[\w.]+@(paytm|phonepe|googlepay|okaxis|okhdfc|okicici|oksbi|ybl|ibl|axl)\b/gi, '<UPI_ID>');

  // ========================================
  // 4. SQL VALUES (NEW: Mask data inside SQL)
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
  // 5. NAME MASKING (Labled only)
  // ========================================
  masked = masked.replace(
    /\b(Customer\s*Name|Name|Card\s*Holder|User)\s*[:=]\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g,
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
