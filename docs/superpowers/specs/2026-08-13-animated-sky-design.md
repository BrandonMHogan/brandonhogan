# Animated Sky Design

## Goal

Give the portfolio kingdom a continuous, layered sky that scales consistently across browser sizes and visibly tracks the day/night cycle.

## Background and scale

Remove baked clouds from the empty and completed wide/narrow backgrounds while preserving the playable terrain. Project the extended artwork with a scale capped by both viewport width and viewport height, so ultrawide Chrome windows reveal breathing room rather than enlarging the entire kingdom.

## Cloud layers

Use complete transparent pixel-cloud sprites with generous source padding. Phaser renders two bands behind the profile and terrain: small distant clouds drift slowly and larger near clouds drift somewhat faster. Each cloud wraps beyond the opposite viewport edge without popping. Reduced-motion mode keeps the same composition but disables drift.

## Sun and moon

The sun traverses a shallow arc during the five-minute day phase and the moon traverses the same arc during the five-minute night phase. At each phase boundary, the active body sets while the next begins rising as the existing night tint and stars crossfade. Celestial position derives from elapsed phase progress rather than an independent animation, keeping visuals and production behavior synchronized.

## Verification

Unit-test responsive projection and deterministic celestial coordinates. Inspect wide and narrow layouts, confirm no sprite clipping or background cloud remnants, and verify the phase transition plus reduced-motion behavior.
