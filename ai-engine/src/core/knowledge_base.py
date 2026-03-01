import re
from typing import List, Tuple, Optional, TypedDict

class KnowledgeEntry(TypedDict):
    id: str
    keywords: List[str]
    content: str
    recommendations: List[str]
    intent: str

class WebsiteKnowledgeBase:
    def __init__(self) -> None:
        # 🟢 DATA LAYER: Hardened Knowledge Base
        self._knowledge_data: List[KnowledgeEntry] = [
            {
                "id": "fha_vs_conv",
                "keywords": ["fha", "conventional", "compare", "difference", "versus"],
                "content": "FHA loans are government-backed and ideal for credit scores as low as 580 with 3.5% down. Conventional loans typically require a 620 score and 3% down for first-time buyers, offering lower insurance costs for those with stronger credit.",
                "recommendations": ["Compare Rates", "FHA Requirements"],
                "intent": "loan_comparison"
            },
            {
                "id": "down_payment",
                "keywords": ["down payment", "minimum", "cash", "3.5%", "3%", "upfront"],
                "content": "Gone are the days of needing 20% down! You can secure a home with as little as 3% on Conventional or 3.5% on FHA. Veterans may even qualify for 0% down through VA programs.",
                "recommendations": ["VA Eligibility", "Down Payment Guide"],
                "intent": "financial_requirement"
            },
            {
                "id": "closing_costs",
                "keywords": ["closing costs", "fees", "how much to close", "out of pocket", "settlement"],
                "content": "Typically, closing costs range from 2% to 5% of the home's purchase price. This covers lender fees, title insurance, and appraisals. I can generate a sample cost sheet for you if you'd like!",
                "recommendations": ["Generate Sample Sheet", "Fee Breakdown"],
                "intent": "closing_costs"
            }
        ]

    def _preprocess(self, text: str) -> List[str]:
        """Cleans and tokenizes input."""
        return re.sub(r'[^\w\s%]', '', text.lower()).split()

    def search(self, query: str) -> Tuple[Optional[str], List[str], str, float]:
        """
        Ranked Keyword Search Engine.
        PO/BA Note: Tuned to favor exact keyword density over phrase length.
        """
        tokens = self._preprocess(query)
        if not tokens:
            return None, [], "fallback", 0.0

        best_match: Optional[KnowledgeEntry] = None
        highest_score: float = 0.0

        for entry in self._knowledge_data:
            # 🟢 LOGIC: Count how many keywords appear in the user's query
            match_count = 0
            for keyword in entry["keywords"]:
                if any(keyword in token for token in tokens):
                    match_count += 1
            
            if match_count > 0:
                # Basic density score
                score = match_count / len(entry["keywords"])
                # Bonus for multiple keyword hits
                score += match_count * 0.75 
                
                if score > highest_score:
                    highest_score = score
                    best_match = entry

        # 🟢 THRESHOLD: Only return results Sarah is confident about
        if highest_score < 0.4 or best_match is None:
            return None, [], "fallback", 0.0

        return (
            str(best_match["content"]),
            list(best_match["recommendations"]),
            str(best_match["intent"]),
            float(highest_score)
        )