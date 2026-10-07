import express from "express";
import Stripe from "stripe";

import { protect, requireRole } from "../middleware/authMiddleware.js";

import Property from "../models/Property.js";
import Booking from "../models/Booking.js";
import Transaction from "../models/Transaction.js";

const router = express.Router();

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY
);

/*
|--------------------------------------------------------------------------
| CREATE STRIPE CHECKOUT SESSION
|--------------------------------------------------------------------------
|
| POST /api/payments/create-checkout-session
|
| Tenant creates a Stripe Checkout Session.
|
|--------------------------------------------------------------------------
*/

router.post(
  "/create-checkout-session",
  protect,
  requireRole("tenant"),
  async (req, res) => {
    try {
      const {
        propertyId,
        propertyTitle,
        rent,
        rentType,
        moveInDate,
        duration,
        phone,
        additionalNotes,
      } = req.body;

      /*
      |--------------------------------------------------------------------------
      | VALIDATION
      |--------------------------------------------------------------------------
      */

      if (!propertyId) {
        return res.status(400).json({
          success: false,
          message:
            "Property ID is required.",
        });
      }

      if (!moveInDate) {
        return res.status(400).json({
          success: false,
          message:
            "Move-in date is required.",
        });
      }

      if (
        !duration ||
        Number(duration) < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Booking duration must be at least 1.",
        });
      }

      if (!phone?.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Contact number is required.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | FIND PROPERTY
      |--------------------------------------------------------------------------
      */

      const property =
        await Property.findById(
          propertyId
        );

      if (!property) {
        return res.status(404).json({
          success: false,
          message:
            "Property not found.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | PROPERTY MUST BE APPROVED
      |--------------------------------------------------------------------------
      */

      if (
        property.status !==
        "Approved"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This property is not available for booking.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | USE DATABASE PROPERTY DATA
      |--------------------------------------------------------------------------
      */

      const propertyRent =
        Number(property.rent);

      const bookingDuration =
        Number(duration);

      const totalAmount =
        propertyRent *
        bookingDuration;

      if (
        !Number.isFinite(
          totalAmount
        ) ||
        totalAmount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid payment amount.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | STRIPE AMOUNT
      |--------------------------------------------------------------------------
      |
      | Stripe expects amount in the smallest currency unit.
      | For BDT, amount is multiplied by 100.
      |
      */

      const stripeAmount =
        Math.round(
          totalAmount * 100
        );

      /*
      |--------------------------------------------------------------------------
      | CREATE CHECKOUT SESSION
      |--------------------------------------------------------------------------
      */

      const checkoutSession =
        await stripe.checkout.sessions.create(
          {
            mode: "payment",

            payment_method_types: [
              "card",
            ],

            line_items: [
              {
                price_data: {
                  currency: "bdt",

                  product_data: {
                    name:
                      property.title ||
                      propertyTitle ||
                      "Property Booking",

                    description:
                      property.location ||
                      "",
                  },

                  unit_amount:
                    propertyRent *
                    100,
                },

                quantity:
                  bookingDuration,
              },
            ],

            customer_email:
              req.user.email,

            metadata: {
              propertyId:
                String(property._id),

              tenantId:
                String(req.user.id),

              tenantName:
                req.user.name || "",

              tenantEmail:
                req.user.email || "",

              tenantPhoto:
                req.user.photo || "",

              propertyTitle:
                property.title || "",

              moveInDate:
                String(moveInDate),

              duration:
                String(
                  bookingDuration
                ),

              phone:
                phone.trim(),

              additionalNotes:
                additionalNotes?.trim() ||
                "",
            },

            success_url:
              "http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}",

            cancel_url:
              "http://localhost:3000/payment/cancel",
          }
        );

      /*
      |--------------------------------------------------------------------------
      | RESPONSE
      |--------------------------------------------------------------------------
      */

      return res.status(200).json({
        success: true,

        message:
          "Stripe checkout session created.",

        sessionId:
          checkoutSession.id,

        checkoutUrl:
          checkoutSession.url,

        amount:
          totalAmount,

        currency: "BDT",
      });
    } catch (error) {
      console.error(
        "Create checkout session error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Failed to create Stripe checkout session.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| VERIFY PAYMENT + CREATE BOOKING + TRANSACTION
|--------------------------------------------------------------------------
|
| GET /api/payments/verify-session/:sessionId
|
| This endpoint:
|
| 1. Retrieves Stripe Checkout Session
| 2. Confirms payment was successful
| 3. Creates Booking
| 4. Creates Transaction
| 5. Prevents duplicate records
|
|--------------------------------------------------------------------------
*/

router.get(
  "/verify-session/:sessionId",
  async (req, res) => {
    try {
      const {
        sessionId,
      } = req.params;

      /*
      |--------------------------------------------------------------------------
      | VALIDATE SESSION ID
      |--------------------------------------------------------------------------
      */

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message:
            "Stripe session ID is required.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | RETRIEVE STRIPE SESSION
      |--------------------------------------------------------------------------
      */

      const session =
        await stripe.checkout.sessions.retrieve(
          sessionId
        );

      /*
      |--------------------------------------------------------------------------
      | CHECK PAYMENT STATUS
      |--------------------------------------------------------------------------
      */

      if (
        session.payment_status !==
        "paid"
      ) {
        return res.status(400).json({
          success: false,
          paid: false,
          message:
            "Payment has not been completed.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | STRIPE METADATA
      |--------------------------------------------------------------------------
      */

      const metadata =
        session.metadata || {};

      const {
        propertyId,
        tenantId,
        tenantName,
        tenantEmail,
        tenantPhoto,
        propertyTitle,
        moveInDate,
        duration,
        phone,
        additionalNotes,
      } = metadata;

      /*
      |--------------------------------------------------------------------------
      | VALIDATE METADATA
      |--------------------------------------------------------------------------
      */

      if (
        !propertyId ||
        !tenantId ||
        !tenantEmail ||
        !moveInDate ||
        !duration
      ) {
        return res.status(400).json({
          success: false,
          paid: true,
          message:
            "Payment succeeded, but booking information is incomplete.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | FIND PROPERTY
      |--------------------------------------------------------------------------
      */

      const property =
        await Property.findById(
          propertyId
        );

      if (!property) {
        return res.status(404).json({
          success: false,
          paid: true,
          message:
            "Property associated with this payment was not found.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | FIND EXISTING BOOKING
      |--------------------------------------------------------------------------
      |
      | Prevent duplicate booking creation if user refreshes
      | the success page.
      |
      */

      let booking =
        await Booking.findOne({
          paymentId:
            session.payment_intent
              ? String(
                  session.payment_intent
                )
              : session.id,
        });

      /*
      |--------------------------------------------------------------------------
      | TOTAL AMOUNT
      |--------------------------------------------------------------------------
      */

      const bookingDuration =
        Number(duration);

      const totalAmount =
        Number(property.rent) *
        bookingDuration;

      /*
      |--------------------------------------------------------------------------
      | CREATE BOOKING
      |--------------------------------------------------------------------------
      */

      if (!booking) {
        booking =
          await Booking.create({
            property: {
              id: String(
                property._id
              ),

              title:
                property.title ||
                propertyTitle ||
                "",

              location:
                property.location ||
                "",

              image:
                property.images?.[0] ||
                "",

              rent:
                Number(
                  property.rent
                ),

              rentType:
                property.rentType ||
                "Monthly",
            },

            tenant: {
              id:
                String(tenantId),

              name:
                tenantName ||
                "Tenant",

              email:
                tenantEmail,

              photo:
                tenantPhoto ||
                "",

              phone:
                phone || "",
            },

            owner: {
              id:
                property.owner
                  ?.id || "",

              name:
                property.owner
                  ?.name || "",

              email:
                property.owner
                  ?.email || "",

              photo:
                property.owner
                  ?.photo || "",
            },

            moveInDate:
              new Date(
                moveInDate
              ),

            duration:
              bookingDuration,

            totalAmount,

            additionalNotes:
              additionalNotes ||
              "",

            status:
              "Pending",

            rejectionFeedback:
              "",

            paymentStatus:
              "Paid",

            paymentId:
              session.payment_intent
                ? String(
                    session.payment_intent
                  )
                : session.id,
          });
      } else {
        /*
        |--------------------------------------------------------------------------
        | UPDATE EXISTING BOOKING
        |--------------------------------------------------------------------------
        */

        booking.paymentStatus =
          "Paid";

        booking.paymentId =
          session.payment_intent
            ? String(
                session.payment_intent
              )
            : session.id;

        await booking.save();
      }

      /*
      |--------------------------------------------------------------------------
      | CREATE TRANSACTION
      |--------------------------------------------------------------------------
      |
      | Prevent duplicate transaction.
      |
      */

      let transaction =
        await Transaction.findOne({
          paymentId:
            session.payment_intent
              ? String(
                  session.payment_intent
                )
              : session.id,
        });

      if (!transaction) {
        /*
        |--------------------------------------------------------------------------
        | TRANSACTION ID
        |--------------------------------------------------------------------------
        */

        const transactionId =
          `TRX-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)
            .toUpperCase()}`;

        transaction =
          await Transaction.create({
            transactionId,

            paymentId:
              session.payment_intent
                ? String(
                    session.payment_intent
                  )
                : session.id,

            bookingId:
              String(
                booking._id
              ),

            property: {
              id: String(
                property._id
              ),

              title:
                property.title ||
                "",

              location:
                property.location ||
                "",

              image:
                property.images?.[0] ||
                "",
            },

            tenant: {
              id:
                String(
                  tenantId
                ),

              name:
                tenantName ||
                "Tenant",

              email:
                tenantEmail,
            },

            owner: {
              id:
                property.owner
                  ?.id || "",

              name:
                property.owner
                  ?.name || "",

              email:
                property.owner
                  ?.email || "",
            },

            amount:
              totalAmount,

            currency:
              "BDT",

            paymentMethod:
              "Stripe",

            status:
              "Paid",

            transactionDate:
              new Date(),
          });
      }

      /*
      |--------------------------------------------------------------------------
      | RESPONSE
      |--------------------------------------------------------------------------
      */

      return res.status(200).json({
        success: true,

        paid: true,

        message:
          "Payment verified successfully. Booking and transaction created.",

        booking: {
          id: String(
            booking._id
          ),

          status:
            booking.status,

          paymentStatus:
            booking.paymentStatus,

          totalAmount:
            booking.totalAmount,
        },

        transaction: {
          id: String(
            transaction._id
          ),

          transactionId:
            transaction.transactionId,

          amount:
            transaction.amount,

          currency:
            transaction.currency,

          status:
            transaction.status,
        },

        property: {
          id: String(
            property._id
          ),

          title:
            property.title,

          location:
            property.location,

          image:
            property.images?.[0] ||
            "",
        },
      });
    } catch (error) {
      console.error(
        "Verify payment session error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Failed to verify payment.",
      });
    }
  }
);

export default router;