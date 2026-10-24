"use client";
import { useEffect, useId, useRef, useState } from "react";
import {
  Check,
  Focus,
  Grid2X2,
  Palette,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { usePersonalization } from "./Personalization";
import { palettes, type PaletteId, type Surface } from "@/lib/personalization";
import type { GameSlug } from "@/data/games";
import { Mute } from "./SoundToggle";

export function Customize({ game }: { game?: GameSlug }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  function close() {
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus());
  }
  return (
    <>
      <button
        ref={trigger}
        className={
          game
            ? "mode-info-button customize-trigger"
            : "icon-button customize-trigger"
        }
        aria-label={game ? "Customize game" : "Customize appearance"}
        title="Customize"
        onClick={() => setOpen(true)}
      >
        <Palette size={game ? 16 : 18} />
      </button>
      {open && <CustomizationDialog game={game} close={close} />}
    </>
  );
}
function CustomizationDialog({
  game,
  close,
}: {
  game?: GameSlug;
  close: () => void;
}) {
  const { preferences, change, color, resetAppearance } = usePersonalization();
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useId();
  useEffect(() => {
    const element = dialog.current!;
    const previous = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    document.documentElement.dataset.customizing = "true";
    window.dispatchEvent(new Event("boredom-customize"));
    return () => {
      element.close();
      document.body.style.overflow = previous;
      delete document.documentElement.dataset.customizing;
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="customize-dialog"
      aria-labelledby={title}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        className="customize-content"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="customize-heading">
          <h2 id={title}>Make it yours</h2>
          <button
            className="customize-close"
            aria-label="Close customization"
            onClick={close}
          >
            <X size={19} />
          </button>
        </div>
        <div
          className={`look-preview preview-${preferences.surface}`}
          style={
            {
              "--preview-color":
                palettes[
                  game
                    ? (preferences.gameColors[game] ?? preferences.accent)
                    : preferences.accent
                ].base,
            } as React.CSSProperties
          }
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
          <span />
          <i />
          <b>2048</b>
          <span />
          <span />
          <span />
        </div>
        <fieldset className="customize-field">
          <legend>Accent</legend>
          <Swatches
            value={preferences.accent}
            select={(accent) => change({ accent })}
            label="Accent color"
          />
        </fieldset>
        {game && (
          <fieldset className="customize-field">
            <legend>Game color</legend>
            <div className="game-color-options">
              <button
                className={`original-color ${!preferences.gameColors[game] ? "chosen" : ""}`}
                aria-pressed={!preferences.gameColors[game]}
                onClick={() => color(game)}
              >
                Original
              </button>
              <Swatches
                value={preferences.gameColors[game]}
                select={(palette) => color(game, palette)}
                label="Game color"
              />
            </div>
          </fieldset>
        )}
        <fieldset className="customize-field">
          <legend>Arena</legend>
          <div className="surface-options">
            {(["classic", "midnight", "arcade"] as Surface[]).map((surface) => (
              <button
                className={`surface-option surface-${surface}`}
                key={surface}
                aria-label={`${surface} arena`}
                aria-pressed={preferences.surface === surface}
                onClick={() => change({ surface })}
              >
                <span>
                  <i />
                  <i />
                  <i />
                </span>
                <b>{surface[0].toUpperCase() + surface.slice(1)}</b>
                {preferences.surface === surface && <Check size={13} />}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="customize-toggle-row">
          <span>
            <Grid2X2 size={15} /> Cards
          </span>
          <div
            className="density-options"
            role="group"
            aria-label="Card density"
          >
            {(["compact", "comfortable"] as const).map((density) => (
              <button
                key={density}
                aria-pressed={preferences.density === density}
                onClick={() => change({ density })}
              >
                {density === "compact" ? "Compact" : "Roomy"}
              </button>
            ))}
          </div>
        </div>
        <Toggle
          label="Focus mode"
          checked={preferences.focus}
          change={() => change({ focus: !preferences.focus })}
          icon={<Focus size={15} />}
        />
        <Toggle
          label="Effects"
          checked={preferences.effects}
          change={() => change({ effects: !preferences.effects })}
          icon={<Sparkles size={15} />}
        />
        <Toggle
          label="Auto rematch"
          checked={preferences.autoReplay}
          change={() => change({ autoReplay: !preferences.autoReplay })}
          icon={<RotateCcw size={15} />}
        />
        <div className="customize-toggle-row">
          <span>Sound</span>
          <Mute />
        </div>
        <div className="customize-bottom">
          <button className="reset-look" onClick={resetAppearance}>
            <RotateCcw size={13} /> Reset look
          </button>
          <button className="button" onClick={close}>
            Done
          </button>
        </div>
      </div>
    </dialog>
  );
}
function Swatches({
  value,
  select,
  label,
}: {
  value?: PaletteId;
  select: (color: PaletteId) => void;
  label: string;
}) {
  return (
    <div className="color-swatches" role="group" aria-label={label}>
      {(Object.keys(palettes) as PaletteId[]).map((id) => (
        <button
          key={id}
          className="color-swatch"
          style={{ background: palettes[id].base }}
          aria-label={palettes[id].name}
          aria-pressed={value === id}
          title={palettes[id].name}
          onClick={() => select(id)}
        >
          {value === id && <Check size={17} />}
        </button>
      ))}
    </div>
  );
}
function Toggle({
  label,
  checked,
  change,
  icon,
}: {
  label: string;
  checked: boolean;
  change: () => void;
  icon: React.ReactNode;
}) {
  return (
    <div className="customize-toggle-row">
      <span>
        {icon}
        {label}
      </span>
      <button
        className="look-switch"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        onClick={change}
      >
        <i />
      </button>
    </div>
  );
}
