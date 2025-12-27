const { maskLog } = require('../services/presidioService');

console.log('='.repeat(80));
console.log('TESTING LOG MASKING WITH USER\'S ERROR LOGS');
console.log('='.repeat(80));

// Test Case 1: First error log from user
const errorLog1 = `2025-03-21 14:32:10 ERROR [AuthService]
User authentication failed

User Details:
Name: Ramesh Kumar
Email: ramesh.kumar98@gmail.com
Phone: +91-9876543210
Aadhaar: 4829 7732 9104
IP Address: 192.168.1.24

Request Payload:
{
  "username": "ramesh.kumar98@gmail.com",
  "password": "Ramesh@123",
  "cardNumber": "4111-1111-1111-1111",
  "cvv": "345",
  "expiry": "08/27"
}

Exception:
java.lang.SecurityException: Invalid credentials provided for user ramesh.kumar98@gmail.com
	at com.safeai.auth.LoginService.login(LoginService.java:87)`;

// Test Case 2: Second error log from user
const errorLog2 = `2025-03-22 09:47:55 WARN [PaymentGateway]
Transaction processing failed

Customer Info:
Full Name: Anjali Mehta
Email ID: anjali.mehta22@outlook.com
Mobile: +91 91234 56789
PAN Number: BQZPM1234K
Date of Birth: 1999-06-14
Address: 14, MG Road, Bengaluru, Karnataka - 560001

Transaction Details:
Transaction ID: TXN98237465
UPI ID: anjali.mehta@okhdfcbank
Bank Account: 034567890123
IFSC Code: HDFC0001234
Amount: ₹12,500

System Error:
org.payment.exception.InsufficientBalanceException:
Account 034567890123 has insufficient balance
	at com.safeai.payment.UPIService.process(UPIService.java:142)`;

// Test Case 3: AWS S3 error log from user
const errorLog3 = `2025-03-26 03:11:08 ERROR [S3UploadService]
Failed to upload backup file to cloud storage

Environment: production
Service: data-backup-worker
Region: ap-south-1

AWS Credentials:
AccessKeyId: AKIA4X7YH2ZQWEXAMPLE
SecretAccessKey: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

User Context:
Admin Name: Suresh Narayanan
Admin Email: suresh.narayanan@companymail.com
Admin Phone: +91-9988776655
Source IP: 103.21.45.198

File Details:
Bucket Name: company-prod-backups
Object Key: db-backups/finance/payroll_march_2025.sql
File Size: 248 MB

Exception:
com.amazonaws.services.s3.model.AmazonS3Exception: Access Denied (Service: Amazon S3; Status Code: 403; Error Code: AccessDenied)
	at com.amazonaws.services.s3.AmazonS3Client.putObject(AmazonS3Client.java:1682)
	at com.safeai.backup.S3UploadService.upload(S3UploadService.java:94)
	at com.safeai.backup.BackupScheduler.run(BackupScheduler.java:47)`;

