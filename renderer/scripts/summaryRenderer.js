function copyToClipboard(id) {
  const textToCopy = document.getElementById(id).value;
  navigator.clipboard.writeText(textToCopy);
  document.getElementById('status-message').textContent = `Copied to clipboard: ${id}`;
}

document.getElementById('open-globus-button').addEventListener('click', () => {
  window.open('https://app.globus.org/collections', '_blank');
});

document.getElementById('close-app-button').addEventListener('click', () => {
  window.close();
});

window.addEventListener('DOMContentLoaded', async function() {
  const globusCredentials = await window.api.getGlobusCredentials();
  document.getElementById('access-key').value = globusCredentials.globusAccessKey;
  document.getElementById('secret-key').value = globusCredentials.globusSecretKey;
  document.getElementById('bucket-name').value = globusCredentials.bucketName;
});