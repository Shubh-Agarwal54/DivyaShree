const Promo = require('./promo.model');

class PromoController {
  // GET /admin/promos — list all promo codes (admin)
  async getAllPromos(req, res) {
    try {
      const promos = await Promo.find().sort({ createdAt: -1 });
      res.json({ success: true, data: promos });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /admin/promos — create promo code (admin)
  async createPromo(req, res) {
    try {
      const {
        code,
        description,
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscountAmount,
        maxUses,
        isActive,
        expiresAt,
      } = req.body;

      if (!code || !discountType || discountValue === undefined) {
        return res.status(400).json({
          success: false,
          message: 'code, discountType and discountValue are required',
        });
      }

      const existing = await Promo.findOne({ code: code.toUpperCase().trim() });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Promo code already exists' });
      }

      const promo = new Promo({
        code: code.toUpperCase().trim(),
        description: description || '',
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount) || 0,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        maxUses: maxUses ? Number(maxUses) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      });

      await promo.save();
      res.status(201).json({ success: true, data: promo });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // PUT /admin/promos/:promoId — update promo (admin)
  async updatePromo(req, res) {
    try {
      const { promoId } = req.params;
      const updates = { ...req.body };

      if (updates.code) {
        updates.code = updates.code.toUpperCase().trim();
        const existing = await Promo.findOne({ code: updates.code, _id: { $ne: promoId } });
        if (existing) {
          return res.status(400).json({ success: false, message: 'Promo code already exists' });
        }
      }

      const promo = await Promo.findByIdAndUpdate(promoId, updates, { new: true, runValidators: true });
      if (!promo) {
        return res.status(404).json({ success: false, message: 'Promo not found' });
      }

      res.json({ success: true, data: promo });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // DELETE /admin/promos/:promoId — delete promo (admin)
  async deletePromo(req, res) {
    try {
      const { promoId } = req.params;
      const promo = await Promo.findByIdAndDelete(promoId);
      if (!promo) {
        return res.status(404).json({ success: false, message: 'Promo not found' });
      }
      res.json({ success: true, message: 'Promo code deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/promos/validate — validate a promo code (authenticated user)
  async validatePromo(req, res) {
    try {
      const { code, subtotal } = req.body;

      if (!code) {
        return res.status(400).json({ success: false, message: 'Promo code is required' });
      }

      const promo = await Promo.findOne({ code: code.toUpperCase().trim() });

      if (!promo) {
        return res.status(404).json({ success: false, message: 'Invalid promo code' });
      }

      if (!promo.isActive) {
        return res.status(400).json({ success: false, message: 'This promo code is no longer active' });
      }

      if (promo.expiresAt && new Date() > promo.expiresAt) {
        return res.status(400).json({ success: false, message: 'This promo code has expired' });
      }

      if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
        return res.status(400).json({ success: false, message: 'This promo code has reached its usage limit' });
      }

      const orderSubtotal = Number(subtotal) || 0;
      if (orderSubtotal < promo.minOrderAmount) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount of ₹${promo.minOrderAmount} required for this code`,
        });
      }

      let discountAmount = 0;
      if (promo.discountType === 'percentage') {
        discountAmount = Math.round((orderSubtotal * promo.discountValue) / 100);
        if (promo.maxDiscountAmount !== null) {
          discountAmount = Math.min(discountAmount, promo.maxDiscountAmount);
        }
      } else {
        discountAmount = promo.discountValue;
      }

      res.json({
        success: true,
        data: {
          code: promo.code,
          discountType: promo.discountType,
          discountValue: promo.discountValue,
          discountAmount,
          description: promo.description,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/promos/active — list active promos for cart display (public)
  async getActivePromos(req, res) {
    try {
      const now = new Date();
      const promos = await Promo.find({
        isActive: true,
        $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
      }).select('code description discountType discountValue minOrderAmount maxDiscountAmount maxUses usedCount');

      res.json({ success: true, data: promos });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new PromoController();
