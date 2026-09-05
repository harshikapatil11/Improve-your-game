import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.neighbors import NearestNeighbors


# ==========================================
# 1. LOAD DATASET
# ==========================================

df = pd.read_csv("data/rejection_pattern_demo_dataset.csv")

print("Dataset loaded successfully!")
print("Dataset shape:", df.shape)

print("\nFirst 5 records:")
print(df.head())

print("\nColumns:")
print(df.columns.tolist())


# ==========================================
# 2. SELECT FEATURES
# ==========================================

features = [
    "approach_method",
    "conversation_stage",
    "initial_yes",
    "reply_change",
    "reciprocity",
    "mixed_signals",
    "relationship_status",
    "his_investment",
    "days_talking",
    "meetings",
    "he_increased_pursuit"
]

X = df[features]


# ==========================================
# 3. CATEGORICAL FEATURES
# ==========================================

categorical_features = [
    "approach_method",
    "conversation_stage",
    "initial_yes",
    "reply_change",
    "reciprocity",
    "mixed_signals",
    "relationship_status",
    "his_investment",
    "he_increased_pursuit"
]


# ==========================================
# 4. NUMERICAL FEATURES
# ==========================================

numerical_features = [
    "days_talking",
    "meetings"
]


# ==========================================
# 5. PREPROCESSING
# ==========================================

preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features
        ),
        (
            "numerical",
            StandardScaler(),
            numerical_features
        )
    ]
)


# ==========================================
# 6. TRANSFORM DATA
# ==========================================

X_processed = preprocessor.fit_transform(X)

print("\nOriginal feature shape:")
print(X.shape)

print("\nProcessed feature shape:")
print(X_processed.shape)


# ==========================================
# 7. CREATE KNN MODEL
# ==========================================

knn = NearestNeighbors(
    n_neighbors=5,
    metric="cosine"
)

knn.fit(X_processed)

print("\nKNN model trained successfully!")


# ==========================================
# 8. NEW / UNKNOWN SITUATION
# ==========================================

new_case = pd.DataFrame([{

    "approach_method": "Instagram",

    "conversation_stage": "Talking",

    "initial_yes": "Yes",

    "reply_change": "reduced",

    "reciprocity": "low",

    "mixed_signals": "Yes",

    "relationship_status": "single/unknown",

    "his_investment": "high",

    "days_talking": 15,

    "meetings": 0,

    "he_increased_pursuit": "Yes"

}])


# ==========================================
# 9. PREPROCESS NEW CASE
# ==========================================

new_case_processed = preprocessor.transform(new_case)


# ==========================================
# 10. FIND SIMILAR CASES
# ==========================================

distances, indexes = knn.kneighbors(
    new_case_processed
)


print("\n")
print("=" * 60)
print("SIMILAR HISTORICAL CASES")
print("=" * 60)


for distance, index in zip(
    distances[0],
    indexes[0]
):

    case = df.iloc[index]

    similarity = (1 - distance) * 100

    print(
        f"\nCase ID       : {case['case_id']}"
    )

    print(
        f"Similarity    : {similarity:.2f}%"
    )

    print(
        f"Pattern       : {case['pattern_tag']}"
    )

    print(
        f"Outcome       : {case['outcome']}"
    )


# ==========================================
# 11. ANALYZE SIMILAR CASES
# ==========================================

similar_cases = df.iloc[indexes[0]]


negative_outcomes = [
    "rejected",
    "ghosted",
    "not_available"
]


negative_count = sum(
    outcome in negative_outcomes
    for outcome in similar_cases["outcome"]
)


total_cases = len(similar_cases)

negative_ratio = negative_count / total_cases


# ==========================================
# 12. WARNING LEVEL
# ==========================================

if negative_ratio >= 0.7:

    warning = "HIGH"

elif negative_ratio >= 0.4:

    warning = "MEDIUM"

else:

    warning = "LOW"


# ==========================================
# 13. FIND COMMON PATTERN
# ==========================================

patterns = similar_cases["pattern_tag"].value_counts()

most_common_pattern = patterns.index[0]

pattern_count = patterns.iloc[0]


# ==========================================
# 14. FINAL RESULT
# ==========================================

print("\n")
print("=" * 60)
print("ANALYSIS RESULT")
print("=" * 60)

print(
    f"\nNegative cases: {negative_count}/{total_cases}"
)

print(
    f"Negative ratio: {negative_ratio:.2f}"
)

print(
    f"Warning level: {warning}"
)

print(
    f"Most common pattern: {most_common_pattern}"
)

print(
    f"Pattern frequency: "
    f"{pattern_count}/{total_cases}"
)

print("\n")