import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.neighbors import NearestNeighbors


class RejectionPatternAnalyzer:

    def __init__(self, dataset_path):

        # ==========================================
        # LOAD DATA
        # ==========================================

        self.df = pd.read_csv(dataset_path)


        # ==========================================
        # FEATURES
        # ==========================================

        self.features = [
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


        # ==========================================
        # CATEGORICAL FEATURES
        # ==========================================

        self.categorical_features = [
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
        # NUMERICAL FEATURES
        # ==========================================

        self.numerical_features = [
            "days_talking",
            "meetings"
        ]


        # ==========================================
        # PREPROCESSOR
        # ==========================================

        self.preprocessor = ColumnTransformer(
            transformers=[

                (
                    "categorical",
                    OneHotEncoder(
                        handle_unknown="ignore"
                    ),
                    self.categorical_features
                ),

                (
                    "numerical",
                    StandardScaler(),
                    self.numerical_features
                )

            ]
        )


        # ==========================================
        # PREPROCESS HISTORICAL DATA
        # ==========================================

        X = self.df[self.features]

        X_processed = self.preprocessor.fit_transform(X)


        # ==========================================
        # KNN MODEL
        # ==========================================

        self.knn = NearestNeighbors(
            n_neighbors=5,
            metric="cosine"
        )

        self.knn.fit(X_processed)


    # ==============================================
    # ANALYZE NEW SITUATION
    # ==============================================

    def analyze(self, new_case):

        # Convert dictionary into DataFrame

        new_case_df = pd.DataFrame([new_case])


        # Transform using SAME preprocessor

        new_case_processed = self.preprocessor.transform(
            new_case_df
        )


        # Find nearest historical cases

        distances, indexes = self.knn.kneighbors(
            new_case_processed
        )


        # Store similar cases

        similar_cases = []


        for distance, index in zip(
            distances[0],
            indexes[0]
        ):

            case = self.df.iloc[index]

            similarity = (1 - distance) * 100


            similar_cases.append({

                "case_id": case["case_id"],

                "similarity": round(
                    similarity,
                    2
                ),

                "pattern": case["pattern_tag"],

                "outcome": case["outcome"]

            })


        # ==========================================
        # NEGATIVE OUTCOME ANALYSIS
        # ==========================================

        negative_outcomes = [
            "rejected",
            "ghosted",
            "not_available"
        ]


        negative_count = sum(
            case["outcome"] in negative_outcomes
            for case in similar_cases
        )


        total_cases = len(similar_cases)


        negative_ratio = (
            negative_count / total_cases
        )


        # ==========================================
        # WARNING
        # ==========================================

        if negative_ratio >= 0.7:

            warning = "HIGH"

        elif negative_ratio >= 0.4:

            warning = "MEDIUM"

        else:

            warning = "LOW"


        # ==========================================
        # COMMON PATTERN
        # ==========================================

        pattern_counts = {}

        for case in similar_cases:

            pattern = case["pattern"]

            pattern_counts[pattern] = (
                pattern_counts.get(pattern, 0) + 1
            )


        most_common_pattern = max(
            pattern_counts,
            key=pattern_counts.get
        )


        pattern_count = pattern_counts[
            most_common_pattern
        ]


        # ==========================================
        # FINAL RESULT
        # ==========================================

        return {

            "warning": warning,

            "negative_cases": negative_count,

            "total_similar_cases": total_cases,

            "negative_ratio": round(
                negative_ratio,
                2
            ),

            "common_pattern": most_common_pattern,

            "pattern_frequency": pattern_count,

            "similar_cases": similar_cases

        }


# ==============================================
# TEST
# ==============================================

if __name__ == "__main__":

    analyzer = RejectionPatternAnalyzer(
        "data/rejection_pattern_demo_dataset.csv"
    )


    new_case = {

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

    }


    result = analyzer.analyze(
        new_case
    )


    print("\n")
    print("=" * 60)
    print("REJECTION PATTERN ANALYZER")
    print("=" * 60)


    print(
        "\nWarning:",
        result["warning"]
    )


    print(
        "Negative ratio:",
        result["negative_ratio"]
    )


    print(
        "Common pattern:",
        result["common_pattern"]
    )


    print(
        "Pattern frequency:",
        result["pattern_frequency"]
    )


    print("\nSimilar cases:")


    for case in result["similar_cases"]:

        print(
            f"\n{case['case_id']} "
            f"| {case['similarity']}% "
            f"| {case['pattern']} "
            f"| {case['outcome']}"
        )