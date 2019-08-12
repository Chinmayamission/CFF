import hashlib
import base64
import re
import os

# def generate_signed_url(image_name):
#     return s3_client.generate_presigned_url('get_object', Params = {'Bucket': S3_UPLOADS_BUCKET_NAME, 'Key': 'hello.txt'}, ExpiresIn = 100)


def upload_image_to_s3(image):
    from chalicelib.main import s3_client, S3_UPLOADS_BUCKET_NAME

    if image.startswith("data:"):
        content_type = re.findall("^data:([^;]+);", image)[0]
        content = re.sub("^.*?base64,", "", image)
        name = hashlib.md5(image.encode("utf-8")).hexdigest()
        s3_client.put_object(
            Bucket=S3_UPLOADS_BUCKET_NAME,
            Body=base64.b64decode(content),
            Key=name,
            ContentType=content_type,
            ContentEncoding="base64",
        )
        return name
    return image


def process_response_data_images(response_data):
    if "images" in response_data:
        for i, image in enumerate(response_data["images"]):
            response_data["images"][i] = upload_image_to_s3(image)
    # if "image" in response_data:
    #     response_data["image"] = upload_image_to_s3(image)
    return response_data
