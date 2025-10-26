"use client";

import { type CSSProperties, useEffect, useMemo, useState } from "react";

type HighlightSegment = {
  id: string;
  start: string;
  end: string;
  description: string;
  confidence: number;
  selected: boolean;
};

type GeneratedShort = {
  id: string;
  title: string;
  duration: number;
  thumbnailGradient: string;
  clipRange: string;
  description: string;
};

type EditingState = {
  trimStart: number;
  trimEnd: number;
  textOverlay: string;
  soundLevel: number;
};

type CarouselStyle = CSSProperties & {
  "--item-count"?: number;
  "--active-index"?: number;
};

const shortLengthOptions = [15, 30, 60];
const transitionOptions = [
  { value: "fade", label: "Fade" },
  { value: "cross-dissolve", label: "Cross-dissolve" },
  { value: "zoom", label: "Cinematic zoom" }
];

const baseHighlights: HighlightSegment[] = [
  {
    id: "segment-1",
    start: "00:18",
    end: "00:33",
    description: "High-energy hook and channel intro",
    confidence: 0.94,
    selected: true
  },
  {
    id: "segment-2",
    start: "02:11",
    end: "02:38",
    description: "Key insight with strong visual moment",
    confidence: 0.88,
    selected: true
  },
  {
    id: "segment-3",
    start: "05:46",
    end: "06:05",
    description: "Audience reaction with emotional peak",
    confidence: 0.81,
    selected: false
  },
  {
    id: "segment-4",
    start: "08:19",
    end: "08:44",
    description: "Climactic reveal and CTA",
    confidence: 0.9,
    selected: true
  }
];

const shareTargets = [
  {
    name: "TikTok",
    href: "https://www.tiktok.com/",
    description: "Share to TikTok",
    accent: "#25F4EE"
  },
  {
    name: "Instagram Reels",
    href: "https://www.instagram.com/",
    description: "Share to Instagram Reels",
    accent: "#FF2D55"
  },
  {
    name: "YouTube Shorts",
    href: "https://www.youtube.com/shorts",
    description: "Share to YouTube Shorts",
    accent: "#FF0000"
  }
];

const gradientPalette = [
  "linear-gradient(145deg, rgba(255,64,129,0.85), rgba(58,12,163,0.88))",
  "linear-gradient(145deg, rgba(0,212,255,0.75), rgba(58,12,163,0.95))",
  "linear-gradient(145deg, rgba(255,167,38,0.8), rgba(255,64,129,0.85))",
  "linear-gradient(145deg, rgba(76,175,239,0.95), rgba(124,77,255,0.85))"
];

function buildGeneratedShorts(
  segments: HighlightSegment[],
  targetDuration: number
): GeneratedShort[] {
  const selectedSegments = segments.filter((segment) => segment.selected);
  const source = selectedSegments.length > 0 ? selectedSegments : segments.slice(0, 2);

  return source.map((segment, index) => ({
    id: `short-${segment.id}`,
    title: `Highlight ${index + 1}`,
    duration: targetDuration,
    thumbnailGradient: gradientPalette[index % gradientPalette.length],
    clipRange: `${segment.start} - ${segment.end}`,
    description: segment.description
  }));
}

