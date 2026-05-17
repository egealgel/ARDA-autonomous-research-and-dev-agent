from dataclasses import dataclass


@dataclass(frozen=True)
class ModelPricing:
    input_per_mtok: float
    output_per_mtok: float
    cache_write_per_mtok: float
    cache_read_per_mtok: float


PRICING: dict[str, ModelPricing] = {
    "claude-sonnet-4-6": ModelPricing(3.00, 15.00, 3.75, 0.30),
    "claude-opus-4-7": ModelPricing(15.00, 75.00, 18.75, 1.50),
    "claude-haiku-4-5-20251001": ModelPricing(1.00, 5.00, 1.25, 0.10),
}


def cost_usd(
    model: str,
    input_tokens: int,
    output_tokens: int,
    cache_creation_tokens: int = 0,
    cache_read_tokens: int = 0,
) -> float:
    p = PRICING.get(model)
    if p is None:
        return 0.0
    return (
        input_tokens * p.input_per_mtok
        + output_tokens * p.output_per_mtok
        + cache_creation_tokens * p.cache_write_per_mtok
        + cache_read_tokens * p.cache_read_per_mtok
    ) / 1_000_000
