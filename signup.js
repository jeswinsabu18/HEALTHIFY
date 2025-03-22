async function sendToMongoDB(userData) {
  try {
    const response = await fetch('http://localhost:5000/api/addUserToMongo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error('Failed to fetch');
    }

    const result = await response.json();
    console.log('✅ MongoDB Sync Successful:', result);
  } catch (error) {
    console.error('❌ MongoDB Sync Failed:', error);
  }
}

// ...existing code...

document.getElementById('signupForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const userData = {
    // ...existing code to gather user data...
  };
  await sendToMongoDB(userData);
});
