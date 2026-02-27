import { useState } from 'react'
import { Palette, Bell, Shield,  Save, Moon, Sun, Monitor } from 'lucide-react'
import { useAppTheme } from "../context/ThemeContext";
import { updateRestaurantTheme } from "../services/api";
import { toast } from "sonner";

export default function Settings() {
	const [settings, setSettings] = useState({
		theme: 'light', // light, dark, system
		language: 'en',
		timezone: 'Asia/Kolkata',
		notifications: {
			email: true,
			push: true,
			sms: false,
			taskReminders: true,
			systemUpdates: true
		},
		privacy: {
			profileVisibility: 'private',
			dataSharing: false,
			analytics: true
		}
	})

	const { primaryColor, setPrimaryColor } = useAppTheme();
	const [selectedColor, setSelectedColor] = useState(primaryColor);

	const handleSettingChange = (category, key, value) => {
		setSettings(prev => ({
			...prev,
			[category]: typeof prev[category] === 'object' ? {
				...prev[category],
				[key]: value
			} : value
		}))
	}

	const handleSave = async () => {
		try {
			if (selectedColor !== primaryColor) {
				await updateRestaurantTheme({ primary: selectedColor });
				setPrimaryColor(selectedColor);
			}
			toast.success('Settings saved successfully!');
		} catch (error) {
			console.error(error);
			toast.error('Failed to save settings');
		}
	}

	const themes = [
		{ value: 'light', label: 'Light', icon: Sun },
		{ value: 'dark', label: 'Dark', icon: Moon },
		{ value: 'system', label: 'System', icon: Monitor }
	]

	const languages = [
		{ value: 'en', label: 'English' },
		{ value: 'hi', label: 'Hindi' },
		{ value: 'mr', label: 'Marathi' }
	]

	const timezones = [
		{ value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
		{ value: 'UTC', label: 'UTC' },
		{ value: 'America/New_York', label: 'America/New_York (EST)' }
	]

	return (
		<div className="panel">
			<div className="settings-header">
				<h1 className="settings-title">Settings</h1>
				<p className="settings-subtitle">Manage your account preferences and system settings</p>
			</div>

			<div className="settings-content">
				{/* Appearance Section */}
				<div className="settings-section">
					<div className="section-header">
						<Palette className="section-icon" size={20} />
						<h2 className="section-title">Appearance</h2>
					</div>
					<div className="section-content">
						<div className="setting-group">
							<label className="setting-label">Theme</label>
							<div className="theme-options">
								{themes.map(({ value, label, icon: Icon }) => (
									<button
										key={value}
										className={`theme-option ${settings.theme === value ? 'active' : ''}`}
										onClick={() => handleSettingChange('theme', null, value)}
									>
										<Icon size={16} />
										<span>{label}</span>
									</button>
								))}
							</div>
						</div>

						<div className="setting-group">
							<label className="setting-label">Primary Color</label>
							<div className="theme-options" style={{ flexWrap: 'wrap', gap: '1rem' }}>
								{[
									{ value: '#5240d6', label: 'Default' },
									{ value: '#ec4899', label: 'Pink' },
									{ value: '#10b981', label: 'Emerald' },
									{ value: '#3b82f6', label: 'Blue' },
									{ value: '#f97316', label: 'Orange' },
									{ value: '#ef4444', label: 'Red' },
								].map(({ value, label }) => (
									<button
										key={value}
										className={`theme-option ${selectedColor === value ? 'active' : ''}`}
										onClick={() => setSelectedColor(value)}
										style={{ 
											borderColor: selectedColor === value ? value : 'transparent',
											borderWidth: '2px',
											background: 'transparent'
										}}
									>
										<div style={{ width: 16, height: 16, borderRadius: '50%', background: value }}></div>
										<span>{label}</span>
									</button>
								))}
								<div className="theme-option" style={{ padding: '0.5rem' }}>
									<input 
										type="color" 
										value={selectedColor} 
										onChange={(e) => setSelectedColor(e.target.value)} 
										style={{ border: 'none', background: 'transparent', width: 32, height: 32, cursor: 'pointer' }}
									/>
									<span>Custom</span>
								</div>
							</div>
						</div>

						<div className="setting-group">
							<label className="setting-label">Language</label>
							<select
								className="setting-select"
								value={settings.language}
								onChange={(e) => handleSettingChange('language', null, e.target.value)}
							>
								{languages.map(({ value, label }) => (
									<option key={value} value={value}>{label}</option>
								))}
							</select>
						</div>

						<div className="setting-group">
							<label className="setting-label">Timezone</label>
							<select
								className="setting-select"
								value={settings.timezone}
								onChange={(e) => handleSettingChange('timezone', null, e.target.value)}
							>
								{timezones.map(({ value, label }) => (
									<option key={value} value={value}>{label}</option>
								))}
							</select>
						</div>
					</div>
				</div>

				{/* Notifications Section */}
				<div className="settings-section">
					<div className="section-header">
						<Bell className="section-icon" size={20} />
						<h2 className="section-title">Notifications</h2>
					</div>
					<div className="section-content">
						<div className="notification-settings">
							<div className="setting-toggle">
								<div className="toggle-info">
									<label className="toggle-label">Email Notifications</label>
									<p className="toggle-desc">Receive notifications via email</p>
								</div>
								<label className="toggle-switch">
									<input
										type="checkbox"
										checked={settings.notifications.email}
										onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
									/>
									<span className="toggle-slider"></span>
								</label>
							</div>

							<div className="setting-toggle">
								<div className="toggle-info">
									<label className="toggle-label">Push Notifications</label>
									<p className="toggle-desc">Receive push notifications in browser</p>
								</div>
								<label className="toggle-switch">
									<input
										type="checkbox"
										checked={settings.notifications.push}
										onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
									/>
									<span className="toggle-slider"></span>
								</label>
							</div>

							<div className="setting-toggle">
								<div className="toggle-info">
									<label className="toggle-label">SMS Notifications</label>
									<p className="toggle-desc">Receive notifications via SMS</p>
								</div>
								<label className="toggle-switch">
									<input
										type="checkbox"
										checked={settings.notifications.sms}
										onChange={(e) => handleSettingChange('notifications', 'sms', e.target.checked)}
									/>
									<span className="toggle-slider"></span>
								</label>
							</div>

							<div className="setting-toggle">
								<div className="toggle-info">
									<label className="toggle-label">Task Reminders</label>
									<p className="toggle-desc">Get reminded about pending tasks</p>
								</div>
								<label className="toggle-switch">
									<input
										type="checkbox"
										checked={settings.notifications.taskReminders}
										onChange={(e) => handleSettingChange('notifications', 'taskReminders', e.target.checked)}
									/>
									<span className="toggle-slider"></span>
								</label>
							</div>

							<div className="setting-toggle">
								<div className="toggle-info">
									<label className="toggle-label">System Updates</label>
									<p className="toggle-desc">Receive notifications about system updates</p>
								</div>
								<label className="toggle-switch">
									<input
										type="checkbox"
										checked={settings.notifications.systemUpdates}
										onChange={(e) => handleSettingChange('notifications', 'systemUpdates', e.target.checked)}
									/>
									<span className="toggle-slider"></span>
								</label>
							</div>
						</div>
					</div>
				</div>

				{/* Privacy & Security Section */}
				<div className="settings-section">
					<div className="section-header">
						<Shield className="section-icon" size={20} />
						<h2 className="section-title">Privacy & Security</h2>
					</div>
					<div className="section-content">
						<div className="setting-group">
							<label className="setting-label">Profile Visibility</label>
							<select
								className="setting-select"
								value={settings.privacy.profileVisibility}
								onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
							>
								<option value="public">Public</option>
								<option value="private">Private</option>
								<option value="team">Team Only</option>
							</select>
						</div>

						<div className="setting-toggle">
							<div className="toggle-info">
								<label className="toggle-label">Data Sharing</label>
								<p className="toggle-desc">Allow sharing of anonymized data for improvements</p>
							</div>
							<label className="toggle-switch">
								<input
									type="checkbox"
									checked={settings.privacy.dataSharing}
									onChange={(e) => handleSettingChange('privacy', 'dataSharing', e.target.checked)}
								/>
								<span className="toggle-slider"></span>
							</label>
						</div>

						<div className="setting-toggle">
							<div className="toggle-info">
								<label className="toggle-label">Analytics</label>
								<p className="toggle-desc">Help improve the app with usage analytics</p>
							</div>
							<label className="toggle-switch">
								<input
									type="checkbox"
									checked={settings.privacy.analytics}
									onChange={(e) => handleSettingChange('privacy', 'analytics', e.target.checked)}
								/>
								<span className="toggle-slider"></span>
							</label>
						</div>
					</div>
				</div>

				{/* Save Button */}
				<div className="settings-actions">
					<button className="btn create" onClick={handleSave}>
						<Save className="btn-icon" size={18} />
						Save Settings
					</button>
				</div>
			</div>
		</div>
	)
}
