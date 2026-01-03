import { useState, useEffect } from 'react';
import { User } from '../../App';
import { Camera, MapPin, Phone, Mail, Briefcase, Calendar, User as UserIcon, CreditCard } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { db, EmployeeProfile } from '../../services/database';
import { formatINR } from '../../utils/currencyUtils';

interface ProfileViewProps {
  user: User;
}

export function ProfileView({ user }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState<EmployeeProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, [user.id]);

  const loadProfile = async () => {
    try {
      const userProfile = await db.getProfileById(user.id);
      if (userProfile) {
        setProfile(userProfile);
        setEditedProfile(userProfile);
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast.error(error.message || 'Failed to load profile');
    }
  };

  const handleSave = async () => {
    if (!editedProfile) return;

    try {
      const updated = await db.updateProfile(user.id, {
        phone: editedProfile.phone,
        address: editedProfile.address,
        emergencyContact: editedProfile.emergencyContact,
        emergencyContactNumber: editedProfile.emergencyContactNumber,
      });

      if (updated) {
        setProfile(updated);
        setIsEditing(false);
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  if (!profile || !editedProfile) {
    return <div className="text-center py-12">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 h-32"></div>
        
        <div className="px-8 pb-8">
          {/* Profile Picture */}
          <div className="relative -mt-16 mb-6">
            <div className="inline-block">
              <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600">{profile?.fullName?.charAt(0) || 'U'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-gray-900 mb-1">{profile?.fullName || 'Profile'}</h2>
              <p className="text-gray-600">{profile?.designation || 'Not specified'}</p>
              <p className="text-gray-500">{profile.employeeId}</p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {/* Profile Sections */}
          <div className="space-y-6">
            {/* Personal Details */}
            <div>
              <h3 className="text-gray-900 mb-4">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 mb-2">Phone Number</label>
                  {isEditing ? (
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={editedProfile.phone}
                        onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-900">
                      <Phone className="w-5 h-5 text-gray-400" />
                      {profile?.phone || 'Not provided'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-600 mb-2">Email</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Mail className="w-5 h-5 text-gray-400" />
                    {profile?.phone || 'Not provided'}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-600 mb-2">Department</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Briefcase className="w-5 h-5 text-gray-400" />
                    {profile?.department || 'Not specified'}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-600 mb-2">Employment Type</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                    {profile?.employmentType || 'Not specified'}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-600 mb-2">Address</label>
                  {isEditing ? (
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <textarea
                        value={editedProfile.address}
                        onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                        rows={2}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-gray-900">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      {profile?.address || 'Not provided'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Job Details */}
            <div>
              <h3 className="text-gray-900 mb-4">Job Details (Read-only)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 mb-2">Employee ID</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    {user?.employeeId || 'Not set'}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-600 mb-2">Department</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Briefcase className="w-5 h-5 text-gray-400" />
                    {profile.department}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-600 mb-2">Job Title</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Briefcase className="w-5 h-5 text-gray-400" />
                    {profile?.designation || 'Not specified'}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-600 mb-2">Joining Date</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    {profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'Not set'}
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-gray-900 mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 mb-2">Contact Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.emergencyContact || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, emergencyContact: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="text-gray-900">{profile.emergencyContact || 'Not set'}</div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-600 mb-2">Contact Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedProfile.emergencyContactNumber || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, emergencyContactNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="text-gray-900">{profile.emergencyContactNumber || 'Not set'}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Salary Structure */}
            <div>
              <h3 className="text-gray-900 mb-4">Salary Structure (Read-only)</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Annual Salary (CTC)</span>
                  <span className="text-gray-900">{formatINR(profile.salary)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Monthly Salary</span>
                  <span className="text-gray-900">{formatINR(Math.round(profile.salary / 12))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
