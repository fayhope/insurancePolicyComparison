import json
import numpy as np
import tensorflow as tf
from transformers import TFBertTokenizer, TFBertModel

# Load the training data
with open('trainingData.json') as f:
    training_data = json.load(f)

# Extract texts and labels
texts = [item['text'] for item in training_data]
labels = [item['labels'] for item in training_data]

# Define categories
categories = ['Topic', 'Coverage/Limit', 'Exclusions', 'Notes']

# Convert labels into one-hot encoding for each category
def encode_labels(labels, categories):
    encoded = []
    for label in labels:
        encoded.append([int(label[category]) for category in categories])
    return np.array(encoded)

encoded_labels = encode_labels(labels, categories)

# Tokenization
tokenizer = TFBertTokenizer.from_pretrained('bert-base-uncased')
inputs = tokenizer(texts, padding=True, truncation=True, max_length=128, return_tensors='tf')

# Extract input tensors
input_ids = inputs['input_ids']
attention_mask = inputs['attention_mask']

# Split the data manually (80% train, 20% test)
split_index = int(0.8 * len(texts))
train_inputs, test_inputs = input_ids[:split_index], input_ids[split_index:]
train_attention, test_attention = attention_mask[:split_index], attention_mask[split_index:]
train_labels, test_labels = encoded_labels[:split_index], encoded_labels[split_index:]

# Load BERT model
bert_model = TFBertModel.from_pretrained('bert-base-uncased')

# Define the model
input_layer = tf.keras.Input(shape=(128,), dtype=tf.int32, name='input_ids')
attention_layer = tf.keras.Input(shape=(128,), dtype=tf.int32, name='attention_mask')

# Get BERT outputs
bert_output = bert_model(input_layer, attention_mask=attention_layer)[0]

# Dense layers for each category
outputs = []
for category in categories:
    dense_output = tf.keras.layers.Dense(1, activation='sigmoid', name=category)(bert_output[:, 0, :])
    outputs.append(dense_output)

# Combine outputs into a multi-output model
model = tf.keras.Model(inputs=[input_layer, attention_layer], outputs=outputs)

# Compile the model
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Train the model
model.fit(
    [train_inputs, train_attention],
    {category: train_labels[:, i] for i, category in enumerate(categories)},
    epochs=5,
    batch_size=32,
    validation_data=(
        [test_inputs, test_attention],
        {category: test_labels[:, i] for i, category in enumerate(categories)}
    )
)

# Predictions (Map back to labels)
predictions = model.predict([test_inputs, test_attention])
final_predictions = {
    category: (predictions[i] > 0.5).astype(int).flatten().tolist()
    for i, category in enumerate(categories)
}

# Example of mapping back predictions to human-readable labels
print("Predictions mapped to labels:")
for i, category in enumerate(categories):
    print(f"{category}: {final_predictions[category]}")
