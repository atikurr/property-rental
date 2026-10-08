"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import {
  Loader2,
  MessageSquare,
  Send,
  Star,
  Trash2,
  User,
} from "lucide-react";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ReviewSection({
  propertyId,
  propertyTitle,
  session,
}) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const user = session?.user || null;

  const userRole = user?.role?.toLowerCase();

  const isTenant = userRole === "tenant";

  // =====================================================
  // LOAD REVIEWS
  // =====================================================

  const loadReviews = async () => {
    if (!propertyId) return;

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/reviews/property/${propertyId}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to load reviews."
        );
      }

      setReviews(data?.reviews || []);

      setAverageRating(
        Number(data?.averageRating || 0)
      );

      setTotalReviews(
        Number(data?.totalReviews || 0)
      );
    } catch (error) {
      console.error(
        "Review loading error:",
        error
      );

      toast.error(
        error?.message ||
          "Failed to load reviews."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [propertyId]);

  // =====================================================
  // SUBMIT REVIEW
  // =====================================================

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (!user) {
      toast.error(
        "Please login to submit a review."
      );
      return;
    }

    if (!isTenant) {
      toast.error(
        "Only tenants can submit reviews."
      );
      return;
    }

    if (!rating) {
      toast.error(
        "Please select a rating."
      );
      return;
    }

    if (!comment.trim()) {
      toast.error(
        "Please write a review."
      );
      return;
    }

    if (comment.trim().length < 3) {
      toast.error(
        "Review must contain at least 3 characters."
      );
      return;
    }

    try {
      setSubmitting(true);

      const tokenResponse =
        await authClient.token();

      const token =
        tokenResponse?.data?.token ||
        tokenResponse?.token ||
        "";

      if (!token) {
        toast.error(
          "Authentication token not found."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/api/reviews`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            propertyId,
            rating,
            comment: comment.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to submit review."
        );
      }

      toast.success(
        "Review submitted successfully!"
      );

      setRating(0);
      setHoverRating(0);
      setComment("");

      await loadReviews();
    } catch (error) {
      console.error(
        "Submit review error:",
        error
      );

      toast.error(
        error?.message ||
          "Failed to submit review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // DELETE REVIEW
  // =====================================================

  const handleDeleteReview = async (reviewId) => {
    if (!reviewId) return;

    try {
      setDeletingId(reviewId);

      const tokenResponse =
        await authClient.token();

      const token =
        tokenResponse?.data?.token ||
        tokenResponse?.token ||
        "";

      if (!token) {
        toast.error(
          "Authentication token not found."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/api/reviews/${reviewId}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to delete review."
        );
      }

      toast.success(
        "Review deleted successfully."
      );

      await loadReviews();
    } catch (error) {
      console.error(
        "Delete review error:",
        error
      );

      toast.error(
        error?.message ||
          "Failed to delete review."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // HELPERS
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  const getInitial = (name) => {
    return (
      name?.charAt(0)?.toUpperCase() || "U"
    );
  };

  const isOwnReview = (review) => {
    if (!user?.id || !review?.tenant?.id) {
      return false;
    }

    return (
      String(review.tenant.id) ===
      String(user.id)
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
      />

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {/* =================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-orange-500" />

              <h2 className="text-2xl font-bold text-slate-950">
                Reviews & Ratings
              </h2>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              See what tenants say about this property.
            </p>
          </div>

          {/* =================================================
              RATING SUMMARY
          ================================================== */}

          <div className="flex items-center gap-4 rounded-2xl bg-orange-50 px-5 py-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-950">
                {averageRating.toFixed(1)}
              </p>

              <div className="mt-1 flex justify-center">
                {[1, 2, 3, 4, 5].map(
                  (star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <=
                        Math.round(
                          averageRating
                        )
                          ? "fill-orange-400 text-orange-400"
                          : "text-slate-300"
                      }`}
                    />
                  )
                )}
              </div>
            </div>

            <div className="h-10 w-px bg-orange-200" />

            <div>
              <p className="text-sm font-bold text-slate-900">
                {totalReviews}
              </p>

              <p className="text-xs text-slate-500">
                {totalReviews === 1
                  ? "Review"
                  : "Reviews"}
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            REVIEW FORM
        ================================================== */}

        {user && isTenant && (
          <div className="mt-8 rounded-2xl border border-orange-100 bg-orange-50/50 p-5 sm:p-6">
            <h3 className="text-lg font-bold text-slate-950">
              Write a Review
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Share your experience with this property.
            </p>

            <form
              onSubmit={handleSubmitReview}
              className="mt-5"
            >
              {/* STAR SELECTOR */}

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-800">
                  Your Rating
                </p>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setRating(star)
                        }
                        onMouseEnter={() =>
                          setHoverRating(star)
                        }
                        onMouseLeave={() =>
                          setHoverRating(0)
                        }
                        className="rounded-md p-1 transition hover:scale-110"
                        aria-label={`Rate ${star} stars`}
                      >
                        <Star
                          className={`h-7 w-7 ${
                            star <=
                            (hoverRating ||
                              rating)
                              ? "fill-orange-400 text-orange-400"
                              : "text-slate-300"
                          }`}
                        />
                      </button>
                    )
                  )}

                  {rating > 0 && (
                    <span className="ml-2 text-sm font-semibold text-slate-600">
                      {rating}/5
                    </span>
                  )}
                </div>
              </div>

              {/* COMMENT */}

              <div className="mt-5">
                <label
                  htmlFor="reviewComment"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Your Review
                </label>

                <textarea
                  id="reviewComment"
                  value={comment}
                  onChange={(event) =>
                    setComment(
                      event.target.value
                    )
                  }
                  rows={4}
                  maxLength={1000}
                  placeholder="Write your experience about this property..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />

                <div className="mt-1 text-right text-xs text-slate-400">
                  {comment.length}/1000
                </div>
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={submitting}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Review
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* =================================================
            LOGIN MESSAGE
        ================================================== */}

        {!user && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
            <p className="text-sm text-slate-600">
              Please login as a tenant to write a
              review.
            </p>
          </div>
        )}

        {/* =================================================
            REVIEW LIST
        ================================================== */}

        <div className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-950">
              Tenant Reviews
            </h3>

            <span className="text-sm text-slate-500">
              {totalReviews}{" "}
              {totalReviews === 1
                ? "review"
                : "reviews"}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center rounded-2xl border border-slate-200 py-12">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <MessageSquare className="mx-auto h-10 w-10 text-slate-300" />

              <h4 className="mt-4 text-lg font-bold text-slate-800">
                No reviews yet
              </h4>

              <p className="mt-2 text-sm text-slate-500">
                Be the first tenant to review this property.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <article
                  key={review._id}
                  className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      {/* AVATAR */}

                      {review?.tenant?.photo ? (
                        <Image
                          src={review.tenant.photo}
                          alt={
                            review.tenant.name ||
                            "Tenant"
                          }
                          width={44}
                          height={44}
                          unoptimized
                          className="h-11 w-11 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                          {getInitial(
                            review?.tenant?.name
                          )}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-bold text-slate-900">
                          {review?.tenant?.name ||
                            "Tenant"}
                        </h4>

                        <p className="truncate text-xs text-slate-500">
                          {review?.tenant?.email ||
                            ""}
                        </p>
                      </div>
                    </div>

                    {/* DELETE OWN REVIEW */}

                    {isOwnReview(review) && (
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteReview(
                            review._id
                          )
                        }
                        disabled={
                          deletingId ===
                          review._id
                        }
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                        title="Delete review"
                      >
                        {deletingId ===
                        review._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* RATING */}

                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map(
                        (star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <=
                              review.rating
                                ? "fill-orange-400 text-orange-400"
                                : "text-slate-300"
                            }`}
                          />
                        )
                      )}
                    </div>

                    <span className="text-xs font-medium text-slate-400">
                      {formatDate(
                        review.createdAt
                      )}
                    </span>
                  </div>

                  {/* COMMENT */}

                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
                    {review.comment}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}