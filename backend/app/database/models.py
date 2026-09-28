from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON, Boolean
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

# 1. USER PROFILE & WALLET (Matches "My Profile" & "My Wallet")
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    google_id = Column(String, unique=True, index=True) # From Google OAuth
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    
    # Wallet & Rewards
    wallet_balance = Column(Float, default=0.0)     # In INR (₹)
    reward_points = Column(Integer, default=0)      # Earned from previous bookings
    
    # Relationships to other tables
    trips = relationship("Trip", back_populates="owner")
    wishlist = relationship("WishlistItem", back_populates="owner")

# 2. TRAVEL HISTORY (Matches "My Trips")
class Trip(Base):
    __tablename__ = "trips"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Booking Metadata
    booking_reference = Column(String, unique=True, index=True) # e.g., TM-FLIGHT-9823
    destination = Column(String)
    total_cost = Column(Float)
    booking_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="UPCOMING") # UPCOMING, COMPLETED, CANCELLED
    
    # The actual travel data (We can just dump the AI's JSON output here!)
    package_details = Column(JSON) 
    
    owner = relationship("User", back_populates="trips")

# 3. SAVED DEALS (Matches "Wishlist")
class WishlistItem(Base):
    __tablename__ = "wishlist"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    title = Column(String) # e.g., "5 Days in Goa"
    saved_price = Column(String)
    
    # Dump the scraped data so they can view it later without re-scraping
    deal_data = Column(JSON) 
    saved_on = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="wishlist")