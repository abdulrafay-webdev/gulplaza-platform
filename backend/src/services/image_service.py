import os
from dotenv import load_dotenv

load_dotenv()

imagekit = None
try:
    from imagekitio import ImageKit
    try:
        imagekit = ImageKit(
            public_key=os.getenv("IMAGEKIT_PUBLIC_KEY"),
            private_key=os.getenv("IMAGEKIT_PRIVATE_KEY"),
            url_endpoint=os.getenv("IMAGEKIT_URL_ENDPOINT")
        )
    except TypeError:
        imagekit = ImageKit(
            private_key=os.getenv("IMAGEKIT_PRIVATE_KEY")
        )
except Exception as e:
    print(f"Warning: ImageKit init failed: {e}")

def get_auth_params():
    """Generate authentication parameters for client-side upload."""
    if not imagekit:
        return {}
    if hasattr(imagekit, "get_authentication_parameters"):
        return imagekit.get_authentication_parameters()
    elif hasattr(imagekit, "helper") and hasattr(imagekit.helper, "get_authentication_parameters"):
        return imagekit.helper.get_authentication_parameters()
    return {}
