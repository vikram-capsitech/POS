import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchEmployees } from '../services/api'
import { Users, UserPlus, UserMinus, Shield, Building } from 'lucide-react'

const getUserRole = () => {
	const role = localStorage.getItem('role')
	return role || 'admin'
}

export default function AdminPortal() {
	const navigate = useNavigate()
	const [admins, setAdmins] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		const loadAdmins = async () => {
			try {
				const employees = await fetchEmployees()
				// Filter employees who are admins
				const adminEmployees = employees.filter(emp => emp.role === 'admin' || emp.role === 'superadmin')
				setAdmins(adminEmployees)
			} catch (err) {
				setError('Failed to load admin data')
				console.error('Error loading admins:', err)
			} finally {
				setLoading(false)
			}
		}

		loadAdmins()
	}, [])

	const handleAddAdmin = () => {
		// Navigate to add admin page
		navigate('/add-admin')
	}



	const handleRemoveAdmin = (adminId) => {
		// TODO: Implement remove admin functionality
		alert(`Remove admin ${adminId} functionality to be implemented`)
	}

	if (loading) {
		return (
			<div className="admin-portal">
				<div className="admin-portal__header">
					<h1 className="admin-portal__title">Admin Portal</h1>
					<p className="admin-portal__subtitle">Manage system administrators</p>
				</div>
				<div style={{ textAlign: 'center', padding: '40px', color: 'var(--grey-100)' }}>
					Loading admin data...
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="admin-portal">
				<div className="admin-portal__header">
					<h1 className="admin-portal__title">Admin Portal</h1>
					<p className="admin-portal__subtitle">Manage system administrators</p>
				</div>
				<div style={{ textAlign: 'center', padding: '40px', color: 'var(--red-500)' }}>
					{error}
				</div>
			</div>
		)
	}

	return (
		<div className="admin-portal">
			<div className="admin-portal__header">
				<h1 className="admin-portal__title">Admin Portal</h1>
				<p className="admin-portal__subtitle">Manage system administrators</p>
			</div>

			<div className="admin-portal__actions">
				{getUserRole() === 'superadmin' && (
					<button className="btn primary" onClick={() => navigate('/add-restaurant')}>
						<Building size={20} style={{ marginRight: '8px' }} />
						Add Restaurant
					</button>
				)}
				<button className="btn secondary" onClick={handleAddAdmin}>
					<UserPlus size={20} style={{ marginRight: '8px' }} />
					Add New Admin
				</button>
			</div>

			<div className="admin-portal__content">
				<div className="admin-list">
					<h2 className="admin-list__title">
						<Shield size={24} style={{ marginRight: '12px', verticalAlign: 'middle' }} />
						Current Administrators ({admins.length})
					</h2>

					{admins.length === 0 ? (
						<div className="admin-list__empty">
							<Users size={48} style={{ color: 'var(--grey-120)', marginBottom: '16px' }} />
							<p>No administrators found</p>
						</div>
					) : (
						<div className="admin-list__grid">
							{admins.map(admin => (
								<div key={admin.id} className="admin-card">
									<div className="admin-card__header">
										<div className="admin-card__avatar">
											{admin.name.charAt(0).toUpperCase()}
										</div>
										<div className="admin-card__info">
											<h3 className="admin-card__name">{admin.name}</h3>
											<p className="admin-card__role">{admin.role}</p>
										</div>
									</div>
									<div className="admin-card__details">
										<p className="admin-card__email">{admin.email}</p>
										<p className="admin-card__phone">{admin.phone}</p>
									</div>
									<div className="admin-card__actions">
										{admin.role !== 'superadmin' && (
											<button
												className="btn danger small"
												onClick={() => handleRemoveAdmin(admin.id)}
											>
												<UserMinus size={16} style={{ marginRight: '6px' }} />
												Remove Admin
											</button>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
