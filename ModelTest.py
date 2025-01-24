import json
import torch
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification

model_path = "./fine_tuned_model"  # Change this to your model path
tokenizer = DistilBertTokenizer.from_pretrained(model_path)
model = DistilBertForSequenceClassification.from_pretrained(model_path)

# Function to predict labels for a piece of text
def predict_label(text):
    inputs = tokenizer(text, padding=True, truncation=True, return_tensors="pt")
    
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        predicted_class = torch.argmax(logits, dim=1).item()
    
    return predicted_class

extracted_texts = [
    "This insurance policy offers comprehensive coverage for theft, fire damage, and liability for accidents occurring on the insured premises.",
    "The policy provides coverage limits up to £5,000,000 for property damage and personal injury claims.",
    "This policy does not cover damages caused by natural disasters, such as earthquakes or floods.",
    "The insurance contract is valid for a duration of 12 months and can be renewed thereafter.",
    "Public liability insurance protects against claims made by third parties for injuries or damages that occur as a result of business operations.",
    "This policy is designed for freelancers and small business owners, providing essential liability protection.",
    "Coverage includes legal expenses in the event of a claim, ensuring financial protection throughout the process.",
    "You can cancel the policy within 14 days for a full refund of your premium, provided no claims have been made.",
    "Optional add-ons are available for accidental damage and equipment breakdown, tailored to the needs of the business.",
    "This health insurance plan excludes any pre-existing conditions and experimental treatments."
]

predicted_labels = []
for text in extracted_texts:
    label = predict_label(text)
    predicted_labels.append(label)

# Convert the predictions to a structured format (e.g., table)
results = [{"text": text, "predicted_label": label} for text, label in zip(extracted_texts, predicted_labels)]

# Save results to a JSON file
with open('predicted_labels.json', 'w') as f:
    json.dump(results, f, indent=2)

print("Predictions saved to predicted_labels.json")