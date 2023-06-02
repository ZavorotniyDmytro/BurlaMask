import tempfile
from flask import Flask, request, jsonify, send_file
import cv2
import numpy as np
from PIL import Image, ImageDraw
from io import BytesIO
from scipy.ndimage import zoom, gaussian_filter
import requests
from werkzeug.utils import secure_filename
from tempfile import NamedTemporaryFile
import os
from shutil import copyfile
import io
import base64

app = Flask(__name__)

def find_face(image):
    ## Виконати розпізнавання обличів і повернути результати
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    if len(faces) > 0:
        face = faces[0]
        center = (face[0] + face[2] // 2, face[1] + face[3] // 2)
        return face, center

    return None, None


def draw_ellipse(image, center, width, height):
    # Застосування згладжування перед малюванням еліпсу
    smoothed_image = gaussian_filter(image, sigma=(10, 10, 0))

    # Візуалізація еліпсу навколо обличчя на згладженому зображенні
    img = Image.fromarray(smoothed_image)
    draw = ImageDraw.Draw(img)

    left = center[0] - width // 3
    top = center[1] - height // 2
    right = center[0] + width // 3
    bottom = center[1] + height // 2

    draw.ellipse((left, top, right, bottom), outline="red")
    return np.array(img)


def crop_ellipse(image, ellipse):
    img = Image.fromarray(image)
    mask = Image.new("L", img.size, 0)
    draw = ImageDraw.Draw(mask)

    # Отримати координати крапок, що утворюють еліпс
    left = ellipse[0] - ellipse[2] // 3
    top = ellipse[1] - ellipse[3] // 2
    right = ellipse[0] + ellipse[2] // 3
    bottom = ellipse[1] + ellipse[3] // 2

    # Отримати параметри еліпса
    center_x = (left + right) // 2
    center_y = (top + bottom) // 2
    radius_x = (right - left) // 2
    radius_y = (bottom - top) // 2

    # Намалювати еліпсову маску
    draw.ellipse((left, top, right, bottom), fill=255)

    # Вирізати еліпс зображення на основі маски
    cropped_img = Image.new("RGB", img.size)
    cropped_img.paste(img, mask=mask)

    # Обрізати вирізане зображення до розмірів еліпса
    cropped_img = cropped_img.crop((center_x - radius_x, center_y - radius_y, center_x + radius_x, center_y + radius_y))

    return np.array(cropped_img)


from PIL import Image
import numpy as np
from io import BytesIO
import base64

@app.route('/process_images', methods=['POST', 'multipart'])
def process_images():
    # Отримання двох зображень з форми даних (form-data)
    image1 = request.files['image1']
    image2 = request.files['image2']

    # Завантаження зображень
    image1 = Image.open(BytesIO(image1.read()))
    image1 = np.array(image1)

    image2 = Image.open(BytesIO(image2.read()))
    image2 = np.array(image2)

    # Знаходження облич і центрів
    face1, center1 = find_face(image1)
    face2, center2 = find_face(image2)

    if face1 is not None and face2 is not None:
        # Відображення еліпсів
        ellipse1 = (center1[0], center1[1], face1[2], face1[3])
        ellipse2 = (center2[0], center2[1], face2[2], face2[3])

        image1_with_ellipse = draw_ellipse(image1, ellipse1[0:2], ellipse1[2], ellipse1[3])
        image2_with_ellipse = draw_ellipse(image2, ellipse2[0:2], ellipse2[2], ellipse2[3])

        # Вирізання еліпсів
        cropped_image1 = crop_ellipse(image2, ellipse2)
        cropped_image2 = crop_ellipse(image1, ellipse1)

        # Зміна розмірів еліпсів
        resized_cropped_image1 = zoom(cropped_image1, (ellipse1[3] / ellipse2[3], ellipse1[2] / ellipse2[2], 1), order=1)
        resized_cropped_image2 = zoom(cropped_image2, (ellipse2[3] / ellipse1[3], ellipse2[2] / ellipse1[2], 1), order=1)

        # Накладання еліпсів на вихідні зображення
        overlay1 = Image.fromarray(image1)
        mask1 = np.where(resized_cropped_image1[..., 0] > 0, 255, 0).astype('uint8')
        mask1 = Image.fromarray(mask1, mode='L')
        overlay1.paste(
            Image.fromarray(resized_cropped_image1.astype('uint8')),
            (ellipse1[0] - ellipse1[2] // 3, ellipse1[1] - ellipse1[3] // 2),
            mask=mask1
        )

        overlay2 = Image.fromarray(image2)
        mask2 = np.where(resized_cropped_image2[..., 0] > 0, 255, 0).astype('uint8')
        mask2 = Image.fromarray(mask2, mode='L')
        overlay2.paste(
            Image.fromarray(resized_cropped_image2.astype('uint8')),
            (ellipse2[0] - ellipse2[2] // 3, ellipse2[1] - ellipse2[3] // 2),
            mask=mask2
        )

        # Кодування зображень у форматі base64
        buffered1 = BytesIO()
        overlay1.save(buffered1, format="JPEG")
        encoded_image1 = base64.b64encode(buffered1.getvalue()).decode('utf-8')

        buffered2 = BytesIO()
        overlay2.save(buffered2, format="JPEG")
        encoded_image2 = base64.b64encode(buffered2.getvalue()).decode('utf-8')

        # Повернення результату у форматі JSON
        result = {
            'image1_with_ellipse': encoded_image1,
            'image2_with_ellipse': encoded_image2
        }
        return jsonify(result)



def image_to_base64(image):
    buffered = BytesIO()
    image.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')



@app.route('/test', methods=['GET'])
def test():
    return "hello"

if __name__ == '__main__':
    app.run()
