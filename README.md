# ChimeNest
A decentralized sleep tracking and white noise generation app built on Stacks blockchain.

## Features
- Track sleep sessions with duration and quality metrics
- Store white noise presets and preferences
- Set and manage smart alarms
- User profile management
- Rewards system for consistent sleep habits

## Setup and Installation
1. Clone the repository
2. Install Clarinet
3. Run `clarinet check` to verify contracts
4. Run `clarinet test` to execute test suite

## Usage Examples
```clarity
;; Start a sleep session
(contract-call? .chime-nest start-sleep-session)

;; End sleep session with quality rating
(contract-call? .chime-nest end-sleep-session u8)

;; Set white noise preferences
(contract-call? .chime-nest set-white-noise-preset "rain" u60 u70)

;; Set smart alarm
(contract-call? .chime-nest set-smart-alarm u28800 u1800)
```

## Dependencies
- Clarity language
- Clarinet for testing and deployment
