import { getApiBase } from "../utils/getApiBase";

export const BASE_URL = getApiBase();

//  Admin Endpoints
export const ADMIN_URL = `${BASE_URL}/api/admin`;

//  Worker Endpoints
export const WORKER_URL = `${BASE_URL}/api/worker`;

//  File Uploads
export const UPLOAD_URL = `${BASE_URL}/api/upload`;
