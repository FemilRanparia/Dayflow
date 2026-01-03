import { useState, useEffect } from 'react';
import { Calendar, Check, X, MessageSquare, Filter } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { db, LeaveRequest } from '../../services/database';
import { parseDate } from '../../utils/dateUtils';

export function LeaveApprovals() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | LeaveRequest['status']>('all');
  const [commentModal, setCommentModal] = useState<{ show: boolean; requestId: string; action: 'approve' | 'reject' }>({
    show: false,
    requestId: '',
    action: 'approve',
  });
  const [comment, setComment] = useState('');

  useEffect(() => {
    loadLeaveRequests();
  }, []);

  const loadLeaveRequests = async () => {
    try {
      const requests = await db.getAllLeaves();
      setLeaveRequests((requests || []).sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      ));
    } catch (error: any) {
      console.error('Error loading leave requests:', error);
      toast.error(error.message || 'Failed to load leave requests');
    }
  };

  const handleApprove = async (requestId: string, adminComment?: string) => {
    try {
      await db.updateLeave(requestId, {
        status: 'approved',
        adminComment,
        approvedBy: 'Admin',
      });
      toast.success('Leave request approved');
      await loadLeaveRequests();
      closeCommentModal();
    } catch (error: any) {
      console.error('Error approving leave:', error);
      toast.error(error.message || 'Failed to approve leave');
    }
  };

  const handleReject = async (requestId: string, adminComment?: string) => {
    try {
      await db.updateLeave(requestId, {
        status: 'rejected',
        adminComment,
      });
      toast.success('Leave request rejected');
      await loadLeaveRequests();
      closeCommentModal();
    } catch (error: any) {
      console.error('Error rejecting leave:', error);
      toast.error(error.message || 'Failed to reject leave');
    }
  };

  const openCommentModal = (requestId: string, action: 'approve' | 'reject') => {
    setCommentModal({ show: true, requestId, action });
    setComment('');
  };

  const closeCommentModal = () => {
    setCommentModal({ show: false, requestId: '', action: 'approve' });
    setComment('');
  };

  const handleSubmitComment = () => {
    if (commentModal.action === 'approve') {
      handleApprove(commentModal.requestId, comment);
    } else {
      handleReject(commentModal.requestId, comment);
    }
  };

  const getStatusBadge = (status: LeaveRequest['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getLeaveTypeBadge = (type: LeaveRequest['leaveType']) => {
    const styles = {
      paid: 'bg-blue-100 text-blue-800',
      sick: 'bg-purple-100 text-purple-800',
      unpaid: 'bg-gray-100 text-gray-800',
      casual: 'bg-green-100 text-green-800',
    };
    const labels = {
      paid: 'Paid Leave',
      sick: 'Sick Leave',
      unpaid: 'Unpaid Leave',
      casual: 'Casual Leave',
    };
    return (
      <span className={`px-3 py-1 rounded-full ${styles[type]}`}>
        {labels[type]}
      </span>
    );
  };

  const calculateDays = (start: string, end: string) => {
    const startDate = parseDate(start);
    const endDate = parseDate(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Filter requests
  const filteredRequests = filterStatus === 'all' 
    ? leaveRequests 
    : leaveRequests.filter(r => r.status === filterStatus);

  // Stats
  const pendingCount = leaveRequests.filter(r => r.status === 'pending').length;
  const approvedCount = leaveRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = leaveRequests.filter(r => r.status === 'rejected').length;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-gray-900 mb-2">Leave Approvals</h2>
        <p className="text-gray-600">Review and manage employee leave requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-gray-600 mb-1">Total Requests</p>
          <p className="text-gray-900">{leaveRequests.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-gray-600 mb-1">Pending</p>
          <p className="text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-gray-600 mb-1">Approved</p>
          <p className="text-green-600">{approvedCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-gray-600 mb-1">Rejected</p>
          <p className="text-red-600">{rejectedCount}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Leave Requests List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="divide-y divide-gray-200">
          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No leave requests found</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div key={request.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-gray-900">{request.userName}</p>
                      {getLeaveTypeBadge(request.leaveType)}
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {request.startDate} - {request.endDate}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 rounded">
                        {calculateDays(request.startDate, request.endDate)} day(s)
                      </span>
                    </div>
                    <p className="text-gray-500">
                      Submitted on {new Date(request.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => openCommentModal(request.id, 'approve')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => openCommentModal(request.id, 'reject')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>

                {request.remarks && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-1">Employee Remarks:</p>
                    <p className="text-gray-900">{request.remarks}</p>
                  </div>
                )}

                {request.adminComment && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <p className="text-blue-900">Admin Comment:</p>
                    </div>
                    <p className="text-blue-800">{request.adminComment}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Comment Modal */}
      {commentModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900">
                {commentModal.action === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
              </h3>
              <button
                onClick={closeCommentModal}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">
                Add Comment (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Add any comments or notes..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeCommentModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitComment}
                className={`flex-1 px-4 py-2 text-white rounded-lg ${
                  commentModal.action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {commentModal.action === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
