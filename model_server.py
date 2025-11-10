import tensorflow as tf
import numpy as np
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000'], 
     methods=['GET', 'POST'],
     allow_headers=['Content-Type'])

# Define image dimensions (must match the dimensions used during training)
IMG_WIDTH = 128
IMG_HEIGHT = 128

# Load the saved model
# Make sure the 'eye_disease_classifier.keras' file is in the same directory as this script
try:
    model = tf.keras.models.load_model('eye_disease_classifier.keras')
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Define the class names (must match the order used during training)
# You can get this from the notebook by running sorted(df['label'].unique())
class_names = ['cataract', 'diabetic_retinopathy', 'glaucoma', 'normal']

# Function to load and preprocess a single image from a file path
def preprocess_image_from_path(image_path):
    img = tf.io.read_file(image_path)
    try:
        img = tf.image.decode_png(img, channels=3)
    except tf.errors.InvalidArgumentError:
         img = tf.image.decode_jpeg(img, channels=3)
    img = tf.image.resize(img, [IMG_HEIGHT, IMG_WIDTH])
    img = img / 255.0  # Normalize to [0, 1]
    img = tf.expand_dims(img, axis=0) # Add batch dimension
    return img

# Function to load and preprocess a single image from uploaded file data
def preprocess_image_from_bytes(image_bytes):
    img = tf.image.decode_image(image_bytes, channels=3)
    img = tf.image.resize(img, [IMG_HEIGHT, IMG_WIDTH])
    img = img / 255.0  # Normalize to [0, 1]
    img = tf.expand_dims(img, axis=0) # Add batch dimension
    return img


# Function to make a prediction on a preprocessed image tensor
def predict_preprocessed_image(preprocessed_img_tensor):
    if model is None:
        return None, None, "Model not loaded."

    predictions = model.predict(preprocessed_img_tensor)
    predicted_class_index = np.argmax(predictions[0])
    predicted_class_name = class_names[predicted_class_index]
    confidence = float(np.max(predictions[0])) # Convert to float for JSON serialization
    return predicted_class_name, confidence, None


@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response

    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        image_bytes = file.read()
        preprocessed_img = preprocess_image_from_bytes(image_bytes)
        predicted_class, confidence, error = predict_preprocessed_image(preprocessed_img)
        print(f"IMAGE PREDICTED TO BE: {predicted_class}")

        if error:
            response = jsonify({'error': error})
            response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
            return response, 500

        response = jsonify({'predicted_class': predicted_class, 'confidence': confidence})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        return response

    except Exception as e:
        response = jsonify({'error': str(e)})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        return response, 500

@app.route('/')
def index():
    return "Eye Disease Classifier Server is running. Send a POST request to /predict with an image file."

if __name__ == '__main__':
    # To run locally, make sure you have flask installed: pip install Flask
    # Also make sure you have tensorflow installed: pip install tensorflow
    # And Pillow for image handling: pip install Pillow
    # Place the 'eye_disease_classifier.keras' file in the same directory as this script
    # Then run this script from your terminal: python your_script_name.py
    # The server will start on http://127.0.0.1:5001/
    app.run(debug=True, port=5001) # Changed to port 5001 to avoid conflict with AirPlay