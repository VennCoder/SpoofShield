from flask import Flask, request, jsonify
from transformers import BertTokenizer, BertForSequenceClassification
import torch
from flask_cors import CORS  # Import CORS

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Load the trained model and tokenizer
model = BertForSequenceClassification.from_pretrained('saved_model')  # Path to your saved model
tokenizer = BertTokenizer.from_pretrained('saved_model')  # Path to your saved tokenizer

# Define a route to process email content
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    email_content = data['email_content']

    # Tokenize the input and run it through the model
    inputs = tokenizer(email_content, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
    
    # Get the prediction
    prediction = torch.argmax(outputs.logits, dim=-1).item()
    label = "spoofed" if prediction == 1 else "legit"
    
    return jsonify({'result': label})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)