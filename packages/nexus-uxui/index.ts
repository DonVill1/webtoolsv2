// Nexus UX/UI — the fitting engine's public surface.
//
// The engine is content-agnostic: spaces measure themselves and rank the
// canonical shapes they can become; a host link decides what serves.
// `nexus-ads` is the flagship consumer (ad formats + fit families); layout
// regions, media decks, panels are the same contract with other shapes.

// Core types
export type { DeviceClass, Box, Shape, TraceStep, HoldPlate } from './types';

// Negotiation core
export { UniversalSlot, EMPTY_DECISION, HOLD_DECISION, ENFORCED_DECISION } from './slot';
export type { UniversalSlotOptions, Capability, UAADecision, NexusLink, SlotListener } from './slot';
export { setNexusLink, getNexusLink, HOLD_LINK } from './link';
export type { RawDecision } from './link';
export { rankShapes, shapeDims } from './fit';
export type { FitResult } from './fit';

// The fit ladder (hard points)
export { ladder, hardPoints, reachable, ladderFits } from './ladder';
export type { Ladder, LadderPoint, HoldZone } from './ladder';

// Device classes, viewport guard, fluid scale
export { detectDeviceClass, DEVICE_PRESETS } from './compat';
export type { DeviceDesign } from './compat';
export { viewportStatus } from './viewport';
export type { ViewportStatus } from './viewport';
export { nexusScale, scaleTokens } from './scale';
export type { ScaleState, ScaleTokens } from './scale';

// Token layer (families + color architecture)
export { nexusTokens, tokensForScale, radiusSet, lineSet, elevationSet, motionSet, typeMetaSet, COLOR_SLOTS, COLOR_CONTRACT } from './tokens';
export type { RadiusTokens, LineTokens, ElevationStep, ElevationTokens, MotionTokens, TypeMeta, ColorSlot, ColorContract, NexusTokens } from './tokens';

// Region catalog (page-chrome standard)
export { REGIONS, getRegion, regionBand, regionWidth, regionAdHosts, regionShapes, pageScaffold } from './regions';
export type { RegionSpec, RegionKind, BandDesign, ScaffoldRow, PageScaffold } from './regions';

// Control parameter kit
export { controlParams, controlParamsFromTokens, CARD_PRESETS, cardPreset, resolveCard } from './controls';
export type { ControlParams, CardPreset, BorderRadiusKey, ElevationKey } from './controls';

// Container scope
export { containerScale, containerTokens, containerTier, TIERS, CONTAINER_BOUNDS } from './container';
export type { ContainerScaleState, ContainerTier } from './container';

// App shell standard + view modes
export { SHELL, shellRegion, shellDesign, shellAdHosts, shellShapes, shellWidth, appScaffold, collapseLadder, snapPane, paneLadder, detectOrientation, SAFE_AREA_TOKENS } from './shell';
export type { Orientation, ShellSpec, ShellDesign, ShellKind, AppRow, AppScaffold, CollapseStep, CollapsePlan } from './shell';
export { VIEW_MODES, viewStatus, composeView, appViewportStatus } from './views';
export type { ViewMode, ViewStatus, ComposedView } from './views';

// Interaction standard: the state matrix + state/focus tokens
export type { InteractionState, StateRule, StateTokens, StateOptions } from './states';
export { STATE_MATRIX, stateTokens, defaultMotionScale, POINTER_TARGET_MIN } from './states';

// Command surfaces: palette geometry + menu placement + the z-tier stack
export { STACK_TIERS, Z_VARS, PALETTE_LADDER, paletteGeometry, MENU_LADDER, menuWidth, menuPlacement } from './commands';
export type { PaletteGeometry, Placement } from './commands';

// Keyboard grammar: classify keys + the focus contract
export type { KeyAction, KeyContext } from './keyboard';
export { classifyKey, isTextField, KEY_GRAMMAR, FOCUS_CONTRACT, focusVars } from './keyboard';
export type { KeySemantics, FocusContract } from './keyboard';

// React glue
export { useNexusSlot, NexusSpace, useViewportGuard, useNexusScale, useNexusTokens, useNexusContainer, usePaneLadder } from './react';
export type { UseNexusSlotOptions, PaneLadderHandle } from './react';
