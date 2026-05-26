// Cloudflare R2 (S3-compatible) stub.
// To wire up: $ npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
// Then implement presigned URL generation and replace this stub.

export const r2Configured = Boolean(
  process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
);

export interface PresignedUploadResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export async function getPresignedUploadUrl(
  key: string,
  _contentType: string
): Promise<PresignedUploadResult> {
  if (!r2Configured) {
    // dev stub — returns a placeholder; the API route should respond with 501
    // until R2 is wired up.
    return {
      uploadUrl: `https://stub.local/upload/${key}`,
      publicUrl: `https://stub.local/files/${key}`,
      key,
    };
  }
  throw new Error("R2 client not implemented. See lib/r2.ts.");
}
