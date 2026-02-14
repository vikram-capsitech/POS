import { useState } from 'react'
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X } from 'lucide-react'

export default function AdminProfile() {
	const [isEditing, setIsEditing] = useState(false)
	const [profile, setProfile] = useState({
		name: 'Harshul',
		email: 'harshul@jumbofood.com',
		phone: '+91 9876543210',
		location: 'Mumbai, India',
		joinDate: '2023-01-15',
		role: 'Administrator',
		department: 'Operations'
	})

	const handleSave = () => {
		// Here you would typically save to backend
		setIsEditing(false)
		alert('Profile updated successfully!')
	}

	const handleCancel = () => {
		// Reset any changes if needed
		setIsEditing(false)
	}

	const handleInputChange = (field, value) => {
		setProfile(prev => ({
			...prev,
			[field]: value
		}))
	}

	return (
		<div className="panel">
			<div className="profile-header">
				<div className="profile-avatar-large">
					<User size={64} />
				</div>
				<div className="profile-info-main">
					<h1 className="profile-name">{profile.name}</h1>
					<p className="profile-role">{profile.role} - {profile.department}</p>
					<div className="profile-actions">
						{!isEditing ? (
							<button className="btn create" onClick={() => setIsEditing(true)}>
								<Edit className="btn-icon" size={18} />
								Edit Profile
							</button>
						) : (
							<div className="edit-actions">
								<button className="btn success" onClick={handleSave}>
									<Save className="btn-icon" size={18} />
									Save Changes
								</button>
								<button className="btn ghost" onClick={handleCancel}>
									<X className="btn-icon" size={18} />
									Cancel
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="profile-details">
				<div className="profile-section">
					<h2 className="section-title">Personal Information</h2>
					<div className="profile-fields">
						<div className="field-group">
							<label className="field-label">
								<User size={16} />
								Full Name
							</label>
							{isEditing ? (
								<input
									type="text"
									className="field-input"
									value={profile.name}
									onChange={(e) => handleInputChange('name', e.target.value)}
								/>
							) : (
								<div className="field-value">{profile.name}</div>
							)}
						</div>

						<div className="field-group">
							<label className="field-label">
								<Mail size={16} />
								Email Address
							</label>
							{isEditing ? (
								<input
									type="email"
									className="field-input"
									value={profile.email}
									onChange={(e) => handleInputChange('email', e.target.value)}
								/>
							) : (
								<div className="field-value">{profile.email}</div>
							)}
						</div>

						<div className="field-group">
							<label className="field-label">
								<Phone size={16} />
								Phone Number
							</label>
							{isEditing ? (
								<input
									type="tel"
									className="field-input"
									value={profile.phone}
									onChange={(e) => handleInputChange('phone', e.target.value)}
								/>
							) : (
								<div className="field-value">{profile.phone}</div>
							)}
						</div>

						<div className="field-group">
							<label className="field-label">
								<MapPin size={16} />
								Location
							</label>
							{isEditing ? (
								<input
									type="text"
									className="field-input"
									value={profile.location}
									onChange={(e) => handleInputChange('location', e.target.value)}
								/>
							) : (
								<div className="field-value">{profile.location}</div>
							)}
						</div>

						<div className="field-group">
							<label className="field-label">
								<Calendar size={16} />
								Join Date
							</label>
							<div className="field-value">{profile.joinDate}</div>
						</div>
					</div>
				</div>

				<div className="profile-section">
					<h2 className="section-title">Account Settings</h2>
					<div className="settings-grid">
						<div className="setting-card">
							<h3 className="setting-title">Password</h3>
							<p className="setting-desc">Change your account password</p>
							<button className="btn outline" onClick={() => alert('Password change feature coming soon!')}>
								Change Password
							</button>
						</div>

						<div className="setting-card">
							<h3 className="setting-title">Notifications</h3>
							<p className="setting-desc">Manage notification preferences</p>
							<button className="btn outline" onClick={() => alert('Notification settings coming soon!')}>
								Manage Notifications
							</button>
						</div>

						<div className="setting-card">
							<h3 className="setting-title">Security</h3>
							<p className="setting-desc">Two-factor authentication and security settings</p>
							<button className="btn outline" onClick={() => alert('Security settings coming soon!')}>
								Security Settings
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
