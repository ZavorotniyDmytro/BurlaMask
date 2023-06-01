import cv2
import numpy as np
from PIL import Image, ImageDraw
import requests
from io import BytesIO
from scipy.ndimage import zoom, gaussian_filter


def find_face(image_url):
    # Приймає URL-адресу зображення і знаходить обличчя на цьому зображенні за допомогою
    # каскадного класифікатора Haar.
    # Функція повертає координати прямокутника навколо обличчя
    # та центр знайденого обличчя або None, якщо обличчя не знайдено.
    response = requests.get(image_url)
    image = Image.open(BytesIO(response.content))
    image = np.array(image)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.2, minNeighbors=4)

    if len(faces) > 0:
        (x, y, w, h) = faces[0]
        center_x = x + w // 2
        center_y = y + h // 2
        return (x, y, w, h), (center_x, center_y)
    else:
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


# Отримання посилань на зображення
image1_url = "https://img.redbull.com/images/c_crop,w_1172,h_585,x_0,y_86,f_auto,q_auto/c_scale,w_1200/redbullcom/2016/05/20/1331795954995_2/%D1%80%D0%B0%D0%B9%D0%B0%D0%BD-%D0%B3%D0%BE%D1%81%D0%BB%D0%B8%D0%BD%D0%B3.jpg"
image2_url = "https://media.glamour.ru/photos/61695c27fb4c6d23cde0a33e/16:9/w_2560%2Cc_limit/w960.jpg"

# Знаходження облич і центрів
face1, center1 = find_face(image1_url)
face2, center2 = find_face(image2_url)

if face1 is not None and face2 is not None:
    # Завантаження зображень
    response1 = requests.get(image1_url)
    image1 = Image.open(BytesIO(response1.content))
    image1 = np.array(image1)

    response2 = requests.get(image2_url)
    image2 = Image.open(BytesIO(response2.content))
    image2 = np.array(image2)

    # Відображення еліпсів
    ellipse1 = (center1[0], center1[1], face1[2], face1[3])
    ellipse2 = (center2[0], center2[1], face2[2], face2[3])

    image1_with_ellipse = draw_ellipse(image1, ellipse1[0:2], ellipse1[2], ellipse1[3])
    image2_with_ellipse = draw_ellipse(image2, ellipse2[0:2], ellipse2[2], ellipse2[3])

    # Вивід фотографій з еліпсами
    image1_with_ellipse = Image.fromarray(image1_with_ellipse)
    # image1_with_ellipse.show()

    image2_with_ellipse = Image.fromarray(image2_with_ellipse)
    # image2_with_ellipse.show()

    # Вирізання еліпсів
    cropped_image1 = crop_ellipse(image2, ellipse2)
    cropped_image2 = crop_ellipse(image1, ellipse1)

    print((ellipse1[0], ellipse1[1]))

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


    # Вивід зображень з накладеними еліпсами
    overlay1.show()
    overlay2.show()
