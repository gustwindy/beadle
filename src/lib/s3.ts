/** biome-ignore-all lint/style/useNamingConvention: not my fault */
import {
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { hashImage } from "./utils.ts";
import { env } from "cloudflare:workers";

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

export async function uploadImage(image: File) {
	const s3 = createS3();
	const buffer = await image.arrayBuffer();

	const hash = await hashImage(buffer);

	await s3.send(
		new PutObjectCommand({
			Bucket: "nextDrawings",
			Key: hash,
			Body: image,
			ContentType: "image/png",
		}),
	);

	return hash;
}

export async function signImage(hash: string, seconds: number) {
	const s3 = createS3();

	return getSignedUrl(
		s3,
		new GetObjectCommand({
			Bucket: "nextDrawings",
			Key: hash,
		}),
		{ expiresIn: seconds },
	);
}
