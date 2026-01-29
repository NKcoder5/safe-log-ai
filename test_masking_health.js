const { maskLog } = require('./backend/services/presidioService');
const fs = require('fs');

const log = `SYSTEM ERROR: Health Records Service Unavailable
Timestamp: 2026-01-29 22:47:18
PatientID: PAT-334981
PatientName: Suresh M
DateOfBirth: 1999-08-12
RegisteredEmail: suresh.m@testmail.com
PortalUsername: suresh_m99
PortalPassword: Suresh@Health99
SessionKey: a93f7c1e4b8d22f
Origin: RecordAccessController.java:74`;

async function test() {
    const masked = await maskLog(log);
    fs.writeFileSync('e:\\Safe-ai\\test_output_health.txt', masked, 'utf8');
    console.log(masked);
}

test();
