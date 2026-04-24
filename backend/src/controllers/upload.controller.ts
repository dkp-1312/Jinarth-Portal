import { Request, Response } from 'express';
import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary.js';

type UploadedAsset = {
  secure_url: string;
  public_id: string;
  resource_type: string;
  bytes: number;
  format?: string;
};

const uploadOneToCloudinary = (file: Express.Multer.File, folder: string): Promise<UploadedAsset> =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Failed to upload file'));
          return;
        }

        resolve(result as UploadedAsset);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });

export const uploadSolutionFiles = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files provided',
      });
    }
    if (files.length > 3) {
      return res.status(400).json({
        success: false,
        message: 'You can upload a maximum of 3 files',
      });
    }

    const totalSizeBytes = files.reduce((sum, file) => sum + file.size, 0);
    const maxTotalSizeBytes = 15 * 1024 * 1024;
    if (totalSizeBytes > maxTotalSizeBytes) {
      return res.status(400).json({
        success: false,
        message: 'Total file size must be less than or equal to 15MB',
      });
    }

    const folder = process.env.CLOUDINARY_FOLDER || 'portal-solutions';
    const uploaded = await Promise.all(files.map((file) => uploadOneToCloudinary(file, folder)));

    const attachments = uploaded.map((asset, idx) => ({
      fileName: files[idx].originalname,
      fileUrl: asset.secure_url,
      publicId: asset.public_id,
      bytes: asset.bytes,
      resourceType: asset.resource_type,
      format: asset.format || null,
    }));

    res.json({
      success: true,
      message: 'Files uploaded successfully',
      data: attachments,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Cloudinary upload failed',
      error: error.message,
    });
  }
};

export const uploadProfileImage = async (req: Request, res: Response) => {
  try {
    const file = req.file as Express.Multer.File | undefined;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
      });
    }

    // Check file size (2MB limit)
    const maxSizeBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return res.status(400).json({
        success: false,
        message: 'Profile image size must be less than 2MB',
      });
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Only PNG, JPG, JPEG, and WEBP formats are supported',
      });
    }

    const folder = 'profile-images';
    const asset = await uploadOneToCloudinary(file, folder);

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      url: asset.secure_url,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Cloudinary upload failed',
      error: error.message,
    });
  }
};
