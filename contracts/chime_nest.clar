;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-invalid-rating (err u101))
(define-constant err-no-active-session (err u102))
(define-constant err-session-exists (err u103))
(define-constant err-invalid-duration (err u104))
(define-constant err-invalid-volume (err u105))
(define-constant err-invalid-wake-time (err u106))

;; Data variables
(define-map user-profiles
  principal
  {
    total-sessions: uint,
    reward-points: uint,
    streak: uint,
    last-session: uint
  }
)

(define-map sleep-sessions
  principal
  {
    start-time: uint,
    is-active: bool
  }
)

(define-map white-noise-presets
  principal
  {
    sound-type: (string-ascii 32),
    duration: uint,
    volume: uint
  }
)

(define-map smart-alarms
  principal
  {
    wake-time: uint,
    window: uint
  }
)

;; Private functions
(define-private (is-valid-volume (vol uint))
  (<= vol u100)
)

(define-private (update-streak (last-session uint) (current-time uint))
  (if (< (- current-time last-session) u144) ;; Within 24 hours (144 blocks)
    u1
    u0
  )
)

;; Public functions
(define-public (start-sleep-session)
  (let ((existing-session (default-to {start-time: u0, is-active: false} (map-get? sleep-sessions tx-sender))))
    (if (get is-active existing-session)
      err-session-exists
      (begin
        (map-set sleep-sessions tx-sender {start-time: block-height, is-active: true})
        (ok true)
      )
    )
  )
)

(define-public (end-sleep-session (quality uint))
  (let (
    (session (default-to {start-time: u0, is-active: false} (map-get? sleep-sessions tx-sender)))
    (profile (default-to {total-sessions: u0, reward-points: u0, streak: u0, last-session: u0} (map-get? user-profiles tx-sender)))
    (duration (- block-height (get start-time session)))
  )
    (if (and 
          (get is-active session)
          (<= quality u10)
          (>= duration u36) ;; Minimum 6 hours (36 blocks)
        )
      (begin
        (map-set sleep-sessions tx-sender {start-time: u0, is-active: false})
        (map-set user-profiles tx-sender 
          {
            total-sessions: (+ (get total-sessions profile) u1),
            reward-points: (+ (get reward-points profile) u10),
            streak: (update-streak (get last-session profile) block-height),
            last-session: block-height
          }
        )
        (ok true)
      )
      err-invalid-rating
    )
  )
)

(define-public (set-white-noise-preset (sound (string-ascii 32)) (duration uint) (volume uint))
  (if (is-valid-volume volume)
    (begin
      (map-set white-noise-presets tx-sender
        {
          sound-type: sound,
          duration: duration,
          volume: volume
        }
      )
      (ok true)
    )
    err-invalid-volume
  )
)

(define-public (set-smart-alarm (wake-time uint) (window uint))
  (if (and
        (>= wake-time u0)
        (<= window u7200) ;; Max 12 hour window
      )
    (begin
      (map-set smart-alarms tx-sender
        {
          wake-time: wake-time,
          window: window
        }
      )
      (ok true)
    )
    err-invalid-wake-time
  )
)

;; Read only functions
(define-read-only (get-profile (user principal))
  (ok (default-to 
    {total-sessions: u0, reward-points: u0, streak: u0, last-session: u0}
    (map-get? user-profiles user)
  ))
)

(define-read-only (get-active-session (user principal))
  (ok (default-to
    {start-time: u0, is-active: false}
    (map-get? sleep-sessions user)
  ))
)
