"""
Validation middleware for file uploads and request validation.
"""

from fastapi import UploadFile, HTTPException, status
from typing import List
import os
from config.settings import settings, get_max_file_size_bytes, is_allowed_file_extension
import logging

logger = logging.getLogger(__name__)


async def validate_file_upload(file: UploadFile) -> None:
    """
    Validate uploaded file for security and size constraints.
    
    Args:
        file: The uploaded file to validate
        
    Raises:
        HTTPException: If validation fails
    """
    # Check if file exists
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    # Check filename
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename"
        )
    
    # Check file extension
    if not is_allowed_file_extension(file.filename):
        allowed = ", ".join(settings.allowed_extensions)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {allowed}"
        )
    
    # Check file size
    max_size = get_max_file_size_bytes()
    
    # Read file to check size (FastAPI UploadFile doesn't have size property)
    contents = await file.read()
    file_size = len(contents)
    
    # Reset file pointer so it can be read again
    await file.seek(0)
    
    if file_size > max_size:
        max_mb = settings.max_file_size_mb
        actual_mb = file_size / (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size: {max_mb}MB. Your file: {actual_mb:.2f}MB"
        )
    
    # Check for path traversal attempts
    if ".." in file.filename or "/" in file.filename or "\\" in file.filename:
        logger.warning(f"Potential path traversal attempt detected: {file.filename}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename - path characters not allowed"
        )
    
    logger.info(f"File validation passed: {file.filename} ({file_size} bytes)")


async def validate_multiple_file_uploads(files: List[UploadFile]) -> None:
    """
    Validate multiple uploaded files.
    
    Args:
        files: List of uploaded files to validate
        
    Raises:
        HTTPException: If validation fails
    """
    if not files or len(files) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files provided"
        )
    
    # Check maximum number of files (prevent DoS)
    max_files = 50
    if len(files) > max_files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Too many files. Maximum: {max_files}, provided: {len(files)}"
        )
    
    # Validate each file
    for file in files:
        await validate_file_upload(file)


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent security issues.
    
    Args:
        filename: Original filename
        
    Returns:
        Sanitized filename
    """
    # Get basename to remove any path components
    filename = os.path.basename(filename)
    
    # Remove or replace dangerous characters
    # Keep only alphanumeric, dash, underscore, and dot
    safe_chars = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.")
    sanitized = "".join(c if c in safe_chars else "_" for c in filename)
    
    # Ensure filename doesn't start with a dot (hidden file)
    if sanitized.startswith("."):
        sanitized = "_" + sanitized[1:]
    
    return sanitized
