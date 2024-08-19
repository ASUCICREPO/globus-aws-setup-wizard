document.getElementById('next-button').addEventListener('click', async () => {
  console.log("Before ")
  const accessKey = document.getElementById('access-key').value;
  const secretKey = document.getElementById('secret-key').value;
  if (!accessKey || !secretKey) {
      document.getElementById('error-message').textContent = 'Please enter both AWS Access Key and Secret Key';
      return;
  }
  try {
    const credentials = {
      accessKey: accessKey, 
      secretKey: secretKey
    };
    await window.api.validateCredentials(accessKey, secretKey);
    console.log("Credentails verfication")
    await window.api.setCredentials(credentials);
    window.location.href = 'bucket.html';
  } catch (error) {
    console.log(error)
    document.getElementById('error-message').textContent = 'Invalid AWS credentials. Please try again.';
  }
});