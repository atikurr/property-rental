import express from "express";
import Review from "../models/Review.js";
import Property from "../models/Property.js";
import Booking from "../models/Booking.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =========================================================
   GET REVIEWS BY PROPERTY
   Public endpoint
   ========================================================= */
router.get("/property/:propertyId", async (req, res) => {
  try {
    const { propertyId } = req.params;

    const reviews = await Review.find({
      "property.id": propertyId,
    }).sort({ createdAt: -1 });

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          totalReviews
        : 0;

    res.status(200).json({
      success: true,
      reviews,
      totalReviews,
      averageRating: Number(averageRating.toFixed(1)),
    });
  } catch (error) {
    console.error("Get reviews error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
});


/* =========================================================
   CREATE REVIEW
   Tenant only
   ========================================================= */
router.post(
  "/",
  protect,
  requireRole("tenant"),
  async (req, res) => {
    try {
      const user = req.user;

      const {
        propertyId,
        rating,
        comment,
      } = req.body;

      /* ---------- Validation ---------- */

      if (!propertyId) {
        return res.status(400).json({
          success: false,
          message: "Property ID is required",
        });
      }

      if (!rating) {
        return res.status(400).json({
          success: false,
          message: "Rating is required",
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }

      if (!comment || comment.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: "Review must contain at least 3 characters",
        });
      }


      /* ---------- Check Property ---------- */

      const property = await Property.findById(propertyId);

      if (!property) {
        return res.status(404).json({
          success: false,
          message: "Property not found",
        });
      }

      if (
        property.status &&
        property.status.toLowerCase() !== "approved"
      ) {
        return res.status(400).json({
          success: false,
          message: "You can only review an approved property",
        });
      }


      /* ---------- Check Previous Review ---------- */

      const existingReview = await Review.findOne({
        "property.id": propertyId,
        "tenant.id": user.id,
      });

      if (existingReview) {
        return res.status(409).json({
          success: false,
          message: "You have already reviewed this property",
        });
      }


      /* ---------- Create Review ---------- */

      const review = await Review.create({
        property: {
          id: property._id,
          title: property.title,
        },

        tenant: {
          id: user.id,
          name: user.name || "Tenant",
          email: user.email,
          photo: user.photo || "",
        },

        rating: Number(rating),

        comment: comment.trim(),
      });

      res.status(201).json({
        success: true,
        message: "Review submitted successfully",
        review,
      });
    } catch (error) {
      console.error("Create review error:", error);

      // MongoDB duplicate key protection
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "You have already reviewed this property",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to submit review",
      });
    }
  }
);


/* =========================================================
   DELETE REVIEW
   Tenant can delete own review
   ========================================================= */
router.delete(
  "/:id",
  protect,
  requireRole("tenant"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const review = await Review.findById(id);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Review not found",
        });
      }

      if (String(review.tenant.id) !== String(req.user.id)) {
        return res.status(403).json({
          success: false,
          message: "You can only delete your own review",
        });
      }

      await Review.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: "Review deleted successfully",
      });
    } catch (error) {
      console.error("Delete review error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to delete review",
      });
    }
  }
);


export default router;