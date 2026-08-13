from typing import List, Dict, Any


class RecursiveCharacterChunker:
    """
    Splits text recursively using natural separators:
    1. Paragraph ("\n\n")
    2. Line ("\n")
    3. Sentence/Period (". ")
    4. Word (" ")
    5. Character ("")
    """

    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        if chunk_overlap >= chunk_size:
            raise ValueError("chunk_overlap must be strictly less than chunk_size.")
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.separators = ["\n\n", "\n", ". ", " ", ""]

    def _split_text(self, text: str, separators: List[str]) -> List[str]:
        final_chunks = []
        separator = separators[-1]
        new_separators = []

        for i, _s in enumerate(separators):
            if _s == "":
                separator = ""
                break
            if _s in text:
                separator = _s
                new_separators = separators[i + 1:]
                break

        splits = text.split(separator) if separator != "" else list(text)

        good_splits = []
        for s in splits:
            if not s and separator != "":
                continue
            if len(s) < self.chunk_size:
                good_splits.append(s)
            else:
                if good_splits:
                    merged = self._merge_splits(good_splits, separator)
                    final_chunks.extend(merged)
                    good_splits = []
                if new_separators:
                    sub_chunks = self._split_text(s, new_separators)
                    final_chunks.extend(sub_chunks)
                else:
                    final_chunks.append(s)

        if good_splits:
            merged = self._merge_splits(good_splits, separator)
            final_chunks.extend(merged)

        return final_chunks

    def _merge_splits(self, splits: List[str], separator: str) -> List[str]:
        chunks = []
        current_chunk = []
        total_len = 0

        for s in splits:
            len_s = len(s)
            sep_len = len(separator) if current_chunk else 0

            if total_len + len_s + sep_len > self.chunk_size:
                if current_chunk:
                    chunk_str = separator.join(current_chunk)
                    chunks.append(chunk_str)

                    # Calculate overlap
                    overlap_str = ""
                    while current_chunk and (len(overlap_str) + len(current_chunk[-1]) + len(separator)) <= self.chunk_overlap:
                        overlap_str = current_chunk.pop() + (separator + overlap_str if overlap_str else "")

                    if overlap_str:
                        current_chunk = [overlap_str]
                        total_len = len(overlap_str)
                    else:
                        current_chunk = []
                        total_len = 0

            current_chunk.append(s)
            total_len += len_s + (len(separator) if len(current_chunk) > 1 else 0)

        if current_chunk:
            chunks.append(separator.join(current_chunk))

        return chunks

    def chunk_text(self, text: str) -> List[Dict[str, Any]]:
        """
        Main entry point for chunking text.
        Returns a list of dictionaries with chunk_index, chunk_text, and character_count.
        """
        if not text or not text.strip():
            return []

        text = text.strip()
        if len(text) <= self.chunk_size:
            return [{
                "chunk_index": 0,
                "chunk_text": text,
                "character_count": len(text)
            }]

        raw_chunks = self._split_text(text, self.separators)
        
        result_chunks = []
        for idx, chunk in enumerate(raw_chunks):
            cleaned = chunk.strip()
            if cleaned:
                result_chunks.append({
                    "chunk_index": len(result_chunks),
                    "chunk_text": cleaned,
                    "character_count": len(cleaned)
                })

        return result_chunks


def chunk_document_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[Dict[str, Any]]:
    """
    Convenience wrapper function for text chunking.
    """
    chunker = RecursiveCharacterChunker(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    return chunker.chunk_text(text)
