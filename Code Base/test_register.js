const fetch = require('node-fetch');
const readline = require('readline');

const prompt = (query) => new Promise((resolve) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question(query, (answer) => {
    rl.close();
    resolve(answer.trim());
  });
});

const baseUrl = 'http://localhost:3000';

async function testRegister(userData, testName = '') {
  if (testName) console.log(`\n[${testName}]`);
  console.log(`Testing registration for: ${userData.email}`);


  if (userData.password !== userData.confirmPassword) {
    console.log('FAILED: Passwords do not match (client-side validation)');
    return;
  }

  const { confirmPassword, ...dataToSend } = userData;

  try {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend)
    });

    const responseText = await res.text();
    let result;
    
    try {
      result = JSON.parse(responseText);
    } catch {
      result = responseText;
    }

    if (!res.ok) {
      console.log(`FAILED: ${result}`);
      return;
    }

    console.log(` SUCCESS: Registered user ${userData.email}`);
    console.log("Server response:", result);

  } catch (err) {
    console.error(`FAILED: Network error -> ${err.message}`);
  }
}

(async () => {

  await testRegister({
    firstName: "Test",
    lastName: "User",
    email: "mismatch@example.com",
    password: "password123",
    confirmPassword: "different123",
    phoneNumber: "1234567890",
    address: {
      street: "123 Test St",
      city: "Testville",
      state: "TS",
      postalCode: "12345",
      country: "Testland"
    },
    userType: "buyer",
    dataConsent: true
  }, "Password Mismatch Test");


  const randomEmail = `testuser${Math.floor(Math.random() * 10000)}@example.com`;
  await testRegister({
    firstName: "Test",
    lastName: "User",
    email: randomEmail,
    password: "securePassword123",
    confirmPassword: "securePassword123",
    phoneNumber: "1234567890",
    address: {
      street: "123 Test St",
      city: "Testville",
      state: "TS",
      postalCode: "12345",
      country: "Testland"
    },
    userType: "buyer",
    dataConsent: true
  }, "Successful Registration Test");


  await testRegister({
    firstName: "Duplicate",
    lastName: "Email",
    email: randomEmail, 
    password: "anotherPassword",
    confirmPassword: "anotherPassword",
    phoneNumber: "9876543210",
    address: {
      street: "456 Duplicate Ave",
      city: "Testville",
      state: "TS",
      postalCode: "12345",
      country: "Testland"
    },
    userType: "seller",
    dataConsent: false
  }, "Duplicate Email Test");


  await testRegister({
    firstName: "Incomplete",
    email: "incomplete@example.com",
    password: "test123",
    confirmPassword: "test123",

    userType: "buyer",
    dataConsent: true
  }, "Incomplete Data Test");
})();