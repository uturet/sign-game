import json
from tensorflow.keras import models
import numpy as np

FILENAME = 'digit_recognition_model.h5'
model = models.load_model(FILENAME)


async def send(message, writer, users=(), send_self=False, mtype=None):
    message = json.dumps({"type": mtype, "message": message})
    for user in users:
        if user.writer != writer or send_self:
            print(f'Sending to {user.username}: {message}')
            await user.writer.send_text(message)


def read_sign(image):
    try:
        image = np.array([image])
        image = image.reshape((1, 28, 28, 1)).astype('float32') / 255
        res = model.predict(image)
        print(res.argmax(), res[0][res.argmax()])
        return res.argmax()
    except Exception as e:
        print('Read Sign', e)
    return -1
