import pickle
from flask import Flask, render_template, request
import numpy as np

app = Flask(__name__)

# Load the model
with open('model.pkl', 'rb') as file:
    model = pickle.load(file)

def preprocess_data(data):
    # Preprocess the data here if needed
    # For example, convert categorical data to numerical, handle missing values
    # Replace this with your actual preprocessing logic
    return data  # Or return the preprocessed data

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        guest_count = int(request.form.get('guest_count', 0))
        dish_category = int(request.form.get('dish_category', 0))
        dish_type = int(request.form.get('dish_type', 0))
        price = float(request.form.get('price', 0))
        is_dairy_free = int(request.form.get('dairy_free', 0))
        is_gluten_free = int(request.form.get('gluten_free', 0))
        is_nut_free = int(request.form.get('nut_free', 0))
        is_vegan = int(request.form.get('vegan', 0))

        input_data = {
            'GUEST_COUNT': guest_count,
            'dish_category': dish_category,
            'dish_type': dish_type,
            'PRICE_y': price,
            'IS_DAIRY_FREE': is_dairy_free,
            'IS_GLUTEN_FREE': is_gluten_free,
            'IS_NUT_FREE': is_nut_free,
            'IS_VEGAN': is_vegan
        }

        preprocessed_data = preprocess_data(input_data)

        # Convert data to a NumPy array (adjust as needed for your model)
        input_array = np.array([list(preprocessed_data.values())])

        predicted_units = model.predict(input_array)
        return render_template('index.html', total_units=predicted_units[0])
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)