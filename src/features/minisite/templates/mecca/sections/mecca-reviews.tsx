import { meccaReveal } from "@/lib/minisite/mecca-motion";
import { MECCA_SECTION_META } from "@/lib/minisite/mecca-sections";
import type { MinisiteContent, ShopPublicData } from "@/lib/validations/public-shop";

type MeccaReviewsSectionProps = {
  data: ShopPublicData;
};

type RawReview = {
  id?: string;
  quote?: string;
  text?: string;
  body?: string;
  name?: string;
  author?: string;
  reviewer?: string;
  date?: string;
  rating?: number;
  stars?: number;
};

type MeccaReview = {
  id: string;
  quote: string;
  name: string;
  date: string;
  stars: number;
};

const PLACEHOLDER_REVIEWS: MeccaReview[] = [
  {
    id: "placeholder-1",
    quote:
      "Endlich ein Salon, der Handwerk und Atmosphäre auf höchstem Niveau vereint. Ich fühle mich jedes Mal willkommen.",
    name: "Sarah K.",
    date: "Januar 2025",
    stars: 5,
  },
  {
    id: "placeholder-2",
    quote:
      "Präzise Beratung, perfekter Schnitt und ein Team, das zuhört. Mein neuer Stammplatz in der Stadt.",
    name: "Marcus L.",
    date: "Dezember 2024",
    stars: 5,
  },
  {
    id: "placeholder-3",
    quote:
      "Luxuriös, aufmerksam und unkompliziert. Die Online-Buchung klappt super — der Look hält wochenlang.",
    name: "Aylin D.",
    date: "November 2024",
    stars: 5,
  },
];

type BlockField = "eyebrow" | "title";

type ReviewsSectionBlock = {
  eyebrow?: string;
  title?: string;
};

function getReviewsSectionBlock(content: MinisiteContent): ReviewsSectionBlock | undefined {
  const sections = content.sections as (MinisiteContent["sections"] & {
    reviews?: ReviewsSectionBlock;
  }) | undefined;
  return sections?.reviews;
}

function getReviewsField(
  content: MinisiteContent,
  field: BlockField,
  fallback: string,
): string {
  const block = getReviewsSectionBlock(content);
  const value = block?.[field];
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return fallback;
}

function renderStars(count: number): string {
  const clamped = Math.max(1, Math.min(5, Math.round(count || 5)));
  return "★".repeat(clamped);
}

function normalizeReview(raw: RawReview, index: number): MeccaReview | null {
  const quote = raw.quote?.trim() || raw.text?.trim() || raw.body?.trim();
  const name = raw.name?.trim() || raw.author?.trim() || raw.reviewer?.trim();
  const date = raw.date?.trim() || "";
  const stars = raw.stars ?? raw.rating ?? 5;

  if (!quote || !name) {
    return null;
  }

  return {
    id: raw.id?.trim() || `review-${index}`,
    quote,
    name,
    date: date || "Kürzlich",
    stars,
  };
}

function resolveReviews(data: ShopPublicData): MeccaReview[] {
  const content = data.minisite.content as MinisiteContent & { reviews?: RawReview[] };
  const dataWithReviews = data as ShopPublicData & { reviews?: RawReview[] };

  const rawReviews = content.reviews ?? dataWithReviews.reviews;
  if (!Array.isArray(rawReviews) || rawReviews.length === 0) {
    return PLACEHOLDER_REVIEWS;
  }

  const normalized = rawReviews
    .map((review, index) => normalizeReview(review, index))
    .filter((review): review is MeccaReview => review !== null);

  return normalized.length > 0 ? normalized : PLACEHOLDER_REVIEWS;
}

export function MeccaReviewsSection({ data }: MeccaReviewsSectionProps) {
  const content = data.minisite.content;
  const meta = MECCA_SECTION_META.reviews;
  const eyebrow = getReviewsField(
    content,
    "eyebrow",
    meta.defaults.eyebrow ?? "STIMMEN UNSERER KUNDEN",
  );
  const title = getReviewsField(
    content,
    "title",
    meta.defaults.title ?? "Was unsere Kunden sagen.",
  );
  const reviews = resolveReviews(data);

  return (
    <section id="ms-mecca-reviews" className="ms-mecca-reviews ms-mecca-section" aria-label="Bewertungen">
      <div className="ms-mecca-reviews-inner">
        <header {...meccaReveal("up", 0, "ms-mecca-reviews-header")}>
          <p className="ms-mecca-reviews-eyebrow">{eyebrow}</p>
          <h2 className="ms-mecca-reviews-title">{title}</h2>
        </header>

        <div className="ms-mecca-reviews-track" role="list" data-mecca-stagger>
          {reviews.map((review) => (
            <article
              key={review.id}
              className="ms-mecca-review-card ms-mecca-reveal ms-mecca-reveal--up"
              role="listitem"
            >
              <p className="ms-mecca-stars" aria-label={`${review.stars} von 5 Sternen`}>
                {renderStars(review.stars)}
              </p>
              <blockquote className="ms-mecca-review-quote">{review.quote}</blockquote>
              <footer className="ms-mecca-reviewer">
                {review.name}
                <span className="ms-mecca-reviewer-date">{review.date}</span>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
