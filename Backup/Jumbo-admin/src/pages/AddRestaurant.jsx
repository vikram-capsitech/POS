import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { addRestaurant } from '../services/api'
import {  Building, User, Phone, Mail, MapPin, Lock } from 'lucide-react'

export default function AddRestaurant() {
	const navigate = useNavigate()
	const [formData, setFormData] = useState({
		restaurantName: '',
		restaurantAddress: '',
		adminName: '',
		adminEmail: '',
		adminPhone: '',
		adminPassword: ''
	})

	const handleInputChange = (e) => {
		const { name, value } = e.target
		setFormData(prev => ({
			...prev,
			[name]: value
		}))
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		try {
			const restaurantData = {
				name: formData.restaurantName,
				address: formData.restaurantAddress,
				admin: {
					name: formData.adminName,
					email: formData.adminEmail,
					phone: formData.adminPhone,
					password: formData.adminPassword
				}
			}
			await addRestaurant(restaurantData)
			alert('Restaurant and admin added successfully!')
			navigate('/admin-portal')
		} catch (error) {
			console.error('Error adding restaurant:', error)
			alert('Failed to add restaurant. Please try again.')
		}
	}

	return (
		<div className="task-create">
			<div className="task-create__panel">
				<div className="task-create__breadcrumb">
					<Link to="/admin-portal" className="crumb-dim" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
						Admin Portal
					</Link>
					<span className="crumb-sep">›</span>
					<span className="crumb">Add Restaurant</span>
				</div>

				<div className="task-details">
					<div className="task-details__header">
						<h1 className="task-details__title">Add New Restaurant</h1>
						<p className="task-details__subtitle">Create a new restaurant and assign an admin</p>
					</div>

					<form onSubmit={handleSubmit} className="task-details__content">
						<div className="form-section">
							<h3 className="form-section__title">
								<Building size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
								Restaurant Details
							</h3>
							<div className="form-row">
								<div className="form-col">
									<label className="label-lg">
										<Building size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
										Restaurant Name *
									</label>
									<input
										type="text"
										name="restaurantName"
										value={formData.restaurantName}
										onChange={handleInputChange}
										className="form-input"
										placeholder="Enter restaurant name"
										required
									/>
								</div>
							</div>
							<div className="form-field">
								<label className="label-lg">
									<MapPin size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
									Restaurant Address *
								</label>
								<textarea
									name="restaurantAddress"
									value={formData.restaurantAddress}
									onChange={handleInputChange}
									className="form-input"
									placeholder="Enter full restaurant address"
									rows="3"
									required
								/>
							</div>
						</div>

						<div className="form-section">
							<h3 className="form-section__title">
								<User size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
								Admin Details
							</h3>
							<div className="form-row">
								<div className="form-col">
									<label className="label-lg">
										<User size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
										Full Name *
									</label>
									<input
										type="text"
										name="adminName"
										value={formData.adminName}
										onChange={handleInputChange}
										className="form-input"
										placeholder="Enter admin full name"
										required
									/>
								</div>
								<div className="form-col">
									<label className="label-lg">
										<Phone size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
										Phone Number *
									</label>
									<input
										type="tel"
										name="adminPhone"
										value={formData.adminPhone}
										onChange={handleInputChange}
										className="form-input"
										placeholder="+91 9876543210"
										required
									/>
								</div>
							</div>

							<div className="form-row">
								<div className="form-col">
									<label className="label-lg">
										<Mail size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
										Email *
									</label>
									<input
										type="email"
										name="adminEmail"
										value={formData.adminEmail}
										onChange={handleInputChange}
										className="form-input"
										placeholder="admin@example.com"
										required
									/>
								</div>
								<div className="form-col">
									<label className="label-lg">
										<Lock size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
										Password *
									</label>
									<input
										type="password"
										name="adminPassword"
										value={formData.adminPassword}
										onChange={handleInputChange}
										className="form-input"
										placeholder="Enter password"
										required
									/>
								</div>
							</div>
						</div>

						<div className="task-details__actions">
							<button type="button" className="btn ghost" onClick={() => navigate('/admin-portal')}>
								Cancel
							</button>
							<button type="submit" className="btn create">
								Add Restaurant & Admin
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}
