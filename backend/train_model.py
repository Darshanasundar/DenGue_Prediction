import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (accuracy_score, classification_report,
                             confusion_matrix)
from sklearn.model_selection import train_test_split


def generate_synthetic_data(num_samples=1000):
    np.random.seed(42)
    # Months 1 to 12
    months = np.random.randint(1, 13, num_samples)

    # Generate base features depending roughly on month (monsoon mostly
    # Jun-Sep)
    temp = np.random.normal(28, 4, num_samples)  # 20 to 36 C
    humidity = np.random.normal(70, 15, num_samples)  # 40 to 100 %
    rainfall = np.random.exponential(50, num_samples)  # 0 to 300 mm

    # Adjust for monsoon season (June to Sept)
    monsoon_idx = (months >= 6) & (months <= 9)
    humidity[monsoon_idx] = np.random.normal(85, 10, sum(monsoon_idx))
    rainfall[monsoon_idx] = np.random.normal(200, 50, sum(monsoon_idx))
    temp[monsoon_idx] = np.random.normal(30, 3, sum(monsoon_idx))

    # Clip values
    humidity = np.clip(humidity, 30, 100)
    rainfall = np.clip(rainfall, 0, 500)
    temp = np.clip(temp, 15, 45)

    # Determine risk score (higher temp, humidity, rainfall = higher risk)
    # Give weights to features
    risk_score = (temp * 0.3) + (humidity * 0.4) + (rainfall * 0.1)

    # Create categories (Low, Moderate, High)
    threshold_high = np.percentile(risk_score, 75)
    threshold_low = np.percentile(risk_score, 30)

    risk_levels = []
    cases = []
    for score in risk_score:
        if score > threshold_high:
            risk_levels.append('High')
            cases.append(int(np.random.normal(150, 30)))  # 100-200 cases
        elif score > threshold_low:
            risk_levels.append('Moderate')
            cases.append(int(np.random.normal(50, 20)))  # 20-80 cases
        else:
            risk_levels.append('Low')
            cases.append(int(np.random.normal(5, 3)))  # 0-10 cases

    cases = np.clip(cases, 0, None)

    df = pd.DataFrame({
        'Month': months,
        'Temperature': temp,
        'Humidity': humidity,
        'Rainfall': rainfall,
        'Dengue_Cases': cases,
        'Risk_Level': risk_levels
    })

    # Ensure Risk_Level has consistent categorical mapping if needed
    return df


def train_and_save():
    print("Generating synthetic dataset...")
    df = generate_synthetic_data(2000)

    # Save dataset to CSV for front-end history mock
    df.to_csv('historical_dengue_data.csv', index=False)

    print("Preparing data for training...")
    X = df[['Temperature', 'Humidity', 'Rainfall', 'Month']]
    y = df['Risk_Level']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42)

    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    print("Evaluating Model...")
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    print(f"\nModel Accuracy: {accuracy * 100:.2f}%\n")
    print("Classification Report:")
    print(classification_report(y_test, y_pred))

    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    print("\nSaving model to disk...")
    # Features names are saved inherently in sklearn >= 1.0 but we save them
    # here as well
    joblib.dump(model, 'dengue_model.pkl')
    print("Model saved as 'dengue_model.pkl'")
    print("Dataset saved as 'historical_dengue_data.csv'")


if __name__ == "__main__":
    train_and_save()