export default function HomePage() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [length, setLength] = useState<number>(shortLengthOptions[1]);
  const [transition, setTransition] = useState<string>(transitionOptions[0].value);
  const [highlights, setHighlights] = useState<HighlightSegment[]>(baseHighlights);
  const [generatedShorts, setGeneratedShorts] = useState<GeneratedShort[]>([]);
  const [editingState, setEditingState] = useState<Record<string, EditingState>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const selectedTransitionLabel = useMemo(() => {
    const current = transitionOptions.find((option) => option.value === transition);
    return current?.label ?? transitionOptions[0].label;
  }, [transition]);

  useEffect(() => {
    if (!isProcessing) {
      return;
    }

    setProgress(0);
    const progressInterval = window.setInterval(() => {
      setProgress((prev) => {
        const increment = Math.random() * 18 + 10;
        const nextValue = Math.min(prev + increment, 100);
        return nextValue;
      });
    }, 420);

    const releaseTimeout = window.setTimeout(() => {
      setProgress(100);
      const shorts = buildGeneratedShorts(highlights, length);
      setGeneratedShorts(shorts);
      const nextEditingState = shorts.reduce<Record<string, EditingState>>((acc, short) => {
        acc[short.id] = {
          trimStart: 0,
          trimEnd: short.duration,
          textOverlay: "",
          soundLevel: 70
        };
        return acc;
      }, {});
      setEditingState(nextEditingState);
      setActiveIndex(0);
      setIsProcessing(false);
    }, 2500);

    return () => {
      window.clearInterval(progressInterval);
      window.clearTimeout(releaseTimeout);
    };
  }, [highlights, isProcessing, length]);

  useEffect(() => {
    if (generatedShorts.length > 0) {
      setActiveIndex(0);
    }
  }, [generatedShorts.length]);

  const generationStatus = useMemo(() => {
    if (isProcessing) {
      return "Generating shorts...";
    }
    if (generatedShorts.length > 0) {
      return "Shorts ready";
    }
    return "Awaiting input";
  }, [generatedShorts.length, isProcessing]);

  const handleHighlightToggle = (id: string) => {
    setHighlights((prev) =>
      prev.map((segment) =>
        segment.id === id ? { ...segment, selected: !segment.selected } : segment
      )
    );
  };

  const handleGenerate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!youtubeUrl.trim()) {
      setError("Paste a YouTube URL to begin.");
      return;
    }
    if (!/youtu(\.be|be\.com)/i.test(youtubeUrl)) {
      setError("Please enter a valid YouTube link (youtube.com or youtu.be).");
      return;
    }
    setError(null);
    setIsProcessing(true);
    setGeneratedShorts([]);
  };

  const handleEditingChange = (shortId: string, updates: Partial<EditingState>) => {
    setEditingState((prev) => ({
      ...prev,
      [shortId]: {
        ...prev[shortId],
        ...updates
      }
    }));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % Math.max(generatedShorts.length, 1));
  };

  const handlePrev = () => {
    setActiveIndex((prev) =>
      prev === 0 ? Math.max(generatedShorts.length - 1, 0) : prev - 1
    );
  };

  const handleCarouselKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!generatedShorts.length) {
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      handleNext();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      handlePrev();
    }
  };

  return (
    <main>
      <header>
        <span className="badge" aria-live="polite">
          <span className="status-dot" /> Smart short-form studio
        </span>
        <h1 className="page-title">
          Turn any YouTube video into a pack of scroll-stopping shorts.
        </h1>
        <p className="page-subtitle">
          Paste a URL, fine-tune clip options, and let AI surface the most engaging moments. Preview,
          polish, and share to every platform in seconds with a single flow.
        </p>
      </header>

      <form
        className="surface-card flex-grid generator-grid"
        onSubmit={handleGenerate}
        aria-labelledby="generator-heading"
      >
        <div className="flex-grid input-section" role="group" aria-label="YouTube URL input">
          <div>
            <h2 id="generator-heading" className="input-label">
              Upload or paste a YouTube video
            </h2>
            <p className="page-subtitle" style={{ fontSize: "0.95rem" }}>
              We'll fetch transcripts, scene changes, and momentum shifts to pinpoint the most
              replayable beats.
            </p>
          </div>
          <label className="url-input-wrapper" htmlFor="youtube-url">
            <span className="url-input_icon" aria-hidden>
              ▶︎
            </span>
            <input
              id="youtube-url"
              name="youtube-url"
              className="url-input"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(event) => setYoutubeUrl(event.target.value)}
              aria-describedby={error ? "url-error" : undefined}
              aria-invalid={Boolean(error)}
              required
            />
          </label>
          {error ? (
            <span id="url-error" className="error-text" role="alert">
              {error}
            </span>
          ) : null}
          <button
            type="submit"
            className="primary-button"
            disabled={isProcessing}
            aria-label={isProcessing ? "Generating shorts" : "Generate shorts"}
          >
            {isProcessing ? "Processing" : "Generate shorts"}
          </button>
        </div>

        <div className="flex-grid" role="group" aria-label="Shorts configuration">
          <div className="options-grid">
            <div className="option-group" role="radiogroup" aria-label="Short length">
              <span className="input-label">Short length</span>
              <div className="segment-control">
                {shortLengthOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className="segment-button"
                    aria-pressed={length === option}
                    onClick={() => setLength(option)}
                  >
                    {option}s
                  </button>
                ))}
              </div>
            </div>

            <div className="option-group">
              <label className="input-label" htmlFor="transition-select">
                Transition style
              </label>
              <div className="transition-select">
                <select
                  id="transition-select"
                  value={transition}
                  onChange={(event) => setTransition(event.target.value)}
                  aria-label="Select transition style"
                >
                  {transitionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <section className="highlights-panel" aria-label="AI highlight detection">
            <div className="page-subtitle" style={{ fontSize: "0.95rem" }}>
              AI-suggested highlight segments ({highlights.filter((s) => s.selected).length} selected)
            </div>
            <div className="highlight-list">
              {highlights.map((segment) => (
                <button
                  key={segment.id}
                  type="button"
                  className="highlight-chip"
                  onClick={() => handleHighlightToggle(segment.id)}
                  aria-pressed={segment.selected}
                  aria-label={`${segment.description} ${segment.selected ? "selected" : "not selected"}`}
                >
                  <span className="highlight-title">
                    <strong>
                      {segment.start} – {segment.end}
                    </strong>
                    <span className="confidence-pill">
                      AI {Math.round(segment.confidence * 100)}%
                    </span>
                  </span>
                  <span>{segment.description}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <section className="progress-panel" aria-live="polite">
          <span className="input-label">Processing status</span>
          <div className="progress-status">
            <span>{generationStatus}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar-wrapper" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
            <div
              className="progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        </section>
      </form>

      <section className="surface-card carousel-section" aria-label="Generated shorts previews">
        <div className="carousel-header">
          <div>
            <h2 className="input-label" style={{ color: "var(--color-text-primary)", fontSize: "1rem" }}>
              Generated shorts
            </h2>
            <p className="page-subtitle" style={{ fontSize: "0.95rem" }}>
              Swipe, arrow through, or click to jump between highlight previews. Fine-tune each clip before exporting.
            </p>
          </div>
          <div className="carousel-controls">
            <button
              type="button"
              className="icon-button"
              onClick={handlePrev}
              disabled={!generatedShorts.length}
              aria-label="Previous short"
            >
              ←
            </button>
            <button
              type="button"
              className="icon-button"
              onClick={handleNext}
              disabled={!generatedShorts.length}
              aria-label="Next short"
            >
              →
            </button>
          </div>
        </div>

        <div
          className="carousel"
          role="region"
          aria-label="Shorts carousel"
          tabIndex={0}
          onKeyDown={handleCarouselKeyDown}
        >
          <div
            className="carousel-track"
            style={{
              "--item-count": generatedShorts.length || 1,
              "--active-index": generatedShorts.length ? activeIndex : 0
            } as CarouselStyle}
          >
            {generatedShorts.length === 0 ? (
              <article className="carousel-card" aria-live="polite">
                <div className="page-subtitle" style={{ fontSize: "1rem" }}>
                  Run a video to see AI-crafted shorts here. We'll generate tailored previews once processing completes.
                </div>
              </article>
            ) : (
              generatedShorts.map((short, index) => (
                <article
                  key={short.id}
                  className={`carousel-card ${index === activeIndex ? "active" : ""}`.trim()}
                  aria-hidden={index !== activeIndex}
                  aria-label={`Short ${index + 1}: ${short.title}`}
                >
                  <div
                    className="thumbnail-frame"
                    style={{ background: short.thumbnailGradient }}
                  >
                    <span className="thumbnail-badge">{short.duration}s</span>
                    <span className="thumbnail-overlay">{short.clipRange}</span>
                  </div>

                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.15rem" }}>{short.title}</h3>
                    <p className="page-subtitle" style={{ fontSize: "0.9rem" }}>
                      {short.description}
                    </p>
                    <span className="page-subtitle" style={{ fontSize: "0.85rem" }}>
                      Transition: {selectedTransitionLabel}
                    </span>
                  </div>

                  <div className="editing-panel" aria-label={`Editing options for ${short.title}`}>
                    <div className="editing-row">
                      <label htmlFor={`trim-start-${short.id}`}>Trim start ({Math.round(editingState[short.id]?.trimStart ?? 0)}s)</label>
                      <input
                        id={`trim-start-${short.id}`}
                        type="range"
                        min={0}
                        max={short.duration - 3}
                        step={1}
                        value={editingState[short.id]?.trimStart ?? 0}
                        onChange={(event) =>
                          handleEditingChange(short.id, {
                            trimStart: Number(event.target.value)
                          })
                        }
                        className="editing-slider"
                        aria-valuemin={0}
                        aria-valuemax={short.duration - 3}
                        aria-valuenow={editingState[short.id]?.trimStart ?? 0}
                        aria-label={`Trim start for ${short.title}`}
                      />
                    </div>

                    <div className="editing-row">
                      <label htmlFor={`trim-end-${short.id}`}>Trim end ({Math.round(editingState[short.id]?.trimEnd ?? short.duration)}s)</label>
                      <input
                        id={`trim-end-${short.id}`}
                        type="range"
                        min={(editingState[short.id]?.trimStart ?? 0) + 3}
                        max={short.duration}
                        step={1}
                        value={editingState[short.id]?.trimEnd ?? short.duration}
                        onChange={(event) =>
                          handleEditingChange(short.id, {
                            trimEnd: Number(event.target.value)
                          })
                        }
                        className="editing-slider"
                        aria-valuemin={(editingState[short.id]?.trimStart ?? 0) + 3}
                        aria-valuemax={short.duration}
                        aria-valuenow={editingState[short.id]?.trimEnd ?? short.duration}
                        aria-label={`Trim end for ${short.title}`}
                      />
                    </div>

                    <div className="editing-row">
                      <label htmlFor={`text-overlay-${short.id}`}>Text overlay</label>
                      <input
                        id={`text-overlay-${short.id}`}
                        className="editing-input"
                        type="text"
                        placeholder="Add a hook or CTA"
                        value={editingState[short.id]?.textOverlay ?? ""}
                        onChange={(event) =>
                          handleEditingChange(short.id, {
                            textOverlay: event.target.value
                          })
                        }
                      />
                    </div>

                    <div className="editing-row">
                      <label htmlFor={`sound-level-${short.id}`}>
                        Sound adjustment ({editingState[short.id]?.soundLevel ?? 70}% bed volume)
                      </label>
                      <input
                        id={`sound-level-${short.id}`}
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={editingState[short.id]?.soundLevel ?? 70}
                        onChange={(event) =>
                          handleEditingChange(short.id, {
                            soundLevel: Number(event.target.value)
                          })
                        }
                        className="editing-slider"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={editingState[short.id]?.soundLevel ?? 70}
                        aria-label={`Sound level for ${short.title}`}
                      />
                    </div>
                  </div>

                  <div className="share-row" role="group" aria-label="Share options">
                    {shareTargets.map((target) => (
                      <a
                        key={target.name}
                        className="share-button"
                        href={target.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${target.description} (opens in new tab)`}
                        style={{ borderColor: `${target.accent}33` }}
                      >
                        {target.name}
                        <span aria-hidden>↗</span>
                      </a>
                    ))}
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
