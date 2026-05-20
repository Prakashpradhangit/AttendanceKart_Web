import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit3, 
  Camera, 
  IdCard, 
  Calendar, 
  Heart, 
  Droplet, 
  Flag,
  UserCircle,
  Save,
  X,
  Upload,
  FileText,
  CheckCircle2
} from 'lucide-react';
import Modal from '../components/Modal';

const EmployeeProfile = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    role: "",
    employeeId: "",
    email: "",
    phone: "",
    address: "",
    profileImage: "",
    emergencyContact: {
      name: "",
      phone: "",
      address: ""
    },
    personalInfo: {
      fullName: "",
      gender: "",
      maritalStatus: "",
      nationality: "",
      dob: "",
      bloodGroup: "",
      personalEmail: ""
    }
  });

  const [editFormData, setEditFormData] = useState({ ...profileData });

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData({
          name: data.name || '',
          role: data.designation || '',
          employeeId: data.employeeCode || '',
          email: data.email || '',
          phone: data.phoneNumber || '',
          address: data.address || '',
          profileImage: data.profileImage || '',
          emergencyContact: {
            name: data.emergencyContactName || '',
            phone: data.emergencyContactPhone || '',
            address: data.emergencyContactAddress || ''
          },
          personalInfo: {
            fullName: data.name || '',
            gender: data.gender || '',
            maritalStatus: data.maritalStatus || '',
            nationality: data.nationality || '',
            dob: data.dob || '',
            bloodGroup: data.bloodGroup || '',
            personalEmail: data.personalEmail || ''
          }
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEditClick = () => {
    setEditFormData({ ...profileData });
    setIsEditModalOpen(true);
  };

  const handleInputChange = (e, section, field) => {
    const { name, value } = e.target;
    if (section) {
      setEditFormData(prev => {
        const updatedSection = {
          ...prev[section],
          [field || name]: value
        };
        const extra = {};
        if (section === 'personalInfo' && (field || name) === 'fullName') {
          extra.name = value;
        }
        return {
          ...prev,
          [section]: updatedSection,
          ...extra
        };
      });
    } else {
      setEditFormData(prev => {
        const extra = {};
        if (name === 'name') {
          extra.personalInfo = {
            ...prev.personalInfo,
            fullName: value
          };
        }
        return {
          ...prev,
          [name]: value,
          ...extra
        };
      });
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;

      // Optimistic update
      setProfileData(prev => ({
        ...prev,
        profileImage: base64String
      }));

      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            profileImage: base64String
          })
        });

        if (res.ok) {
          const data = await res.json();
          setProfileData(prev => ({
            ...prev,
            profileImage: data.profileImage || ''
          }));
        } else {
          alert('Failed to save profile image.');
        }
      } catch (err) {
        console.error('Error uploading profile image:', err);
        alert('An error occurred during upload.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const payload = {
        name: editFormData.name,
        designation: editFormData.role,
        phoneNumber: editFormData.phone,
        gender: editFormData.personalInfo.gender,
        address: editFormData.address,
        emergencyContactName: editFormData.emergencyContact.name,
        emergencyContactPhone: editFormData.emergencyContact.phone,
        emergencyContactAddress: editFormData.emergencyContact.address,
        maritalStatus: editFormData.personalInfo.maritalStatus,
        nationality: editFormData.personalInfo.nationality,
        dob: editFormData.personalInfo.dob,
        bloodGroup: editFormData.personalInfo.bloodGroup,
        personalEmail: editFormData.personalInfo.personalEmail
      };

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setProfileData({
          name: data.name || '',
          role: data.designation || '',
          employeeId: data.employeeCode || '',
          email: data.email || '',
          phone: data.phoneNumber || '',
          address: data.address || '',
          profileImage: data.profileImage || '',
          emergencyContact: {
            name: data.emergencyContactName || '',
            phone: data.emergencyContactPhone || '',
            address: data.emergencyContactAddress || ''
          },
          personalInfo: {
            fullName: data.name || '',
            gender: data.gender || '',
            maritalStatus: data.maritalStatus || '',
            nationality: data.nationality || '',
            dob: data.dob || '',
            bloodGroup: data.bloodGroup || '',
            personalEmail: data.personalEmail || ''
          }
        });
        setIsEditModalOpen(false);
      } else {
        alert('Failed to save profile. Please try again.');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('An error occurred while saving.');
    }
  };

  return (
    <div className="px-6 pb-6 bg-gray-50 min-h-screen lg:-mt-10 -mt-4">
      {/* Header */}
      <div className="mb-6 pt-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
      </div>

      <div className="flex flex-col gap-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-50 shadow-md bg-gray-50 flex items-center justify-center">
              {profileData.profileImage ? (
                <img 
                  src={profileData.profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircle size={80} className="text-gray-300" />
              )}
            </div>
            <button 
              onClick={() => document.getElementById('profile-file-input').click()}
              className="absolute bottom-1 right-1 p-2 bg-white rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <Camera size={16} className="text-blue-600" />
            </button>
            <input 
              id="profile-file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-1">{profileData.name}</h2>
            <p className="text-gray-500 font-medium text-lg mb-3">{profileData.role}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-semibold border border-blue-100 flex items-center gap-2">
                <IdCard size={16} />
                {profileData.employeeId}
              </span>
              <span className="bg-gray-50 text-gray-600 px-4 py-1.5 rounded-full text-sm font-semibold border border-gray-100 flex items-center gap-2">
                <Mail size={16} />
                {profileData.email}
              </span>
              <span className="bg-gray-50 text-gray-600 px-4 py-1.5 rounded-full text-sm font-semibold border border-gray-100 flex items-center gap-2">
                <Phone size={16} />
                {profileData.phone}
              </span>
            </div>
          </div>
        </div>

        {/* Personal Information Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
            <button 
              onClick={handleEditClick}
              className="flex items-center gap-2 px-6 py-2.5 border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all"
            >
              <Edit3 size={18} />
              Edit
            </button>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
              <InfoItem icon={<UserCircle className="text-blue-500" />} label="Full Name" value={profileData.personalInfo.fullName} />
              <InfoItem icon={<IdCard className="text-blue-500" />} label="Employee ID" value={profileData.employeeId} />
              <InfoItem icon={<UserCircle className="text-blue-500" />} label="Gender" value={profileData.personalInfo.gender} />
              <InfoItem icon={<Calendar className="text-blue-500" />} label="Date of Birth" value={profileData.personalInfo.dob ? new Date(profileData.personalInfo.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not set'} />
              <InfoItem icon={<Heart className="text-blue-500" />} label="Marital Status" value={profileData.personalInfo.maritalStatus} />
              <InfoItem icon={<Droplet className="text-blue-500" />} label="Blood Group" value={profileData.personalInfo.bloodGroup} />
              <InfoItem icon={<Flag className="text-blue-500" />} label="Nationality" value={profileData.personalInfo.nationality} />
              <InfoItem icon={<Mail className="text-blue-500" />} label="Personal Email" value={profileData.personalInfo.personalEmail} />
              <InfoItem icon={<Phone className="text-blue-500" />} label="Mobile Number" value={profileData.phone} />
              <div className="md:col-span-2 lg:col-span-3">
                <InfoItem icon={<MapPin className="text-blue-500" />} label="Address" value={profileData.address} />
              </div>
            </div>

            <div className="mt-16">
              <h3 className="text-gray-900 font-bold mb-8">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-2xl">
                    <User size={22} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-tight">Name</p>
                    <p className="text-sm font-semibold text-gray-800">{profileData.emergencyContact.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-2xl">
                    <Phone size={22} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-tight">Mobile Number</p>
                    <p className="text-sm font-semibold text-gray-800">{profileData.emergencyContact.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-2xl">
                    <MapPin size={22} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-tight">Address</p>
                    <p className="text-sm font-semibold text-gray-800 leading-relaxed">{profileData.emergencyContact.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-8 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Documents</h2>
            <span className="text-sm font-medium text-gray-500 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">
              4 Required Documents
            </span>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <DocumentUploadItem 
                label="PAN Card" 
                description="Upload clear copy of your PAN card" 
                hasInput={true}
                inputLabel="PAN Number"
                placeholder="e.g. ABCDE1234F"
              />
              <DocumentUploadItem 
                label="Aadhar Card" 
                description="Upload front & back of Aadhar card" 
                hasInput={true}
                inputLabel="Aadhar Number"
                placeholder="e.g. 1234 5678 9012"
              />
              <DocumentUploadItem 
                label="Bank Passbook" 
                description="First page with bank details" 
                hasInput={true}
                inputLabel="Account Number"
                placeholder="e.g. 9876543210123"
              />
              <DocumentUploadItem 
                label="Last Working Payslip" 
                description="Recent month salary slip" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="Edit Personal Information"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Full Name" name="fullName" value={editFormData.personalInfo.fullName} onChange={(e) => handleInputChange(e, 'personalInfo', 'fullName')} />
            <InputField label="Gender" name="gender" value={editFormData.personalInfo.gender} onChange={(e) => handleInputChange(e, 'personalInfo', 'gender')} />
            <InputField label="Date of Birth" name="dob" type="date" value={editFormData.personalInfo.dob} onChange={(e) => handleInputChange(e, 'personalInfo', 'dob')} />
            <InputField label="Marital Status" name="maritalStatus" value={editFormData.personalInfo.maritalStatus} onChange={(e) => handleInputChange(e, 'personalInfo', 'maritalStatus')} />
            <InputField label="Blood Group" name="bloodGroup" value={editFormData.personalInfo.bloodGroup} onChange={(e) => handleInputChange(e, 'personalInfo', 'bloodGroup')} />
            <InputField label="Nationality" name="nationality" value={editFormData.personalInfo.nationality} onChange={(e) => handleInputChange(e, 'personalInfo', 'nationality')} />
            <InputField label="Personal Email" name="personalEmail" type="email" value={editFormData.personalInfo.personalEmail} onChange={(e) => handleInputChange(e, 'personalInfo', 'personalEmail')} />
            <InputField label="Mobile Number" name="phone" value={editFormData.phone} onChange={(e) => handleInputChange(e, null, 'phone')} />
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
              <textarea 
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none h-24"
                value={editFormData.address}
                onChange={(e) => handleInputChange(e, null, 'address')}
              />
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Contact Name" name="name" value={editFormData.emergencyContact.name} onChange={(e) => handleInputChange(e, 'emergencyContact', 'name')} />
              <InputField label="Contact Number" name="phone" value={editFormData.emergencyContact.phone} onChange={(e) => handleInputChange(e, 'emergencyContact', 'phone')} />
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Contact Address</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none h-24"
                  value={editFormData.emergencyContact.address}
                  onChange={(e) => handleInputChange(e, 'emergencyContact', 'address')}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button 
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              <X size={20} />
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-6 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
            >
              <Save size={20} />
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-5">
    <div className="p-3 bg-blue-50 rounded-2xl min-w-[52px] h-[52px] flex items-center justify-center">
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-400 mb-0.5">{label}</p>
      <p className="text-base font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const InputField = ({ label, type = "text", ...props }) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
    <input 
      type={type}
      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
      {...props}
    />
  </div>
);

const DocumentUploadItem = ({ label, description, hasInput, inputLabel, placeholder }) => (
  <div className="p-6 border-2 border-dashed border-gray-100 rounded-[32px] hover:border-blue-200 hover:bg-blue-50/20 transition-all group">
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="p-3.5 bg-gray-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
          <FileText size={26} className="text-gray-400 group-hover:text-blue-500" />
        </div>
        <div>
          <h4 className="text-base font-bold text-gray-900 mb-1">{label}</h4>
          <p className="text-xs text-gray-500 font-medium">{description}</p>
        </div>
      </div>
      <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:text-blue-600 hover:border-blue-600 transition-all shadow-sm active:scale-95">
        <Upload size={16} />
        Upload
      </button>
    </div>

    {hasInput && (
      <div className="mt-4 pt-4 border-t border-gray-50">
        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
          {inputLabel}
        </label>
        <input 
          type="text" 
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm font-semibold text-gray-900 placeholder:text-gray-300"
        />
      </div>
    )}
  </div>
);

export default EmployeeProfile;
