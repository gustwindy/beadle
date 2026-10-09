/** biome-ignore-all lint/style/useNamingConvention: not my fault */
import {
	S3Client,
	PutObjectCommand,
	GetObjectCommand,
} from "@aws-sdk/client-s3";
import { env } from "cloudflare:workers";
import { createHash } from "crypto";

function createS3() {
	return new S3Client({
		region: env.S3_REGION,
		endpoint: env.S3_ENDPOINT,
		forcePathStyle: true,
		credentials: {
			accessKeyId: env.S3_ACCESS_KEY_ID,
			secretAccessKey: env.S3_SECRET_ACCESS_KEY,
		},
	});
}

export async function uploadImage(base64Image: string): Promise<string> {
	const hash: string = createHash("md5").update(base64Image).digest("hex");
	const bytes = Uint8Array.from(atob(base64Image), (char) =>
		char.charCodeAt(0),
	);

	const s3 = createS3();

	await s3.send(
		new PutObjectCommand({
			Bucket: "drawings",
			Key: hash,
			Body: bytes,
			ContentType: "image/png",
		}),
	);

	return hash;
}

export async function getImage(hash: string): Promise<string | null> {
	const s3 = createS3();

	try {
		const result = await s3.send(
			new GetObjectCommand({
				Bucket: "drawings",
				Key: hash,
			}),
		);

		if (!result.Body) return null;

		const bytes = await result.Body.transformToByteArray();

		let binary = "";
		for (const byte of bytes) {
			binary += String.fromCharCode(byte);
		}

		return btoa(binary);
	} catch (_error) {
		return null;
	}
}
