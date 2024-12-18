import joblib
import numpy as np

# Load the model
model = joblib.load('catering_cost_rf_model.pkl')

# Example values
example_data = [
    [500.00, 5, 3, 2, 50, 10.00, 200, 10, 7, 3],
    [1000.00, 10, 5, 4, 100, 12.00, 400, 19, 12, 7],
    [1500.00, 15, 8, 6, 150, 15.00, 600, 25, 15, 10],
    [2000.00, 20, 10, 8, 200, 20.00, 800, 30, 18, 12],
    [2500.00, 25, 12, 10, 250, 25.00, 1000, 35, 20, 15]
]

# Predict catering costs
for data in example_data:
    prediction = model.predict(np.array(data).reshape(1, -1))
    print(f"Predicted CATERING_COST: ${prediction[0]:.2f}")
