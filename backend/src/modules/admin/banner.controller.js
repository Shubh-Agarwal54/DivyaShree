const path = require('path');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const Banner = require('./banner.model');
const adminAuditService = require('./admin-audit.service');

// S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const BUCKET = process.env.AWS_BUCKET_NAME;
const SIGNED_URL_EXPIRES = 3600; // 1 hour

// Generate a presigned GET URL for an S3 key
async function getPresignedUrl(s3Key) {
  if (!s3Key) return null;
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: s3Key });
  return getSignedUrl(s3Client, command, { expiresIn: SIGNED_URL_EXPIRES });
}

// Multer-S3 storage config — key is resolved at request time via req.params.key
const storage = multerS3({
  s3: s3Client,
  bucket: BUCKET,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `banners/${req.params.key || 'banner'}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const BANNER_KEYS = ['hero', 'bestseller', 'app-exclusive', 'modern-shehzadi', 'store-experience'];

// Default text fields per banner key
const DEFAULT_TEXTS = {
  hero: {
    scriptText: 'Shaadi',
    displayTitle: 'Carnival',
    scriptText2: 'Flash',
    displayTitle2: 'Sale',
    discountText: 'FLAT 50% OFF',
    discountSubtext: 'Lehengas',
    buttonText: 'SHOP NOW',
    buttonLink: '/shop/lehengas',
  },
  bestseller: {
    scriptText: 'Bestseller',
    displayTitle: 'Brigade',
    buttonText: 'SHOP NOW',
    buttonLink: '/bestsellers',
  },
  'app-exclusive': {
    displayTitle: 'APP EXCLUSIVE',
    scriptText: 'Offer',
    discountText: 'FLAT 15%',
    couponCode: 'APPFIRST',
    buttonText: 'GET THE APP',
  },
  'modern-shehzadi': {
    scriptText: 'Modern',
    displayTitle: 'Shehzadi',
    description: 'Bridal Lehengas for the Modern Bride',
    buttonText: 'SHOP NOW',
    buttonLink: '/shop/lehengas',
  },
  'store-experience': {
    scriptText: 'Experience Our',
    displayTitle: 'STORES',
    buttonText: 'VISIT US',
    buttonLink: '/about/stores',
  },
};

class BannerController {
  // GET /admin/banners  — all banners (admin)
  async getAllBanners(req, res) {
    try {
      const banners = await Banner.find();
      const result = await Promise.all(
        BANNER_KEYS.map(async (key) => {
          const found = banners.find((b) => b.key === key);
          const obj = found
            ? found.toObject()
            : { key, imageUrl: null, texts: DEFAULT_TEXTS[key], isActive: true };
          // Replace stored S3 key with a fresh presigned URL
          obj.imageUrl = obj.imageUrl ? await getPresignedUrl(obj.imageUrl) : null;
          return obj;
        })
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch banners', error: error.message });
    }
  }

  // GET /admin/banners/:key  — single banner
  async getBanner(req, res) {
    try {
      const { key } = req.params;
      if (!BANNER_KEYS.includes(key))
        return res.status(400).json({ success: false, message: 'Invalid banner key' });

      const banner = await Banner.findOne({ key });
      const obj = banner
        ? banner.toObject()
        : { key, imageUrl: null, texts: DEFAULT_TEXTS[key], isActive: true };
      obj.imageUrl = obj.imageUrl ? await getPresignedUrl(obj.imageUrl) : null;
      res.status(200).json({ success: true, data: obj });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch banner', error: error.message });
    }
  }

  // PUT /admin/banners/:key/texts  — update text content only
  async updateBannerTexts(req, res) {
    try {
      const { key } = req.params;
      if (!BANNER_KEYS.includes(key))
        return res.status(400).json({ success: false, message: 'Invalid banner key' });

      const { texts } = req.body;
      if (!texts || typeof texts !== 'object')
        return res.status(400).json({ success: false, message: 'texts object is required' });

      // Sanitize keys — only allow string values
      const sanitized = {};
      for (const [k, v] of Object.entries(texts)) {
        if (typeof v === 'string') sanitized[k] = v.trim();
      }

      const banner = await Banner.findOneAndUpdate(
        { key },
        { $set: { texts: sanitized, updatedBy: req.user._id } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      await adminAuditService.log({
        action: 'UPDATE',
        resource: 'banner',
        resourceId: banner._id,
        userId: req.user._id,
        changes: { key, texts: sanitized },
      });

      res.status(200).json({ success: true, data: banner, message: 'Banner text updated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update banner text', error: error.message });
    }
  }

  // POST /admin/banners/:key/image  — upload image
  uploadBannerImage(req, res) {
    const uploader = upload.single('image');
    uploader(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      try {
        const { key } = req.params;
        if (!BANNER_KEYS.includes(key))
          return res.status(400).json({ success: false, message: 'Invalid banner key' });

        if (!req.file)
          return res.status(400).json({ success: false, message: 'No image file uploaded' });

        // multer-s3 puts the S3 key on req.file.key
        const s3Key = req.file.key;

        // Delete old S3 object if there was a custom image
        const existing = await Banner.findOne({ key });
        if (existing?.imageUrl && !existing.imageUrl.startsWith('http')) {
          await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: existing.imageUrl })).catch(() => {});
        }

        const banner = await Banner.findOneAndUpdate(
          { key },
          { $set: { imageUrl: s3Key, updatedBy: req.user._id } },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        await adminAuditService.log({
          action: 'UPDATE',
          resource: 'banner',
          resourceId: banner._id,
          userId: req.user._id,
          changes: { key, s3Key },
        });

        // Return a presigned URL for immediate preview
        const imageUrl = await getPresignedUrl(s3Key);
        res.status(200).json({ success: true, data: { ...banner.toObject(), imageUrl }, message: 'Banner image updated successfully' });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to upload banner image', error: error.message });
      }
    });
  }

  // DELETE /admin/banners/:key/image  — reset to default image
  async resetBannerImage(req, res) {
    try {
      const { key } = req.params;
      if (!BANNER_KEYS.includes(key))
        return res.status(400).json({ success: false, message: 'Invalid banner key' });

      const existing = await Banner.findOne({ key });
      // Delete S3 object if there is a custom image (stored as S3 key, not a URL)
      if (existing?.imageUrl && !existing.imageUrl.startsWith('http')) {
        await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: existing.imageUrl })).catch(() => {});
      }

      const banner = await Banner.findOneAndUpdate(
        { key },
        { $set: { imageUrl: null, updatedBy: req.user._id } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      res.status(200).json({ success: true, data: banner, message: 'Banner image reset to default' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to reset banner image', error: error.message });
    }
  }
}

module.exports = new BannerController();
