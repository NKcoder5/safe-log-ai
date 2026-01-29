const { maskLog } = require('./backend/services/presidioService');
const fs = require('fs');

const log = `CRITICAL ERROR: Payment Gateway Failure
Timestamp: 2026-01-29 21:12:33
UserID: U-5589012
CustomerName: Anil Ramesh
EmailAddress: anil.ramesh@domain.com
AccountUsername: anil_r
AccountPassword: Anil@12345
CardLastFour: 4821
BillingIP: 172.16.4.88
Trace: PaymentProcessor.process(PaymentProcessor.java:203)`;

async function test() {
    const masked = await maskLog(log);
    fs.writeFileSync('e:\\Safe-ai\\test_output_fail.txt', masked, 'utf8');
    console.log(masked);
}

test();
