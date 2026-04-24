import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary.js';
const uploadOneToCloudinary = (file, folder) => new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({
        folder,
        resource_type: 'auto',
    }, (error, result) => {
        if (error || !result) {
            reject(error || new Error('Failed to upload file'));
            return;
        }
        resolve(result);
    });
    streamifier.createReadStream(file.buffer).pipe(uploadStream);
});
export const uploadSolutionFiles = async (req, res) => {
    try {
        const files = req.files;
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Cloudinary upload failed',
            error: error.message,
        });
    }
};
