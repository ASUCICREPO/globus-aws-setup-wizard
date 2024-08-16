const createNewRadio = document.querySelector('input[value="new"]');
const useExistingRadio = document.querySelector('input[value="existing"]');
const bucketNameInput = document.getElementById('bucket-name');

const statusMessage = document.getElementById('status-message');

function generateUniqueBucketName() {
    const prefix = 'my-globus-bucket-';
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${prefix}${timestamp}-${randomString}`;
}

function updateBucketNameInput() {
    if (createNewRadio.checked) {
        bucketNameInput.value = generateUniqueBucketName();
        bucketNameInput.readOnly = true;
    } else {
        bucketNameInput.value = '';
        bucketNameInput.readOnly = false;
    }
}

createNewRadio.addEventListener('change', updateBucketNameInput);
useExistingRadio.addEventListener('change', updateBucketNameInput);
updateBucketNameInput();

try {
    
} catch (error) {
    statusMessage.textContent = `Error: ${error.message}`;
}
document.getElementById('create-resources-button').addEventListener('click', async () => {
    event.preventDefault();
    const bucketName = bucketNameInput.value;
    const isNewBucket = createNewRadio.checked;
    try {
        const credentials = await window.api.getCredentials();
        accessKey = credentials.accessKey;
        secretKey = credentials.secretKey;
        const result = await window.api.createResources(accessKey, secretKey, bucketName, isNewBucket);
        await window.api.setGlobusCredentials(result);
        window.location.href = 'summary.html';

    } catch (error) {
        document.getElementById('status-message').textContent = `Error: ${error.message}`;
    }
});
