const { contextBridge, ipcRenderer } = require('electron');
const { STSClient, GetCallerIdentityCommand } = require("@aws-sdk/client-sts");
const { S3Client, HeadBucketCommand, CreateBucketCommand, ListBucketsCommand, GetBucketLocationCommand} = require("@aws-sdk/client-s3");
const { IAMClient, CreateUserCommand, CreatePolicyCommand, AttachUserPolicyCommand, CreateAccessKeyCommand } = require("@aws-sdk/client-iam");

const s3Client1 = new S3Client({});

async function listBuckets() {
  try {
    const data = await s3Client1.send(new ListBucketsCommand({}));
    return data.Buckets.map(bucket => bucket.Name);
  } catch (error) {
    console.error("Error listing buckets:", error);
    return [];
  }
}

async function getBucketLocation(bucketName) {
  try {
    const data = await s3Client1.send(new GetBucketLocationCommand({ Bucket: bucketName }));
    return data.LocationConstraint || "us-east-1"; // Default region if location is not specified
  } catch (error) {
    console.error(`Error getting location for bucket ${bucketName}:`, error);
    return null;
  }
}

contextBridge.exposeInMainWorld('api', {
  validateCredentials: async (accessKey, secretKey) => {
    try {
      const stsClient = new STSClient({
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        },
        region: 'us-east-2'
      });
      await stsClient.send(new GetCallerIdentityCommand({}));
      return true;
    } catch (error) {
      console.error('Credential validation error:', error);
      throw new Error('Invalid AWS credentials');
    }
  },

  setCredentials: async (credentials) => {
    try{
      ipcRenderer.send('set-user-credentials', credentials);
    }
    catch(error){
      throw new Error('Unable to set credentails');
    }
  },

  getCredentials: async () => ipcRenderer.invoke('get-user-credentials'),

  setGlobusCredentials: async (resultCredentials) => {
    try{
      ipcRenderer.send('set-globus-credentials', resultCredentials);
    }
    catch(error){
      throw new Error('Unable to set Result credentails');
    }
  },

  getGlobusCredentials: async () => ipcRenderer.invoke('get-globus-credentials'),

  // validateBucketName: async (accessKey, secretKey, bucketName) => {
  //   try {
  //     const s3Client = new S3Client({
  //       credentials: {
  //         accessKeyId: accessKey,
  //         secretAccessKey: secretKey,
  //       },
  //       region: 'us-east-2'
  //     });

  //     await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
  //     return true;
  //   } catch (error) {
  //     if (error.name === 'NotFound') {
  //       throw new Error(`Error ${bucketName} doesn't exist`);
  //     } else if (error.name === 'Forbidden') {
  //       throw new Error(`Bucket ${bucketName} exists but is not accessible with these credentials`);
  //     } else {
  //       console.error('Bucket validation error:', error);
  //       throw new Error(`Error ${bucketName} validating bucket name`);
  //     }
  //   }
  // },

  createResources: async (accessKey, secretKey, bucketName, isNewBucket) => {
    try {
      const s3Client = new S3Client({
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        },
        region: 'us-east-2'
      });

      const iamClient = new IAMClient({
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        },
        region: 'us-east-2'
      });

      if (isNewBucket) {
        await s3Client.send(new CreateBucketCommand({
          Bucket: bucketName,
          CreateBucketConfiguration: { LocationConstraint: 'us-east-2' }
        }));
      } else {

        const buckets = await listBuckets();
        let region = null
        if (buckets.includes(bucketName)) {
          region = await getBucketLocation(bucketName);
          console.log(`Bucket ${bucketName} is located in region: ${region}`);
        } else {
          console.log(`Bucket ${bucketName} not found in your account.`);
          throw new Error(`${bucketName} doesn't exist`); 
        }
      }

      const userName = `user-for-${bucketName}`;
      await iamClient.send(new CreateUserCommand({ UserName: userName }));

      const policyName = `CustomS3Policy-${bucketName}`;
      const policyDocument = {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'AllBuckets',
            Effect: 'Allow',
            Action: ['s3:ListAllMyBuckets'],
            Resource: '*'
          },
          {
            Sid: 'Bucket',
            Effect: 'Allow',
            Action: [
              's3:ListBucket',
              's3:ListBucketMultipartUploads'
            ],
            Resource: `arn:aws:s3:::${bucketName}`
          },
          {
            Sid: 'Objects',
            Effect: 'Allow',
            Action: [
              's3:GetObject',
              's3:PutObject',
              's3:DeleteObject',
              's3:ListMultipartUploadParts',
              's3:AbortMultipartUpload'
            ],
            Resource: `arn:aws:s3:::${bucketName}/*`
          }
        ]
      };

      const policyResponse = await iamClient.send(new CreatePolicyCommand({
        PolicyName: policyName,
        PolicyDocument: JSON.stringify(policyDocument)
      }));

      await iamClient.send(new AttachUserPolicyCommand({
        UserName: userName,
        PolicyArn: policyResponse.Policy.Arn
      }));

      const accessKeyResponse = await iamClient.send(new CreateAccessKeyCommand({ UserName: userName }));

      return {
        globusAccessKey: accessKeyResponse.AccessKey.AccessKeyId,
        globusSecretKey: accessKeyResponse.AccessKey.SecretAccessKey,
        bucketName: bucketName,
      };
    } catch (error) {
      if (error.name === 'NotFound') {
        throw new Error(`Error ${bucketName} doesn't exist`);
      } else {
        console.error('Resource creation error:', error);
        throw error;
      }
    }
  }
});