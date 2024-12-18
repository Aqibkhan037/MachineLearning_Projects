from app import Flask, request, jsonify, render_template
import joblib
import pandas as pd

# Initialize the Flask app
app = Flask(__name__)

# Load the model
model = joblib.load('catering_cost_rf_model.pkl')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.form.to_dict()
        df = pd.DataFrame([data])
        prediction = model.predict(df)
        return render_template('index.html', prediction_text=f'Predicted Catering Cost: ${prediction[0]:.2f}')
    except Exception as e:
        return render_template('index.html', prediction_text=f'Error: {str(e)}')

if __name__ == '__main__':
    app.run(debug=True)
