import os
from imagekitio import ImageKit
from dotenv import load_dotenv

load_dotenv()

imagekit = ImageKit(
    public_key=os.getenv("IMAGEKIT_PUBLIC_KEY"),
    private_key=os.getenv("IMAGEKIT_PRIVATE_KEY"),
    url_endpoint=os.getenv("IMAGEKIT_URL_ENDPOINT")
)

def get_auth_params():
    """Generate authentication parameters for client-side upload."""
    return imagekit.get_authentication_parameters()
