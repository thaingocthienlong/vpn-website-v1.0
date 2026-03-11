# Plan: Partner Logo UI Update

## Goal
Display partner logos in full color by default (removing the grayscale effect).

## Context
- **Component**: `src/components/cards/PartnerLogo.tsx`
- **Current Style**: `grayscale group-hover:grayscale-0` (Gray by default, color on hover).
- **Desired Style**: Color by default.

## Usage
This component is used in `PartnersSection.tsx` on the Homepage.

## Steps

### 1. Implementation (`frontend-specialist`)
- **Action**: Edit `src/components/cards/PartnerLogo.tsx`.
- **Change**: Remove `grayscale` and `group-hover:grayscale-0` classes from the `Image` component.

### 2. Verification (`test-engineer`)
- **Visual Check**: Confirm logos are colored without hovering.
- **Code Check**: Verify classes are removed.

## User Review Required
- Confirm this is the only desired change for partner logos.