async function runTests() {
    console.log('\n' + '─'.repeat(80));
    console.log('TEST 1: Authentication Error Log');
    console.log('─'.repeat(80));

    const masked1 = await maskLog(errorLog1);
    console.log('\n📝 ORIGINAL LOG:');
    console.log(errorLog1);
    console.log('\n🔒 MASKED LOG:');
    console.log(masked1);

    // Verify sensitive data is masked
    console.log('\n✅ VERIFICATION:');
    const checks1 = [
        { name: 'Aadhaar masked', pass: !masked1.includes('4829 7732 9104') && masked1.includes('<AADHAAR>') },
        { name: 'Password masked', pass: !masked1.includes('Ramesh@123') && masked1.includes('<PASSWORD>') },
        { name: 'CVV masked', pass: !masked1.includes('"cvv": "345"') && masked1.includes('<CVV>') },
        { name: 'Credit card masked', pass: !masked1.includes('4111-1111-1111-1111') && masked1.includes('<CREDIT_CARD>') },
        { name: 'IP address masked', pass: !masked1.includes('192.168.1.24') && masked1.includes('<IP_ADDRESS>') },
        { name: 'Phone masked', pass: !masked1.includes('9876543210') && masked1.includes('<PHONE>') },
        { name: 'Email domain preserved', pass: masked1.includes('@gmail.com') && !masked1.includes('ramesh.kumar98@gmail.com') },
        { name: 'Stack trace preserved', pass: masked1.includes('LoginService.java:87') },
        { name: 'Exception preserved', pass: masked1.includes('java.lang.SecurityException') }
    ];

    checks1.forEach(check => {
        console.log(`  ${check.pass ? '✅' : '❌'} ${check.name}`);
    });

    console.log('\n' + '─'.repeat(80));
    console.log('TEST 2: Payment Gateway Error Log');
    console.log('─'.repeat(80));

    const masked2 = await maskLog(errorLog2);
    console.log('\n📝 ORIGINAL LOG:');
    console.log(errorLog2);
    console.log('\n🔒 MASKED LOG:');
    console.log(masked2);

    // Verify sensitive data is masked
    console.log('\n✅ VERIFICATION:');
    const checks2 = [
        { name: 'Full name masked', pass: !masked2.includes('Anjali Mehta') && masked2.includes('<FULL_NAME>') },
        { name: 'Email domain preserved', pass: masked2.includes('@outlook.com') && !masked2.includes('anjali.mehta22@outlook.com') },
        { name: 'Phone masked', pass: !masked2.includes('91234 56789') && masked2.includes('<PHONE>') },
        { name: 'PAN masked', pass: !masked2.includes('BQZPM1234K') && masked2.includes('<PAN_CARD>') },
        { name: 'DOB masked', pass: !masked2.includes('1999-06-14') && masked2.includes('<DATE_OF_BIRTH>') },
        { name: 'Address masked', pass: !masked2.includes('14, MG Road, Bengaluru') && masked2.includes('<ADDRESS>') },
        { name: 'UPI ID masked', pass: !masked2.includes('anjali.mehta@okhdfcbank') && masked2.includes('<UPI_ID>') },
        { name: 'Bank account masked', pass: !masked2.includes('034567890123') && masked2.includes('<BANK_ACCOUNT>') },
        { name: 'IFSC masked', pass: !masked2.includes('HDFC0001234') && masked2.includes('<IFSC_CODE>') },
        { name: 'Transaction ID preserved', pass: masked2.includes('TXN98237465') },
        { name: 'Amount preserved', pass: masked2.includes('₹12,500') },
        { name: 'Stack trace preserved', pass: masked2.includes('UPIService.java:142') },
        { name: 'Exception preserved', pass: masked2.includes('InsufficientBalanceException') }
    ];

    checks2.forEach(check => {
        console.log(`  ${check.pass ? '✅' : '❌'} ${check.name}`);
    });

    console.log('\n' + '─'.repeat(80));
    console.log('TEST 3: AWS S3 Upload Error Log');
    console.log('─'.repeat(80));

    const masked3 = await maskLog(errorLog3);
    console.log('\n📝 ORIGINAL LOG:');
    console.log(errorLog3);
    console.log('\n🔒 MASKED LOG:');
    console.log(masked3);

    // Verify sensitive data is masked
    console.log('\n✅ VERIFICATION:');
    const checks3 = [
        { name: 'AWS AccessKeyId masked', pass: !masked3.includes('AKIA4X7YH2ZQWEXAMPLE') && masked3.includes('<AWS_KEY>') },
        { name: 'AWS SecretAccessKey masked', pass: !masked3.includes('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY') && (masked3.includes('<AWS_SECRET_KEY>') || masked3.includes('<SECRET>')) },
        { name: 'Admin name masked', pass: !masked3.includes('Suresh Narayanan') && masked3.includes('<FULL_NAME>') },
        { name: 'Email domain preserved', pass: masked3.includes('@companymail.com') && !masked3.includes('suresh.narayanan@companymail.com') },
        { name: 'Phone masked', pass: !masked3.includes('9988776655') && masked3.includes('<PHONE>') },
        { name: 'IP address masked', pass: !masked3.includes('103.21.45.198') && masked3.includes('<IP_ADDRESS>') },
        { name: 'Bucket name preserved', pass: masked3.includes('company-prod-backups') },
        { name: 'File path preserved', pass: masked3.includes('db-backups/finance/payroll_march_2025.sql') },
        { name: 'Stack trace preserved', pass: masked3.includes('S3UploadService.java:94') },
        { name: 'Exception preserved', pass: masked3.includes('AmazonS3Exception') }
    ];

    checks3.forEach(check => {
        console.log(`  ${check.pass ? '✅' : '❌'} ${check.name}`);
    });

    // Summary
    const allChecks = [...checks1, ...checks2, ...checks3];
    const passed = allChecks.filter(c => c.pass).length;
    const total = allChecks.length;

    console.log('\n' + '='.repeat(80));
    console.log(`SUMMARY: ${passed}/${total} checks passed`);
    console.log('='.repeat(80));

    if (passed === total) {
        console.log('✅ ALL TESTS PASSED! Masking is working correctly.');
    } else {
        console.log('❌ SOME TESTS FAILED! Please review the output above.');
    }
}

runTests().catch(console.error);
