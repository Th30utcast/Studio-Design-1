const fetch = require('node-fetch');
const readline = require('readline');

// Utility to prompt user input from terminal
const prompt = (query) => new Promise((resolve) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question(query, (answer) => {
    rl.close();
    resolve(answer.trim());
  });
});

const baseUrl = 'http://localhost:3000';

async function testLogin(email, password) {
  console.log(`\nTesting login for: ${email}`);

  try {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await res.json();

    if (!res.ok) {
      console.log(`❌ FAILED: ${result.error || 'Unknown error'}`);
      return;
    }

    if (result.step === "2fa-required") {
      console.log("2FA required – code should be visible in the terminal logs from backend.");
      const code = await prompt("Enter the 2FA code shown in terminal: ");

      const verifyRes = await fetch(`${baseUrl}/api/auth/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      const verifyResult = await verifyRes.json();

      if (!verifyRes.ok) {
        console.error(`❌ FAILED: ${verifyResult.error || 'Unable to verify 2FA code'}`);
        return;
      }

      if (verifyResult.step === 'success') {
        console.log(`✅ SUCCESS: Logged in as ${verifyResult.user.email}`);
      } else {
        console.log(`❌ FAILED: 2FA failed - ${verifyResult.error || 'Unexpected error'}`);
      }

    } else if (result.step === "success") {
      console.log(`✅ SUCCESS: Logged in as ${result.user.email}`);
    } else {
      console.log("❌ FAILED: Unknown response from server.");
    }

  } catch (err) {
    console.error(`❌ FAILED: Network or server error -> ${err.message}`);
  }
}

(async () => {
  await testLogin("does_not_exist@gmail.com", "123");
  await testLogin("does_exist@gmail.com", "123");
})();
