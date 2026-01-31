"""
Router for admin-related endpoints
"""
from fastapi import APIRouter, HTTPException
from firebase_admin import auth
from typing import List, Dict
import logging

router = APIRouter(prefix="/api/admin", tags=["Admin"])
logger = logging.getLogger(__name__)


@router.get("/users")
async def get_all_users() -> Dict:
    """
    Get all registered users from Firebase Authentication.
    Returns user details including email, display name, creation time, etc.
    """
    try:
        all_users = []
        page = auth.list_users()
        
        while page:
            for user in page.users:
                user_data = {
                    "uid": user.uid,
                    "email": user.email,
                    "display_name": user.display_name or "Not set",
                    "email_verified": user.email_verified,
                    "provider": user.provider_data[0].provider_id if user.provider_data else "N/A",
                    "created_at": user.user_metadata.creation_timestamp,
                    "last_sign_in": user.user_metadata.last_sign_in_timestamp,
                    "disabled": user.disabled,
                    "photo_url": user.photo_url
                }
                all_users.append(user_data)
            
            # Get next batch of users
            page = page.get_next_page()
        
        # Sort by creation date (newest first)
        all_users.sort(key=lambda x: x["created_at"], reverse=True)
        
        return {
            "users": all_users,
            "total_count": len(all_users)
        }
        
    except Exception as e:
        logger.error(f"Error fetching users: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch users: {str(e)}")
