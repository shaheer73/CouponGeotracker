import React, { useState } from 'react';
import axios from 'axios';


const Home = () => {
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [coupons, setCoupons] = useState([]);
    const [newCouponTitle, setNewCouponTitle] = useState('');
    const [newCouponAddress, setNewCouponAddress] = useState('');

    const handleLocationSubmit = async (e: any) => {
        e.preventDefault();

        try {
            const response = await axios.get(`http://localhost:8000/api/coupons`, {
                params: {
                    latitude,
                    longitude,
                },
            });
            console.log(response.data);
            setCoupons(response.data);

            setLatitude('');
            setLongitude('');
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateCoupon = async (e: any) => {
        e.preventDefault();

        try {
            // Replace with your coupon details
            const newCouponData = {
                title: newCouponTitle,
                address: newCouponAddress,
                radius: 500, // Example radius in meters
            };

            const response = await axios.post('http://localhost:8000/api/coupons', newCouponData);
            console.log('Coupon created:', response.data);

            setNewCouponTitle('');
            setNewCouponAddress('');
            // Optionally, update the UI or display a success message
        } catch (error) {
            console.error('Error creating coupon:', error);
            // Optionally, update the UI or display an error message
        }
    };

    return (
        <div className="container">
            <div className="form-container">
                <h1>Coupon Geotracker</h1>
                <form onSubmit={handleLocationSubmit} className="form">
                    <label className="form-label">
                        Enter your latitude:
                        <input className="form-input" type="text" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
                    </label>
                    <label className="form-label">
                        Enter your longitude:  
                        <input className="form-input" type="text" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
                    </label>
                    <button className="submit-button" type="submit">Retrieve Coupons</button>
                </form>
            </div>

            <div className="coupon-container">
                <h2>Nearby Coupons:</h2>
                <div className="coupon-grid">
                    {coupons.map((coupon: any) => (
                        <div key={coupon._id} className="coupon-card">
                            <h2>{coupon.title}</h2>
                            <strong>Address:</strong> {coupon.address} <br />
                            <strong>Coordinates:</strong> {coupon.location.coordinates.join(', ')}
                        </div>
                    ))}
                </div>
            </div>

            <div className="create-coupon-form">
                <form onSubmit={handleCreateCoupon} className="form">
                    <h2>Create Coupon</h2>
                    <label className="form-label">
                        Title:
                        <input className="form-input" type="text" value={newCouponTitle} onChange={(e) => setNewCouponTitle(e.target.value)} />
                    </label>
                    <label className="form-label">
                        Address:
                        <input className="form-input" type="text" value={newCouponAddress} onChange={(e) => setNewCouponAddress(e.target.value)} />
                    </label>
                    <button className="submit-button" type="submit">Create Coupon</button>
                </form>
            </div>
        </div>
    );
};

export default Home;
