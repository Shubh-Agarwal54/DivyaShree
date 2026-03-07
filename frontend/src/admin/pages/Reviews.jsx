import { useState, useEffect, useCallback } from 'react';
import {
  Star, Trash2, MessageCircle, Search, Filter, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, Eye, EyeOff, X, Send, Image as ImageIcon, RefreshCw
} from 'lucide-react';
import { adminReviewAPI } from '@/services/review.api';
import { toast } from 'sonner';

const RATINGS = [0, 1, 2, 3, 4, 5];
const ITEMS_PER_PAGE = 15;

const StarRow = ({ rating, size = 14 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={size}
        className={i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ))}
  </div>
);

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [filterRating, setFilterRating] = useState(0);
  const [filterApproved, setFilterApproved] = useState('all'); // 'all' | 'approved' | 'hidden'

  // Respond modal
  const [respondModal, setRespondModal] = useState(null); // reviewId
  const [responseText, setResponseText] = useState('');
  const [responding, setResponding] = useState(false);

  // Image lightbox
  const [lightbox, setLightbox] = useState(null); // { urls, idx }

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState(null); // reviewId
  const [deleting, setDeleting] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: ITEMS_PER_PAGE };
      if (search) params.search = search;
      if (filterRating > 0) params.rating = filterRating;
      if (filterApproved !== 'all') params.isApproved = filterApproved === 'approved';

      const res = await adminReviewAPI.getAll(params);
      if (res.success) {
        setReviews(res.data.reviews);
        setTotalPages(res.data.pages);
        setTotal(res.data.total);
        setStats(res.data.stats);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, filterRating, filterApproved]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, filterRating, filterApproved]);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const res = await adminReviewAPI.deleteReview(deleteConfirm);
      if (res.success) {
        toast.success('Review deleted');
        setDeleteConfirm(null);
        fetchReviews();
      } else {
        toast.error(res.message);
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleApproval = async (reviewId) => {
    const res = await adminReviewAPI.toggleApproval(reviewId);
    if (res.success) {
      toast.success(res.message);
      fetchReviews();
    } else {
      toast.error(res.message);
    }
  };

  const handleRespond = async () => {
    if (!responseText.trim()) return toast.error('Response cannot be empty');
    setResponding(true);
    try {
      const review = reviews.find((r) => r._id === respondModal);
      const hasExisting = !!review?.adminResponse?.comment;

      const res = await adminReviewAPI.respond(respondModal, responseText.trim());
      if (res.success) {
        toast.success(hasExisting ? 'Response updated' : 'Response added');
        setRespondModal(null);
        setResponseText('');
        fetchReviews();
      } else {
        toast.error(res.message);
      }
    } finally {
      setResponding(false);
    }
  };

  const handleDeleteResponse = async (reviewId) => {
    const res = await adminReviewAPI.deleteResponse(reviewId);
    if (res.success) {
      toast.success('Response removed');
      fetchReviews();
    } else {
      toast.error(res.message);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const openRespondModal = (review) => {
    setRespondModal(review._id);
    setResponseText(review.adminResponse?.comment || '');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#6B1E1E]">Reviews</h1>
          <p className="font-body text-gray-600 mt-1">Manage customer product reviews</p>
        </div>
        <button
          onClick={fetchReviews}
          className="flex items-center gap-2 px-4 py-2 bg-[#6B1E1E] text-white rounded-lg hover:bg-[#8B2E2E] transition-colors font-body text-sm"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Reviews', value: stats.total, color: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
            { label: 'Avg Rating', value: (stats.avgRating || 0).toFixed(1), color: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700' },
            { label: 'With Images', value: stats.withImages || 0, color: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
            { label: 'Responded', value: stats.responded || 0, color: 'bg-green-50 border-green-200', text: 'text-green-700' },
            { label: 'Pending Approval', value: stats.pending || 0, color: 'bg-red-50 border-red-200', text: 'text-red-700' },
          ].map((s) => (
            <div key={s.label} className={`p-4 rounded-lg border ${s.color}`}>
              <p className={`font-body text-2xl font-bold ${s.text}`}>{s.value}</p>
              <p className="font-body text-xs text-gray-600 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or comment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg font-body text-sm focus:outline-none focus:border-[#6B1E1E]"
            />
          </div>

          {/* Rating filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-2 font-body text-sm focus:outline-none focus:border-[#6B1E1E]"
            >
              {RATINGS.map((r) => (
                <option key={r} value={r}>
                  {r === 0 ? 'All Ratings' : `${r} Star${r > 1 ? 's' : ''}`}
                </option>
              ))}
            </select>
          </div>

          {/* Approval filter */}
          <select
            value={filterApproved}
            onChange={(e) => setFilterApproved(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 font-body text-sm focus:outline-none focus:border-[#6B1E1E]"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6B1E1E]" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 text-gray-500 font-body">No reviews found</div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="p-5">
              <div className="flex gap-4">
                {/* Left: Review content */}
                <div className="flex-1 min-w-0">
                  {/* Header row */}
                  <div className="flex flex-wrap items-start gap-2 justify-between mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-body font-semibold text-gray-900">{review.name}</span>
                      {review.isVerifiedPurchase && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-body">Verified</span>
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-body ${
                          review.isApproved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {review.isApproved ? 'Approved' : 'Hidden'}
                      </span>
                    </div>
                    <span className="font-body text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                  </div>

                  {/* Product name */}
                  {review.product?.name && (
                    <p className="font-body text-xs text-[#6B1E1E] mb-1">
                      Product: {review.product.name}
                    </p>
                  )}

                  {/* Rating */}
                  <StarRow rating={review.rating} />

                  {/* Comment */}
                  <p className="font-body text-sm text-gray-700 mt-2 leading-relaxed">{review.comment}</p>

                  {/* Review Images */}
                  {review.imageUrls && review.imageUrls.filter(Boolean).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {review.imageUrls.filter(Boolean).map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setLightbox({ urls: review.imageUrls.filter(Boolean), idx })}
                          className="w-16 h-16 rounded-md overflow-hidden border border-gray-200 hover:border-[#6B1E1E] transition-colors"
                        >
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                      <div className="flex items-center gap-1 text-xs text-gray-400 font-body">
                        <ImageIcon size={12} />
                        {review.imageUrls.filter(Boolean).length} photo{review.imageUrls.filter(Boolean).length > 1 ? 's' : ''}
                      </div>
                    </div>
                  )}

                  {/* Admin Response */}
                  {review.adminResponse?.comment && (
                    <div className="mt-3 p-3 bg-[#6B1E1E]/5 border-l-4 border-[#6B1E1E] rounded-r-md">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <MessageCircle size={13} className="text-[#6B1E1E]" />
                          <span className="font-body text-xs font-semibold text-[#6B1E1E]">Store Response</span>
                          <span className="font-body text-xs text-gray-400">
                            · {formatDate(review.adminResponse.respondedAt)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteResponse(review._id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove response"
                        >
                          <X size={13} />
                        </button>
                      </div>
                      <p className="font-body text-sm text-gray-700">{review.adminResponse.comment}</p>
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {/* Respond button */}
                  <button
                    onClick={() => openRespondModal(review)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs transition-colors ${
                      review.adminResponse?.comment
                        ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        : 'bg-[#6B1E1E]/10 text-[#6B1E1E] hover:bg-[#6B1E1E]/20'
                    }`}
                  >
                    <MessageCircle size={13} />
                    {review.adminResponse?.comment ? 'Edit Response' : 'Respond'}
                  </button>

                  {/* Approve/Hide */}
                  <button
                    onClick={() => handleToggleApproval(review._id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs transition-colors ${
                      review.isApproved
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {review.isApproved ? <EyeOff size={13} /> : <Eye size={13} />}
                    {review.isApproved ? 'Hide' : 'Approve'}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setDeleteConfirm(review._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-body text-xs transition-colors"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-3">
          <p className="font-body text-sm text-gray-600">
            Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-body text-sm px-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Respond Modal */}
      {respondModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="font-display text-xl font-bold text-[#6B1E1E]">
                  {reviews.find((r) => r._id === respondModal)?.adminResponse?.comment
                    ? 'Edit Response'
                    : 'Add Response'}
                </h3>
                <p className="font-body text-sm text-gray-500 mt-0.5">Your response will be visible to all users</p>
              </div>
              <button onClick={() => { setRespondModal(null); setResponseText(''); }}>
                <X size={20} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            {/* Show the review being responded to */}
            {(() => {
              const rev = reviews.find((r) => r._id === respondModal);
              return rev ? (
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <StarRow rating={rev.rating} size={12} />
                    <span className="font-body text-sm font-medium text-gray-700">{rev.name}</span>
                  </div>
                  <p className="font-body text-sm text-gray-600 line-clamp-2">{rev.comment}</p>
                </div>
              ) : null;
            })()}

            <div className="p-6 space-y-4">
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:border-[#6B1E1E] resize-none"
                placeholder="Write your response to this review..."
                maxLength={1000}
              />
              <p className="font-body text-xs text-gray-400 text-right">{responseText.length}/1000</p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setRespondModal(null); setResponseText(''); }}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg font-body text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRespond}
                  disabled={responding || !responseText.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#6B1E1E] text-white rounded-lg font-body text-sm hover:bg-[#8B2E2E] transition-colors disabled:opacity-50"
                >
                  <Send size={14} />
                  {responding ? 'Sending...' : 'Send Response'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-gray-900">Delete Review</h3>
                <p className="font-body text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="font-body text-sm text-gray-600 mb-6">
              Are you sure you want to delete this review? Any uploaded photos will also be removed from storage.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg font-body text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-body text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setLightbox(null)}
          >
            <X size={28} />
          </button>
          <div className="relative max-w-3xl max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightbox.urls[lightbox.idx]}
              alt=""
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            {lightbox.urls.length > 1 && (
              <div className="flex justify-center gap-2 mt-3">
                {lightbox.urls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setLightbox({ ...lightbox, idx: i })}
                    className={`w-12 h-12 rounded overflow-hidden border-2 ${i === lightbox.idx ? 'border-white' : 'border-transparent'}`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
