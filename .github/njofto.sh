#!/usr/bin/env bash
# Dërgon push me OneSignal kur ndryshon data "Përditësuar" në një nga oraret.
# Përdorim: njofto.sh <commit_para> <commit_pas>
set -euo pipefail
BEFORE="${1:-}"; AFTER="${2:-HEAD}"
APP_ID="${ONESIGNAL_APP_ID:?}"
LINK="${ORARI_LINK:-https://fjonamera2-lab.github.io/Orari/}"

if [ -z "$BEFORE" ] || [[ "$BEFORE" =~ ^0+$ ]] || ! git cat-file -e "$BEFORE^{commit}" 2>/dev/null; then
  echo "Nuk ka commit të mëparshëm për krahasim, nuk dërgoj njoftim."; exit 0
fi

stamp(){ git show "$1:$2" 2>/dev/null | grep -o 'class="upd">[^<]*' | head -n1 | sed 's/^.*Përditësuar:[[:space:]]*//' || true; }

declare -A LABEL=( [orari_dita.html]="Orari i ditës" [orari_kp.html]="Orari i kohës së pjesshme" )
CHANGED=()
for f in orari_dita.html orari_kp.html; do
  old="$(stamp "$BEFORE" "$f")"; new="$(stamp "$AFTER" "$f")"
  echo "$f: '$old' -> '$new'"
  if [ -n "$new" ] && [ "$old" != "$new" ]; then CHANGED+=("${LABEL[$f]}"); fi
done

if [ ${#CHANGED[@]} -eq 0 ]; then echo "Data e gjenerimit nuk ndryshoi, nuk dërgoj njoftim."; exit 0; fi

NAMES="$(printf '%s, ' "${CHANGED[@]}")"; NAMES="${NAMES%, }"
TITLE="Orari u përditësua"
BODY="U përditësua: $NAMES"

mk(){ jq -n --arg app "$APP_ID" --arg t "$TITLE" --arg b "$BODY" --arg u "$LINK" --arg seg "$1" \
  '{app_id:$app, included_segments:[$seg], headings:{en:$t}, contents:{en:$b}, url:$u}'; }

if [ -n "${DRY_RUN:-}" ]; then echo "DRY_RUN payload:"; mk "Total Subscriptions"; exit 0; fi

: "${ONESIGNAL_API_KEY:?Mungon sekreti ONESIGNAL_API_KEY}"
# Emri i segmentit varet nga aplikacioni OneSignal: provohet njëri, pastaj tjetri
for SEG in "Total Subscriptions" "Subscribed Users"; do
  if RESP="$(mk "$SEG" | curl -sS -X POST "https://api.onesignal.com/notifications?c=push" \
      -H "Authorization: Key $ONESIGNAL_API_KEY" -H "Content-Type: application/json; charset=utf-8" \
      -d @- -w '\n%{http_code}')"; then
    CODE="${RESP##*$'\n'}"; echo "${RESP%$'\n'*}"
    if [ "$CODE" = "200" ]; then echo "Njoftimi u dërgua ($SEG): $BODY"; exit 0; fi
    echo "Segmenti '$SEG' dështoi (HTTP $CODE), provoj tjetrin..."
  fi
done
echo "Njoftimi NUK u dërgua. Kontrollo ONESIGNAL_API_KEY dhe App ID."; exit 1
